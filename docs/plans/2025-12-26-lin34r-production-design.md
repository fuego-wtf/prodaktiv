# LIN34R Production Design

**Date**: 2025-12-26
**Status**: In Progress

## Overview

LIN34R is a productivity system combining:
1. **Web App** - React-based focus timer with Linear integration
2. **Hardware Device** - ESP32-based phone locker with e-ink display

The device enforces focus by physically locking your phone during deep work sessions.

## Product Components

### Hardware Device
- **MCU**: ESP32 with BLE
- **Display**: E-ink (shows session info, time remaining, progress)
- **Phone Compartment**: Transparent cover with electronic lock
- **Controls**: Rotary dial, physical button, lock switch
- **Sensors**: Phone presence detection
- **Power**: USB-C charging, battery backup

### Web Application
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **External APIs**: Linear (task management), Gemini (AI assistance)
- **Device Communication**: Web Bluetooth API

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        LIN34R SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐         BLE          ┌─────────────────┐ │
│   │   WEB APP       │◄────────────────────►│   DEVICE        │ │
│   │   (Browser)     │    Web Bluetooth     │   (ESP32)       │ │
│   │                 │                      │                 │ │
│   │  ┌───────────┐  │    GATT Services:    │  ┌───────────┐  │ │
│   │  │ Timer     │◄─┼──► Timer Service ◄───┼──│ E-ink     │  │ │
│   │  │ State     │  │    Lock Service      │  │ Display   │  │ │
│   │  │ Linear    │  │    Session Service   │  │           │  │ │
│   │  └───────────┘  │                      │  ├───────────┤  │ │
│   │                 │    Commands:         │  │ Rotary    │  │ │
│   │  ┌───────────┐  │    • START_FOCUS     │  │ Encoder   │  │ │
│   │  │ useDevice │◄─┼──► • END_SESSION     │  ├───────────┤  │ │
│   │  │ Hook      │  │    • LOCK_PHONE      │  │ Lock      │  │ │
│   │  └───────────┘  │    • UNLOCK_PHONE    │  │ Mechanism │  │ │
│   │                 │                      │  ├───────────┤  │ │
│   │  ┌───────────┐  │    Events:           │  │ Phone     │  │ │
│   │  │ Score     │◄─┼──► • DIAL_ROTATED    │  │ Detect    │  │ │
│   │  │ board     │  │    • PHONE_PLACED    │  │ Sensor    │  │ │
│   │  └───────────┘  │    • LOCK_ENGAGED    │  └───────────┘  │ │
│   │                 │    • SESSION_END_BTN │                 │ │
│   └─────────────────┘                      └─────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## User Flow

### Session Start
1. User opens web app, plans their day
2. Selects tasks from Linear
3. Places phone in device compartment
4. Device detects phone, app prompts "Lock phone?"
5. User confirms → phone locks
6. Focus session starts, timer syncs to device display

### During Session
- Device display shows: session name, time remaining, progress bar
- Rotary dial can adjust timer (with app permission)
- Physical button can pause (brief) or end session
- Phone stays locked until session ends or emergency unlock

### Session End
- Timer hits zero OR user ends via app/device button
- Phone unlocks automatically
- Scoreboard updates in app
- Break timer starts (if configured)

## File Structure (After)

```
lin34r/
├── App.tsx
├── types.ts                        # Updated with DeviceState
├── components/
│   ├── DeviceStatus.tsx            # NEW: BLE connection indicator
│   ├── DevicePairing.tsx           # NEW: Pairing modal
│   ├── PhoneLock.tsx               # NEW: Lock controls
│   └── ... (existing)
├── hooks/
│   └── useDevice.ts                # NEW: BLE state management
├── services/
│   ├── bluetooth.ts                # NEW: Web Bluetooth API
│   ├── device-protocol.ts          # NEW: BLE protocol
│   └── ... (existing)
├── firmware/
│   └── protocol-spec.md            # NEW: Hardware team docs
└── docs/plans/
    └── 2025-12-26-lin34r-production-design.md
```

## BLE Protocol Summary

### Services
| Service | UUID | Purpose |
|---------|------|---------|
| Timer | `0x1001` | Session state, timer control |
| Lock | `0x1002` | Phone lock state, lock control |
| Device | `0x1003` | Battery, dial, button events |

### Commands (App → Device)
- `START_FOCUS`: Begin focus session
- `END_SESSION`: End current session
- `LOCK_PHONE`: Lock compartment
- `UNLOCK_PHONE`: Unlock compartment
- `SYNC_STATE`: Push timer/phase to display

### Events (Device → App)
- `DIAL_ROTATED`: Encoder position changed
- `PHONE_PLACED`: Phone detected in compartment
- `PHONE_REMOVED`: Phone removed (during unlock)
- `LOCK_ENGAGED`: Lock mechanism engaged
- `LOCK_RELEASED`: Lock mechanism released
- `BUTTON_PRESSED`: Physical button pressed

## Next Steps

1. ✅ Design document
2. 🔄 Web Bluetooth service layer
3. 🔄 React hooks for device state
4. 🔄 UI components for device interaction
5. 🔄 Firmware protocol specification
6. ⏳ Integrate device into main app flow
7. ⏳ ESP32 firmware development
8. ⏳ Hardware prototyping

## Hardware Bill of Materials (Initial)

| Component | Purpose | Est. Cost |
|-----------|---------|-----------|
| ESP32-S3 | MCU + BLE | $5-8 |
| 2.9" E-ink | Display | $15-20 |
| Rotary Encoder | Dial input | $2-3 |
| Servo/Solenoid | Lock mechanism | $5-10 |
| IR Sensor | Phone detection | $1-2 |
| LiPo Battery | Power backup | $5-8 |
| Enclosure | Aluminum/plastic | $20-40 |

**Estimated BOM**: $60-100 per unit (prototype quantities)
