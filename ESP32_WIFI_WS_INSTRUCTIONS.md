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
Dispatched once every 60 seconds (or immediately when an actuator state changes).
```json
{
  "type": "telemetry",
  "deviceId": "esp32-greenhouse-01",
  "data": {
    "temperature": 25.4,
    "humidity": 62.0,
    "soilMoisture": 45,
    "lightIntensity": 3200,
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

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Next.js WebSocket Server address (Port 3001)
const char* ws_url = "ws://192.168.1.100:3001"; // REPLACE WITH YOUR NEXTJS SERVER IP

// Pin Definitions
#define RELAYPIN 23
#define FANRELAY 27
#define LIGHTRELAY 25

#define SOILPIN 35
#define LDRPIN 32

#define DHTPIN 4
#define DHTTYPE DHT11

// Instances
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, DHTTYPE);
using namespace websockets;
WebsocketsClient client;

// Threshold values
int dryValue = 3500;
int wetValue = 1500;
int darkValue = 3500;

// Dynamic States
bool pumpON = false;
bool fanON = false;
bool lightON = false;

// Override Flags (Allows manual commands to temporarily bypass automatic sensor thresholds)
bool pumpOverride = false;
bool fanOverride = false;
bool lightOverride = false;

// Timers & Intervals
const int telemetryIntervalSeconds = 60; // Configurable telemetry interval in seconds (change this value to adjust frequency)
unsigned long lastTelemetryTime = 0;
const unsigned long telemetryInterval = telemetryIntervalSeconds * 1000UL;
unsigned long lastDisplaySwitch = 0;
int displayState = 0;
unsigned long pumpOverrideStartTime = 0;
const unsigned long pumpOverrideDuration = 600000UL; // 10 minutes override safety window in milliseconds

void setup() {
  Serial.begin(115200);

  lcd.init();
  lcd.backlight();

  dht.begin();

  // Initial Pin setup matching user's original logic
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

void onMessageCallback(WebsocketsMessage message) {
  Serial.print("WebSocket Payload Received: ");
  Serial.println(message.data());

  // Parse incoming JSON commands
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message.data());

  if (error) {
    Serial.print("JSON Deserialization failed: ");
    Serial.println(error.c_str());
    return;
  }

  const char* type = doc["type"];
  if (type && strcmp(type, "control") == 0) {
    const char* actuator = doc["actuator"];
    bool value = doc["value"];

    if (strcmp(actuator, "pump") == 0) {
      pumpON = value;
      pumpOverride = true; // Flag override active
      pumpOverrideStartTime = millis(); // Record override start timestamp
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
      if (lightON) {
        pinMode(LIGHTRELAY, OUTPUT);
        digitalWrite(LIGHTRELAY, LOW);
      } else {
        pinMode(LIGHTRELAY, INPUT);
      }
    }
    
    // Echo state changes immediately
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

void sendTelemetry() {
  if (!client.available()) return;

  int soilValue = analogRead(SOILPIN);
  int ldrValue = analogRead(LDRPIN);
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  int moisturePercent = map(soilValue, dryValue, wetValue, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  StaticJsonDocument<512> doc;
  doc["type"] = "telemetry";
  doc["deviceId"] = "esp32-greenhouse-01";
  
  JsonObject data = doc.createNestedObject("data");
  data["temperature"] = isnan(temperature) ? 24.0 : temperature;
  data["humidity"] = isnan(humidity) ? 60.0 : humidity;
  data["soilMoisture"] = moisturePercent;
  data["lightIntensity"] = ldrValue;
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

void loop() {
  // Process WebSocket frames
  if (client.available()) {
    client.poll();
  } else {
    // Attempt reconnection if disconnected
    static unsigned long lastReconnectAttempt = 0;
    if (millis() - lastReconnectAttempt > 10000) {
      lastReconnectAttempt = millis();
      connectWebSocket();
    }
  }

  // Sensor Ingestions
  int soilValue = analogRead(SOILPIN);
  int ldrValue = analogRead(LDRPIN);
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  int moisturePercent = map(soilValue, dryValue, wetValue, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  // AUTOMATIC CONTROL RULES (Only run if no active WebSocket override)
  
  // Water Pump Threshold Check
  if (!pumpOverride) {
    if (moisturePercent < 30) {
      pinMode(RELAYPIN, OUTPUT);
      digitalWrite(RELAYPIN, LOW);
      if (!pumpON) { pumpON = true; sendTelemetry(); }
    }
    else if (moisturePercent > 45) {
      pinMode(RELAYPIN, INPUT);
      if (pumpON) { pumpON = false; sendTelemetry(); }
    }
  } else {
    // Reset override only if 10-minute window has elapsed AND pump is ON and soil is wet enough
    if (millis() - pumpOverrideStartTime >= pumpOverrideDuration) {
      if (pumpON && moisturePercent > 50) {
        pumpOverride = false; 
      }
    }
  }

  // Cooling Fan Threshold Check
  if (!fanOverride) {
    if (temperature > 27) {
      pinMode(FANRELAY, OUTPUT);
      digitalWrite(FANRELAY, LOW);
      if (!fanON) { fanON = true; sendTelemetry(); }
    }
    else {
      pinMode(FANRELAY, INPUT);
      if (fanON) { fanON = false; sendTelemetry(); }
    }
  } else {
    // Reset override if temp deviates significantly
    if (temperature > 32 || temperature < 24) {
      fanOverride = false;
    }
  }

  // Grow Light Threshold Check
  if (!lightOverride) {
    if (ldrValue < darkValue) {
      pinMode(LIGHTRELAY, OUTPUT);
      digitalWrite(LIGHTRELAY, LOW);
      if (!lightON) { lightON = true; sendTelemetry(); }
    }
    else {
      pinMode(LIGHTRELAY, INPUT);
      if (lightON) { lightON = false; sendTelemetry(); }
    }
  }

  // Handle LCD Sequential Screens Printing without blocking WebSocket execution loops
  unsigned long currentMillis = millis();
  if (currentMillis - lastDisplaySwitch >= 2000) {
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
        lcd.print("LDR:");
        lcd.print(ldrValue);
        break;
    }
  }

  // Structured Periodic Telemetry Sends
  if (currentMillis - lastTelemetryTime >= telemetryInterval) {
    lastTelemetryTime = currentMillis;
    sendTelemetry();
  }

  // Replaces the blocking delay(2000) calls from the original code to ensure non-blocking WS poll execution
  delay(50); 
}
```

---

# ESP32-CAM WebSocket Sketch (OV2640 integration)

Use this secondary sketch on your **ESP32-CAM** module to stream live video frames and capture snapshots for AI analysis.

```cpp
#include "esp_camera.h"
#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* ws_server_url = "ws://192.168.1.100:3001"; // Next.js WS Daemon IP

using namespace websockets;
WebsocketsClient client;

bool isStreaming = false;
unsigned long lastHeartbeat = 0;
unsigned long lastFrameTime = 0;

// Camera configuration pinouts (AI Thinker ESP32-CAM module)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void setup() {
  Serial.begin(115200);
  
  // Camera init
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Select frame sizes based on memory constraints
  if(psramFound()){
    config.frame_size = FRAMESIZE_VGA;
    config.jpeg_quality = 12;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 15;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");

  // Event handlers for WS commands
  client.onMessage(onMessageCallback);
  connectWebSocket();
}

void connectWebSocket() {
  Serial.println("Establishing camera WS handshake...");
  if (client.connect(ws_server_url)) {
    Serial.println("WS connection active!");
    sendHeartbeat();
  } else {
    Serial.println("Handshake failed.");
  }
}

void sendHeartbeat() {
  StaticJsonDocument<128> doc;
  doc["type"] = "camera_telemetry";
  doc["deviceId"] = "esp32-camera-01";
  String json;
  serializeJson(doc, json);
  client.send(json);
}

void sendFrame(bool isCapture) {
  camera_fb_t * fb = esp_camera_fb_get();
  if(!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  // Base64 encode the JPEG frame
  String base64Image = "data:image/jpeg;base64,";
  // Simple Base64 encoder helper block
  static const char cb64[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  unsigned char in[3], out[4];
  int i, len = fb->len;
  unsigned char* p = fb->buf;
  
  while (len > 0) {
    int chunk = len > 3 ? 3 : len;
    for (i = 0; i < 3; i++) {
      if (i < chunk) in[i] = *p++;
      else in[i] = 0;
    }
    out[0] = (in[0] & 0xfc) >> 2;
    out[1] = ((in[0] & 0x03) << 4) | ((in[1] & 0xf0) >> 4);
    out[2] = chunk > 1 ? (((in[1] & 0x0f) << 2) | ((in[2] & 0xc0) >> 6)) : '=';
    out[3] = chunk > 2 ? (in[2] & 0x3f) : '=';
    
    for (i = 0; i < 4; i++) {
      if (out[i] == '=') base64Image += '=';
      else base64Image += cb64[out[i]];
    }
    len -= chunk;
  }

  esp_camera_fb_return(fb);

  StaticJsonDocument<2048> doc; // Adjust doc size as buffer limits dictate or slice
  doc["type"] = isCapture ? "camera_capture" : "camera_frame";
  doc["image"] = base64Image;
  doc["deviceId"] = "esp32-camera-01";

  String payload;
  serializeJson(doc, payload);
  client.send(payload);
}

void onMessageCallback(WebsocketsMessage message) {
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message.data());
  if (error) return;

  const char* type = doc["type"];
  if (strcmp(type, "capture") == 0) {
    sendFrame(true);
  } 
  else if (strcmp(type, "control") == 0) {
    const char* action = doc["action"];
    if (strcmp(action, "start_stream") == 0) {
      isStreaming = true;
    } else if (strcmp(action, "stop_stream") == 0) {
      isStreaming = false;
    }
  }
}

void loop() {
  if (client.available()) {
    client.poll();
  } else {
    static unsigned long lastReconnect = 0;
    if (millis() - lastReconnect > 10000) {
      lastReconnect = millis();
      connectWebSocket();
    }
  }

  // Periodic heartbeat
  if (millis() - lastHeartbeat > 10000) {
    lastHeartbeat = millis();
    sendHeartbeat();
  }

  // Stream frame handling (e.g. 5 FPS / 200ms interval)
  if (isStreaming && (millis() - lastFrameTime > 200)) {
    lastFrameTime = millis();
    sendFrame(false);
  }
}
```

