# Button Detection State Machines

**Version:** 1.0.0
**Date:** 2025-12-26
**Target Platform:** ESP32-S3
**Related Linear Tasks:** FCS-409, FCS-410

---

## Table of Contents

1. [Overview](#overview)
2. [Hardware Configuration](#hardware-configuration)
3. [Double-Click Detection (Toggle Mode)](#double-click-detection-toggle-mode)
4. [Push-and-Hold Detection](#push-and-hold-detection)
5. [Combined State Machine](#combined-state-machine)
6. [Implementation](#implementation)
7. [Testing Guidelines](#testing-guidelines)

---

## Overview

L1NEAR supports two primary button interaction modes for voice recording:

| Mode | Trigger | Recording | Use Case |
|------|---------|-----------|----------|
| **Toggle Mode** | Double-click | Start/Stop toggle | Hands-free, longer recordings |
| **Push-to-Talk** | Hold button | While held | Quick notes, precise control |

Both modes must coexist on the same physical button, requiring a unified state machine that can distinguish between:
- Single tap (ignored or other action)
- Double-click (toggle recording)
- Press-and-hold (push-to-talk)

---

## Hardware Configuration

### GPIO Setup

```
Button GPIO:     GPIO 4 (configurable)
Pull-up:         Internal 45k ohm
Active State:    LOW (pressed = 0)
Interrupt:       Both edges (RISING + FALLING)
```

### Timing Constants

```c
#define DEBOUNCE_MS             50      // Debounce window
#define DOUBLE_CLICK_WINDOW_MS  300     // Max time between clicks
#define HOLD_THRESHOLD_MS       200     // Min hold to distinguish from tap
#define LONG_PRESS_MS           1000    // Long press threshold
#define VERY_LONG_PRESS_MS      3000    // Emergency unlock threshold
```

---

## Double-Click Detection (Toggle Mode)

### State Machine Diagram

```
                                        +------------------+
                                        |                  |
                                        v                  |
    +--------+     press      +---------------+           |
    |        |--------------->|               |           |
    |  IDLE  |                | FIRST_PRESS   |           |
    |        |<---------------|               |           |
    +--------+   release      +---------------+           |
        ^        (< HOLD)           |                     |
        |                           | release             |
        |                           | (< HOLD_THRESHOLD)  |
        |                           v                     |
        |                    +---------------+            |
        |    timeout         |               |   press    |
        |    (300ms)         | WAIT_SECOND   |----------->+
        +<-------------------|               |            |
        |                    +---------------+            |
        |                           |                     |
        |                           | press               |
        |                           | (within 300ms)      |
        |                           v                     |
        |                    +---------------+            |
        |                    |               |            |
        |                    |  RECORDING    |<-----------+
        |                    |   (toggle)    |      (double-click
        +<-------------------|               |       detected)
             double-click    +---------------+
             (stop)
```

### State Descriptions

| State | Description | Entry Action | Exit Condition |
|-------|-------------|--------------|----------------|
| **IDLE** | Waiting for button press | Clear timers | Button pressed |
| **FIRST_PRESS** | First press detected, debouncing | Start debounce timer | Release or hold threshold |
| **WAIT_SECOND** | First click complete, waiting for second | Start 300ms timeout | Second press or timeout |
| **RECORDING** | Voice recording active (toggle mode) | Start recording, notify BLE | Double-click to stop |

### Transition Table

| Current State | Event | Condition | Next State | Action |
|---------------|-------|-----------|------------|--------|
| IDLE | press | - | FIRST_PRESS | Start debounce timer |
| FIRST_PRESS | release | duration < HOLD_THRESHOLD | WAIT_SECOND | Start double-click timer |
| FIRST_PRESS | timer | duration >= HOLD_THRESHOLD | (handled by hold FSM) | - |
| WAIT_SECOND | press | within 300ms | RECORDING | Toggle ON, send BLE event |
| WAIT_SECOND | timeout | 300ms elapsed | IDLE | Single-click action (if any) |
| RECORDING | double-click | - | IDLE | Toggle OFF, send BLE event |

### Pseudocode

```cpp
// Double-click detection for toggle mode
enum class DoubleClickState {
    IDLE,
    FIRST_PRESS,
    WAIT_SECOND,
    RECORDING
};

class DoubleClickDetector {
private:
    DoubleClickState state = DoubleClickState::IDLE;
    uint32_t pressTime = 0;
    uint32_t releaseTime = 0;
    bool isRecording = false;

    static constexpr uint32_t DEBOUNCE_MS = 50;
    static constexpr uint32_t DOUBLE_CLICK_WINDOW_MS = 300;
    static constexpr uint32_t HOLD_THRESHOLD_MS = 200;

public:
    void onButtonPress(uint32_t timestamp) {
        switch (state) {
            case DoubleClickState::IDLE:
                state = DoubleClickState::FIRST_PRESS;
                pressTime = timestamp;
                break;

            case DoubleClickState::WAIT_SECOND:
                // Second press within window - toggle recording
                if (timestamp - releaseTime <= DOUBLE_CLICK_WINDOW_MS) {
                    toggleRecording();
                }
                state = DoubleClickState::IDLE;
                break;

            case DoubleClickState::RECORDING:
                // Start detecting for stop double-click
                pressTime = timestamp;
                state = DoubleClickState::FIRST_PRESS;
                break;

            default:
                break;
        }
    }

    void onButtonRelease(uint32_t timestamp) {
        switch (state) {
            case DoubleClickState::FIRST_PRESS:
                if (timestamp - pressTime < HOLD_THRESHOLD_MS) {
                    // Short press - wait for potential second click
                    state = DoubleClickState::WAIT_SECOND;
                    releaseTime = timestamp;
                }
                // If held longer, let hold detector handle it
                break;

            default:
                break;
        }
    }

    void tick(uint32_t timestamp) {
        switch (state) {
            case DoubleClickState::WAIT_SECOND:
                if (timestamp - releaseTime > DOUBLE_CLICK_WINDOW_MS) {
                    // Timeout - single click, return to appropriate state
                    state = isRecording ?
                        DoubleClickState::RECORDING :
                        DoubleClickState::IDLE;
                    onSingleClick(); // Optional single-click action
                }
                break;

            default:
                break;
        }
    }

private:
    void toggleRecording() {
        isRecording = !isRecording;
        if (isRecording) {
            startVoiceRecording();
            sendBleEvent(VoiceEvent::RECORDING_STARTED, RecordingMode::TOGGLE);
        } else {
            stopVoiceRecording();
            sendBleEvent(VoiceEvent::RECORDING_STOPPED, RecordingMode::TOGGLE);
        }
    }

    void onSingleClick() {
        // Optional: Handle single click (e.g., play/pause timer)
    }
};
```

---

## Push-and-Hold Detection

### State Machine Diagram

```
    +--------+     press       +---------------+
    |        |---------------->|               |
    |  IDLE  |                 |   PRESSING    |
    |        |<----------------|               |
    +--------+   release       +---------------+
        ^        (< 200ms)           |
        |        (tap ignored)       | timer (200ms)
        |                            | hold detected
        |                            v
        |                     +---------------+
        |                     |               |
        |                     |   RECORDING   |
        |                     |  (push-hold)  |
        |                     |               |
        |                     +-------+-------+
        |                             |
        |                             | release
        |                             v
        |                     +---------------+
        |                     |               |
        +---------------------|   RELEASING   |
             process audio    |  (finalize)   |
                              +---------------+
```

### State Descriptions

| State | Description | Entry Action | Exit Condition |
|-------|-------------|--------------|----------------|
| **IDLE** | Waiting for button press | - | Button pressed |
| **PRESSING** | Press detected, waiting to confirm hold | Start 200ms timer | Release (tap) or timer expires |
| **RECORDING** | Actively recording while held | Start recording, notify BLE | Button released |
| **RELEASING** | Button released, finalizing | Stop recording, process audio | Processing complete |

### Transition Table

| Current State | Event | Condition | Next State | Action |
|---------------|-------|-----------|------------|--------|
| IDLE | press | - | PRESSING | Start hold timer, debounce |
| PRESSING | release | duration < 200ms | IDLE | Ignore (was tap, not hold) |
| PRESSING | timer | 200ms elapsed | RECORDING | Start recording, BLE notify |
| RECORDING | release | - | RELEASING | Stop recording, BLE notify |
| RELEASING | process_done | - | IDLE | Trigger transcription |

### Pseudocode

```cpp
// Push-and-hold detection for voice recording
enum class HoldState {
    IDLE,
    PRESSING,
    RECORDING,
    RELEASING
};

class HoldDetector {
private:
    HoldState state = HoldState::IDLE;
    uint32_t pressTime = 0;
    uint32_t recordingDuration = 0;

    static constexpr uint32_t DEBOUNCE_MS = 50;
    static constexpr uint32_t HOLD_THRESHOLD_MS = 200;
    static constexpr uint32_t MAX_RECORDING_MS = 60000; // 1 minute max

public:
    void onButtonPress(uint32_t timestamp) {
        if (state == HoldState::IDLE) {
            state = HoldState::PRESSING;
            pressTime = timestamp;
        }
    }

    void onButtonRelease(uint32_t timestamp) {
        uint32_t duration = timestamp - pressTime;

        switch (state) {
            case HoldState::PRESSING:
                // Released before hold threshold - ignore (was a tap)
                state = HoldState::IDLE;
                break;

            case HoldState::RECORDING:
                // Stop recording
                recordingDuration = duration;
                state = HoldState::RELEASING;
                stopVoiceRecording();
                sendBleEvent(VoiceEvent::RECORDING_STOPPED,
                            RecordingMode::PUSH_TO_TALK,
                            recordingDuration);
                processRecording();
                state = HoldState::IDLE;
                break;

            default:
                break;
        }
    }

    void tick(uint32_t timestamp) {
        switch (state) {
            case HoldState::PRESSING:
                if (timestamp - pressTime >= HOLD_THRESHOLD_MS) {
                    // Hold confirmed - start recording
                    state = HoldState::RECORDING;
                    startVoiceRecording();
                    sendBleEvent(VoiceEvent::RECORDING_STARTED,
                                RecordingMode::PUSH_TO_TALK);
                }
                break;

            case HoldState::RECORDING:
                // Check max recording limit
                if (timestamp - pressTime >= MAX_RECORDING_MS) {
                    // Force stop at max duration
                    state = HoldState::RELEASING;
                    stopVoiceRecording();
                    sendBleEvent(VoiceEvent::RECORDING_STOPPED,
                                RecordingMode::PUSH_TO_TALK,
                                MAX_RECORDING_MS);
                    sendBleEvent(VoiceEvent::MAX_DURATION_REACHED);
                    processRecording();
                    state = HoldState::IDLE;
                }
                break;

            default:
                break;
        }
    }

private:
    void processRecording() {
        // Queue audio for transcription
        // This happens asynchronously
    }
};
```

---

## Combined State Machine

The unified button handler coordinates both detection modes:

### Combined State Diagram

```
                                   BUTTON PRESS
                                        |
                                        v
                          +-------------+-------------+
                          |                           |
                          |      DEBOUNCE (50ms)      |
                          |                           |
                          +-------------+-------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
                   v                                         v
        RELEASE < 200ms                            HOLD >= 200ms
        (potential double-click)                   (push-to-talk)
                   |                                         |
                   v                                         v
        +----------+----------+                   +----------+----------+
        |                     |                   |                     |
        |  WAIT_SECOND_CLICK  |                   |  RECORDING (PTT)    |
        |    (300ms window)   |                   |                     |
        +----------+----------+                   +----------+----------+
                   |                                         |
          +--------+--------+                                |
          |                 |                                |
          v                 v                                v
    SECOND CLICK       TIMEOUT                          RELEASE
    (within 300ms)     (> 300ms)                             |
          |                 |                                v
          v                 v                     +----------+----------+
    +-----+------+    +-----+------+              |                     |
    |            |    |            |              |  STOP + PROCESS     |
    |  TOGGLE    |    |  SINGLE    |              |                     |
    | RECORDING  |    |  CLICK     |              +---------------------+
    +------------+    +------------+
```

### Implementation

```cpp
// Combined button state machine
class ButtonStateMachine {
private:
    enum class State {
        IDLE,
        DEBOUNCING,
        WAIT_HOLD,
        RECORDING_PTT,
        WAIT_SECOND_CLICK,
        RECORDING_TOGGLE
    };

    State state = State::IDLE;
    uint32_t stateEnterTime = 0;
    uint32_t pressTime = 0;
    uint32_t releaseTime = 0;
    bool buttonPressed = false;

    // Timing constants
    static constexpr uint32_t DEBOUNCE_MS = 50;
    static constexpr uint32_t HOLD_THRESHOLD_MS = 200;
    static constexpr uint32_t DOUBLE_CLICK_WINDOW_MS = 300;
    static constexpr uint32_t MAX_RECORDING_MS = 60000;

public:
    // Called from GPIO ISR (edge-triggered)
    void IRAM_ATTR onButtonInterrupt(bool pressed) {
        buttonPressed = pressed;
        // Defer processing to main loop via flag or queue
        buttonEventPending = true;
    }

    // Called from main loop
    void processButtonEvent(uint32_t now) {
        if (!buttonEventPending) return;
        buttonEventPending = false;

        if (buttonPressed) {
            onPress(now);
        } else {
            onRelease(now);
        }
    }

    // Called every tick (1-10ms interval)
    void tick(uint32_t now) {
        uint32_t elapsed = now - stateEnterTime;

        switch (state) {
            case State::DEBOUNCING:
                if (elapsed >= DEBOUNCE_MS) {
                    if (buttonPressed) {
                        transitionTo(State::WAIT_HOLD, now);
                    } else {
                        transitionTo(State::IDLE, now);
                    }
                }
                break;

            case State::WAIT_HOLD:
                if (elapsed >= HOLD_THRESHOLD_MS) {
                    // Hold confirmed - start PTT recording
                    startRecording(RecordingMode::PUSH_TO_TALK);
                    transitionTo(State::RECORDING_PTT, now);
                }
                break;

            case State::WAIT_SECOND_CLICK:
                if (elapsed >= DOUBLE_CLICK_WINDOW_MS) {
                    // Timeout - was single click
                    handleSingleClick();
                    transitionTo(State::IDLE, now);
                }
                break;

            case State::RECORDING_PTT:
            case State::RECORDING_TOGGLE:
                if (elapsed >= MAX_RECORDING_MS) {
                    // Max duration reached
                    stopRecording(StopReason::MAX_DURATION);
                    transitionTo(State::IDLE, now);
                }
                break;

            default:
                break;
        }
    }

private:
    void onPress(uint32_t now) {
        switch (state) {
            case State::IDLE:
                pressTime = now;
                transitionTo(State::DEBOUNCING, now);
                break;

            case State::WAIT_SECOND_CLICK:
                // Double-click detected!
                if (now - releaseTime <= DOUBLE_CLICK_WINDOW_MS) {
                    startRecording(RecordingMode::TOGGLE);
                    transitionTo(State::RECORDING_TOGGLE, now);
                } else {
                    // Too slow - treat as new first press
                    pressTime = now;
                    transitionTo(State::DEBOUNCING, now);
                }
                break;

            case State::RECORDING_TOGGLE:
                // Start detecting for stop double-click
                pressTime = now;
                // Stay in same state but track this press
                break;

            default:
                break;
        }
    }

    void onRelease(uint32_t now) {
        releaseTime = now;
        uint32_t pressDuration = now - pressTime;

        switch (state) {
            case State::DEBOUNCING:
                // Released during debounce - ignore
                transitionTo(State::IDLE, now);
                break;

            case State::WAIT_HOLD:
                // Released before hold threshold - potential double-click
                if (pressDuration < HOLD_THRESHOLD_MS) {
                    transitionTo(State::WAIT_SECOND_CLICK, now);
                }
                break;

            case State::RECORDING_PTT:
                // Release stops PTT recording
                stopRecording(StopReason::RELEASED);
                transitionTo(State::IDLE, now);
                break;

            case State::RECORDING_TOGGLE:
                // Check for stop double-click
                if (pressDuration < HOLD_THRESHOLD_MS) {
                    // Short press while recording - wait for second click to stop
                    transitionTo(State::WAIT_SECOND_CLICK, now);
                }
                // Long press while in toggle mode is ignored
                break;

            default:
                break;
        }
    }

    void transitionTo(State newState, uint32_t now) {
        state = newState;
        stateEnterTime = now;
    }

    void startRecording(RecordingMode mode);
    void stopRecording(StopReason reason);
    void handleSingleClick();
};
```

---

## Implementation

### ISR Handler

```cpp
// GPIO Interrupt Service Routine
volatile bool buttonEventPending = false;
volatile bool buttonState = false;

void IRAM_ATTR buttonISR() {
    buttonState = (gpio_get_level(BUTTON_GPIO) == 0); // Active low
    buttonEventPending = true;
}

// Setup
void setupButtonInterrupt() {
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << BUTTON_GPIO),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_ANYEDGE
    };
    gpio_config(&io_conf);

    gpio_install_isr_service(0);
    gpio_isr_handler_add(BUTTON_GPIO, buttonISR, NULL);
}
```

### Main Loop Integration

```cpp
ButtonStateMachine buttonFSM;

void loop() {
    uint32_t now = millis();

    // Process pending button events
    if (buttonEventPending) {
        noInterrupts();
        bool pressed = buttonState;
        buttonEventPending = false;
        interrupts();

        if (pressed) {
            buttonFSM.onButtonPress(now);
        } else {
            buttonFSM.onButtonRelease(now);
        }
    }

    // Run state machine tick
    buttonFSM.tick(now);

    // Other processing...
    delay(1); // 1ms tick rate
}
```

### BLE Notification Integration

```cpp
void startRecording(RecordingMode mode) {
    // Start audio capture
    audioRecorder.start();

    // Send BLE notification
    VoiceEventData event = {
        .eventType = VOICE_EVENT_STARTED,
        .recordingMode = mode,
        .timestamp = getTimestamp()
    };
    bleNotifyVoiceEvent(&event);

    // Visual feedback
    setLED(LED_RECORDING);
}

void stopRecording(StopReason reason) {
    uint32_t duration = audioRecorder.getDuration();

    // Stop audio capture
    audioRecorder.stop();

    // Send BLE notification
    VoiceEventData event = {
        .eventType = VOICE_EVENT_STOPPED,
        .stopReason = reason,
        .duration_ms = duration,
        .timestamp = getTimestamp()
    };
    bleNotifyVoiceEvent(&event);

    // Queue for processing
    if (reason != StopReason::CANCELLED) {
        transcriptionQueue.push(audioRecorder.getBuffer());
    }

    // Visual feedback
    setLED(LED_PROCESSING);
}
```

---

## Testing Guidelines

### Test Matrix

| Test ID | Scenario | Action | Expected Result |
|---------|----------|--------|-----------------|
| BTN-001 | Single tap | Press <200ms, release | No recording, single-click event |
| BTN-002 | Double-click | Two taps <300ms apart | Toggle recording starts |
| BTN-003 | Double-click stop | Double-click while recording | Toggle recording stops |
| BTN-004 | Push-to-talk | Hold >200ms | Recording while held |
| BTN-005 | PTT release | Release after PTT | Recording stops, processed |
| BTN-006 | Slow double-click | Two taps >300ms apart | Two single-clicks |
| BTN-007 | Hold then release fast | Hold 200ms, release, tap | PTT then single-click |
| BTN-008 | Debounce | Noisy press signal | Single clean event |
| BTN-009 | Max duration | Hold for 60s | Auto-stop at limit |
| BTN-010 | Rapid clicks | 5 clicks <500ms | Correct event sequence |

### Timing Verification

```cpp
// Test fixture for timing validation
void testTimingAccuracy() {
    // Simulate double-click at exact 300ms boundary
    buttonFSM.onButtonPress(0);
    buttonFSM.onButtonRelease(100);  // 100ms tap
    buttonFSM.tick(100);

    // At exactly 300ms - should still detect
    buttonFSM.tick(299);
    buttonFSM.onButtonPress(300);
    assert(state == State::RECORDING_TOGGLE);

    // Reset and test at 301ms - should timeout
    buttonFSM.reset();
    buttonFSM.onButtonPress(0);
    buttonFSM.onButtonRelease(100);
    buttonFSM.tick(301);
    assert(state == State::IDLE);
}
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-26 | L1NEAR Team | Initial specification |

---

**Document End**
