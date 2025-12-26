<div align="center">
<img width="1200" height="475" alt="Prodaktiv Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Prodaktiv

**Deep work productivity system with hardware flow control**

A focused productivity app that combines a React web interface with an ESP32 physical controller (the "knob") for distraction-free deep work sessions.

[![Status](https://img.shields.io/badge/status-in_development-yellow)]()
[![Platform](https://img.shields.io/badge/platform-web%20%7C%20desktop-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

</div>

## Overview

Prodaktiv is a productivity system designed for developers who want to:
- **Focus deeply** with timed work sessions and enforced breaks
- **Plan tasks** using voice-to-plan AI integration
- **Track progress** with a daily scoring system
- **Stay accountable** with optional phone locking via BLE

## Dual Deployment Architecture

Prodaktiv supports two deployment modes with a shared React codebase:

| Feature | Web Mode | Desktop Mode |
|---------|----------|--------------|
| **Target Users** | Marketing/Onboarding | Graphyn Subscribers |
| **Linear Integration** | Basic (API) | Full + Plugins |
| **BLE Device** | Chrome/Edge | Native |
| **Voice-to-Plan** | - | Local whisper-rs |
| **Multi-Agent** | - | Graphyn Framework |
| **STT** | - | Local Whisper |

```
┌─────────────────────────────────────────────────────────────────┐
│                    Shared React Codebase                        │
│    (components, hooks, services with feature detection)         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
┌─────────────────┐          ┌─────────────────────┐
│   Web Mode      │          │   Desktop Mode      │
│   (Vite)        │          │   (Tauri + GPUI)    │
│                 │          │                     │
│ • Linear API    │          │ • prodaktiv plugin     │
│ • Web Bluetooth │          │ • whisper-rs        │
│ • Timer/Planner │          │ • Multi-agent       │
└─────────────────┘          └─────────────────────┘
```

## Features

### Web Interface
- **Session Timer** - Web Worker-based timer (works in background tabs)
- **Task Planning** - Linear integration for task management
- **Daily Scoreboard** - Track deep work, shipping, movement, and shutdown rituals
- **Emergency Mode** - Minimal 20-minute sessions when time is limited
- **Day Shape** - Visual timeline of your work phases
- **BLE Device** - Connect ESP32 knob via Web Bluetooth (Chrome/Edge)

### Hardware Controller (ESP32-S3 Knob)
- **Physical Start/Stop** - Push to begin focus, push to end
- **E-Ink Display** - 200x200 1-bit display with partial refresh
- **Rotary Encoder** - Navigate and adjust settings
- **Phone Lock** - Solenoid-actuated phone detention with load cell detection
- **Voice Trigger** - Push knob to start voice-to-plan capture

### Voice-to-Plan (Desktop Only)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  PUSH    │───▶│ RECORD   │───▶│   STT    │───▶│  AGENT   │───▶│  REVIEW  │
│  KNOB    │    │  VOICE   │    │ (Whisper)│    │ (Letta)  │    │   UI     │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────┐
                                                               │  LINEAR  │
                                                               │   TASK   │
                                                               └──────────┘
```

**Knob Interaction Modes:**
- **Double-push toggle** - Push to start recording, push again to stop
- **Push-and-hold** - Hold while speaking, release to process

**Privacy:** All speech processing happens locally via Whisper (whisper-rs). No cloud STT.

## Architecture

```
prodaktiv/
├── App.tsx                     # Main app component
├── components/
│   ├── Header.tsx              # Score display, device status
│   ├── NowRail.tsx             # Active session console (Web Worker timer)
│   ├── Planner.tsx             # Task planning with Linear integration
│   ├── Scoreboard.tsx          # Daily scoring checklist
│   ├── DayShape.tsx            # Visual timeline sidebar
│   ├── Toolkit.tsx             # Micro-steps notepad
│   ├── Settings.tsx            # API keys, preferences
│   ├── LandingPage.tsx         # Entry screen
│   ├── DevicePairing.tsx       # BLE device connection UI
│   ├── PhoneLock.tsx           # Phone lock controls
│   └── ConfirmDialog.tsx       # Custom confirmation dialogs
├── hooks/
│   ├── useDevice.ts            # BLE device state management
│   └── useTimer.ts             # Web Worker-based timer hook
├── services/
│   └── bleService.ts           # Web Bluetooth GATT communication
├── utils/
│   └── tauriBridge.ts          # Feature detection (Web vs Desktop)
├── workers/
│   └── timerWorker.ts          # Background timer (survives tab blur)
├── types/
│   ├── index.ts                # TypeScript interfaces
│   └── session.ts              # Session state types
└── docs/
    ├── architecture/
    │   └── STT_ARCHITECTURE.md # STT plugin architecture
    ├── firmware/
    │   ├── ESP32_FIRMWARE_ARCHITECTURE.md
    │   ├── button-detection.md # FSM specifications
    │   ├── eink-voice-ui.md    # E-Ink display designs
    │   └── voice-events.md     # BLE voice protocol
    ├── BLE_PROTOCOL.md         # Full BLE specification
    └── plans/                  # Design documents
```

## Hardware

### ESP32 Controller Specifications
- **MCU:** ESP32-S3 with BLE 5.0
- **Display:** 1.54" E-Ink (200x200)
- **Input:** Rotary encoder with push button
- **Power:** USB-C, 1000mAh LiPo battery
- **Case:** 3D printed enclosure

### BLE Protocol
Service UUID: `0x4C49` ("LI" for Linear)

| Characteristic | UUID | Properties | Description |
|---------------|------|------------|-------------|
| Session State | 0x4C50 | Read, Notify | Current phase, timer, task |
| Control | 0x4C51 | Write | Start, stop, pause commands |
| Phone Lock | 0x4C52 | Read, Write, Notify | Lock state, has_phone |
| Voice | 0x4C53 | Notify | Voice recording events |

## Setup

### Prerequisites
- Node.js 18+
- Linear API key (for task integration)
- Gemini API key (optional, for AI features)

### Installation

```bash
# Clone repository
git clone https://github.com/fuego-wtf/prodaktiv.git
cd prodaktiv

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

### Configuration

Edit `.env.local`:
```env
GEMINI_API_KEY=your_gemini_key
```

Linear API key is entered in the app settings after first launch.

## Development

### Commands
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run preview  # Preview production build
```

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **BLE:** Web Bluetooth API
- **AI:** Google Gemini (planning), Whisper (STT)

## Roadmap

### Phase 1: Core Web App (Complete)
- [x] Core session timer and phases
- [x] Linear task integration
- [x] Web Worker-based timer (background-safe)
- [x] Daily scoreboard tracking
- [x] Day shape visualization

### Phase 2: BLE Integration (Complete)
- [x] BLE device pairing
- [x] Phone lock UI components
- [x] Device state management (useDevice hook)
- [x] BLE protocol specification

### Phase 3: Voice-to-Plan Design (Complete)
- [x] STT architecture design
- [x] Button detection FSM specification
- [x] E-Ink voice UI design
- [x] BLE voice event protocol
- [x] ESP32 firmware architecture

### Phase 4: Desktop Integration (In Progress)
- [ ] Tauri shell with prodaktiv plugin
- [ ] whisper-rs integration
- [ ] Multi-agent orchestration (Graphyn framework)
- [ ] Voice capture component

### Phase 5: Hardware (Planned)
- [ ] ESP32-S3 firmware implementation
- [ ] E-Ink display driver
- [ ] Phone lock mechanism
- [ ] Production PCB design

### Phase 6: Production (Future)
- [ ] Mobile companion app
- [ ] Firmware OTA updates
- [ ] Hardware manufacturing

## Related Projects

| Project | Description |
|---------|-------------|
| **prodaktiv-firmware** | ESP32 PlatformIO project (planned) |
| **graphyn-desktop** | Desktop app shell (Rust/GPUI) |
| **graphyn-plugin-framework** | Plugin architecture |
| **graphyn-workspace** | Parent monorepo |

## Documentation

| Document | Description |
|----------|-------------|
| [BLE Protocol](docs/BLE_PROTOCOL.md) | Full BLE GATT specification |
| [STT Architecture](docs/architecture/STT_ARCHITECTURE.md) | Voice-to-plan system design |
| [ESP32 Firmware](docs/firmware/ESP32_FIRMWARE_ARCHITECTURE.md) | Firmware architecture |
| [Button Detection](docs/firmware/button-detection.md) | FSM for button interactions |
| [E-Ink Voice UI](docs/firmware/eink-voice-ui.md) | Display state designs |
| [Voice Events](docs/firmware/voice-events.md) | BLE voice protocol |

## License

MIT

