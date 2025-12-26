# Prodaktiv Implementation Plan

## File Tree Comparison

### BEFORE (Current Web App)

```
prodaktiv/                              # React 19 + Vite web app
├── App.tsx                          # Main app component
├── index.tsx                        # Entry point
├── index.html
├── types.ts                         # Type definitions
├── vite.config.ts
├── tsconfig.json
├── package.json
│
├── components/
│   ├── Header.tsx                   # Score display
│   ├── LandingPage.tsx              # Marketing landing
│   ├── LoginModal.tsx               # Linear auth
│   ├── Planner.tsx                  # Task queue management
│   ├── NowRail.tsx                  # Focus session UI
│   ├── LinearPicker.tsx             # Linear issue picker
│   ├── Scoreboard.tsx               # Daily score
│   ├── Toolkit.tsx                  # Micro-steps
│   ├── DayShape.tsx                 # Day visualization
│   ├── Settings.tsx                 # Settings modal
│   ├── DeviceStatus.tsx             # BLE status indicator
│   ├── DevicePairing.tsx            # BLE pairing modal
│   └── PhoneLock.tsx                # Lock/unlock controls
│
├── hooks/
│   ├── index.ts
│   └── useDevice.ts                 # Web Bluetooth hook
│
├── services/
│   ├── linear.ts                    # Linear GraphQL API
│   ├── bluetooth.ts                 # Web Bluetooth service
│   ├── device-protocol.ts           # BLE protocol definitions
│   └── agent.ts                     # Gemini AI service
│
├── firmware/
│   └── protocol-spec.md             # ESP32 BLE spec
│
└── docs/
    ├── Prodaktiv_ARCHITECTURE.md       # Architecture overview
    └── plans/
        └── 2025-12-26-prodaktiv-production-design.md
```

### AFTER (Graphyn Plugin + Website + Firmware)

```
graphyn-workspace/
├── prodaktiv/                          # GPUI Plugin (submodule)
│   ├── Cargo.toml                   # Rust dependencies
│   ├── README.md
│   │
│   ├── src/
│   │   ├── lib.rs                   # Plugin exports
│   │   ├── plugin.rs                # Plugin + StreamingTask impl
│   │   ├── phases.rs                # FocusPhase state machine
│   │   │
│   │   ├── ui/                      # GPUI Components
│   │   │   ├── mod.rs
│   │   │   ├── focus_panel.rs       # Main focus view (NowRail port)
│   │   │   ├── task_queue.rs        # Task list (Planner port)
│   │   │   ├── task_item.rs         # Individual task row
│   │   │   ├── timer_display.rs     # Countdown timer
│   │   │   ├── session_log.rs       # Chat/session history
│   │   │   ├── device_status.rs     # Controller status
│   │   │   └── score_ring.rs        # Daily score indicator
│   │   │
│   │   ├── locking/                 # OS-Level Focus
│   │   │   ├── mod.rs               # Orchestrator
│   │   │   ├── macos.rs             # Focus Mode + ScreenTime
│   │   │   ├── linux.rs             # X11/Wayland focus
│   │   │   └── windows.rs           # Focus Assist
│   │   │
│   │   ├── ble/                     # BLE Controller
│   │   │   ├── mod.rs               # BLE manager
│   │   │   ├── protocol.rs          # GATT protocol (0x4C49)
│   │   │   ├── scanner.rs           # Device discovery
│   │   │   └── controller.rs        # Device commands
│   │   │
│   │   ├── linear/                  # Linear Integration
│   │   │   ├── mod.rs
│   │   │   ├── client.rs            # MCP wrapper
│   │   │   └── types.rs             # LinearTask, etc.
│   │   │
│   │   └── state/                   # Focus State
│   │       ├── mod.rs
│   │       ├── focus_state.rs       # DayLog equivalent
│   │       ├── task.rs              # Task type
│   │       └── persistence.rs       # Local storage
│   │
│   └── tests/
│       ├── plugin_test.rs
│       └── locking_test.rs
│
└── framework/                       # Existing plugin framework
    └── (unchanged)

---

prodaktiv-web/                          # Marketing Website (new repo)
├── package.json
├── vite.config.ts
├── tsconfig.json
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── pages/
│   │   ├── index.tsx                # Landing (port LandingPage.tsx)
│   │   ├── pricing.tsx              # Pricing tiers
│   │   ├── checkout.tsx             # Stripe checkout
│   │   ├── success.tsx              # Order confirmation
│   │   └── dashboard/
│   │       ├── index.tsx            # User dashboard
│   │       ├── orders.tsx           # Order history
│   │       ├── devices.tsx          # Registered controllers
│   │       └── settings.tsx         # Account settings
│   │
│   ├── components/                  # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PricingCard.tsx
│   │   └── DeviceCard.tsx
│   │
│   └── services/
│       ├── api.ts                   # Backend API client
│       └── stripe.ts                # Stripe integration
│
└── public/
    └── assets/

---

prodaktiv-firmware/                     # ESP32 Controller (new repo)
├── platformio.ini
├── README.md
│
├── src/
│   ├── main.cpp                     # Entry point
│   │
│   ├── ble/
│   │   ├── gatt_server.h
│   │   ├── gatt_server.cpp          # GATT server (0x4C49)
│   │   └── protocol.h               # Command definitions
│   │
│   ├── display/
│   │   ├── eink_driver.h
│   │   ├── eink_driver.cpp          # E-Ink display driver
│   │   ├── fonts.h                  # Embedded fonts
│   │   └── ui.cpp                   # Timer/status rendering
│   │
│   ├── locker/
│   │   ├── motor_control.h
│   │   ├── motor_control.cpp        # Servo control
│   │   ├── sensor.h
│   │   ├── sensor.cpp               # Phone presence detection
│   │   └── state_machine.cpp        # Lock/unlock FSM
│   │
│   └── power/
│       ├── battery.h
│       ├── battery.cpp              # Battery monitoring
│       └── sleep.cpp                # Deep sleep
│
├── include/
│   └── config.h                     # Hardware config
│
└── hardware/
    ├── schematic.pdf
    ├── bom.csv
    └── enclosure.stl
```

---

## Sequential Task List with Dependencies

```
                              Prodaktiv IMPLEMENTATION ROADMAP
═══════════════════════════════════════════════════════════════════════════════

PHASE 1: PLUGIN FOUNDATION                                    [Week 1-2]
─────────────────────────────────────────────────────────────────────────────

    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-001: Initialize prodaktiv plugin repo                                 │
    │        Create Cargo.toml, implement Plugin trait skeleton            │
    │        Files: src/lib.rs, src/plugin.rs, Cargo.toml                  │
    │        Depends on: (none)                                            │
    └─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-002: Port type system to Rust                                      │
    │        Convert types.ts to Rust structs                              │
    │        Files: src/state/mod.rs, src/state/task.rs,                   │
    │               src/state/focus_state.rs                               │
    │        Depends on: T-001                                             │
    └─────────────────────────────────────────────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
    │ T-003: Focus    │  │ T-004: Linear   │  │ T-005: Persistence      │
    │ Phase enum      │  │ MCP client      │  │ layer                   │
    │                 │  │                 │  │                         │
    │ src/phases.rs   │  │ src/linear/     │  │ src/state/              │
    │                 │  │   client.rs     │  │   persistence.rs        │
    │ Depends: T-002  │  │   types.rs      │  │ Depends: T-002          │
    │                 │  │ Depends: T-002  │  │                         │
    └─────────────────┘  └─────────────────┘  └─────────────────────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-006: Implement StreamingTask                                       │
    │        Full execute_streaming() with events                          │
    │        Files: src/plugin.rs (update)                                 │
    │        Depends on: T-003, T-004, T-005                               │
    └─────────────────────────────────────────────────────────────────────┘


PHASE 2: GPUI INTERFACE                                       [Week 2-3]
─────────────────────────────────────────────────────────────────────────────

    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-007: Timer display component                                       │
    │        Port formatTime + countdown UI                                │
    │        Files: src/ui/mod.rs, src/ui/timer_display.rs                 │
    │        Depends on: T-001                                             │
    └─────────────────────────────────────────────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
    │ T-008: Task     │  │ T-009: Session  │  │ T-010: Score ring       │
    │ item component  │  │ log component   │  │ component               │
    │                 │  │                 │  │                         │
    │ src/ui/         │  │ src/ui/         │  │ src/ui/                 │
    │   task_item.rs  │  │   session_log   │  │   score_ring.rs         │
    │ Depends: T-007  │  │ Depends: T-007  │  │ Depends: T-007          │
    └─────────────────┘  └─────────────────┘  └─────────────────────────┘
              │                    │                    │
              ▼                    │                    │
    ┌─────────────────┐            │                    │
    │ T-011: Task     │            │                    │
    │ queue component │            │                    │
    │                 │            │                    │
    │ src/ui/         │            │                    │
    │   task_queue.rs │            │                    │
    │ Depends: T-008  │            │                    │
    └─────────────────┘            │                    │
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-012: Focus panel (main view)                                       │
    │        Compose all components into NowRail equivalent                │
    │        Files: src/ui/focus_panel.rs                                  │
    │        Depends on: T-011, T-009, T-010                               │
    └─────────────────────────────────────────────────────────────────────┘


PHASE 3: OS-LEVEL LOCKING                                     [Week 3-4]
─────────────────────────────────────────────────────────────────────────────

    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-013: Locking module skeleton                                       │
    │        Cross-platform trait + mod.rs                                 │
    │        Files: src/locking/mod.rs                                     │
    │        Depends on: T-006                                             │
    └─────────────────────────────────────────────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
    │ T-014: macOS    │  │ T-015: Linux    │  │ T-016: Windows          │
    │ Focus Mode      │  │ focus mode      │  │ Focus Assist            │
    │                 │  │                 │  │                         │
    │ - Focus Mode    │  │ - i3/sway       │  │ - Focus Assist          │
    │ - ScreenTime    │  │ - X11 overlay   │  │ - Notification          │
    │ - App blocking  │  │ - Wayland       │  │   center                │
    │                 │  │                 │  │                         │
    │ src/locking/    │  │ src/locking/    │  │ src/locking/            │
    │   macos.rs      │  │   linux.rs      │  │   windows.rs            │
    │ Depends: T-013  │  │ Depends: T-013  │  │ Depends: T-013          │
    └─────────────────┘  └─────────────────┘  └─────────────────────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-017: Emergency unlock mechanism                                    │
    │        Cmd+Shift+Esc + 10s hold to force unlock                      │
    │        Files: src/locking/mod.rs (update)                            │
    │        Depends on: T-014, T-015, T-016                               │
    └─────────────────────────────────────────────────────────────────────┘


PHASE 4: BLE CONTROLLER INTEGRATION                           [Week 4-5]
─────────────────────────────────────────────────────────────────────────────

    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-018: BLE module with btleplug                                      │
    │        Scanner, connection manager                                   │
    │        Files: src/ble/mod.rs, src/ble/scanner.rs                     │
    │        Depends on: T-006                                             │
    └─────────────────────────────────────────────────────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
    ┌─────────────────────────────┐  ┌─────────────────────────────────────┐
    │ T-019: BLE protocol         │  │ T-020: Controller commands          │
    │ (port from TS)              │  │                                     │
    │                             │  │ - LOCK, UNLOCK                      │
    │ - Service 0x4C49            │  │ - SYNC_TIMER                        │
    │ - State char 0x4C50         │  │ - GET_STATUS                        │
    │ - Command char 0x4C51       │  │                                     │
    │                             │  │ src/ble/controller.rs               │
    │ src/ble/protocol.rs         │  │ Depends: T-019                      │
    │ Depends: T-018              │  │                                     │
    └─────────────────────────────┘  └─────────────────────────────────────┘
              │                                         │
              └─────────────────┬───────────────────────┘
                                ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-021: Device status UI component                                    │
    │        Show connection state, battery, lock status                   │
    │        Files: src/ui/device_status.rs                                │
    │        Depends on: T-019, T-020                                      │
    └─────────────────────────────────────────────────────────────────────┘


PHASE 5: WEBSITE (PARALLEL TRACK)                             [Week 2-4]
─────────────────────────────────────────────────────────────────────────────

    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-022: Initialize prodaktiv-web repo                                    │
    │        Vite + React 19 + TypeScript setup                            │
    │        Files: package.json, vite.config.ts, tsconfig.json            │
    │        Depends on: (none) - PARALLEL TRACK                           │
    └─────────────────────────────────────────────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
    │ T-023: Port     │  │ T-024: Pricing  │  │ T-025: Dashboard        │
    │ landing page    │  │ page            │  │ pages                   │
    │                 │  │                 │  │                         │
    │ pages/index.tsx │  │ pages/          │  │ pages/dashboard/        │
    │ (from Landing   │  │   pricing.tsx   │  │   index.tsx             │
    │  Page.tsx)      │  │                 │  │   orders.tsx            │
    │                 │  │                 │  │   devices.tsx           │
    │ Depends: T-022  │  │ Depends: T-022  │  │ Depends: T-022          │
    └─────────────────┘  └─────────────────┘  └─────────────────────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-026: Stripe checkout integration                                   │
    │        Checkout flow, success page, webhook handler                  │
    │        Files: pages/checkout.tsx, pages/success.tsx,                 │
    │               services/stripe.ts                                     │
    │        Depends on: T-024                                             │
    └─────────────────────────────────────────────────────────────────────┘


PHASE 6: FIRMWARE (PARALLEL TRACK)                            [Week 3-5]
─────────────────────────────────────────────────────────────────────────────

    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-027: Initialize prodaktiv-firmware repo                               │
    │        PlatformIO + ESP32-S3 setup                                   │
    │        Files: platformio.ini, src/main.cpp                           │
    │        Depends on: (none) - PARALLEL TRACK                           │
    └─────────────────────────────────────────────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
    │ T-028: BLE      │  │ T-029: E-Ink    │  │ T-030: Motor/sensor     │
    │ GATT server     │  │ display driver  │  │ control                 │
    │                 │  │                 │  │                         │
    │ src/ble/        │  │ src/display/    │  │ src/locker/             │
    │   gatt_server   │  │   eink_driver   │  │   motor_control         │
    │                 │  │   ui.cpp        │  │   sensor                │
    │ Depends: T-027  │  │ Depends: T-027  │  │ Depends: T-027          │
    └─────────────────┘  └─────────────────┘  └─────────────────────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-031: State machine integration                                     │
    │        Connect BLE commands to motor + display                       │
    │        Files: src/locker/state_machine.cpp                           │
    │        Depends on: T-028, T-029, T-030                               │
    └─────────────────────────────────────────────────────────────────────┘


PHASE 7: INTEGRATION & TESTING                                [Week 5-6]
─────────────────────────────────────────────────────────────────────────────

    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-032: Plugin → Controller E2E test                                  │
    │        Test full flow: focus start → BLE connect → lock → unlock     │
    │        Files: tests/e2e_test.rs                                      │
    │        Depends on: T-021, T-031                                      │
    └─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-033: Plugin → Linear E2E test                                      │
    │        Test: fetch tasks, complete task, update status               │
    │        Files: tests/linear_test.rs                                   │
    │        Depends on: T-012, T-004                                      │
    └─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │ T-034: Publish to Graphyn marketplace                                │
    │        Add to registry.toml, set pricing tier                        │
    │        Files: (graphyn-workspace root)                               │
    │        Depends on: T-032, T-033                                      │
    └─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
```

---

## Dependency Matrix

| Task | Depends On | Blocks | Priority |
|------|------------|--------|----------|
| T-001 | - | T-002, T-007 | P0 |
| T-002 | T-001 | T-003, T-004, T-005 | P0 |
| T-003 | T-002 | T-006 | P0 |
| T-004 | T-002 | T-006 | P0 |
| T-005 | T-002 | T-006 | P0 |
| T-006 | T-003, T-004, T-005 | T-013, T-018 | P0 |
| T-007 | T-001 | T-008, T-009, T-010 | P1 |
| T-008 | T-007 | T-011 | P1 |
| T-009 | T-007 | T-012 | P1 |
| T-010 | T-007 | T-012 | P1 |
| T-011 | T-008 | T-012 | P1 |
| T-012 | T-011, T-009, T-010 | T-033 | P1 |
| T-013 | T-006 | T-014, T-015, T-016 | P1 |
| T-014 | T-013 | T-017 | P1 |
| T-015 | T-013 | T-017 | P2 |
| T-016 | T-013 | T-017 | P2 |
| T-017 | T-014, T-015, T-016 | T-032 | P1 |
| T-018 | T-006 | T-019, T-020 | P1 |
| T-019 | T-018 | T-020, T-021 | P1 |
| T-020 | T-019 | T-021 | P1 |
| T-021 | T-019, T-020 | T-032 | P1 |
| T-022 | - | T-023, T-024, T-025 | P2 |
| T-023 | T-022 | T-026 | P2 |
| T-024 | T-022 | T-026 | P2 |
| T-025 | T-022 | T-026 | P2 |
| T-026 | T-024 | - | P2 |
| T-027 | - | T-028, T-029, T-030 | P2 |
| T-028 | T-027 | T-031 | P2 |
| T-029 | T-027 | T-031 | P2 |
| T-030 | T-027 | T-031 | P2 |
| T-031 | T-028, T-029, T-030 | T-032 | P2 |
| T-032 | T-021, T-031 | T-034 | P1 |
| T-033 | T-012, T-004 | T-034 | P1 |
| T-034 | T-032, T-033 | - | P1 |

---

## Parallel Execution Opportunities

```
Week 1-2:
├──▶ T-001 ──▶ T-002 ──▶ (T-003 || T-004 || T-005) ──▶ T-006
│
├──▶ T-022 ──▶ (T-023 || T-024 || T-025)  [WEBSITE - PARALLEL]
│
└──▶ T-027 ──▶ (T-028 || T-029 || T-030)  [FIRMWARE - PARALLEL]

Week 2-3:
├──▶ T-007 ──▶ (T-008 || T-009 || T-010) ──▶ T-011 ──▶ T-012
│
├──▶ T-013 ──▶ (T-014 || T-015 || T-016) ──▶ T-017
│
└──▶ T-026 [WEBSITE continues]

Week 3-4:
├──▶ T-018 ──▶ T-019 ──▶ T-020 ──▶ T-021
│
└──▶ T-031 [FIRMWARE continues]

Week 5:
└──▶ T-032 ──▶ T-033 ──▶ T-034
```

---

## Critical Path

```
T-001 → T-002 → T-004 → T-006 → T-013 → T-014 → T-017 → T-032 → T-034
         │                          │
         └→ T-003 ─────────────────►┘
         └→ T-005 ─────────────────►┘
```

**Estimated Duration**: 6 weeks

---

## TPM Validation Gate

```
┌─────────────────────────────────────────────────────────────────┐
│  TPM VALIDATION RESULT                                          │
├─────────────────────────────────────────────────────────────────┤
│  Confidence: HIGH (95%)                                         │
│                                                                 │
│  ✅ Scope: Complete                                              │
│     - Plugin foundation covered (T-001 to T-006)                │
│     - UI components mapped (T-007 to T-012)                     │
│     - OS locking per-platform (T-013 to T-017)                  │
│     - BLE integration complete (T-018 to T-021)                 │
│     - Website parallel track (T-022 to T-026)                   │
│     - Firmware parallel track (T-027 to T-031)                  │
│     - E2E testing + publish (T-032 to T-034)                    │
│                                                                 │
│  ✅ Dependencies: Valid                                          │
│     - No circular dependencies                                  │
│     - Clear critical path identified                            │
│     - Parallel tracks truly independent                         │
│                                                                 │
│  ✅ Resources: Correct                                           │
│     - Plugin → @desktop (Rust + GPUI)                           │
│     - Website → React (reuse existing components)               │
│     - Firmware → PlatformIO (ESP32-S3)                          │
│                                                                 │
│  New Tasks Required: 0                                          │
│                                                                 │
│  Decision: PROCEED ✅                                            │
└─────────────────────────────────────────────────────────────────┘
```
