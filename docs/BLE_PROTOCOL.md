# Prodaktiv BLE Protocol Specification

This document describes the Bluetooth Low Energy (BLE) protocol used by the Prodaktiv focus timer device.

## Overview

The Prodaktiv device communicates with the mobile app via Web Bluetooth, using a custom GATT service architecture with multiple characteristics for commands, events, and state synchronization.

## GATT Services

### Primary Services

| Service | UUID | Description |
|---------|------|-------------|
| Prodaktiv Service | `4c494e34-5234-4c49-4e33-345200000001` | Primary service for device filtering |
| Timer | `00001800-0000-1000-8000-00805f9b34fb` | Focus session timer control |
| Lock | `00001801-0000-1000-8000-00805f9b34fb` | Phone lock mechanism |
| Session | `00001802-0000-1000-8000-00805f9b34fb` | Session state sync |
| Device Info | `0000180a-0000-1000-8000-00805f9b34fb` | Device info (firmware, battery) |
| Voice | `00004c53-0000-1000-8000-00805f9b34fb` | Voice recording events |

## Characteristics

### Session Service Characteristics

| Characteristic | UUID | Properties | Description |
|----------------|------|------------|-------------|
| Session Command | `00002a20-...` | Write | Send commands to device |
| Session State | `00002a21-...` | Read, Notify | Current device state |
| Session Events | `00002a22-...` | Notify | Event notifications |

### Device Info Characteristics

| Characteristic | UUID | Properties | Description |
|----------------|------|------------|-------------|
| Firmware Version | `00002a26-...` | Read | Firmware version string |
| Battery Level | `00002a19-...` | Read, Notify | Battery percentage (0-100) |

### Voice Service Characteristics

| Characteristic | UUID | Properties | Description |
|----------------|------|------------|-------------|
| Voice Events | `00004c53-0001-1000-8000-00805f9b34fb` | Notify | Voice recording events |

## Commands (App -> Device)

Commands are sent to the Session Command characteristic.

### Packet Format

```
[0xAA] [Command] [Sequence] [Payload...]
```

| Byte | Description |
|------|-------------|
| 0 | Start byte (0xAA) |
| 1 | Command opcode |
| 2 | Sequence number (0-255, wraps) |
| 3+ | Optional payload |

### Command Opcodes

| Command | Opcode | Payload | Description |
|---------|--------|---------|-------------|
| START_FOCUS | 0x01 | [duration_low, duration_high] | Start focus session |
| END_SESSION | 0x02 | - | End current session |
| LOCK_PHONE | 0x03 | - | Engage phone lock |
| UNLOCK_PHONE | 0x04 | - | Release phone lock |
| SYNC_STATE | 0x05 | - | Request state sync |
| SET_DURATION | 0x06 | [duration_low, duration_high] | Set timer duration |
| PAUSE_SESSION | 0x07 | - | Pause session |
| RESUME_SESSION | 0x08 | - | Resume paused session |
| RESET | 0x09 | - | Reset to idle |
| ACK_EVENT | 0x0A | [event_id] | Acknowledge event |

## Events (Device -> App)

Events are sent via the Session Events characteristic.

### Packet Format

```
[0xBB] [Event] [Sequence] [PayloadLength] [Payload...] [Timestamp(4)]
```

| Byte | Description |
|------|-------------|
| 0 | Start byte (0xBB) |
| 1 | Event opcode |
| 2 | Sequence number |
| 3 | Payload length |
| 4+ | Payload bytes |
| Last 4 | Timestamp (uint32 LE, optional) |

### Event Opcodes

| Event | Opcode | Payload | Description |
|-------|--------|---------|-------------|
| DIAL_ROTATED | 0x10 | [delta_low, delta_high] | Dial rotation (signed int16) |
| PHONE_PLACED | 0x11 | - | Phone placed on dock |
| PHONE_REMOVED | 0x12 | - | Phone removed from dock |
| LOCK_ENGAGED | 0x13 | - | Lock mechanism engaged |
| LOCK_RELEASED | 0x14 | - | Lock mechanism released |
| BUTTON_PRESSED | 0x15 | - | Physical button pressed |
| TIMER_COMPLETE | 0x16 | - | Timer reached zero |
| SESSION_INTERRUPTED | 0x17 | - | Session interrupted |
| BATTERY_CHANGED | 0x18 | [percent] | Battery level changed |
| ERROR | 0xFF | [error_code] | Error occurred |

## Voice Events

Voice events are sent via the Voice Events characteristic (UUID: `0x4C53`).

### Packet Format

```
[0xDD] [VoiceEvent] [Timestamp(4)] [Duration(4)]
```

| Byte | Description |
|------|-------------|
| 0 | Start byte (0xDD) |
| 1 | Voice event opcode |
| 2-5 | Timestamp (uint32 LE, optional) |
| 6-9 | Duration in ms (uint32 LE, only for stop events) |

### Voice Event Opcodes

| Event | Opcode | Description |
|-------|--------|-------------|
| VOICE_START | 0x10 | Push-to-talk: Recording started |
| VOICE_STOP | 0x11 | Push-to-talk: Recording stopped, process audio |
| VOICE_TOGGLE_ON | 0x12 | Toggle mode: Recording started |
| VOICE_TOGGLE_OFF | 0x13 | Toggle mode: Recording stopped |

### Voice State Machine

```
                  VOICE_START
                  VOICE_TOGGLE_ON
    +-------+     ------------>    +-----------+
    | idle  |                      | recording |
    +-------+     <------------    +-----------+
        ^         VOICE_STOP            |
        |         VOICE_TOGGLE_OFF      |
        |                               v
        |                        +------------+
        +----------------------- | processing |
          (app resets after      +------------+
           audio processing)
```

**State Transitions:**
1. **idle -> recording**: Device sends `VOICE_START` or `VOICE_TOGGLE_ON`
2. **recording -> processing**: Device sends `VOICE_STOP` or `VOICE_TOGGLE_OFF`
3. **processing -> idle**: App calls `resetVoiceState()` after processing audio

### Usage Example

```typescript
import { useDevice } from '../hooks/useDevice';
import { VoiceEvent } from '../services/bluetooth';

function MyComponent() {
  const { voiceState, resetVoice } = useDevice({
    onVoiceEvent: async (event) => {
      if (event.event === VoiceEvent.VOICE_STOP) {
        // Recording ended, process the audio
        console.log(`Recording duration: ${event.durationMs}ms`);

        // Process audio here...
        await processAudio();

        // Reset voice state when done
        resetVoice();
      }
    }
  });

  return (
    <div>
      Voice State: {voiceState}
      {voiceState === 'recording' && <RecordingIndicator />}
      {voiceState === 'processing' && <ProcessingSpinner />}
    </div>
  );
}
```

## State Packet

The device periodically sends state packets via the Session State characteristic.

### Packet Format

```
[0xCC] [TimerState] [Duration(2)] [Remaining(2)] [LockState]
[PhonePresence] [Battery] [DialPosition(2)] [FW Major] [FW Minor] [FW Patch]
```

| Offset | Size | Description |
|--------|------|-------------|
| 0 | 1 | Start byte (0xCC) |
| 1 | 1 | Timer state (0=idle, 1=running, 2=paused, 3=completed) |
| 2-3 | 2 | Timer duration (minutes, LE) |
| 4-5 | 2 | Timer remaining (seconds, LE) |
| 6 | 1 | Lock state (0=unlocked, 1=locked, 2=locking, 3=unlocking) |
| 7 | 1 | Phone presence (0=absent, 1=present) |
| 8 | 1 | Battery percentage (0-100) |
| 9-10 | 2 | Dial position (signed int16, LE) |
| 11-13 | 3 | Firmware version (major.minor.patch) |

## Connection Flow

1. App scans for devices with `Prodaktiv` name prefix or Prodaktiv service UUID
2. App connects to GATT server
3. App discovers services and characteristics
4. App subscribes to:
   - Session Events (notifications)
   - Session State (notifications)
   - Battery Level (notifications)
   - Voice Events (notifications) - if available
5. App sends `SYNC_STATE` command to get initial state
6. Device is ready for use

## Error Handling

- All writes should use `writeValueWithResponse` for reliability
- Commands timeout after 5 seconds
- Max 5 automatic reconnection attempts on disconnect
- Voice characteristic may not be available on older firmware

## Firmware Compatibility

| Feature | Min Firmware |
|---------|--------------|
| Basic Timer | 1.0.0 |
| Phone Lock | 1.0.0 |
| Voice Events | 2.0.0 |
