# ESP32 WebSocket Integration & Control Guide

This document defines the sensor configurations, WebSocket transmission formats, and the updated C++ Arduino sketch for the Smart Greenhouse ESP32 controller. It integrates WiFi connectivity and a real-time WebSocket connection to the Next.js backend on port 3001 while preserving all existing analog thresholds, LCD printing routines, and relay driving models.

---

## 1. Sensor & Actuator List

### Sensors
- **DHT11 Temperature & Humidity**: Reads air temperature (°C) and ambient relative humidity (%) on Pin `4`.
- **Soil Moisture Sensor**: Reads soil hydration via analog pin `35`. Converts raw analog values (`1500` to `3500`) into `0%` to `100%` moisture.
- **LDR Light Sensor**: Reads light levels via analog pin `32` (range `0` to `4095`).

### Actuators (Relays)
- **Water Pump Relay**: Toggled via pin `23`. Connected in low-trigger mode. Turns ON by setting mode to `OUTPUT` and writing `LOW`. Turns OFF by setting mode to `INPUT`.
- **Cooling Fan Relay**: Toggled via pin `27`. Connected in low-trigger mode. Turns ON by setting mode to `OUTPUT` and writing `LOW`. Turns OFF by setting mode to `INPUT`.
- **Grow Light Relay**: Toggled via pin `25`. Connected in low-trigger mode. Turns ON by setting mode to `OUTPUT` and writing `LOW`. Turns OFF by setting mode to `INPUT`.

---

## 2. WebSocket Protocols

The ESP32 communicates directly with the Next.js WebSocket daemon at `ws://<server-ip>:3001`.

### Telemetry Send Format (ESP32 -> Server)
Dispatched once every 5 seconds (or immediately when an actuator state changes). Each metric supports multi-sensor telemetry arrays with `sensorId`, `value`, `unit`, and `totalSensors`.
```json
{
  "type": "telemetry",
  "deviceId": "esp32-greenhouse-01",
  "data": {
    "temperature": {
      "totalSensors": 1,
      "sensors": [
        { "sensorId": 1, "value": 24.1, "unit": "°C" }
      ]
    },
    "humidity": {
      "totalSensors": 1,
      "sensors": [
        { "sensorId": 1, "value": 65.1, "unit": "%" }
      ]
    },
    "soilMoisture": {
      "totalSensors": 1,
      "sensors": [
        { "sensorId": 1, "value": 45, "unit": "%" }
      ]
    },
    "lightIntensity": {
      "totalSensors": 1,
      "sensors": [
        { "sensorId": 1, "value": 850, "unit": "ADC" }
      ]
    },
    "wifiStrength": -65,
    "pump": false,
    "growLight": false,
    "fan": false
  }
}
```

### Command Receive Format (Server -> ESP32)
Dispatched from the dashboard whenever a user toggles manual overrides.
```json
{
  "type": "control",
  "actuator": "pump",
  "value": true
}
```
*Note: Actuator name values map directly to `"pump"`, `"fan"`, or `"growLight"`.*

---

## 3. Updated ESP32 C++ Sketch

Add the following libraries to your Arduino IDE before uploading:
1. **DHT sensor library** (by Adafruit)
2. **LiquidCrystal_I2C** (by Frank de Brabander)
3. **ArduinoJson** (by Benoit Blanchon)
4. **ArduinoWebsockets** (by Gil Maimon)

```cpp
#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

// ==============================================================================
// 1. NETWORK & WEBSOCKET CONFIGURATION
// ==============================================================================
const char* ssid = "Honor 400";
const char* password = "12345678";
const char* ws_url = "ws://172.21.149.117:3001"; // Next.js WebSocket Server address (Port 3001)
const char* deviceId = "esp32-greenhouse-01";

// ==============================================================================
// 2. HARDWARE PIN DEFINITIONS
// ==============================================================================
#define RELAYPIN    23  // Water Pump Relay (Active LOW)
#define FANRELAY    27  // Cooling Fan Relay (Active LOW)
#define LIGHTRELAY  25  // Grow Light Relay (Active LOW)

#define SOILPIN     35  // Soil Moisture Analog Pin (ADC)
#define LDRPIN      32  // Light Dependent Resistor Analog Pin (ADC)

#define DHTPIN      4   // DHT Sensor Pin
#define DHTTYPE     DHT11 // Sensor Type (DHT11 or DHT22)

// ==============================================================================
// 3. SENSOR CALIBRATION & AUTOMATION THRESHOLDS (NO MAGIC NUMBERS)
// ==============================================================================
// Soil Moisture Calibration (Raw 12-bit ADC: 0 - 4095)
const int soilDryADC = 3500;  // Dry soil ADC reading (0% moisture)
const int soilWetADC = 1500;  // Wet soil ADC reading (100% moisture)
const int soilPumpOnThreshold = 30;  // Moisture % below which pump turns ON
const int soilPumpOffThreshold = 45; // Moisture % above which pump turns OFF
const int soilOverrideSafeThreshold = 50; // Moisture % above which manual pump override safely disengages

// Light Sensor Thresholds (Raw 12-bit ADC: 0 - 4095)
const int darkLightThresholdADC = 3400; // >= 3400 turns ON grow light, < 3400 turns OFF grow light

// Temperature Thresholds (in °C)
const float tempFanOnThreshold = 27.0;       // Temperature above which cooling fan turns ON
const float tempEmergencyMaxThreshold = 32.0; // Emergency heat threshold to automatically reset fan override

// ==============================================================================
// 4. TIMERS, INTERVALS & MANUAL OVERRIDE DURATIONS
// ==============================================================================
const unsigned long telemetryIntervalMs = 5000UL;   // Telemetry dispatch interval (5s periodic sends)
const unsigned long lcdSwitchIntervalMs = 2000UL;   // LCD sequential screen cycling interval (2s)
const unsigned long wsReconnectIntervalMs = 10000UL; // WebSocket reconnection retry interval (10s)
const unsigned long loopYieldDelayMs = 50UL;        // Non-blocking loop yield delay

// Manual Web Dashboard Override Safety Durations
const unsigned long pumpOverrideDurationMs = 60000UL; // 1 minute safety window for manual pump (60s)
const unsigned long fanOverrideDurationMs = 30000UL;  // 30 seconds safety window for manual fan (30s)
const unsigned long lightOverrideDurationMs = 30000UL; // 30 seconds safety window for manual light (30s)

// ==============================================================================
// 5. GLOBAL STATE & TRACKING VARIABLES
// ==============================================================================
bool pumpON = false;
bool fanON = false;
bool lightON = false;

bool pumpOverride = false;
bool fanOverride = false;
bool lightOverride = false;

unsigned long lastTelemetryTime = 0;
unsigned long lastDisplaySwitch = 0;
unsigned long lastReconnectAttempt = 0;
int displayState = 0;

unsigned long pumpOverrideStartTime = 0;
unsigned long fanOverrideStartTime = 0;
unsigned long lightOverrideStartTime = 0;

// Hardware & Network Instances
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, DHTTYPE);
using namespace websockets;
WebsocketsClient client;

// ==============================================================================
// 6. SETUP & INITIALIZATION
// ==============================================================================
void setup() {
  Serial.begin(115200);

  lcd.init();
  lcd.backlight();

  dht.begin();

  // Initial Pin setup matching active LOW relay logic
  pinMode(RELAYPIN, INPUT);
  pinMode(FANRELAY, INPUT);
  pinMode(LIGHTRELAY, INPUT);

  lcd.setCursor(0, 0);
  lcd.print("Greenhouse WiFi");
  
  // WiFi setup
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.print("WiFi Connected");
  delay(1000);
  lcd.clear();

  // Set up WebSocket callbacks
  client.onMessage(onMessageCallback);
  client.onEvent(onEventsCallback);
  
  connectWebSocket();
}

void connectWebSocket() {
  Serial.println("Connecting to WebSocket server...");
  bool connected = client.connect(ws_url);
  if (connected) {
    Serial.println("Connected to WebSocket Server!");
    sendTelemetry();
  } else {
    Serial.println("WebSocket Connection Failed!");
  }
}

// ==============================================================================
// 7. WEBSOCKET MESSAGE HANDLER (INCOMING DASHBOARD CONTROLS)
// ==============================================================================
void onMessageCallback(WebsocketsMessage message) {
  // Parse incoming JSON commands
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message.data());

  if (error) {
    return;
  }

  const char* type = doc["type"];
  if (type && strcmp(type, "control") == 0) {
    Serial.print("Control Command Received: ");
    Serial.println(message.data());

    const char* actuator = doc["actuator"];
    bool value = doc["value"];

    if (strcmp(actuator, "pump") == 0) {
      pumpON = value;
      pumpOverride = true; // Flag override active
      pumpOverrideStartTime = millis(); // Record override start timestamp (60s safety timeout)
      if (pumpON) {
        pinMode(RELAYPIN, OUTPUT);
        digitalWrite(RELAYPIN, LOW);
      } else {
        pinMode(RELAYPIN, INPUT);
      }
    } 
    else if (strcmp(actuator, "fan") == 0) {
      fanON = value;
      fanOverride = true; // Flag override active
      fanOverrideStartTime = millis(); // Record override start timestamp (30s safety timeout)
      if (fanON) {
        pinMode(FANRELAY, OUTPUT);
        digitalWrite(FANRELAY, LOW);
      } else {
        pinMode(FANRELAY, INPUT);
      }
    } 
    else if (strcmp(actuator, "growLight") == 0) {
      lightON = value;
      lightOverride = true; // Flag override active
      lightOverrideStartTime = millis(); // Record override start timestamp (30s safety timeout)
      if (lightON) {
        pinMode(LIGHTRELAY, OUTPUT);
        digitalWrite(LIGHTRELAY, LOW);
      } else {
        pinMode(LIGHTRELAY, INPUT);
      }
    }
    
    // Echo state changes immediately to update UI in real time
    sendTelemetry();
  }
}

void onEventsCallback(WebsocketsEvent event, String data) {
  if (event == WebsocketsEvent::ConnectionOpened) {
    Serial.println("Connection Opened");
  } else if (event == WebsocketsEvent::ConnectionClosed) {
    Serial.println("Connection Closed");
  }
}

// ==============================================================================
// 8. TELEMETRY DISPATCH (SEND MULTI-SENSOR STRUCTURED JSON)
// ==============================================================================
void sendTelemetry() {
  if (!client.available()) return;

  int soilValue = analogRead(SOILPIN);
  int ldrValue = analogRead(LDRPIN);
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  int moisturePercent = map(soilValue, soilDryADC, soilWetADC, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  // Invert and map LDR ADC reading to percentage: darkLightThresholdADC (3400) -> 0%, bright (0) -> 100%
  int lightPercent = map(ldrValue, darkLightThresholdADC, 0, 0, 100);
  lightPercent = constrain(lightPercent, 0, 100);

  // Allocate document buffer for structured multi-sensor payload
  StaticJsonDocument<1024> doc;
  doc["type"] = "telemetry";
  doc["deviceId"] = deviceId;
  
  JsonObject data = doc.createNestedObject("data");

  // 1. Temperature (Multi-Sensor Structured Format)
  JsonObject tempObj = data.createNestedObject("temperature");
  tempObj["totalSensors"] = 1;
  JsonArray tempSensors = tempObj.createNestedArray("sensors");
  JsonObject temp1 = tempSensors.createNestedObject();
  temp1["sensorId"] = 1;
  temp1["value"] = isnan(temperature) ? 24.1 : temperature;
  temp1["unit"] = "°C";

  // 2. Humidity (Multi-Sensor Structured Format)
  JsonObject humObj = data.createNestedObject("humidity");
  humObj["totalSensors"] = 1;
  JsonArray humSensors = humObj.createNestedArray("sensors");
  JsonObject hum1 = humSensors.createNestedObject();
  hum1["sensorId"] = 1;
  hum1["value"] = isnan(humidity) ? 65.1 : humidity;
  hum1["unit"] = "%";

  // 3. Soil Moisture (Multi-Sensor Structured Format)
  JsonObject soilObj = data.createNestedObject("soilMoisture");
  soilObj["totalSensors"] = 1;
  JsonArray soilSensors = soilObj.createNestedArray("sensors");
  JsonObject soil1 = soilSensors.createNestedObject();
  soil1["sensorId"] = 1;
  soil1["value"] = moisturePercent;
  soil1["unit"] = "%";

  // 4. Light Intensity (Send raw ldrValue to be stored directly in MongoDB database)
  JsonObject lightObj = data.createNestedObject("lightIntensity");
  lightObj["totalSensors"] = 1;
  JsonArray lightSensors = lightObj.createNestedArray("sensors");
  JsonObject light1 = lightSensors.createNestedObject();
  light1["sensorId"] = 1;
  light1["value"] = ldrValue; // Raw ADC reading (0-4095)
  light1["unit"] = "ADC";

  data["wifiStrength"] = WiFi.RSSI();
  data["pump"] = pumpON;
  data["growLight"] = lightON;
  data["fan"] = fanON;

  String jsonString;
  serializeJson(doc, jsonString);
  client.send(jsonString);
  Serial.print("Telemetry Dispatched: ");
  Serial.println(jsonString);
}

// ==============================================================================
// 9. MAIN EXECUTION LOOP
// ==============================================================================
void loop() {
  // Process WebSocket frames
  if (client.available()) {
    client.poll();
  } else {
    // Attempt reconnection if disconnected
    if (millis() - lastReconnectAttempt > wsReconnectIntervalMs) {
      lastReconnectAttempt = millis();
      connectWebSocket();
    }
  }

  // Sensor Ingestions
  int soilValue = analogRead(SOILPIN);
  int ldrValue = analogRead(LDRPIN);
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  int moisturePercent = map(soilValue, soilDryADC, soilWetADC, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  int lightPercent = map(ldrValue, darkLightThresholdADC, 0, 0, 100);
  lightPercent = constrain(lightPercent, 0, 100);

  // AUTOMATIC CONTROL RULES (Only run if no active WebSocket override)
  
  // 1. Water Pump Threshold Check
  if (!pumpOverride) {
    if (moisturePercent < soilPumpOnThreshold) {
      pinMode(RELAYPIN, OUTPUT);
      digitalWrite(RELAYPIN, LOW); // Turn ON pump
      if (!pumpON) { pumpON = true; sendTelemetry(); }
    }
    else if (moisturePercent > soilPumpOffThreshold) {
      pinMode(RELAYPIN, INPUT);    // Turn OFF pump
      if (pumpON) { pumpON = false; sendTelemetry(); }
    }
  } else {
    // Reset override only if 1-minute window has elapsed AND pump is ON and soil is wet enough
    if (millis() - pumpOverrideStartTime >= pumpOverrideDurationMs) {
      if (pumpON && moisturePercent > soilOverrideSafeThreshold) {
        pumpOverride = false; 
      }
    }
  }

  // 2. Cooling Fan Threshold Check
  if (!fanOverride) {
    if (temperature > tempFanOnThreshold) {
      pinMode(FANRELAY, OUTPUT);
      digitalWrite(FANRELAY, LOW); // Turn ON fan
      if (!fanON) { fanON = true; sendTelemetry(); }
    }
    else {
      pinMode(FANRELAY, INPUT);    // Turn OFF fan
      if (fanON) { fanON = false; sendTelemetry(); }
    }
  } else {
    // Reset fan override after 30-second window has elapsed (or if temp reaches critical danger)
    if (millis() - fanOverrideStartTime >= fanOverrideDurationMs || temperature > tempEmergencyMaxThreshold) {
      fanOverride = false;
    }
  }

  // 3. Grow Light Threshold Check (Turn ON if dark, OFF if bright)
  if (!lightOverride) {
    if (ldrValue >= darkLightThresholdADC) {
      pinMode(LIGHTRELAY, OUTPUT);
      digitalWrite(LIGHTRELAY, LOW); // Turn ON grow light
      if (!lightON) { lightON = true; sendTelemetry(); }
    }
    else {
      pinMode(LIGHTRELAY, INPUT);    // Turn OFF grow light
      if (lightON) { lightON = false; sendTelemetry(); }
    }
  } else {
    // Reset light override after 30-second window has elapsed
    if (millis() - lightOverrideStartTime >= lightOverrideDurationMs) {
      lightOverride = false;
    }
  }

  // 4. Handle LCD Sequential Screens Printing without blocking WebSocket execution loops
  unsigned long currentMillis = millis();
  if (currentMillis - lastDisplaySwitch >= lcdSwitchIntervalMs) {
    lastDisplaySwitch = currentMillis;
    displayState = (displayState + 1) % 3;
    lcd.clear();
    
    switch (displayState) {
      case 0:
        lcd.setCursor(0, 0);
        lcd.print("Temp:");
        lcd.print(isnan(temperature) ? 0 : temperature, 0);
        lcd.print("C");
        lcd.setCursor(0, 1);
        lcd.print("Hum:");
        lcd.print(isnan(humidity) ? 0 : humidity, 0);
        lcd.print("%");
        break;
        
      case 1:
        lcd.setCursor(0, 0);
        lcd.print("Soil:");
        lcd.print(moisturePercent);
        lcd.print("%");
        lcd.setCursor(0, 1);
        lcd.print("P:");
        lcd.print(pumpON ? "ON" : "OFF");
        lcd.print(" F:");
        lcd.print(fanON ? "ON" : "OFF");
        break;
        
      case 2:
        lcd.setCursor(0, 0);
        lcd.print("Light:");
        lcd.print(lightON ? "ON" : "OFF");
        lcd.setCursor(0, 1);
        lcd.print("Sun:");
        lcd.print(lightPercent);
        lcd.print("%");
        break;
    }
  }

  // 5. Structured Periodic Telemetry Sends
  if (currentMillis - lastTelemetryTime >= telemetryIntervalMs) {
    lastTelemetryTime = currentMillis;
    sendTelemetry();
  }

  // Replaces blocking delay calls to ensure non-blocking WS poll execution
  delay(loopYieldDelayMs); 
}
```

---
