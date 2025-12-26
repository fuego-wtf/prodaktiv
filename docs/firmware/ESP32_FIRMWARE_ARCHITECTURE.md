# ESP32 Firmware Architecture

**Version:** 1.0.0
**Date:** 2025-12-26
**Target Platform:** ESP32-S3
**Framework:** PlatformIO + Arduino

---

## Table of Contents

1. [Overview](#overview)
2. [Hardware Specifications](#hardware-specifications)
3. [System Architecture](#system-architecture)
4. [Phone Lock Mechanism](#phone-lock-mechanism)
5. [BLE Stack](#ble-stack)
6. [E-Ink Display](#e-ink-display)
7. [Voice Recording](#voice-recording)
8. [Power Management](#power-management)
9. [Build Configuration](#build-configuration)
10. [Reference Projects](#reference-projects)

---

## Overview

LIN34R firmware transforms an ESP32-S3 into a deep work controller that:
- Tracks focus sessions with hardware-enforced accountability
- Locks user's phone during deep work (physical detention)
- Captures voice for task creation via local STT
- Displays session state on low-power E-Ink

```
+-------------------+     +-------------------+     +-------------------+
|   LIN34R Device   |     |   Desktop App     |     |   Linear API      |
|   (ESP32-S3)      |<--->|   (Tauri/React)   |<--->|                   |
|                   | BLE |                   | API |                   |
+-------------------+     +-------------------+     +-------------------+
        |
        |--- E-Ink Display (200x200)
        |--- Rotary Encoder + Button
        |--- Phone Lock (Solenoid/Servo)
        |--- Presence Sensor (Load Cell)
        |--- Microphone (I2S)
        |--- Status LED (WS2812B)
        |--- Haptic Motor (optional)
```

---

## Hardware Specifications

### MCU Selection

| Feature | ESP32-S3-WROOM-1 |
|---------|------------------|
| CPU | Dual-core Xtensa LX7, 240MHz |
| RAM | 512KB SRAM + 8MB PSRAM |
| Flash | 16MB |
| Bluetooth | BLE 5.0 (NimBLE stack) |
| WiFi | 802.11 b/g/n (not used) |
| GPIO | 45 programmable |
| ADC | 2x 12-bit SAR |
| I2S | 2 channels |

### Pin Assignments

```
+---------------+------+-----------------------------+
| Function      | GPIO | Notes                       |
+---------------+------+-----------------------------+
| E-Ink BUSY    | 4    | Input, pull-up              |
| E-Ink RST     | 5    | Output                      |
| E-Ink DC      | 6    | Output                      |
| E-Ink CS      | 7    | Output, SPI                 |
| E-Ink CLK     | 8    | SPI Clock                   |
| E-Ink MOSI    | 9    | SPI Data                    |
+---------------+------+-----------------------------+
| Encoder A     | 10   | Input, pull-up, interrupt   |
| Encoder B     | 11   | Input, pull-up, interrupt   |
| Button        | 12   | Input, pull-up, interrupt   |
+---------------+------+-----------------------------+
| Lock Solenoid | 13   | Output, PWM capable         |
| Lock Sense    | 14   | Input, limit switch         |
+---------------+------+-----------------------------+
| Load Cell DT  | 15   | HX711 Data                  |
| Load Cell SCK | 16   | HX711 Clock                 |
+---------------+------+-----------------------------+
| I2S BCLK      | 17   | Microphone bit clock        |
| I2S WS        | 18   | Microphone word select      |
| I2S DIN       | 19   | Microphone data             |
+---------------+------+-----------------------------+
| LED WS2812B   | 21   | NeoPixel status LED         |
| Haptic PWM    | 22   | Optional vibration motor    |
+---------------+------+-----------------------------+
```

### Bill of Materials

| Component | Part Number | Purpose |
|-----------|-------------|---------|
| MCU | ESP32-S3-WROOM-1-N16R8 | Main controller |
| E-Ink | GDEW0154M09 (1.54") | Display |
| Encoder | EC11 | Navigation + button |
| Solenoid | JF-0530B (5V, 300mA) | Phone lock |
| Load Cell | 1kg bar + HX711 | Phone presence |
| Microphone | INMP441 (I2S) | Voice capture |
| LED | WS2812B | Status indicator |
| Battery | 103450 LiPo (1800mAh) | Power |
| Charger | TP4056 | USB-C charging |

---

## System Architecture

### Task Model

```cpp
// FreeRTOS task structure
void setup() {
    // Core 0: BLE + Communication
    xTaskCreatePinnedToCore(bleTask, "BLE", 4096, NULL, 1, NULL, 0);
    xTaskCreatePinnedToCore(audioTask, "Audio", 8192, NULL, 2, NULL, 0);

    // Core 1: Display + UI
    xTaskCreatePinnedToCore(displayTask, "Display", 4096, NULL, 1, NULL, 1);
    xTaskCreatePinnedToCore(inputTask, "Input", 2048, NULL, 2, NULL, 1);
    xTaskCreatePinnedToCore(lockTask, "Lock", 2048, NULL, 3, NULL, 1);
}
```

### State Machine

```
                     +--------+
                     | IDLE   |<------------------+
                     +--------+                   |
                         |                        |
                   [Start Session]                |
                         |                        |
                         v                        |
                    +----------+                  |
           +------->| FOCUSING |-------+          |
           |        +----------+       |          |
           |             |             |          |
     [Resume]      [Timer Complete] [Pause]       |
           |             |             |          |
           |             v             v          |
           |        +--------+    +---------+     |
           +--------|  BREAK |    | PAUSED  |-----+
                    +--------+    +---------+     |
                         |                        |
                   [Break Complete]               |
                         |                        |
                         v                        |
                    +----------+                  |
                    | SHUTDOWN |------------------+
                    +----------+
                         |
                   [Day Complete]
                         |
                         v
                    +--------+
                    | SLEEP  |
                    +--------+
```

### Module Dependencies

```
+------------------+
|     main.cpp     |
+------------------+
         |
    +----+----+
    |         |
    v         v
+-------+  +-------+
|  BLE  |  |  UI   |
+-------+  +-------+
    |         |
    v         v
+-------+  +-------+  +-------+
| Lock  |  |Display|  | Input |
+-------+  +-------+  +-------+
    |         |           |
    +----+----+----+------+
         |
         v
    +----------+
    |  State   |
    +----------+
```

---

## Phone Lock Mechanism

### Hardware Design

```
ASCII Side View:

    +---------+        Phone drops into slot
    |  PHONE  |        when placed on device
    +---------+
         |
         v
    +============+     <- Cradle opening
    ||          ||
    ||  CRADLE  ||     <- Phone rests here
    ||          ||
    +===+==+====+
        |  |
       [LOCK]          <- Solenoid-actuated latch
        |  |
    +---+--+---+
    | LOADCELL |       <- Presence detection
    +-----------+
```

### Solenoid Lock Control

```cpp
class PhoneLock {
private:
    static constexpr gpio_num_t SOLENOID_PIN = GPIO_NUM_13;
    static constexpr gpio_num_t SENSE_PIN = GPIO_NUM_14;

    // PWM for soft-landing (reduce mechanical noise)
    static constexpr int PWM_CHANNEL = 0;
    static constexpr int PWM_FREQ = 1000;
    static constexpr int PWM_RESOLUTION = 8;

    bool isLocked = false;
    bool phonePresent = false;

public:
    void begin() {
        // Configure solenoid PWM
        ledcSetup(PWM_CHANNEL, PWM_FREQ, PWM_RESOLUTION);
        ledcAttachPin(SOLENOID_PIN, PWM_CHANNEL);
        ledcWrite(PWM_CHANNEL, 0);

        // Configure sense switch
        pinMode(SENSE_PIN, INPUT_PULLUP);
    }

    bool lock() {
        if (!phonePresent) return false;  // Can't lock empty cradle

        // Engage solenoid with soft start
        for (int duty = 0; duty <= 255; duty += 25) {
            ledcWrite(PWM_CHANNEL, duty);
            delay(10);
        }

        // Verify lock engaged (sense switch)
        delay(50);
        if (digitalRead(SENSE_PIN) == LOW) {
            isLocked = true;
            // Hold with reduced current (30% duty)
            ledcWrite(PWM_CHANNEL, 76);
            return true;
        }

        // Lock failed - release
        ledcWrite(PWM_CHANNEL, 0);
        return false;
    }

    bool unlock() {
        // Disengage solenoid
        ledcWrite(PWM_CHANNEL, 0);

        // Verify unlocked
        delay(50);
        if (digitalRead(SENSE_PIN) == HIGH) {
            isLocked = false;
            return true;
        }
        return false;
    }

    void emergencyUnlock() {
        // Force unlock regardless of session state
        ledcWrite(PWM_CHANNEL, 0);
        isLocked = false;
    }
};
```

### Phone Presence Detection (Load Cell)

```cpp
#include <HX711.h>

class PresenceSensor {
private:
    HX711 loadCell;
    static constexpr gpio_num_t DT_PIN = GPIO_NUM_15;
    static constexpr gpio_num_t SCK_PIN = GPIO_NUM_16;

    // Calibration values
    float calibrationFactor = -7050.0;  // Adjust during setup
    float tareOffset = 0;

    // Detection thresholds
    static constexpr float PHONE_MIN_WEIGHT = 100.0;  // grams
    static constexpr float PHONE_MAX_WEIGHT = 300.0;  // grams
    static constexpr float DEBOUNCE_DELTA = 10.0;     // grams

    bool phonePresent = false;
    float lastWeight = 0;
    uint32_t lastChangeTime = 0;

public:
    void begin() {
        loadCell.begin(DT_PIN, SCK_PIN);
        loadCell.set_scale(calibrationFactor);
        loadCell.tare();
        tareOffset = loadCell.get_offset();
    }

    bool update() {
        if (!loadCell.is_ready()) return phonePresent;

        float weight = loadCell.get_units(3);  // Average of 3 readings

        // Debounce weight changes
        if (abs(weight - lastWeight) > DEBOUNCE_DELTA) {
            lastChangeTime = millis();
        }
        lastWeight = weight;

        // Apply hysteresis
        if (millis() - lastChangeTime > 500) {  // 500ms stable
            bool newPresent = (weight >= PHONE_MIN_WEIGHT &&
                              weight <= PHONE_MAX_WEIGHT);

            if (newPresent != phonePresent) {
                phonePresent = newPresent;
                return true;  // State changed
            }
        }

        return false;  // No change
    }

    bool isPhonePresent() const { return phonePresent; }
    float getWeight() const { return lastWeight; }

    void calibrate(float knownWeight) {
        // Place known weight (e.g., 150g) and call this
        loadCell.set_scale();
        float reading = loadCell.get_units(10);
        calibrationFactor = reading / knownWeight;
        loadCell.set_scale(calibrationFactor);
    }
};
```

### Lock Safety Logic

```cpp
class LockController {
private:
    PhoneLock lock;
    PresenceSensor sensor;
    SessionState* session;

    // Safety: Track consecutive failed unlocks
    int failedUnlocks = 0;
    static constexpr int MAX_FAILED_UNLOCKS = 3;

    // Emergency override
    uint32_t emergencyPressStart = 0;
    static constexpr uint32_t EMERGENCY_HOLD_MS = 5000;  // 5 second hold

public:
    enum class LockResult {
        SUCCESS,
        NO_PHONE,
        ALREADY_LOCKED,
        MECHANISM_FAILED
    };

    enum class UnlockResult {
        SUCCESS,
        NOT_LOCKED,
        SESSION_ACTIVE,
        MECHANISM_FAILED,
        EMERGENCY_TRIGGERED
    };

    LockResult tryLock() {
        if (!sensor.isPhonePresent()) return LockResult::NO_PHONE;
        if (lock.isLocked()) return LockResult::ALREADY_LOCKED;

        if (lock.lock()) {
            notifyBLE(PHONE_LOCKED);
            return LockResult::SUCCESS;
        }
        return LockResult::MECHANISM_FAILED;
    }

    UnlockResult tryUnlock() {
        if (!lock.isLocked()) return UnlockResult::NOT_LOCKED;

        // Check if session allows unlock
        if (session->isActive() && !session->isBreak()) {
            return UnlockResult::SESSION_ACTIVE;
        }

        if (lock.unlock()) {
            failedUnlocks = 0;
            notifyBLE(PHONE_UNLOCKED);
            return UnlockResult::SUCCESS;
        }

        failedUnlocks++;
        if (failedUnlocks >= MAX_FAILED_UNLOCKS) {
            // Mechanism stuck - allow emergency unlock
            lock.emergencyUnlock();
            notifyBLE(EMERGENCY_UNLOCK);
            return UnlockResult::EMERGENCY_TRIGGERED;
        }

        return UnlockResult::MECHANISM_FAILED;
    }

    void handleEmergencyButton(bool pressed) {
        if (pressed) {
            if (emergencyPressStart == 0) {
                emergencyPressStart = millis();
            } else if (millis() - emergencyPressStart >= EMERGENCY_HOLD_MS) {
                // 5-second hold triggered
                lock.emergencyUnlock();
                session->abort();  // End session without scoring
                notifyBLE(EMERGENCY_UNLOCK);
                emergencyPressStart = 0;
            }
        } else {
            emergencyPressStart = 0;
        }
    }
};
```

---

## BLE Stack

### NimBLE Configuration

```cpp
// platformio.ini
; lib_deps =
;     h2zero/NimBLE-Arduino@^1.4.1

#include <NimBLEDevice.h>

// Service UUIDs
#define SERVICE_UUID        "00003001-1234-5678-9ABC-4C494E333452"
#define SESSION_STATE_UUID  "00003002-1234-5678-9ABC-4C494E333452"
#define TIMER_CONTROL_UUID  "00003003-1234-5678-9ABC-4C494E333452"
#define PHONE_LOCK_UUID     "00003004-1234-5678-9ABC-4C494E333452"
#define VOICE_EVENT_UUID    "00003007-1234-5678-9ABC-4C494E333452"

class BLEManager {
private:
    NimBLEServer* pServer = nullptr;
    NimBLECharacteristic* sessionChar = nullptr;
    NimBLECharacteristic* timerChar = nullptr;
    NimBLECharacteristic* lockChar = nullptr;
    NimBLECharacteristic* voiceChar = nullptr;

    bool deviceConnected = false;

public:
    void begin() {
        NimBLEDevice::init("LIN34R");
        NimBLEDevice::setPower(ESP_PWR_LVL_P9);  // Max power
        NimBLEDevice::setSecurityAuth(true, true, true);  // Bonding

        pServer = NimBLEDevice::createServer();
        pServer->setCallbacks(new ServerCallbacks(this));

        // Create service
        NimBLEService* pService = pServer->createService(SERVICE_UUID);

        // Create characteristics
        sessionChar = pService->createCharacteristic(
            SESSION_STATE_UUID,
            NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
        );

        timerChar = pService->createCharacteristic(
            TIMER_CONTROL_UUID,
            NIMBLE_PROPERTY::WRITE
        );
        timerChar->setCallbacks(new TimerControlCallbacks());

        lockChar = pService->createCharacteristic(
            PHONE_LOCK_UUID,
            NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY
        );
        lockChar->setCallbacks(new LockControlCallbacks());

        voiceChar = pService->createCharacteristic(
            VOICE_EVENT_UUID,
            NIMBLE_PROPERTY::NOTIFY
        );

        pService->start();

        // Start advertising
        NimBLEAdvertising* pAdvertising = NimBLEDevice::getAdvertising();
        pAdvertising->addServiceUUID(SERVICE_UUID);
        pAdvertising->setScanResponse(true);
        pAdvertising->start();
    }

    void notifySessionState(const SessionStateData& data) {
        if (deviceConnected && sessionChar) {
            sessionChar->setValue((uint8_t*)&data, sizeof(data));
            sessionChar->notify();
        }
    }

    void notifyVoiceEvent(const VoiceEventData& data) {
        if (deviceConnected && voiceChar) {
            voiceChar->setValue((uint8_t*)&data, sizeof(data));
            voiceChar->notify();
        }
    }

    void notifyLockState(const PhoneLockData& data) {
        if (deviceConnected && lockChar) {
            lockChar->setValue((uint8_t*)&data, sizeof(data));
            lockChar->notify();
        }
    }
};
```

---

## E-Ink Display

### GxEPD2 Setup

```cpp
// platformio.ini
; lib_deps =
;     zinggjm/GxEPD2@^1.5.2

#include <GxEPD2_BW.h>

// 1.54" E-Ink 200x200 (GDEW0154M09)
GxEPD2_BW<GxEPD2_154_M09, GxEPD2_154_M09::HEIGHT> display(
    GxEPD2_154_M09(/*CS=*/7, /*DC=*/6, /*RST=*/5, /*BUSY=*/4)
);

class DisplayManager {
private:
    uint16_t partialRefreshCount = 0;
    static constexpr uint16_t FULL_REFRESH_INTERVAL = 15;

public:
    void begin() {
        display.init(115200);
        display.setRotation(0);
        display.setTextColor(GxEPD_BLACK);
        display.setFullWindow();
        display.fillScreen(GxEPD_WHITE);
        display.display();
    }

    void showTimer(uint32_t seconds, uint8_t session, uint8_t total) {
        uint16_t mins = seconds / 60;
        uint16_t secs = seconds % 60;

        char timeStr[8];
        snprintf(timeStr, sizeof(timeStr), "%02d:%02d", mins, secs);

        // Partial update for timer only
        display.setPartialWindow(40, 70, 120, 50);
        display.firstPage();
        do {
            display.fillScreen(GxEPD_WHITE);
            display.setFont(&FreeSansBold24pt7b);
            display.setCursor(45, 105);
            display.print(timeStr);
        } while (display.nextPage());

        checkPartialRefresh();
    }

    void showRecording() {
        doFullRefresh([this]() {
            display.fillScreen(GxEPD_WHITE);
            display.setFont(&FreeSans12pt7b);
            display.setCursor(30, 40);
            display.print("RECORDING");
            // Draw microphone icon
            drawMicrophoneIcon(90, 100);
            display.setCursor(20, 180);
            display.print("Release to end");
        });
    }

    void showSuccess(const char* taskId) {
        doFullRefresh([this, taskId]() {
            display.fillScreen(GxEPD_WHITE);
            drawCheckmark(90, 60);
            display.setFont(&FreeSans12pt7b);
            display.setCursor(35, 110);
            display.print(taskId);
            display.setCursor(30, 160);
            display.print("Task added");
        });
    }

private:
    void checkPartialRefresh() {
        partialRefreshCount++;
        if (partialRefreshCount >= FULL_REFRESH_INTERVAL) {
            display.display(true);  // Full refresh
            partialRefreshCount = 0;
        }
    }

    template<typename F>
    void doFullRefresh(F drawFunc) {
        display.setFullWindow();
        display.firstPage();
        do {
            drawFunc();
        } while (display.nextPage());
        partialRefreshCount = 0;
    }

    void drawMicrophoneIcon(int x, int y);
    void drawCheckmark(int x, int y);
};
```

---

## Voice Recording

### I2S Audio Capture

```cpp
#include <driver/i2s.h>

class AudioRecorder {
private:
    static constexpr i2s_port_t I2S_PORT = I2S_NUM_0;
    static constexpr int SAMPLE_RATE = 16000;
    static constexpr int BUFFER_SIZE = 1024;
    static constexpr int MAX_RECORDING_MS = 60000;

    int16_t* recordingBuffer = nullptr;
    size_t recordingLength = 0;
    size_t maxSamples;
    bool isRecording = false;

public:
    void begin() {
        i2s_config_t i2s_config = {
            .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
            .sample_rate = SAMPLE_RATE,
            .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
            .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
            .communication_format = I2S_COMM_FORMAT_STAND_I2S,
            .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
            .dma_buf_count = 8,
            .dma_buf_len = BUFFER_SIZE,
            .use_apll = false,
            .tx_desc_auto_clear = false,
            .fixed_mclk = 0
        };

        i2s_pin_config_t pin_config = {
            .bck_io_num = 17,
            .ws_io_num = 18,
            .data_out_num = I2S_PIN_NO_CHANGE,
            .data_in_num = 19
        };

        i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
        i2s_set_pin(I2S_PORT, &pin_config);

        // Allocate recording buffer in PSRAM
        maxSamples = (MAX_RECORDING_MS * SAMPLE_RATE) / 1000;
        recordingBuffer = (int16_t*)ps_malloc(maxSamples * sizeof(int16_t));
    }

    void start() {
        if (isRecording) return;

        recordingLength = 0;
        isRecording = true;
        i2s_start(I2S_PORT);
    }

    void stop() {
        if (!isRecording) return;

        isRecording = false;
        i2s_stop(I2S_PORT);
    }

    bool record() {
        if (!isRecording) return false;
        if (recordingLength >= maxSamples) return false;

        int16_t samples[BUFFER_SIZE];
        size_t bytesRead = 0;

        esp_err_t result = i2s_read(I2S_PORT, samples,
            sizeof(samples), &bytesRead, portMAX_DELAY);

        if (result == ESP_OK && bytesRead > 0) {
            size_t samplesRead = bytesRead / sizeof(int16_t);
            size_t toCopy = min(samplesRead, maxSamples - recordingLength);

            memcpy(&recordingBuffer[recordingLength], samples,
                   toCopy * sizeof(int16_t));
            recordingLength += toCopy;

            return true;
        }
        return false;
    }

    const int16_t* getBuffer() const { return recordingBuffer; }
    size_t getLength() const { return recordingLength; }
    uint32_t getDurationMs() const {
        return (recordingLength * 1000) / SAMPLE_RATE;
    }
};
```

---

## Power Management

### Sleep Strategy

```cpp
class PowerManager {
private:
    static constexpr uint32_t IDLE_TIMEOUT_MS = 300000;  // 5 minutes
    static constexpr uint32_t DEEP_SLEEP_TIMEOUT_MS = 1800000;  // 30 minutes

    uint32_t lastActivityTime = 0;
    bool onBattery = true;

public:
    void onActivity() {
        lastActivityTime = millis();
    }

    void update() {
        uint32_t idle = millis() - lastActivityTime;

        if (!sessionActive()) {
            if (idle >= DEEP_SLEEP_TIMEOUT_MS) {
                enterDeepSleep();
            } else if (idle >= IDLE_TIMEOUT_MS) {
                enterLightSleep();
            }
        }
    }

private:
    void enterLightSleep() {
        // Disable unused peripherals
        btStop();

        // Configure wake sources
        esp_sleep_enable_ext0_wakeup(GPIO_NUM_12, 0);  // Button
        esp_sleep_enable_timer_wakeup(60000000);  // 60 seconds

        // Light sleep (BLE maintains connection)
        esp_light_sleep_start();

        // Woke up - re-enable
        btStart();
    }

    void enterDeepSleep() {
        // Show "sleeping" on E-Ink
        displayManager.showSleeping();

        // Disable all peripherals
        display.hibernate();

        // Configure wake sources
        esp_sleep_enable_ext0_wakeup(GPIO_NUM_12, 0);  // Button

        // Deep sleep (complete shutdown, ~10uA)
        esp_deep_sleep_start();
    }
};
```

---

## Build Configuration

### platformio.ini

```ini
[env:esp32s3]
platform = espressif32
board = esp32-s3-devkitc-1
framework = arduino

; CPU and memory
board_build.mcu = esp32s3
board_build.f_cpu = 240000000L
board_build.flash_mode = qio
board_build.flash_size = 16MB
board_build.partitions = huge_app.csv

; PSRAM
board_build.arduino.memory_type = qio_opi
build_flags =
    -DBOARD_HAS_PSRAM
    -DARDUINO_USB_CDC_ON_BOOT=1
    -DCONFIG_NIMBLE_CPP_ATT_VALUE_INIT_LENGTH=512

; Libraries
lib_deps =
    h2zero/NimBLE-Arduino@^1.4.1
    zinggjm/GxEPD2@^1.5.2
    bogde/HX711@^0.7.5
    adafruit/Adafruit NeoPixel@^1.11.0

; Upload
monitor_speed = 115200
upload_speed = 921600
```

### Partition Table (huge_app.csv)

```csv
# Name,   Type, SubType, Offset,   Size, Flags
nvs,      data, nvs,     0x9000,   0x5000,
otadata,  data, ota,     0xe000,   0x2000,
app0,     app,  ota_0,   0x10000,  0x300000,
spiffs,   data, spiffs,  0x310000, 0xE0000,
coredump, data, coredump,0x3F0000, 0x10000,
```

---

## Reference Projects

### Primary References

| Project | URL | Relevant For |
|---------|-----|--------------|
| Rukenshia/pomodoro | github.com/Rukenshia/pomodoro | ESP32 + E-Ink timer, BLE, similar use case |
| ESP32-audioI2S | github.com/schreibfaul1/ESP32-audioI2S | I2S audio capture |
| NimBLE-Arduino | github.com/h2zero/NimBLE-Arduino | BLE 5.0 stack |
| GxEPD2 | github.com/ZinggJM/GxEPD2 | E-Ink display library |

### Architecture Inspirations

- **Flipper Zero** - Button handling, power management
- **Watchy** - E-Ink + ESP32 integration
- **OpenLock** - Electronic lock mechanisms

---

## Directory Structure

```
lin34r-firmware/
├── platformio.ini
├── src/
│   ├── main.cpp
│   ├── config.h
│   ├── ble/
│   │   ├── BLEManager.cpp
│   │   ├── BLEManager.h
│   │   └── characteristics.h
│   ├── display/
│   │   ├── DisplayManager.cpp
│   │   ├── DisplayManager.h
│   │   ├── fonts/
│   │   └── icons/
│   ├── input/
│   │   ├── ButtonFSM.cpp
│   │   ├── ButtonFSM.h
│   │   └── Encoder.h
│   ├── lock/
│   │   ├── LockController.cpp
│   │   ├── LockController.h
│   │   ├── PhoneLock.cpp
│   │   └── PresenceSensor.cpp
│   ├── audio/
│   │   ├── AudioRecorder.cpp
│   │   └── AudioRecorder.h
│   ├── session/
│   │   ├── SessionState.cpp
│   │   └── SessionState.h
│   └── power/
│       └── PowerManager.cpp
├── include/
│   └── types.h
├── lib/
│   └── README
├── test/
│   └── test_button_fsm.cpp
└── docs/
    ├── hardware/
    │   └── schematic.pdf
    └── BLE_PROTOCOL.md
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-26 | LIN34R Team | Initial architecture document |

---

**Document End**
