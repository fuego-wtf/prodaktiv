# Voice Events BLE Protocol

**Version:** 1.0.0
**Date:** 2025-12-26
**Target Platform:** ESP32-S3
**Related Linear Tasks:** FCS-409, FCS-410

---

## Table of Contents

1. [Overview](#overview)
2. [Voice Event Characteristic](#voice-event-characteristic)
3. [Event Byte Format](#event-byte-format)
4. [BLE Notification Structure](#ble-notification-structure)
5. [Timing Diagrams](#timing-diagrams)
6. [Example Sequences](#example-sequences)
7. [Implementation](#implementation)

---

## Overview

Voice events are transmitted from the L1NEAR device to the mobile app via BLE notifications. This enables real-time feedback for voice recording state changes.

### GATT Location

```
Device Service:       00003001-1234-5678-9ABC-4C494E333452
  Voice Event:        00003007-1234-5678-9ABC-4C494E333452
```

---

## Voice Event Characteristic

**UUID:** `00003007-1234-5678-9ABC-4C494E333452`

| Property | Value |
|----------|-------|
| Permissions | Notify |
| Descriptors | CCCD (0x2902) |
| Max Length | 12 bytes |

---

## Event Byte Format

### Voice Event Data (12 bytes)

```
Offset  Size  Field           Type       Description
------  ----  -----           ----       -----------
0       1     event_type      uint8      Event type (enum)
1       1     recording_mode  uint8      Toggle or push-to-talk
2       1     stop_reason     uint8      Reason recording stopped
3       1     flags           uint8      Event flags
4       4     duration_ms     uint32_le  Recording duration in ms
8       4     timestamp       uint32_le  Event timestamp (uptime ms)
```

### Event Type Enum

| Value | Name | Description |
|-------|------|-------------|
| 0x01 | RECORDING_STARTED | Voice recording began |
| 0x02 | RECORDING_STOPPED | Voice recording ended |
| 0x03 | RECORDING_CANCELLED | Recording discarded |
| 0x04 | PROCESSING_STARTED | Transcription started |
| 0x05 | PROCESSING_COMPLETE | Transcription finished |
| 0x06 | PROCESSING_ERROR | Transcription failed |
| 0x10 | MAX_DURATION_REACHED | Auto-stopped at limit |
| 0x11 | LOW_BATTERY_WARNING | Recording may stop soon |
| 0x20 | AUDIO_LEVEL | Volume level update |

### Recording Mode Enum

| Value | Name | Description |
|-------|------|-------------|
| 0x00 | NONE | No active recording |
| 0x01 | PUSH_TO_TALK | Hold-to-record mode |
| 0x02 | TOGGLE | Double-click toggle mode |

### Stop Reason Enum

| Value | Name | Description |
|-------|------|-------------|
| 0x00 | NOT_STOPPED | Recording still active |
| 0x01 | USER_RELEASED | PTT button released |
| 0x02 | USER_TOGGLED | Toggle mode off |
| 0x03 | MAX_DURATION | Hit time limit |
| 0x04 | LOW_BATTERY | Battery critical |
| 0x05 | ERROR | Hardware/software error |
| 0x06 | CANCELLED | User cancelled |
| 0x07 | BLE_DISCONNECTED | Connection lost |

### Flags Byte

| Bit | Name | Description |
|-----|------|-------------|
| 0 | HAS_AUDIO | Audio data available |
| 1 | WILL_PROCESS | Will trigger transcription |
| 2 | HIGH_PRIORITY | Urgent notification |
| 3 | SILENT | No haptic/audio feedback |
| 4-7 | Reserved | Must be 0 |

---

## BLE Notification Structure

### Notification Packet Layout

```
+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+
|   0   |   1   |   2   |   3   |   4   |   5   |   6   |   7   |   8   |   9   |  10   |  11   |
+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+
| event | mode  | reason| flags |     duration_ms (LE)      |       timestamp (LE)          |
| type  |       |       |       |  LSB  |       |       | MSB  |  LSB  |       |       | MSB  |
+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+-------+
```

### Example Encoded Packets

**Recording Started (Toggle Mode):**
```
Hex: 01 02 00 03 00 00 00 00 E8 03 00 00
     |  |  |  |  |--------|  |--------|
     |  |  |  |  duration=0  timestamp=1000
     |  |  |  flags=HAS_AUDIO|WILL_PROCESS
     |  |  reason=NOT_STOPPED
     |  mode=TOGGLE
     event=RECORDING_STARTED
```

**Recording Stopped (PTT, 3.5 seconds):**
```
Hex: 02 01 01 03 AC 0D 00 00 D4 1B 00 00
     |  |  |  |  |--------|  |--------|
     |  |  |  |  duration=3500  timestamp=7124
     |  |  |  flags=HAS_AUDIO|WILL_PROCESS
     |  |  reason=USER_RELEASED
     |  mode=PUSH_TO_TALK
     event=RECORDING_STOPPED
```

---

## Timing Diagrams

### Push-to-Talk Sequence

```
Time (ms)   0    50   200  250       3500 3550    4000
            |    |    |    |         |    |       |
Button:     +----+=========+==========+----+------+
            |    |         |          |    |
            |    |         |          |    +-- Debounce complete
            |    |         |          |
            |    |         |          +-- Button released
            |    |         |
            |    |         +-- Recording started (hold threshold)
            |    |
            |    +-- Debounce complete
            |
            +-- Button pressed

BLE Events:
            |                         |         |
         (none)              RECORDING_STARTED  RECORDING_STOPPED
                             @ t=200            @ t=3550
                             mode=PTT           duration=3350
                             duration=0         reason=RELEASED
```

### ASCII Timeline

```
t=0ms     +--------------------------------------------------+
          | BUTTON DOWN                                       |
          | ISR triggered, start debounce                     |
          +--------------------------------------------------+
                    |
                    v (50ms debounce)
t=50ms    +--------------------------------------------------+
          | DEBOUNCE COMPLETE                                 |
          | Transition to WAIT_HOLD state                     |
          +--------------------------------------------------+
                    |
                    v (150ms hold wait)
t=200ms   +--------------------------------------------------+
          | HOLD THRESHOLD                                    |
          | Start recording                                   |
          | BLE: RECORDING_STARTED (mode=PTT, duration=0)     |
          +--------------------------------------------------+
                    |
                    v (3300ms recording)
t=3500ms  +--------------------------------------------------+
          | BUTTON UP                                         |
          | ISR triggered, start debounce                     |
          +--------------------------------------------------+
                    |
                    v (50ms debounce)
t=3550ms  +--------------------------------------------------+
          | RELEASE CONFIRMED                                 |
          | Stop recording                                    |
          | BLE: RECORDING_STOPPED (duration=3350, PTT)       |
          +--------------------------------------------------+
                    |
                    v (async)
t=4000ms  +--------------------------------------------------+
          | PROCESSING STARTED                                |
          | BLE: PROCESSING_STARTED                           |
          +--------------------------------------------------+
```

### Double-Click Toggle Sequence

```
Time (ms)   0   100  150  200  250  300       5000       5100 5200 5300
            |   |    |    |    |    |         |          |    |    |
Button:     +===+----+====+----+----+---------+====+-----+====+----+
            |   |    |    |                   |    |     |    |
            |   |    |    |                   |    |     |    +-- Toggle OFF
            |   |    |    |                   |    |     |         confirmed
            |   |    |    |                   |    |     |
            |   |    |    |                   |    |     +-- 2nd click
            |   |    |    |                   |    |         (stop)
            |   |    |    |                   |    |
            |   |    |    |                   |    +-- 1st click release
            |   |    |    |                   |
            |   |    |    |                   +-- 1st click (stop attempt)
            |   |    |    |
            |   |    |    +-- Toggle ON confirmed (double-click)
            |   |    |
            |   |    +-- 2nd click (within 300ms)
            |   |
            |   +-- 1st click release
            |
            +-- 1st click

BLE Events:
                              |                              |
                    RECORDING_STARTED              RECORDING_STOPPED
                    @ t=250                        @ t=5300
                    mode=TOGGLE                    duration=5050
                    duration=0                     reason=TOGGLED
```

### ASCII State Timeline

```
t=0ms     +--------------------------------------------------+
          | CLICK 1 DOWN                                      |
          | State: IDLE -> DEBOUNCING                         |
          +--------------------------------------------------+
                    |
                    v
t=50ms    +--------------------------------------------------+
          | DEBOUNCE DONE                                     |
          | State: DEBOUNCING -> WAIT_HOLD                    |
          +--------------------------------------------------+
                    |
                    v
t=100ms   +--------------------------------------------------+
          | CLICK 1 UP (before 200ms hold)                    |
          | State: WAIT_HOLD -> WAIT_SECOND_CLICK             |
          | Start 300ms timeout                               |
          +--------------------------------------------------+
                    |
                    v
t=200ms   +--------------------------------------------------+
          | CLICK 2 DOWN (within 300ms window)                |
          | DOUBLE-CLICK DETECTED!                            |
          | Start recording                                   |
          | BLE: RECORDING_STARTED (mode=TOGGLE)              |
          | State: -> RECORDING_TOGGLE                        |
          +--------------------------------------------------+
                    |
                    v (recording for ~5 seconds)
t=5100ms  +--------------------------------------------------+
          | CLICK 1 DOWN (to stop)                            |
          | Track press time                                  |
          +--------------------------------------------------+
                    |
                    v
t=5150ms  +--------------------------------------------------+
          | CLICK 1 UP                                        |
          | State: -> WAIT_SECOND_CLICK (for stop)            |
          +--------------------------------------------------+
                    |
                    v
t=5250ms  +--------------------------------------------------+
          | CLICK 2 DOWN (stop double-click)                  |
          | Stop recording                                    |
          | BLE: RECORDING_STOPPED (mode=TOGGLE, dur=5050)    |
          | State: -> IDLE                                    |
          +--------------------------------------------------+
```

---

## Example Sequences

### Sequence 1: Quick PTT Note

```
+--------+                           +--------+
|  App   |                           | Device |
+--------+                           +--------+
    |                                    |
    |                    [User holds button]
    |                                    |
    |      RECORDING_STARTED             |
    |<-----------------------------------|
    |      [01 01 00 03 00 00 00 00 ...]|
    |                                    |
    |                    [1.2s recording]|
    |                                    |
    |      RECORDING_STOPPED             |
    |<-----------------------------------|
    |      [02 01 01 03 B0 04 00 00 ...]|
    |      (duration=1200ms)             |
    |                                    |
    |      PROCESSING_STARTED            |
    |<-----------------------------------|
    |      [04 01 01 00 ...]             |
    |                                    |
    |                    [transcription] |
    |                                    |
    |      PROCESSING_COMPLETE           |
    |<-----------------------------------|
    |      [05 01 01 00 ...]             |
    |                                    |
```

### Sequence 2: Toggle Mode with Cancellation

```
+--------+                           +--------+
|  App   |                           | Device |
+--------+                           +--------+
    |                                    |
    |            [User double-clicks]    |
    |                                    |
    |      RECORDING_STARTED             |
    |<-----------------------------------|
    |      [01 02 00 03 ...]             |
    |      mode=TOGGLE                   |
    |                                    |
    |                    [2s recording]  |
    |                                    |
    |      Cancel command                |
    |----------------------------------->|
    |      (via Timer Control)           |
    |                                    |
    |      RECORDING_CANCELLED           |
    |<-----------------------------------|
    |      [03 02 06 00 D0 07 00 00 ...] |
    |      reason=CANCELLED              |
    |      duration=2000ms               |
    |                                    |
```

### Sequence 3: Max Duration Auto-Stop

```
+--------+                           +--------+
|  App   |                           | Device |
+--------+                           +--------+
    |                                    |
    |            [User holds button]     |
    |                                    |
    |      RECORDING_STARTED             |
    |<-----------------------------------|
    |      mode=PTT                      |
    |                                    |
    |                    [59s...]        |
    |                                    |
    |      MAX_DURATION_REACHED          |
    |<-----------------------------------|
    |      [10 01 00 04 ...]             |
    |      flags=HIGH_PRIORITY           |
    |                                    |
    |      RECORDING_STOPPED             |
    |<-----------------------------------|
    |      [02 01 03 03 60 EA 00 00 ...] |
    |      reason=MAX_DURATION           |
    |      duration=60000ms              |
    |                                    |
```

---

## Implementation

### Voice Event Structure

```cpp
// Voice event data structure
#pragma pack(push, 1)
struct VoiceEventData {
    uint8_t  eventType;
    uint8_t  recordingMode;
    uint8_t  stopReason;
    uint8_t  flags;
    uint32_t durationMs;
    uint32_t timestamp;
};
#pragma pack(pop)

static_assert(sizeof(VoiceEventData) == 12, "VoiceEventData must be 12 bytes");
```

### Event Type Definitions

```cpp
enum class VoiceEventType : uint8_t {
    RECORDING_STARTED    = 0x01,
    RECORDING_STOPPED    = 0x02,
    RECORDING_CANCELLED  = 0x03,
    PROCESSING_STARTED   = 0x04,
    PROCESSING_COMPLETE  = 0x05,
    PROCESSING_ERROR     = 0x06,
    MAX_DURATION_REACHED = 0x10,
    LOW_BATTERY_WARNING  = 0x11,
    AUDIO_LEVEL          = 0x20
};

enum class RecordingMode : uint8_t {
    NONE         = 0x00,
    PUSH_TO_TALK = 0x01,
    TOGGLE       = 0x02
};

enum class StopReason : uint8_t {
    NOT_STOPPED      = 0x00,
    USER_RELEASED    = 0x01,
    USER_TOGGLED     = 0x02,
    MAX_DURATION     = 0x03,
    LOW_BATTERY      = 0x04,
    ERROR            = 0x05,
    CANCELLED        = 0x06,
    BLE_DISCONNECTED = 0x07
};

enum VoiceEventFlags : uint8_t {
    FLAG_HAS_AUDIO     = 0x01,
    FLAG_WILL_PROCESS  = 0x02,
    FLAG_HIGH_PRIORITY = 0x04,
    FLAG_SILENT        = 0x08
};
```

### BLE Notification Sender

```cpp
class VoiceEventNotifier {
private:
    uint16_t connHandle;
    uint16_t voiceEventHandle;
    bool notificationsEnabled = false;

    // Notification queue for reliability
    static constexpr size_t QUEUE_SIZE = 8;
    VoiceEventData eventQueue[QUEUE_SIZE];
    size_t queueHead = 0;
    size_t queueTail = 0;

public:
    void setConnectionHandle(uint16_t handle) {
        connHandle = handle;
    }

    void setNotificationsEnabled(bool enabled) {
        notificationsEnabled = enabled;
    }

    // Queue an event for sending
    bool queueEvent(const VoiceEventData& event) {
        size_t nextTail = (queueTail + 1) % QUEUE_SIZE;
        if (nextTail == queueHead) {
            // Queue full - drop oldest
            queueHead = (queueHead + 1) % QUEUE_SIZE;
        }
        eventQueue[queueTail] = event;
        queueTail = nextTail;
        return true;
    }

    // Send queued events (call from main loop)
    void processSendQueue() {
        if (!notificationsEnabled) return;

        while (queueHead != queueTail) {
            VoiceEventData& event = eventQueue[queueHead];

            // Attempt to send
            int rc = ble_gattc_notify_custom(
                connHandle,
                voiceEventHandle,
                reinterpret_cast<uint8_t*>(&event),
                sizeof(VoiceEventData)
            );

            if (rc == 0) {
                // Success - advance queue
                queueHead = (queueHead + 1) % QUEUE_SIZE;
            } else if (rc == BLE_HS_ENOMEM) {
                // Buffer full - try again later
                break;
            } else {
                // Other error - skip this event
                queueHead = (queueHead + 1) % QUEUE_SIZE;
            }
        }
    }

    // Convenience methods for common events
    void notifyRecordingStarted(RecordingMode mode) {
        VoiceEventData event = {
            .eventType = static_cast<uint8_t>(VoiceEventType::RECORDING_STARTED),
            .recordingMode = static_cast<uint8_t>(mode),
            .stopReason = static_cast<uint8_t>(StopReason::NOT_STOPPED),
            .flags = FLAG_HAS_AUDIO | FLAG_WILL_PROCESS,
            .durationMs = 0,
            .timestamp = getUptimeMs()
        };
        queueEvent(event);
    }

    void notifyRecordingStopped(RecordingMode mode, StopReason reason,
                                 uint32_t durationMs) {
        VoiceEventData event = {
            .eventType = static_cast<uint8_t>(VoiceEventType::RECORDING_STOPPED),
            .recordingMode = static_cast<uint8_t>(mode),
            .stopReason = static_cast<uint8_t>(reason),
            .flags = FLAG_HAS_AUDIO | FLAG_WILL_PROCESS,
            .durationMs = durationMs,
            .timestamp = getUptimeMs()
        };
        queueEvent(event);
    }

    void notifyMaxDurationReached() {
        VoiceEventData event = {
            .eventType = static_cast<uint8_t>(VoiceEventType::MAX_DURATION_REACHED),
            .recordingMode = 0,
            .stopReason = 0,
            .flags = FLAG_HIGH_PRIORITY,
            .durationMs = 0,
            .timestamp = getUptimeMs()
        };
        queueEvent(event);
    }

    void notifyProcessingStarted() {
        VoiceEventData event = {
            .eventType = static_cast<uint8_t>(VoiceEventType::PROCESSING_STARTED),
            .recordingMode = 0,
            .stopReason = 0,
            .flags = 0,
            .durationMs = 0,
            .timestamp = getUptimeMs()
        };
        queueEvent(event);
    }

    void notifyProcessingComplete() {
        VoiceEventData event = {
            .eventType = static_cast<uint8_t>(VoiceEventType::PROCESSING_COMPLETE),
            .recordingMode = 0,
            .stopReason = 0,
            .flags = 0,
            .durationMs = 0,
            .timestamp = getUptimeMs()
        };
        queueEvent(event);
    }
};
```

### Complete Button Handler with BLE Integration

```cpp
class VoiceRecordingController {
private:
    ButtonStateMachine buttonFSM;
    VoiceEventNotifier bleNotifier;
    AudioRecorder audioRecorder;

    RecordingMode currentMode = RecordingMode::NONE;
    uint32_t recordingStartTime = 0;
    bool isRecording = false;

    static constexpr uint32_t MAX_RECORDING_MS = 60000;

public:
    void setup() {
        buttonFSM.setCallbacks(
            [this](RecordingMode mode) { startRecording(mode); },
            [this](StopReason reason) { stopRecording(reason); }
        );
    }

    void loop() {
        uint32_t now = millis();

        // Process button state machine
        buttonFSM.tick(now);

        // Check max duration
        if (isRecording && (now - recordingStartTime >= MAX_RECORDING_MS)) {
            bleNotifier.notifyMaxDurationReached();
            stopRecording(StopReason::MAX_DURATION);
        }

        // Process BLE send queue
        bleNotifier.processSendQueue();
    }

    void onButtonInterrupt(bool pressed) {
        if (pressed) {
            buttonFSM.onButtonPress(millis());
        } else {
            buttonFSM.onButtonRelease(millis());
        }
    }

private:
    void startRecording(RecordingMode mode) {
        if (isRecording) return;

        isRecording = true;
        currentMode = mode;
        recordingStartTime = millis();

        // Start hardware recording
        audioRecorder.start();

        // Notify app
        bleNotifier.notifyRecordingStarted(mode);

        // LED feedback
        setLED(LED_COLOR_RED, LED_MODE_SOLID);
    }

    void stopRecording(StopReason reason) {
        if (!isRecording) return;

        uint32_t duration = millis() - recordingStartTime;
        isRecording = false;

        // Stop hardware recording
        audioRecorder.stop();

        // Notify app
        bleNotifier.notifyRecordingStopped(currentMode, reason, duration);

        // Process audio (unless cancelled)
        if (reason != StopReason::CANCELLED) {
            processAudio();
        }

        currentMode = RecordingMode::NONE;

        // LED feedback
        setLED(LED_COLOR_BLUE, LED_MODE_PULSE);
    }

    void processAudio() {
        bleNotifier.notifyProcessingStarted();

        // Get audio buffer and queue for transcription
        auto buffer = audioRecorder.getBuffer();

        // This would typically be async
        transcriptionService.queue(buffer, [this](bool success) {
            if (success) {
                bleNotifier.notifyProcessingComplete();
            } else {
                // Handle error
                VoiceEventData event = {
                    .eventType = static_cast<uint8_t>(VoiceEventType::PROCESSING_ERROR),
                    .flags = FLAG_HIGH_PRIORITY
                };
                bleNotifier.queueEvent(event);
            }
            setLED(LED_COLOR_GREEN, LED_MODE_BLINK_ONCE);
        });
    }
};
```

### GATT Service Registration

```cpp
// Add to Device Service characteristics
static const struct ble_gatt_chr_def device_service_chars[] = {
    // ... existing characteristics ...

    // Voice Event Characteristic
    {
        .uuid = BLE_UUID128_DECLARE(
            0x07, 0x30, 0x00, 0x00,
            0x34, 0x12, 0x78, 0x56,
            0xBC, 0x9A, 0x52, 0x34,
            0x33, 0x4E, 0x49, 0x4C
        ),
        .access_cb = NULL,  // Notify only, no access callback needed
        .flags = BLE_GATT_CHR_F_NOTIFY,
        .val_handle = &voice_event_handle,
        .descriptors = (struct ble_gatt_dsc_def[]) {
            {
                .uuid = BLE_UUID16_DECLARE(0x2902),  // CCCD
                .att_flags = BLE_ATT_F_READ | BLE_ATT_F_WRITE,
                .access_cb = voice_cccd_callback,
            },
            { 0 }  // Terminator
        },
    },

    { 0 }  // Terminator
};

// CCCD callback to track notification enable/disable
static int voice_cccd_callback(uint16_t conn_handle,
                                uint16_t attr_handle,
                                struct ble_gatt_access_ctxt *ctxt,
                                void *arg) {
    if (ctxt->op == BLE_GATT_ACCESS_OP_WRITE_DSC) {
        uint16_t cccd_value = le16toh(*(uint16_t*)ctxt->om->om_data);
        bool notify_enabled = (cccd_value & 0x0001) != 0;
        voiceEventNotifier.setNotificationsEnabled(notify_enabled);
    }
    return 0;
}
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-26 | L1NEAR Team | Initial specification |

---

**Document End**
