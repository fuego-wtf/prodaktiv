# Prodaktiv Architecture Plan

## Overview

Prodaktiv is a focus productivity system with three distribution channels:

1. **prodaktiv.com** - Marketing website & product sales
2. **Graphyn Plugin** - Desktop plugin for Graphyn users (Rust + GPUI)
3. **Physical Controller** - ESP32 device that locks phones during focus sessions

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Prodaktiv ECOSYSTEM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐  │
│  │  prodaktiv.com     │    │  Graphyn Plugin │    │  ESP32 Controller       │  │
│  │  (Marketing)    │    │  (Desktop App)  │    │  (Hardware Device)      │  │
│  │                 │    │                 │    │                         │  │
│  │  - Landing      │    │  - Focus Mode   │    │  - Phone Locker         │  │
│  │  - Pricing      │    │  - Task Queue   │    │  - E-Ink Display        │  │
│  │  - Checkout     │    │  - Linear Sync  │    │  - BLE Communication    │  │
│  │  - Dashboard    │    │  - OS Locking   │    │  - Timer Display        │  │
│  └────────┬────────┘    └────────┬────────┘    └───────────┬─────────────┘  │
│           │                      │                          │                │
│           └──────────────────────┼──────────────────────────┘                │
│                                  │                                           │
│                    ┌─────────────▼─────────────┐                             │
│                    │      Graphyn Backend      │                             │
│                    │      (graphyn-backyard)   │                             │
│                    │                           │                             │
│                    │  - Auth (@id)             │                             │
│                    │  - Linear API Proxy       │                             │
│                    │  - User Preferences       │                             │
│                    │  - Subscription Status    │                             │
│                    └───────────────────────────┘                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. prodaktiv.com (Website)

**Purpose**: Product marketing, sales, and customer dashboard

```
prodaktiv-web/                      # Separate git repo
├── src/
│   ├── pages/
│   │   ├── index.tsx            # Landing page (current design)
│   │   ├── pricing.tsx          # Pricing tiers
│   │   ├── checkout.tsx         # Stripe checkout
│   │   ├── dashboard/
│   │   │   ├── index.tsx        # User dashboard
│   │   │   ├── orders.tsx       # Order history
│   │   │   ├── devices.tsx      # Registered controllers
│   │   │   └── settings.tsx     # Account settings
│   ├── components/              # Reuse existing React components
│   └── services/
│       ├── auth.ts              # Better Auth integration
│       └── api.ts               # Backend API client
├── package.json
└── vite.config.ts
```

**Tech Stack**: React 19 + Vite + TypeScript (reuse current codebase)

---

### 2. Graphyn Plugin (prodaktiv-plugin)

**Purpose**: Desktop focus mode with OS-level locking

```
prodaktiv-plugin/                   # Separate git repo, graphyn submodule
├── src/
│   ├── lib.rs                   # Plugin exports
│   ├── plugin.rs                # Plugin + StreamingTask implementation
│   ├── phases.rs                # FocusPhase state machine
│   ├── locking/
│   │   ├── mod.rs               # OS locking orchestrator
│   │   ├── macos.rs             # macOS Focus Mode + app blocking
│   │   ├── linux.rs             # X11/Wayland focus
│   │   └── windows.rs           # Windows Focus Assist
│   ├── ui/
│   │   ├── focus_panel.rs       # Main GPUI focus view
│   │   ├── task_queue.rs        # Linear task list
│   │   ├── timer_display.rs     # Countdown timer
│   │   └── device_status.rs     # BLE controller status
│   ├── ble/
│   │   ├── mod.rs               # BLE manager
│   │   ├── protocol.rs          # GATT protocol (0x4C49)
│   │   └── scanner.rs           # Device discovery
│   └── linear/
│       └── client.rs            # Linear API via MCP
├── Cargo.toml
└── README.md
```

**Tech Stack**: Rust + GPUI + graphyn-plugin-framework

**Plugin Implementation**:

```rust
// prodaktiv-plugin/src/plugin.rs
use graphyn_plugin_framework::{
    Plugin, StreamingTask, PluginContext, PluginResult,
    PluginEvent, PluginEventStream
};

pub struct ProdaktivPlugin {
    mcp_client: McpClient,
    focus_state: Arc<Mutex<FocusState>>,
}

#[async_trait]
impl Plugin for ProdaktivPlugin {
    fn id(&self) -> &str { "prodaktiv" }
    fn name(&self) -> &str { "Prodaktiv Focus Mode" }
    fn version(&self) -> &str { env!("CARGO_PKG_VERSION") }

    async fn execute(&self, ctx: PluginContext) -> Result<PluginResult> {
        match ctx.input.get("action").and_then(|v| v.as_str()) {
            Some("start_focus") => self.start_focus_session(ctx).await,
            Some("end_focus") => self.end_focus_session().await,
            Some("get_tasks") => self.fetch_linear_tasks(ctx).await,
            Some("lock_os") => self.lock_os().await,
            Some("unlock_os") => self.unlock_os().await,
            Some("connect_device") => self.connect_ble_device(ctx).await,
            _ => Err(PluginError::InvalidAction.into())
        }
    }
}

#[async_trait]
impl StreamingTask for ProdaktivPlugin {
    async fn execute_streaming(
        &self,
        ctx: PluginContext,
    ) -> Result<(PluginResult, PluginEventStream)> {
        // Focus session with real-time updates
        let (tx, rx) = mpsc::channel(100);

        tx.send(PluginEvent::started(self.id(), "Focus Session")).await.ok();

        // Phase 1: Load Linear tasks
        tx.send(PluginEvent::progress(self.id(), "Loading tasks...")).await.ok();
        let tasks = self.fetch_linear_tasks(ctx.clone()).await?;

        // Phase 2: Enable OS focus mode
        tx.send(PluginEvent::progress(self.id(), "Enabling focus mode...")).await.ok();
        self.lock_os().await?;

        // Phase 3: Connect to controller (if available)
        tx.send(PluginEvent::progress(self.id(), "Connecting to controller...")).await.ok();
        self.connect_ble_device(ctx.clone()).await.ok(); // Optional

        // Emit current state
        tx.send(PluginEvent::data(
            self.id(),
            "focus_state",
            serde_json::json!({
                "phase": "FOCUS",
                "tasks": tasks,
                "timer_seconds": 90 * 60,
                "os_locked": true,
                "device_connected": self.is_device_connected()
            })
        )).await.ok();

        Ok((
            PluginResult::success(serde_json::json!({ "status": "focus_active" })),
            Box::pin(ReceiverStream::new(rx))
        ))
    }
}
```

---

### 3. Physical Controller (prodaktiv-firmware)

**Purpose**: ESP32-S3 device that physically locks phones

```
prodaktiv-firmware/                 # Separate git repo
├── src/
│   ├── main.cpp                 # Entry point
│   ├── ble/
│   │   ├── gatt_server.cpp      # GATT server (Service 0x4C49)
│   │   └── protocol.h           # Command protocol
│   ├── display/
│   │   ├── eink_driver.cpp      # E-Ink display driver
│   │   └── ui.cpp               # Timer/status rendering
│   ├── locker/
│   │   ├── motor_control.cpp    # Locking mechanism servo
│   │   ├── sensor.cpp           # Phone presence detection
│   │   └── state_machine.cpp    # Lock/unlock FSM
│   └── power/
│       ├── battery.cpp          # Battery monitoring
│       └── sleep.cpp            # Deep sleep management
├── platformio.ini               # PlatformIO config
└── hardware/
    ├── schematic.pdf            # Circuit diagram
    └── enclosure.stl            # 3D printable case
```

**BLE Protocol** (GATT Service 0x4C49 "LI"):

| Characteristic | UUID | Properties | Description |
|---------------|------|------------|-------------|
| State | 0x4C50 | Read, Notify | Lock state, phone presence, battery |
| Command | 0x4C51 | Write | Lock, unlock, sync commands |
| Timer | 0x4C52 | Read, Write | Remaining seconds, phase |

---

## User Flows

### Flow 1: Focus Session Start (Desktop Plugin)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         FOCUS SESSION START                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  [1] User clicks "Start Focus" in Graphyn                                 │
│       │                                                                   │
│       ▼                                                                   │
│  [2] ProdaktivPlugin::execute_streaming() called                             │
│       │                                                                   │
│       ├──► [3] Fetch Linear tasks via MCP                                 │
│       │         mcp_client.invoke_tool("linear::list_issues", {...})      │
│       │                                                                   │
│       ├──► [4] Enable OS Focus Mode                                       │
│       │         ├── macOS: Focus Mode API + app blocking                  │
│       │         ├── Linux: i3/sway focus mode                             │
│       │         └── Windows: Focus Assist                                 │
│       │                                                                   │
│       ├──► [5] Connect BLE Controller (optional)                          │
│       │         ├── Scan for "Prodaktiv-XXXX"                                │
│       │         ├── Connect GATT                                          │
│       │         └── Send LOCK command                                     │
│       │                                                                   │
│       └──► [6] Emit PluginEvent::data("focus_state", {...})               │
│                                                                           │
│  [7] Desktop shows Focus Panel UI                                         │
│       ├── Timer countdown                                                 │
│       ├── Active task                                                     │
│       └── Device status                                                   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Flow 2: OS-Level Locking (macOS)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         macOS FOCUS LOCKING                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  [1] Plugin calls lock_os()                                               │
│       │                                                                   │
│       ▼                                                                   │
│  [2] macOS API calls:                                                     │
│       │                                                                   │
│       ├──► NSWorkspace.shared.perform(Selector("_activateFocusMode:"))    │
│       │    // Activates Do Not Disturb / Focus Mode                       │
│       │                                                                   │
│       ├──► Register app blocklist via ScreenTime API                      │
│       │    // Blocks Twitter, Discord, Slack, etc.                        │
│       │                                                                   │
│       ├──► CGEventTapCreate() to intercept Cmd+Tab                        │
│       │    // Prevent app switching (optional, aggressive)                │
│       │                                                                   │
│       └──► Launch fullscreen overlay window                               │
│            // Semi-transparent overlay on secondary displays              │
│                                                                           │
│  [3] User cannot:                                                         │
│       ├── Switch apps (Cmd+Tab blocked)                                   │
│       ├── Open blocked apps (ScreenTime)                                  │
│       ├── Receive notifications                                          │
│       └── Access distracting websites                                     │
│                                                                           │
│  [4] User CAN:                                                            │
│       ├── Use allowed apps (code editor, terminal)                        │
│       ├── Emergency unlock (Cmd+Shift+Esc + 10s hold)                     │
│       └── Complete tasks in Graphyn                                       │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Flow 3: Controller + App Sync

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         BLE SYNC FLOW                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌───────────────┐         BLE          ┌───────────────────────────┐   │
│   │ Prodaktiv Plugin │◄─────────────────────│ ESP32 Controller          │   │
│   └───────┬───────┘                      └─────────────┬─────────────┘   │
│           │                                            │                  │
│   [1] Focus Start                          [A] Idle (display off)        │
│           │                                            │                  │
│           ├──► Connect to Prodaktiv-XXXX                  │                  │
│           │                                            │                  │
│           ├──► Write SYNC_TIMER (0x03)     ─────────►  │                  │
│           │    { timerSeconds: 5400,                   │                  │
│           │      phase: "FOCUS",                       │                  │
│           │      sessionCount: 1 }         [B] Display timer             │
│           │                                            │                  │
│           ├──► Write LOCK (0x01)           ─────────►  │                  │
│           │                                [C] Activate servo lock       │
│           │                                            │                  │
│   [2] Every 10 seconds:                                │                  │
│           ├──► Write SYNC_TIMER            ─────────►  │                  │
│           │                                [D] Update display            │
│           │                                            │                  │
│   [3] Focus End                                        │                  │
│           ├──► Write UNLOCK (0x02)         ─────────►  │                  │
│           │                                [E] Release servo             │
│           │                                            │                  │
│           └──► Disconnect                  [F] Return to idle            │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Linear Task Integration

### MCP Tool Calls

```rust
// Fetch assigned issues
let tasks = mcp_client.invoke_tool(
    "linear::list_issues",
    serde_json::json!({
        "assignee": "me",
        "state": "started,in_progress,todo"
    })
).await?;

// Update issue status when completed
mcp_client.invoke_tool(
    "linear::update_issue",
    serde_json::json!({
        "id": task_id,
        "state": "done"
    })
).await?;
```

### Task Display in Plugin UI

```rust
// ui/task_queue.rs (GPUI component)
pub struct TaskQueue {
    tasks: Vec<LinearTask>,
    active_task_id: Option<String>,
}

impl TaskQueue {
    fn render(&self, cx: &mut ViewContext<Self>) -> impl IntoElement {
        v_flex()
            .gap_2()
            .children(self.tasks.iter().map(|task| {
                let is_active = self.active_task_id == Some(task.id.clone());

                div()
                    .p_3()
                    .bg(if is_active { blue_600() } else { white() })
                    .border_1()
                    .border_color(gray_200())
                    .rounded_md()
                    .child(
                        h_flex()
                            .gap_2()
                            .child(Badge::new(&task.identifier).color(blue_500()))
                            .when(task.team.is_some(), |this| {
                                this.child(Badge::new(&task.team.key).color(gray_500()))
                            })
                    )
                    .child(
                        text(&task.title)
                            .size(TextSize::Base)
                            .weight(if is_active { FontWeight::BOLD } else { FontWeight::NORMAL })
                    )
            }))
    }
}
```

---

## File Tree Summary

```
graphyn-workspace/
├── prodaktiv/                      # Plugin submodule
│   ├── src/
│   │   ├── lib.rs
│   │   ├── plugin.rs            # Plugin + StreamingTask
│   │   ├── phases.rs            # FocusPhase enum
│   │   ├── locking/             # OS focus mode
│   │   ├── ui/                  # GPUI views
│   │   ├── ble/                 # BLE controller
│   │   └── linear/              # Linear MCP wrapper
│   ├── Cargo.toml
│   └── README.md
│
└── framework/                   # graphyn-plugin-framework
    └── src/
        ├── plugin.rs
        ├── streaming.rs
        ├── events.rs
        └── context.rs

---

prodaktiv-web/                      # Website repo
├── src/
│   ├── pages/
│   ├── components/              # Reuse current React components
│   └── services/
└── package.json

---

prodaktiv-firmware/                 # Controller repo
├── src/
│   ├── main.cpp
│   ├── ble/
│   ├── display/
│   └── locker/
└── platformio.ini
```

---

## Pricing Tiers

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | Basic plugin (no OS locking, no Linear sync) |
| Pro | $9/mo | Full plugin + OS locking + Linear sync |
| Pro + Controller | $49 + $9/mo | Physical controller + Pro features |

---

## Implementation Priority

1. **Phase 1**: Convert current React app to Graphyn plugin (Rust + GPUI)
   - Port UI components to GPUI
   - Implement Plugin + StreamingTask traits
   - Linear MCP integration

2. **Phase 2**: OS-Level Locking
   - macOS Focus Mode integration
   - App blocking (ScreenTime API)
   - Emergency unlock mechanism

3. **Phase 3**: BLE Controller Integration
   - Port Web Bluetooth to Rust btleplug
   - Sync timer state to device
   - Lock/unlock commands

4. **Phase 4**: Website & Marketplace
   - Build prodaktiv.com marketing site
   - Stripe checkout integration
   - Publish to Graphyn plugin marketplace

---

## Questions for TPM Validation

1. Should the plugin be Pro-tier only, or offer a limited free version?
2. What apps should be blocked by default vs. user-configurable?
3. Should controller be required for full lock, or optional enhancement?
4. Emergency unlock: password-based or time-delay (10s hold)?
