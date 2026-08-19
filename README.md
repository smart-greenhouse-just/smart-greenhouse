# 🌱 Smart Greenhouse IoT Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![ESP32](https://img.shields.io/badge/Hardware-ESP32--WROOM--32D-red?style=flat&logo=espressif)](https://www.espressif.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An open-source, full-stack IoT precision agriculture and microclimate management platform. It connects embedded **ESP32** microcontroller nodes with a modern **Next.js** web interface via high-speed **WebSockets**, providing real-time telemetry streaming, automated closed-loop environmental controls, time-series analytics, and fail-safe actuator overrides.

---

## 🏛️ System Architecture

```text
 ┌────────────────────────────────────────────────────────┐
 │               Physical Greenhouse Node                 │
 │                                                        │
 │   [DHT11/22]    [Capacitive Soil]    [LDR Photoresistor]│
 │     (Pin 4)         (Pin 35)              (Pin 32)     │
 │        │                │                     │        │
 │        └────────────────┼─────────────────────┘        │
 │                         ▼                              │
 │                 [ ESP32-WROOM-32D ]                    │
 │                         │                              │
 │         ┌───────────────┴───────────────┐              │
 │         ▼                               ▼              │
 │   [16x2 I2C LCD]            [3-Channel 5V Relay]       │
 │   (Screen Carousel)         (Pump, Fan, Grow Light)    │
 └─────────────────────────┬──────────────────────────────┘
                           │  WebSocket Telemetry (5s) & Commands
                           ▼
 ┌────────────────────────────────────────────────────────┐
 │           Next.js & WebSocket Server Daemon            │
 │                     (Port 3001)                        │
 │                                                        │
 │   • Multi-Sensor Normalization & Arithmetic Averaging  │
 │   • Sub-15ms Bidirectional Control Dispatch            │
 │   • Zero Synthetic / Fake Fallback Data Enforcement    │
 └─────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
 ┌───────────────────────────┐ ┌──────────────────────────┐
 │    MongoDB Time-Series    │ │  Next.js 16 Web Cockpit  │
 │  (Mongoose Sensor Logs)   │ │  (Real-Time UI, VPD,     │
 │                           │ │   Recharts Analytics)    │
 └───────────────────────────┘ └──────────────────────────┘
```

---

## ✨ Key Features

- **⚡ Real-Time Telemetry Streaming**: Ingests sensor data every **5 seconds** from the ESP32 over a persistent WebSocket connection.
- **🔄 Multi-Sensor Schema Architecture**: Database records support multiple physical probes per metric (e.g. multi-point soil probes) with automatic arithmetic average computation.
- **🤖 Automated Closed-Loop Controls**:
  - 💧 **Water Pump (GPIO 23)**: Turns ON at $< 30\%$ soil moisture, turns OFF at $> 45\%$.
  - 🌀 **Exhaust Fan (GPIO 27)**: Turns ON when temperature $> 27.0^\circ\text{C}$, turns OFF at $\le 27.0^\circ\text{C}$.
  - 💡 **Grow Light (GPIO 25)**: Turns ON in dark ambient ($\text{LDR ADC} \ge 3400$), turns OFF in adequate daylight ($< 3400$).
- **⏱️ Fail-Safe Manual Overrides**: Temporary dashboard manual controls that automatically revert back to sensor automation once safety timeout windows expire (30s for Fan/Light, 60s for Pump).
- **🌿 Psychrometric Indicators**: Dynamic real-time calculation of **Vapor Pressure Deficit (VPD)** in $\text{kPa}$ and **Dew Point** in $^\circ\text{C}$.
- **📊 Comprehensive Analytics & History**:
  - Interactive chronology area charts, correlation bar graphs, and psychrometric scatter plots.
  - Telemetry history table sorted by **Newest First** with interactive sort toggles.
  - One-click **CSV Data Export**.
- **🚫 Zero Synthetic Placeholders**: Database queries and UI cards strictly reflect real hardware register outputs without injecting fake mock data.

---

## 🔌 Hardware Instrumentation & Pinouts

| Component | Function / Metric | Interface / Pin | Operating Range / Calibration |
| :--- | :--- | :--- | :--- |
| **ESP32-WROOM-32D** | Central Edge MCU | Wi-Fi 802.11 b/g/n | 240 MHz Dual-Core, 3.3V Logic |
| **DHT11 / DHT22** | Air Temp & Humidity | Digital **GPIO 4** | Temp: $-40^\circ\text{C}-80^\circ\text{C}$, Hum: $0-100\%$ |
| **Capacitive Soil Probe v1.2** | Soil Moisture Hydration | Analog **GPIO 35** | 12-bit ADC (`1500` Wet $\rightarrow$ `3500` Dry) |
| **LDR Photoresistor Module** | Ambient Light / Illumination | Analog **GPIO 32** | 12-bit ADC (`0` Bright $\rightarrow$ `4095` Pitch Dark) |
| **Water Pump Relay** | 12V Submersible Water Pump | Digital **GPIO 23** | Active LOW (Isolated Optocoupler) |
| **Exhaust Fan Relay** | 12V DC Cooling Fan | Digital **GPIO 27** | Active LOW (Isolated Optocoupler) |
| **Grow Light Relay** | Full-Spectrum Grow Light | Digital **GPIO 25** | Active LOW (Isolated Optocoupler) |
| **16x2 I2C Character LCD** | Local Hardware Diagnostic HUD | **SDA 21**, **SCL 22** | Address `0x27` (Cycles screens every 2s) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.18.0` or later
- **npm** / **pnpm** / **yarn**
- **MongoDB**: Local instance or MongoDB Atlas connection string
- **Arduino IDE**: For flashing the ESP32 firmware

---

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/smart-greenhouse-just/smart-greenhouse.git
cd smart-greenhouse
npm install
```

---

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart-greenhouse?retryWrites=true&w=majority

# Target Device Identifier
NEXT_PUBLIC_DEVICE_ID=esp32-greenhouse-01

# Public WebSocket URL for Browser Dashboard
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

### 3. Running Locally

Start the Next.js development server and WebSocket daemon:

```bash
npm run dev
```

The application will be accessible at:
- **Cockpit Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Analytics & History**: [http://localhost:3000/analytics](http://localhost:3000/analytics)
- **System Architecture**: [http://localhost:3000/about](http://localhost:3000/about)
- **WebSocket Server**: `ws://localhost:3001`

---

## 📡 ESP32 Firmware Setup

Complete C++ firmware source code and instructions are available in [ESP32_WIFI_WS_INSTRUCTIONS.md](ESP32_WIFI_WS_INSTRUCTIONS.md).

### Required Arduino IDE Libraries:
1. `DHT sensor library` (by Adafruit)
2. `LiquidCrystal_I2C` (by Frank de Brabander)
3. `ArduinoJson` (by Benoit Blanchon, v6.x)
4. `ArduinoWebsockets` (by Gil Maimon)

### Flashing Steps:
1. Open [ESP32_WIFI_WS_INSTRUCTIONS.md](ESP32_WIFI_WS_INSTRUCTIONS.md) and copy the C++ sketch.
2. Update the network variables at the top:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* ws_url = "ws://<YOUR_COMPUTER_IP>:3001";
   ```
3. Connect your ESP32 via USB and upload the sketch.
4. Open the Serial Monitor at **115200 baud** to verify connection.

---

## 📂 Project Structure

```text
smart-greenhouse/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analytics/       # Summary & historical aggregation endpoints
│   │   │   ├── control/         # Actuator command dispatch endpoints
│   │   │   ├── devices/         # Node status and metadata endpoints
│   │   │   └── sensors/history/ # Raw sensor time-series retrieval
│   │   ├── dashboard/           # Real-time Greenhouse Cockpit
│   │   ├── analytics/           # Climate chronologies, charts, and CSV export
│   │   ├── devices/             # Hardware node management
│   │   ├── about/               # Architecture & instrumentation documentation
│   │   └── layout.tsx           # Navigation sidebar and app shell
│   ├── components/
│   │   ├── SensorCard.tsx       # Live metric card with mini sparklines
│   │   ├── StatusCard.tsx       # Wi-Fi RSSI percentage & node connectivity HUD
│   │   ├── ActuatorControl.tsx  # Relay manual toggle controls
│   │   └── Navbar.tsx           # Global topbar navigation
│   ├── hooks/
│   │   └── useRealtimeData.ts   # WebSocket connection & live telemetry state
│   ├── models/
│   │   ├── SensorLog.ts         # Multi-sensor structured schema with averaging
│   │   ├── Device.ts            # Node registration & connectivity model
│   │   ├── Command.ts           # Actuator execution log model
│   │   └── Alert.ts             # Threshold safety alert model
│   └── services/
│       ├── websocketServer.ts   # Port 3001 WebSocket ingestion & broadcast daemon
│       ├── database.ts          # MongoDB connection singleton
│       ├── sensor.ts            # Sensor API client service
│       └── analytics.ts         # Aggregation & performance calculation service
├── ESP32_WIFI_WS_INSTRUCTIONS.md # Complete Arduino C++ sketch and wiring guide
├── package.json
└── README.md
```

---

## 📜 License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](LICENSE).
