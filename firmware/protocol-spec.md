# L1NEAR BLE GATT Protocol Specification

**Version:** 1.0.0
**Date:** 2025-12-26
**Status:** Production Ready
**Target Platform:** ESP32-S3

---

## Table of Contents

1. [Device Overview](#device-overview)
2. [BLE Configuration](#ble-configuration)
3. [GATT Service Architecture](#gatt-service-architecture)
4. [Timer Service](#timer-service)
5. [Lock Service](#lock-service)
6. [Device Service](#device-service)
7. [Data Formats](#data-formats)
8. [Command Protocol](#command-protocol)
9. [Event Flow Examples](#event-flow-examples)
10. [Power Management](#power-management)
11. [Error Handling](#error-handling)
12. [Implementation Notes](#implementation-notes)

---

## Device Overview

### Hardware Components

| Component | Description | Interface |
|-----------|-------------|-----------|
| ESP32-S3 | Main MCU with BLE 5.0 | - |
| E-Ink Display | 2.9" 296x128 B/W | SPI |
| Phone Compartment | Lockable drawer | Servo + Hall Sensor |
| Rotary Encoder | EC11 with push button | GPIO + Interrupt |
| Physical Button | Tactile momentary | GPIO |
| Battery | 3.7V 2000mAh LiPo | ADC |

### Functional Description

L1NEAR is a physical focus timer companion device that:
- Displays current session state and timer on e-ink
- Locks phone in compartment during focus sessions
- Provides tactile dial control for timer adjustments
- Syncs bidirectionally with mobile app over BLE

---

## BLE Configuration

### Device Identity

```
Device Name:        "L1NEAR-XXXX"  (XXXX = last 4 chars of MAC)
Appearance:         0x0540 (Generic Clock)
Manufacturer ID:    0xFFFF (Development)
```

### Advertising Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Interval (Idle) | 1000ms - 1200ms | Power saving mode |
| Interval (Active) | 100ms - 150ms | Fast discovery when session active |
| Interval (Pairing) | 30ms - 50ms | User initiated pairing mode |
| TX Power | 0 dBm | Balanced range/power |
| Advertising Data | See below | |

### Advertising Packet Structure

```
Bytes 0-2:    Flags (0x02 0x01 0x06)
Bytes 3-15:   Complete Local Name "L1NEAR-XXXX"
Bytes 16-17:  Appearance (0x03 0x19 0x40 0x05)
Bytes 18-21:  Service UUID (Timer Service - shortened)
```

### Scan Response Data

```
Bytes 0-3:    Manufacturer Data Header
Bytes 4:      Firmware Version Major
Bytes 5:      Firmware Version Minor
Bytes 6:      Battery Level (0-100)
Bytes 7:      Device State (see below)
```

### Connection Parameters

| Parameter | Min | Max | Notes |
|-----------|-----|-----|-------|
| Connection Interval | 15ms | 30ms | Fast updates during active session |
| Slave Latency | 0 | 4 | Allow some power saving |
| Supervision Timeout | 4000ms | 6000ms | Handle brief disconnects |
| MTU | 247 | 512 | Negotiate maximum |

---

## GATT Service Architecture

### Service UUID Base

All custom UUIDs use the base:
```
Base: XXXXXXXX-1234-5678-9ABC-L1NEARDEVICE
Format: XXXXXXXX-1234-5678-9ABC-4C494E333452
```

### Service Overview

```
+------------------------------------------+
|           L1NEAR Device                  |
+------------------------------------------+
|                                          |
|  +------------------------------------+  |
|  | Timer Service                      |  |
|  | UUID: 00001001-1234-5678-9ABC-...  |  |
|  |                                    |  |
|  | - Session State (R/N)              |  |
|  | - Timer Control (W)                |  |
|  | - Session Config (R/W)             |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | Lock Service                       |  |
|  | UUID: 00002001-1234-5678-9ABC-...  |  |
|  |                                    |  |
|  | - Lock State (R/N)                 |  |
|  | - Lock Control (W)                 |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | Device Service                     |  |
|  | UUID: 00003001-1234-5678-9ABC-...  |  |
|  |                                    |  |
|  | - Battery Level (R/N)              |  |
|  | - Dial Position (R/N)              |  |
|  | - Button Event (N)                 |  |
|  | - Display Control (W)              |  |
|  | - Device Info (R)                  |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
```

---

## Timer Service

**Service UUID:** `00001001-1234-5678-9ABC-4C494E333452`

### Characteristics

#### Session State (Read/Notify)

**UUID:** `00001002-1234-5678-9ABC-4C494E333452`

| Property | Value |
|----------|-------|
| Permissions | Read, Notify |
| Descriptors | CCCD (0x2902) |

**Data Format (8 bytes):**

```
Offset  Size  Field           Description
------  ----  -----           -----------
0       1     phase           Current phase (enum)
1       2     timer_seconds   Remaining time (uint16_le)
3       1     session_count   Completed sessions today (uint8)
4       1     is_running      Timer active flag (bool)
5       1     score_total     Current day score (uint8)
6       2     reserved        Future use (0x0000)
```

**Phase Enum Values:**

| Value | Phase | Description |
|-------|-------|-------------|
| 0x00 | PLANNING | Session setup phase |
| 0x01 | FOCUS | Active deep work (90 min) |
| 0x02 | BREAK | Rest period (15 min) |
| 0x03 | ADMIN | Administrative tasks |
| 0x04 | SHUTDOWN | End of day ritual |
| 0x05 | COMPLETED | Day complete |
| 0x10 | DEEP_WORK_1 | First deep work block |
| 0x11 | DEEP_WORK_2 | Second deep work block |
| 0x20 | BUILD | Extended build session |
| 0xFF | EMERGENCY | Minimum viable mode |

**Notification Triggers:**
- Phase change
- Timer tick (every 1 second when running)
- Session count increment

---

#### Timer Control (Write)

**UUID:** `00001003-1234-5678-9ABC-4C494E333452`

| Property | Value |
|----------|-------|
| Permissions | Write |
| Write Type | Write with Response |

**Command Format (4 bytes):**

```
Offset  Size  Field           Description
------  ----  -----           -----------
0       1     command         Command opcode
1       2     payload         Command-specific data
3       1     crc8            CRC-8/MAXIM of bytes 0-2
```

**Command Opcodes:**

| Opcode | Command | Payload | Description |
|--------|---------|---------|-------------|
| 0x01 | START | 0x0000 | Start/resume timer |
| 0x02 | PAUSE | 0x0000 | Pause timer |
| 0x03 | RESET | duration_sec | Reset to specified duration |
| 0x04 | END_SESSION | 0x0000 | End current session, advance phase |
| 0x05 | SET_PHASE | phase_id | Force phase transition |
| 0x06 | ADJUST_TIME | delta_sec (signed) | Add/subtract seconds |
| 0x10 | EMERGENCY_MODE | enable (0/1) | Toggle minimum viable mode |

**Response (Write Response):**

| Value | Meaning |
|-------|---------|
| 0x00 | Success |
| 0x01 | Invalid command |
| 0x02 | Invalid state transition |
| 0x03 | CRC error |
| 0x04 | Lock prevents action |

---

#### Session Config (Read/Write)

**UUID:** `00001004-1234-5678-9ABC-4C494E333452`

| Property | Value |
|----------|-------|
| Permissions | Read, Write |

**Data Format (12 bytes):**

```
Offset  Size  Field               Description
------  ----  -----               -----------
0       2     focus_duration      Focus session length (seconds)
2       2     break_duration      Break length (seconds)
4       2     emergency_duration  Emergency mode duration (seconds)
6       1     auto_lock           Auto-lock on focus start (bool)
7       1     auto_display_off    Dim display during focus (bool)
8       1     haptic_feedback     Enable dial haptics (bool)
9       1     sound_enabled       Enable audio alerts (bool)
10      2     reserved            Future use
```

**Default Values:**
- focus_duration: 5400 (90 minutes)
- break_duration: 900 (15 minutes)
- emergency_duration: 1200 (20 minutes)
- auto_lock: 1 (enabled)
- auto_display_off: 0 (disabled)
- haptic_feedback: 1 (enabled)
- sound_enabled: 1 (enabled)

---

## Lock Service

**Service UUID:** `00002001-1234-5678-9ABC-4C494E333452`

### Characteristics

#### Lock State (Read/Notify)

**UUID:** `00002002-1234-5678-9ABC-4C494E333452`

| Property | Value |
|----------|-------|
| Permissions | Read, Notify |
| Descriptors | CCCD (0x2902) |

**Data Format (4 bytes):**

```
Offset  Size  Field           Description
------  ----  -----           -----------
0       1     lock_state      Current lock state (enum)
1       1     phone_present   Phone detected in compartment
2       1     lock_source     Who initiated lock
3       1     unlock_allowed  Can unlock now (based on session)
```

**Lock State Enum:**

| Value | State | Description |
|-------|-------|-------------|
| 0x00 | UNLOCKED | Compartment open |
| 0x01 | LOCKED | Compartment secured |
| 0x02 | LOCKING | Servo in motion (lock) |
| 0x03 | UNLOCKING | Servo in motion (unlock) |
| 0x04 | JAMMED | Mechanical obstruction |
| 0x05 | ERROR | System fault |

**Lock Source Enum:**

| Value | Source | Description |
|-------|--------|-------------|
| 0x00 | NONE | No active lock |
| 0x01 | APP | Locked via BLE command |
| 0x02 | AUTO | Auto-locked on focus start |
| 0x03 | BUTTON | Locked via physical button |
| 0x04 | DIAL | Locked via dial gesture |

**Notification Triggers:**
- Lock state change
- Phone presence change
- Unlock permission change

---

#### Lock Control (Write)

**UUID:** `00002003-1234-5678-9ABC-4C494E333452`

| Property | Value |
|----------|-------|
| Permissions | Write |
| Write Type | Write with Response |

**Command Format (4 bytes):**

```
Offset  Size  Field           Description
------  ----  -----           -----------
0       1     command         Command opcode
1       1     flags           Command flags
2       1     reserved        0x00
3       1     crc8            CRC-8/MAXIM of bytes 0-2
```

**Command Opcodes:**

| Opcode | Command | Flags | Description |
|--------|---------|-------|-------------|
| 0x01 | LOCK | 0x00 | Lock compartment |
| 0x02 | UNLOCK | 0x00 | Unlock compartment |
| 0x03 | UNLOCK | 0x01 | Force unlock (emergency override) |
| 0x10 | QUERY | 0x00 | Request state notification |

**Lock Command Flags:**

| Bit | Flag | Description |
|-----|------|-------------|
| 0 | FORCE | Override session lock |
| 1 | SILENT | No haptic/audio feedback |
| 2-7 | Reserved | Must be 0 |

**Response (Write Response):**

| Value | Meaning |
|-------|---------|
| 0x00 | Success |
| 0x01 | Session active, unlock denied |
| 0x02 | Already in requested state |
| 0x03 | CRC error |
| 0x04 | Hardware fault |
| 0x05 | Phone not present (for lock) |

---

## Device Service

**Service UUID:** `00003001-1234-5678-9ABC-4C494E333452`

### Characteristics

#### Battery Level (Read/Notify)

**UUID:** `00003002-1234-5678-9ABC-4C494E333452`

| Property | Value |
|----------|-------|
| Permissions | Read, Notify |
| Descriptors | CCCD (0x2902), CPF (0x2904) |

**Data Format (4 bytes):**

```
Offset  Size  Field           Description
------  ----  -----           -----------
0       1     level           Battery percentage (0-100)
1       1     charging        Charging state (enum)
2       2     voltage_mv      Battery voltage in millivolts
```

**Charging State Enum:**

| Value | State | Description |
|-------|-------|-------------|
| 0x00 | NOT_CHARGING | On battery |
| 0x01 | CHARGING | USB connected, charging |
| 0x02 | FULL | Charge complete |
| 0x03 | ERROR | Charge fault |

**Notification Triggers:**
- Level change >= 1%
- Charging state change
- Low battery warning (< 20%)
- Critical battery (< 5%)

---

#### Dial Position (Read/Notify)

**UUID:** `00003003-1234-5678-9ABC-4C494E333452`

| Property | Value |
|----------|-------|
| Permissions | Read, Notify |
| Descriptors | CCCD (0x2902) |

**Data Format (6 bytes):**

```
Offset  Size  Field           Description
------  ----  -----           -----------
0       2     position        Absolute encoder position (int16)
1       2     delta           Change since last notification (int16)
4       1     button_state    Encoder button state
5       1     gesture         Detected gesture (enum)
```

**Gesture Enum:**

| Value | Gesture | Description |
|-------|---------|-------------|
| 0x00 | NONE | No gesture |
| 0x01 | ROTATE_CW | Clockwise rotation |
| 0x02 | ROTATE_CCW | Counter-clockwise |
| 0x03 | CLICK | Single press |
| 0x04 | DOUBLE_CLICK | Double press |
| 0x05 | LONG_PRESS | Hold > 1 second |
| 0x06 | ROTATE_CLICK | Rotate while pressed |

**Notification Triggers:**
- Position change (with debounce: 50ms)
- Button state change
- Gesture completion

**Dial Behavior by Phase:**

| Phase | Dial Function |
|-------|---------------|
| PLANNING | Scroll through tasks |
| FOCUS | Adjust timer (+/- 5 min per detent) |
| BREAK | No function |
| SHUTDOWN | Scroll shutdown checklist |

---

#### Button Event (Notify Only)

**UUID:** `00003004-1234-5678-9ABC-4C494E333452`

| Property | Value |
|----------|-------|
| Permissions | Notify |
| Descriptors | CCCD (0x2902) |

**Data Format (4 bytes):**

```
Offset  Size  Field           Description
------  ----  -----           -----------
0       1     button_id       Physical button identifier
1       1     event_type      Press event type
2       2     duration_ms     Press duration (for releases)
```

**Button ID:**

| Value | Button | Location |
|-------|--------|----------|
| 0x01 | MAIN | Front panel button |
| 0x02 | ENCODER | Rotary encoder press |
| 0x03 | SIDE | Side button (if present) |

**Event Type:**

| Value | Event | Description |
|-------|-------|-------------|
| 0x01 | PRESSED | Button down |
| 0x02 | RELEASED | Button up |
| 0x03 | CLICK | Press + release < 500ms |
| 0x04 | DOUBLE_CLICK | Two clicks < 300ms apart |
| 0x05 | LONG_PRESS | Hold >= 1000ms |
| 0x06 | VERY_LONG_PRESS | Hold >= 3000ms |

**Button Actions (Default Mapping):**

| Button | Event | Action |
|--------|-------|--------|
| MAIN | CLICK | Start/pause timer |
| MAIN | LONG_PRESS | End session |
| MAIN | VERY_LONG_PRESS | Emergency unlock |
| ENCODER | CLICK | Confirm selection |
| ENCODER | LONG_PRESS | Toggle lock |

---

#### Display Control (Write)

**UUID:** `00003005-1234-5678-9ABC-4C494E333452`

| Property | Value |
|----------|-------|
| Permissions | Write |
| Write Type | Write with Response |

**Command Format (Variable, max 64 bytes):**

```
Offset  Size  Field           Description
------  ----  -----           -----------
0       1     command         Display command opcode
1       1     length          Payload length
2       N     payload         Command-specific data
N+2     1     crc8            CRC-8/MAXIM
```

**Command Opcodes:**

| Opcode | Command | Payload | Description |
|--------|---------|---------|-------------|
| 0x01 | REFRESH | - | Force full display refresh |
| 0x02 | SET_BRIGHTNESS | level (0-255) | Backlight control |
| 0x03 | SHOW_MESSAGE | string (UTF-8) | Display custom message |
| 0x04 | SHOW_PROGRESS | percent (0-100) | Show progress bar |
| 0x05 | CLEAR | - | Clear display |
| 0x10 | SET_THEME | theme_id | Switch display theme |
| 0x20 | POWER_MODE | mode | Display power state |

**Display Power Modes:**

| Value | Mode | Description |
|-------|------|-------------|
| 0x00 | NORMAL | Full refresh rate |
| 0x01 | LOW_POWER | Reduced updates |
| 0x02 | SLEEP | Display off, fast wake |
| 0x03 | DEEP_SLEEP | Display off, slow wake |

---

#### Device Info (Read)

**UUID:** `00003006-1234-5678-9ABC-4C494E333452`

| Property | Value |
|----------|-------|
| Permissions | Read |

**Data Format (20 bytes):**

```
Offset  Size  Field               Description
------  ----  -----               -----------
0       1     hw_version_major    Hardware revision major
1       1     hw_version_minor    Hardware revision minor
2       1     fw_version_major    Firmware version major
3       1     fw_version_minor    Firmware version minor
4       1     fw_version_patch    Firmware version patch
5       1     protocol_version    This protocol version (0x01)
6       6     mac_address         BLE MAC address
12      4     serial_number       Unique device serial
16      4     uptime_seconds      Time since boot
```

---

## Data Formats

### Byte Order

All multi-byte values use **little-endian** byte order.

```c
// Example: timer_seconds = 5400 (90 minutes)
// Memory layout: 0x18 0x15 (LSB first)
uint16_t timer_seconds = 5400;
// bytes[0] = 0x18
// bytes[1] = 0x15
```

### CRC-8 Calculation

All write commands include CRC-8/MAXIM (Dallas/iButton) checksum.

**Polynomial:** 0x31 (x^8 + x^5 + x^4 + 1)
**Initial Value:** 0x00
**Reflect Input:** Yes
**Reflect Output:** Yes
**XOR Output:** 0x00

```c
uint8_t crc8_maxim(const uint8_t *data, size_t len) {
    uint8_t crc = 0x00;
    for (size_t i = 0; i < len; i++) {
        uint8_t byte = data[i];
        for (int j = 0; j < 8; j++) {
            uint8_t mix = (crc ^ byte) & 0x01;
            crc >>= 1;
            if (mix) crc ^= 0x8C;
            byte >>= 1;
        }
    }
    return crc;
}
```

### Timestamp Format

Timestamps use Unix epoch (seconds since 1970-01-01 00:00:00 UTC), stored as `uint32_t`.

### String Encoding

All strings are UTF-8 encoded, null-terminated when space permits.

---

## Command Protocol

### Write Command Flow

```
+--------+                           +--------+
|  App   |                           | Device |
+--------+                           +--------+
    |                                    |
    |  1. Write Command                  |
    |----------------------------------->|
    |                                    |
    |          2. Validate CRC           |
    |                                    |
    |          3. Process Command        |
    |                                    |
    |  4. Write Response (ATT)           |
    |<-----------------------------------|
    |                                    |
    |  5. State Notification (if changed)|
    |<-----------------------------------|
    |                                    |
```

### Command Acknowledgment

Write commands receive immediate ATT-level response:
- **Success (0x00):** Command accepted and executed
- **Error (0x01-0xFF):** Command rejected with error code

State changes trigger separate notifications on relevant characteristics.

### Command Rate Limiting

| Command Type | Max Rate | Burst |
|--------------|----------|-------|
| Timer Control | 5/sec | 10 |
| Lock Control | 2/sec | 5 |
| Display Control | 2/sec | 3 |
| Dial Events | 20/sec | 50 |

---

## Event Flow Examples

### Example 1: User Starts Focus Session from App

```
Timeline    App                 BLE                  Device
--------    ---                 ---                  ------
T+0ms       Write START cmd     -->
            [0x01 0x00 0x00 CRC]
                                                     Validate CRC
                                                     Check lock state
                                                     Start timer
T+15ms                          <-- ATT Response
                                    [0x00 = Success]
T+20ms                          <-- Session State    Update display
                                    Notification     "FOCUS 90:00"
                                    [0x01 0x18 0x15
                                     0x00 0x01 ...]
T+25ms                          <-- Lock State       Engage lock
                                    Notification     (if auto_lock)
                                    [0x02 0x01 0x02 0x00]
T+200ms                         <-- Lock State
                                    Notification
                                    [0x01 0x01 0x02 0x00]
                                    (LOCKED)
T+1000ms                        <-- Session State    Timer tick
                                    [0x01 0x17 0x15 ...]
```

### Example 2: User Rotates Dial During Focus

```
Timeline    Device              BLE                  App
--------    ------              ---                  ---
T+0ms       User rotates
            dial 3 detents CW

T+10ms      Debounce start

T+60ms      Debounce complete   Dial Position -->
                                Notification
                                [pos=+3, delta=+3,
                                 btn=0, gesture=0x01]

T+65ms                                               Calculate new time
                                                     (+3 detents = +15 min)

T+70ms                          <-- Timer Control
                                ADJUST_TIME cmd
                                [0x06 0x84 0x03 CRC]
                                (delta = +900 sec)

T+80ms                          ATT Response -->
                                [0x00 = Success]

T+85ms                          Session State -->    Update UI
                                Notification
                                [timer = 6300 sec]

T+90ms      Update display
            "FOCUS 105:00"
```

### Example 3: Phone Placed in Compartment

```
Timeline    Device              BLE                  App
--------    ------              ---                  ---
T+0ms       Hall sensor
            detects phone

T+50ms      Debounce complete   Lock State -->
                                Notification
                                [0x00 0x01 0x00 0x00]
                                (UNLOCKED, phone=YES)

T+55ms                                               Show "Phone detected"
                                                     Enable "Lock" button

            --- User continues with focus ---

T+N         User starts focus   <-- Timer Control
                                START cmd

T+N+15ms                        Session State -->

T+N+20ms    Auto-lock engaged   Lock State -->
            (servo activates)   [0x02 ...]
                                (LOCKING)

T+N+200ms   Lock complete       Lock State -->       Update lock icon
                                [0x01 0x01 0x02 0x00]
```

### Example 4: Session Ends (Timer Expires)

```
Timeline    Device              BLE                  App
--------    ------              ---                  ---
T+0ms       Timer reaches 0

T+5ms       Play completion
            sound/haptic

T+10ms      Update display      Session State -->
            "BREAK 15:00"       Notification
                                [0x02 0x84 0x03      Update UI
                                 0x01 0x00 ...]      "Break time!"
                                (BREAK, 900s,
                                 session_count=1)

T+15ms                          Lock State -->
                                Notification
                                [0x03 0x01 0x02 0x01]
                                (UNLOCKING, unlock_allowed=YES)

T+200ms     Lock disengaged     Lock State -->
                                [0x00 0x01 0x00 0x01]
                                (UNLOCKED)
```

### Example 5: Emergency Unlock (Long Press)

```
Timeline    Device              BLE                  App
--------    ------              ---                  ---
T+0ms       User presses
            main button

T+1000ms    Long press
            threshold

T+3000ms    Very long press     Button Event -->     Show warning
            threshold           [0x01 0x06 0xB8 0x0B]
                                (MAIN, VERY_LONG, 3000ms)

T+3010ms    Emergency unlock    Lock State -->       Update UI
            initiated           [0x03 0x01 0x01 0x00]"Emergency unlock"
                                (UNLOCKING, source=APP...
                                 wait, source=BUTTON)
                                [0x03 0x01 0x03 0x00]

T+3200ms    Lock disengaged     Lock State -->
                                [0x00 0x01 0x00 0x00]

T+3210ms    Session ended       Session State -->    Update score
            (penalty applied)   [0x00 0x00 0x00      (no points)
                                 0x00 0x00 ...]
```

---

## Power Management

### Power States

```
+------------------+
|   ADVERTISING    |  <-- Default on boot
|   (Low Power)    |
+--------+---------+
         |
         | Connection established
         v
+--------+---------+
|    CONNECTED     |
|    (Active)      |
+--------+---------+
         |
         | Idle > 30 seconds
         v
+--------+---------+
|    CONNECTED     |
|   (Low Power)    |
+--------+---------+
         |
         | Session starts
         v
+--------+---------+
|    SESSION       |
|    (Active)      |
+------------------+
```

### Power Consumption Targets

| State | Current Draw | Notes |
|-------|-------------|-------|
| Deep Sleep | < 50 uA | Display off, no BLE |
| Advertising (Slow) | < 500 uA | 1s interval |
| Advertising (Fast) | < 2 mA | 100ms interval |
| Connected (Idle) | < 1 mA | Slow connection interval |
| Connected (Active) | < 15 mA | Fast updates, display on |
| Session Active | < 25 mA | Lock engaged, display updating |
| Peak (Lock motor) | < 200 mA | 200ms duration |

### Battery Life Targets

| Usage Pattern | Expected Life |
|---------------|---------------|
| Standby | > 30 days |
| 1 session/day | > 14 days |
| 4 sessions/day | > 5 days |
| Heavy use | > 2 days |

### Connection Parameter Updates

Device may request connection parameter updates based on state:

| State | Interval | Latency | Timeout |
|-------|----------|---------|---------|
| Active Session | 15ms | 0 | 4000ms |
| Connected Idle | 100ms | 4 | 6000ms |
| Low Battery | 200ms | 8 | 8000ms |

---

## Error Handling

### Error Codes

| Code | Name | Description | Recovery |
|------|------|-------------|----------|
| 0x00 | SUCCESS | Operation completed | - |
| 0x01 | ERR_INVALID_CMD | Unknown command opcode | Check command format |
| 0x02 | ERR_INVALID_STATE | Command not valid in current state | Check session state |
| 0x03 | ERR_CRC | CRC validation failed | Retry with correct CRC |
| 0x04 | ERR_LOCK_BLOCKED | Lock prevents operation | Wait for unlock or use FORCE |
| 0x05 | ERR_HARDWARE | Hardware fault detected | Device reset may be needed |
| 0x06 | ERR_BUSY | Previous operation in progress | Wait and retry |
| 0x07 | ERR_TIMEOUT | Operation timed out | Retry |
| 0x08 | ERR_NOT_CONNECTED | No BLE connection | Establish connection |
| 0x09 | ERR_PERMISSION | Operation not permitted | Check authentication |
| 0x0A | ERR_INVALID_PARAM | Parameter out of range | Check value bounds |
| 0xFF | ERR_UNKNOWN | Unspecified error | Contact support |

### Retry Policy

| Error Type | Retry | Delay | Max Attempts |
|------------|-------|-------|--------------|
| CRC Error | Yes | 0ms | 3 |
| Busy | Yes | 100ms | 5 |
| Timeout | Yes | 500ms | 3 |
| Hardware | No | - | - |
| State Error | No | - | - |

### Watchdog Behavior

- Hardware watchdog: 8 second timeout
- Software watchdog: 30 second timeout
- BLE supervision timeout: 6 seconds

If watchdog triggers:
1. Log error to flash
2. Disengage lock (safety)
3. Reset device
4. Resume advertising

---

## Implementation Notes

### Firmware Team Checklist

#### BLE Stack Configuration

```c
// ESP-IDF BLE configuration
#define CONFIG_BT_NIMBLE_ENABLED 1
#define CONFIG_BT_NIMBLE_MAX_CONNECTIONS 1
#define CONFIG_BT_NIMBLE_MAX_BONDS 3
#define CONFIG_BT_NIMBLE_ATT_PREFERRED_MTU 247
#define CONFIG_BT_NIMBLE_SVC_GAP_CENTRAL_ADDRESS_RESOLUTION 0
```

#### Characteristic Handles

Pre-assign handles for efficient lookup:

```c
typedef enum {
    HANDLE_TIMER_SESSION_STATE = 0x0010,
    HANDLE_TIMER_SESSION_STATE_CCC = 0x0011,
    HANDLE_TIMER_CONTROL = 0x0012,
    HANDLE_TIMER_CONFIG = 0x0013,

    HANDLE_LOCK_STATE = 0x0020,
    HANDLE_LOCK_STATE_CCC = 0x0021,
    HANDLE_LOCK_CONTROL = 0x0022,

    HANDLE_DEVICE_BATTERY = 0x0030,
    HANDLE_DEVICE_BATTERY_CCC = 0x0031,
    HANDLE_DEVICE_DIAL = 0x0032,
    HANDLE_DEVICE_DIAL_CCC = 0x0033,
    HANDLE_DEVICE_BUTTON = 0x0034,
    HANDLE_DEVICE_BUTTON_CCC = 0x0035,
    HANDLE_DEVICE_DISPLAY = 0x0036,
    HANDLE_DEVICE_INFO = 0x0037,
} gatt_handles_t;
```

#### Notification Buffer Management

```c
// Maintain notification queue for reliability
#define NOTIFICATION_QUEUE_SIZE 16

typedef struct {
    uint16_t handle;
    uint8_t data[20];
    uint8_t len;
    uint8_t retries;
} notification_t;

// Send notifications in order, retry on failure
```

#### E-Ink Display Updates

```c
// Partial refresh for timer updates (fast, no flicker)
#define DISPLAY_PARTIAL_REFRESH_INTERVAL_MS 1000

// Full refresh to prevent ghosting
#define DISPLAY_FULL_REFRESH_INTERVAL_MS 300000  // 5 minutes

// E-ink update during focus session
// Only update timer digits, not full screen
```

#### Lock Servo Control

```c
// Servo PWM configuration
#define SERVO_PWM_FREQ 50          // Hz
#define SERVO_LOCKED_DUTY 2.5      // % (0 degrees)
#define SERVO_UNLOCKED_DUTY 12.5   // % (180 degrees)
#define SERVO_MOVEMENT_TIME_MS 200

// Safety: Always allow emergency unlock
#define EMERGENCY_UNLOCK_HOLD_MS 3000
```

#### Rotary Encoder Debouncing

```c
// Encoder configuration
#define ENCODER_DEBOUNCE_MS 5
#define ENCODER_DETENT_THRESHOLD 4  // Pulses per detent
#define ENCODER_BUTTON_DEBOUNCE_MS 50
#define DOUBLE_CLICK_WINDOW_MS 300
#define LONG_PRESS_THRESHOLD_MS 1000
```

### Security Considerations

1. **No Pairing Required:** Device uses open pairing for ease of use
2. **Command CRC:** All writes validated with CRC-8
3. **State Machine:** Invalid state transitions rejected
4. **Emergency Override:** Physical long-press always unlocks
5. **Watchdog:** Hardware reset on firmware hang

### Testing Requirements

| Test Case | Description | Pass Criteria |
|-----------|-------------|---------------|
| BLE-001 | Advertising discovery | Found within 5 seconds |
| BLE-002 | Connection establishment | Connected within 2 seconds |
| BLE-003 | MTU negotiation | MTU >= 247 bytes |
| BLE-004 | Notification subscription | All CCCs writable |
| TMR-001 | Start session | Phase changes to FOCUS |
| TMR-002 | Timer accuracy | Drift < 1 second/hour |
| TMR-003 | Session end | Phase changes to BREAK |
| LCK-001 | Lock engagement | Servo completes in 200ms |
| LCK-002 | Phone detection | Hall sensor triggers < 100ms |
| LCK-003 | Emergency unlock | Always succeeds |
| PWR-001 | Sleep current | < 50 uA in deep sleep |
| PWR-002 | Active current | < 25 mA during session |

### OTA Update Considerations

- Reserve 1MB flash partition for OTA
- Validate firmware signature before apply
- Maintain BLE connection during download
- Rollback on failed update

---

## Appendix A: UUID Reference

```
Timer Service:        00001001-1234-5678-9ABC-4C494E333452
  Session State:      00001002-1234-5678-9ABC-4C494E333452
  Timer Control:      00001003-1234-5678-9ABC-4C494E333452
  Session Config:     00001004-1234-5678-9ABC-4C494E333452

Lock Service:         00002001-1234-5678-9ABC-4C494E333452
  Lock State:         00002002-1234-5678-9ABC-4C494E333452
  Lock Control:       00002003-1234-5678-9ABC-4C494E333452

Device Service:       00003001-1234-5678-9ABC-4C494E333452
  Battery Level:      00003002-1234-5678-9ABC-4C494E333452
  Dial Position:      00003003-1234-5678-9ABC-4C494E333452
  Button Event:       00003004-1234-5678-9ABC-4C494E333452
  Display Control:    00003005-1234-5678-9ABC-4C494E333452
  Device Info:        00003006-1234-5678-9ABC-4C494E333452
```

---

## Appendix B: CRC-8 Lookup Table

```c
static const uint8_t crc8_table[256] = {
    0x00, 0x5E, 0xBC, 0xE2, 0x61, 0x3F, 0xDD, 0x83,
    0xC2, 0x9C, 0x7E, 0x20, 0xA3, 0xFD, 0x1F, 0x41,
    0x9D, 0xC3, 0x21, 0x7F, 0xFC, 0xA2, 0x40, 0x1E,
    0x5F, 0x01, 0xE3, 0xBD, 0x3E, 0x60, 0x82, 0xDC,
    0x23, 0x7D, 0x9F, 0xC1, 0x42, 0x1C, 0xFE, 0xA0,
    0xE1, 0xBF, 0x5D, 0x03, 0x80, 0xDE, 0x3C, 0x62,
    0xBE, 0xE0, 0x02, 0x5C, 0xDF, 0x81, 0x63, 0x3D,
    0x7C, 0x22, 0xC0, 0x9E, 0x1D, 0x43, 0xA1, 0xFF,
    0x46, 0x18, 0xFA, 0xA4, 0x27, 0x79, 0x9B, 0xC5,
    0x84, 0xDA, 0x38, 0x66, 0xE5, 0xBB, 0x59, 0x07,
    0xDB, 0x85, 0x67, 0x39, 0xBA, 0xE4, 0x06, 0x58,
    0x19, 0x47, 0xA5, 0xFB, 0x78, 0x26, 0xC4, 0x9A,
    0x65, 0x3B, 0xD9, 0x87, 0x04, 0x5A, 0xB8, 0xE6,
    0xA7, 0xF9, 0x1B, 0x45, 0xC6, 0x98, 0x7A, 0x24,
    0xF8, 0xA6, 0x44, 0x1A, 0x99, 0xC7, 0x25, 0x7B,
    0x3A, 0x64, 0x86, 0xD8, 0x5B, 0x05, 0xE7, 0xB9,
    0x8C, 0xD2, 0x30, 0x6E, 0xED, 0xB3, 0x51, 0x0F,
    0x4E, 0x10, 0xF2, 0xAC, 0x2F, 0x71, 0x93, 0xCD,
    0x11, 0x4F, 0xAD, 0xF3, 0x70, 0x2E, 0xCC, 0x92,
    0xD3, 0x8D, 0x6F, 0x31, 0xB2, 0xEC, 0x0E, 0x50,
    0xAF, 0xF1, 0x13, 0x4D, 0xCE, 0x90, 0x72, 0x2C,
    0x6D, 0x33, 0xD1, 0x8F, 0x0C, 0x52, 0xB0, 0xEE,
    0x32, 0x6C, 0x8E, 0xD0, 0x53, 0x0D, 0xEF, 0xB1,
    0xF0, 0xAE, 0x4C, 0x12, 0x91, 0xCF, 0x2D, 0x73,
    0xCA, 0x94, 0x76, 0x28, 0xAB, 0xF5, 0x17, 0x49,
    0x08, 0x56, 0xB4, 0xEA, 0x69, 0x37, 0xD5, 0x8B,
    0x57, 0x09, 0xEB, 0xB5, 0x36, 0x68, 0x8A, 0xD4,
    0x95, 0xCB, 0x29, 0x77, 0xF4, 0xAA, 0x48, 0x16,
    0xE9, 0xB7, 0x55, 0x0B, 0x88, 0xD6, 0x34, 0x6A,
    0x2B, 0x75, 0x97, 0xC9, 0x4A, 0x14, 0xF6, 0xA8,
    0x74, 0x2A, 0xC8, 0x96, 0x15, 0x4B, 0xA9, 0xF7,
    0xB6, 0xE8, 0x0A, 0x54, 0xD7, 0x89, 0x6B, 0x35
};

uint8_t crc8_fast(const uint8_t *data, size_t len) {
    uint8_t crc = 0x00;
    for (size_t i = 0; i < len; i++) {
        crc = crc8_table[crc ^ data[i]];
    }
    return crc;
}
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-26 | L1NEAR Team | Initial specification |

---

**Document End**
