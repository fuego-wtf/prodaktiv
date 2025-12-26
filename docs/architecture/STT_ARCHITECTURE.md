# L1NEAR Architecture Decision

## Deployment Modes

L1NEAR has **two deployment modes**:

### Mode 1: Web (Marketing/Onboarding)

```
l1near.com (React web app)
├─ Landing page for new users
├─ Linear API integration (enter API key, manage tasks)
├─ Timer + Planner functionality
├─ Scoreboard + Day Shape
├─ ESP32 BLE connection (via Web Bluetooth in Chrome/Edge)
├─ Phone lock (when device connected)
└─ NO: STT, Multi-agent (these require native code)
```

**Purpose:** Marketing, onboarding, basic productivity for anyone with a Linear account. Users with ESP32 hardware can connect it via Web Bluetooth.

### Mode 2: Desktop (Graphyn Users)

```
graphyn-desktop (GPUI + Rust)
└─ l1near plugin (via graphyn-plugin-framework)
   ├─ Full l1near experience (embedded webview or native)
   ├─ ESP32 BLE hardware integration
   ├─ Local STT via whisper-rs
   ├─ Multi-agent orchestration
   └─ Voice-to-Plan feature
```

**Purpose:** Power users who download Graphyn Desktop get the full experience with hardware, AI agents, and local processing.

## Plugin Framework Integration

The `graphyn-plugin-framework` provides a **multi-agent interface** that l1near (and other apps) can utilize:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GRAPHYN PLUGIN ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  graphyn-desktop (host)                                              │
│  ├─ Plugin Manager                                                   │
│  ├─ MCP Client (HTTP proxy to backyard)                             │
│  └─ Multi-agent orchestration                                        │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  l1near     │  │  rayban     │  │  figma      │  │  linear     │ │
│  │  plugin     │  │  plugin     │  │  plugin     │  │  plugin     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │                │        │
│         └────────────────┴────────────────┴────────────────┘        │
│                                   │                                  │
│                                   ▼                                  │
│                    ┌──────────────────────────┐                     │
│                    │  graphyn-plugin-framework │                     │
│                    │  ├─ Plugin trait          │                     │
│                    │  ├─ StreamingTask trait   │                     │
│                    │  ├─ PluginEvent enum      │                     │
│                    │  └─ MCP tool access       │                     │
│                    └──────────────────────────┘                     │
│                                   │                                  │
│                                   ▼                                  │
│                    ┌──────────────────────────┐                     │
│                    │  MCP Tools (via backyard) │                     │
│                    │  ├─ graphyn-base (KB)     │                     │
│                    │  ├─ linear (issues)       │                     │
│                    │  ├─ letta (agents)        │                     │
│                    │  └─ stt (transcription)   │                     │
│                    └──────────────────────────┘                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Lin34r Plugin Structure

When running inside graphyn-desktop, l1near becomes a **plugin**:

```
graphyn-workspace/
├─ desktop/              # graphyn-desktop (GPUI host)
├─ framework/            # graphyn-plugin-framework
└─ plugins/
   └─ l1near/           # l1near plugin
      ├─ Cargo.toml
      └─ src/
         ├─ lib.rs       # Plugin trait impl
         ├─ plugin.rs    # Lin34rPlugin struct
         ├─ stt.rs       # Whisper STT (from whisper-rs)
         ├─ voice.rs     # Voice capture + BLE events
         └─ planner.rs   # Multi-agent task planning
```

### Plugin Implementation

```rust
// plugins/l1near/src/plugin.rs

use graphyn_plugin_framework::{Plugin, PluginContext, PluginResult, StreamingTask, PluginEvent};
use async_trait::async_trait;

pub struct Lin34rPlugin {
    stt: crate::stt::WhisperSTT,
}

#[async_trait]
impl Plugin for Lin34rPlugin {
    fn id(&self) -> &str { "l1near" }
    fn name(&self) -> &str { "L1NEAR Focus System" }
    fn version(&self) -> &str { env!("CARGO_PKG_VERSION") }

    async fn execute(&self, ctx: PluginContext) -> Result<PluginResult> {
        let action = ctx.input.get("action").and_then(|v| v.as_str());

        match action {
            // Voice-to-Plan: transcribe audio and create Linear task
            Some("voice_to_plan") => {
                let audio_b64 = ctx.input.get("audio")
                    .and_then(|v| v.as_str())
                    .ok_or("Missing audio")?;

                // 1. Local STT
                let transcript = self.stt.transcribe_base64(audio_b64)?;

                // 2. Call Letta agent via MCP to parse task
                let task_draft = ctx.mcp_client.invoke_tool(
                    "letta::parse_task",
                    serde_json::json!({ "transcript": transcript.text })
                ).await?;

                // 3. Create Linear issue via MCP
                let issue = ctx.mcp_client.invoke_tool(
                    "linear::create_issue",
                    task_draft
                ).await?;

                Ok(PluginResult::success(issue))
            }

            // Session management
            Some("start_session") => { /* ... */ }
            Some("end_session") => { /* ... */ }
            Some("get_status") => { /* ... */ }

            _ => Err("Unknown action".into())
        }
    }
}

#[async_trait]
impl StreamingTask for Lin34rPlugin {
    async fn execute_streaming(&self, ctx: PluginContext, tx: PluginEventSender) -> Result<PluginResult> {
        // For long-running voice capture, stream progress events
        tx.send(PluginEvent::started(self.id(), "voice_capture")).await.ok();
        tx.send(PluginEvent::progress(self.id(), "Recording...", Some(0.0))).await.ok();

        // ... capture and transcribe ...

        tx.send(PluginEvent::progress(self.id(), "Transcribing...", Some(50.0))).await.ok();

        // ... create task ...

        tx.send(PluginEvent::completed(self.id(), duration)).await.ok();
        Ok(PluginResult::success(result))
    }
}
```

### Multi-Agent Orchestration

Lin34r plugin can orchestrate multiple agents via the framework:

```
Voice-to-Plan Multi-Agent Flow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User: "Fix the authentication bug in the login flow"
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Lin34r Plugin (orchestrator)                                        │
│  └─ execute("voice_to_plan", { audio: "..." })                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  STT Agent    │      │  Letta Agent  │      │  Linear Agent │
│  (whisper-rs) │ ───▶ │  (parse task) │ ───▶ │  (create)     │
│               │      │               │      │               │
│  "Fix the..." │      │  {            │      │  WTF-123      │
│               │      │    title:..., │      │  created!     │
│               │      │    labels:... │      │               │
│               │      │  }            │      │               │
└───────────────┘      └───────────────┘      └───────────────┘
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                                ▼
                    ┌───────────────────┐
                    │  Desktop shows    │
                    │  task preview     │
                    │  for confirmation │
                    └───────────────────┘
```

## Shared Codebase Strategy

The l1near React codebase is **shared** between web and desktop:

```
l1near/
├─ src/                      # React components (shared)
│  ├─ App.tsx
│  ├─ components/
│  │  ├─ NowRail.tsx
│  │  ├─ Planner.tsx
│  │  ├─ VoiceCapture.tsx   # Uses tauriBridge when available
│  │  └─ ...
│  └─ utils/
│     └─ tauriBridge.ts     # Conditional: web fallback vs Tauri
│
├─ public/                   # Static assets
├─ index.html                # Web entry
│
└─ src-tauri/               # Desktop-only (not in web build)
   └─ ...                   # Tauri Rust backend
```

### Conditional Feature Detection

```typescript
// src/utils/tauriBridge.ts

export const isDesktop = () => typeof window.__TAURI__ !== 'undefined';
export const isWeb = () => !isDesktop();
export const isGraphyn = () => typeof window.__GRAPHYN__ !== 'undefined';
export const hasBluetooth = () => 'bluetooth' in navigator;

// Feature flags based on environment
export const features = {
  // Desktop-only (require native code)
  voiceToText: isDesktop(),      // Needs whisper-rs
  localWhisper: isDesktop(),     // Needs whisper-rs
  multiAgent: isGraphyn(),       // Needs plugin framework

  // Available on both (when browser supports Web Bluetooth)
  bleHardware: hasBluetooth(),   // Chrome/Edge on desktop
  phoneLock: hasBluetooth(),     // Works if device connected

  // Universal
  linearBasic: true,
  timer: true,
  planner: true,
};
```

```tsx
// src/components/NowRail.tsx

import { features } from '../utils/tauriBridge';

export const NowRail = () => {
  return (
    <div>
      {/* Always available */}
      <Timer />
      <TaskList />

      {/* Desktop only */}
      {features.voiceToText && <VoiceCapture />}
      {features.bleHardware && <DeviceStatus />}
    </div>
  );
};
```

## Architecture Decision

### Stack Alignment with Rayban

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RAYBAN (Reference)         L1NEAR (Target)       │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend      React 18 + TypeScript         React 19 + TypeScript  │
│  Styling       Tailwind CSS                  Tailwind CSS           │
│  Build         Vite                          Vite                   │
│  Desktop       Tauri 2                       Tauri 2 (to add)       │
│  Audio         Web Audio API (viz)           Web Audio + STT        │
│  Native        Rust commands                 Rust commands + STT    │
│  Plugins       graphyn-plugin-framework      graphyn-plugin-framework│
└─────────────────────────────────────────────────────────────────────┘
```

### Voice-to-Plan Flow (Tauri-wrapped)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ESP32 Knob                                                          │
│  └─ BLE Voice Event (0x10 START / 0x11 STOP)                        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Tauri Frontend (React)                                              │
│  ├─ useDevice() receives BLE voice events                           │
│  ├─ VoiceCapture.tsx shows recording UI                             │
│  ├─ MediaRecorder API captures audio                                │
│  └─ Audio blob saved to temp file via Tauri                         │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ tauri.invoke("transcribe_audio", { path })
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Tauri Backend (Rust)                                                │
│  ├─ src-tauri/src/stt.rs                                            │
│  │   └─ transcribe_audio(path: String) -> TranscriptResult          │
│  │       ├─ Load audio file                                         │
│  │       ├─ Decode to PCM (symphonia/rodio)                        │
│  │       ├─ Run whisper-rs inference                                │
│  │       └─ Return transcript + confidence                          │
│  └─ Uses whisper.cpp via whisper-rs                                 │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  AI Agent (Letta/Gemini)                                             │
│  ├─ Parse transcript into task structure                            │
│  ├─ Extract: title, description, estimate, labels                  │
│  └─ Return structured LinearTaskDraft                               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Review UI                                                           │
│  ├─ VoiceReview.tsx shows transcript                                │
│  ├─ TaskPreview.tsx shows parsed task                               │
│  └─ User edits + confirms                                           │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ tauri.invoke("create_linear_issue", {...})
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Linear API (via MCP or direct)                                      │
│  └─ Creates issue in Linear                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Tauri Project Structure

```
l1near/
├── src/                          # Existing React frontend
│   ├── App.tsx
│   ├── components/
│   │   ├── NowRail.tsx
│   │   ├── VoiceCapture.tsx      # NEW: Recording UI
│   │   ├── VoiceWaveform.tsx     # NEW: Audio visualization
│   │   ├── VoiceReview.tsx       # NEW: Transcript editing
│   │   └── TaskPreview.tsx       # NEW: Linear task preview
│   ├── hooks/
│   │   ├── useDevice.ts          # BLE + voice events
│   │   └── useTimer.ts           # Web Worker timer
│   └── utils/
│       └── tauriBridge.ts        # NEW: Tauri command wrappers
├── src-tauri/                    # NEW: Tauri backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs               # Tauri app entry + commands
│       ├── stt.rs                # STT logic (whisper-rs)
│       ├── audio.rs              # Audio decoding (symphonia)
│       └── linear.rs             # Linear API integration
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### Rust Dependencies (src-tauri/Cargo.toml)

```toml
[package]
name = "l1near-desktop"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = { version = "2", features = [] }
tauri-build = { version = "2", features = [] }
tauri-plugin-shell = "2"

# Audio processing
symphonia = { version = "0.5", features = ["mp3", "wav", "ogg"] }
rubato = "0.14"  # Resampling to 16kHz for Whisper

# STT
whisper-rs = "0.11"  # whisper.cpp bindings

# Async + Serialization
tokio = { version = "1", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Optional: Plugin framework integration
graphyn-plugin-framework = { path = "../../graphyn-workspace/framework", optional = true }

[features]
default = []
plugin = ["dep:graphyn-plugin-framework"]
```

### Tauri Commands

```rust
// src-tauri/src/main.rs

mod stt;
mod audio;
mod linear;

use stt::TranscriptResult;
use linear::LinearTaskDraft;

#[tauri::command]
async fn transcribe_audio(path: String) -> Result<TranscriptResult, String> {
    stt::transcribe(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn parse_task_from_transcript(transcript: String) -> Result<LinearTaskDraft, String> {
    // Call Gemini/Letta to parse transcript
    linear::parse_transcript(&transcript).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_linear_issue(draft: LinearTaskDraft, api_key: String) -> Result<String, String> {
    linear::create_issue(&draft, &api_key).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_audio_recording(data: Vec<u8>, filename: String) -> Result<String, String> {
    // Save to ~/Documents/L1NEAR/recordings/
    audio::save_recording(&data, &filename).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            transcribe_audio,
            parse_task_from_transcript,
            create_linear_issue,
            save_audio_recording,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Frontend Tauri Bridge

```typescript
// src/utils/tauriBridge.ts

declare global {
  interface Window {
    __TAURI__?: {
      tauri: {
        invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
      };
    };
  }
}

export const isTauri = () => typeof window.__TAURI__ !== 'undefined';

export interface TranscriptResult {
  text: string;
  confidence: number;
  duration_ms: number;
  language: string;
}

export interface LinearTaskDraft {
  title: string;
  description: string;
  estimate?: number;
  labels?: string[];
  priority?: number;
}

export async function transcribeAudio(audioPath: string): Promise<TranscriptResult> {
  if (!isTauri()) throw new Error('Tauri not available');
  return window.__TAURI__!.tauri.invoke('transcribe_audio', { path: audioPath });
}

export async function parseTaskFromTranscript(transcript: string): Promise<LinearTaskDraft> {
  if (!isTauri()) throw new Error('Tauri not available');
  return window.__TAURI__!.tauri.invoke('parse_task_from_transcript', { transcript });
}

export async function createLinearIssue(draft: LinearTaskDraft, apiKey: string): Promise<string> {
  if (!isTauri()) throw new Error('Tauri not available');
  return window.__TAURI__!.tauri.invoke('create_linear_issue', { draft, apiKey });
}

export async function saveAudioRecording(data: Uint8Array, filename: string): Promise<string> {
  if (!isTauri()) throw new Error('Tauri not available');
  return window.__TAURI__!.tauri.invoke('save_audio_recording', {
    data: Array.from(data),
    filename
  });
}
```

### STT Implementation

```rust
// src-tauri/src/stt.rs

use whisper_rs::{WhisperContext, WhisperContextParameters, FullParams, SamplingStrategy};
use std::path::Path;

#[derive(serde::Serialize)]
pub struct TranscriptResult {
    pub text: String,
    pub confidence: f32,
    pub duration_ms: u64,
    pub language: String,
}

pub async fn transcribe(audio_path: &str) -> Result<TranscriptResult, Box<dyn std::error::Error>> {
    let path = Path::new(audio_path);

    // 1. Decode audio to PCM samples
    let samples = crate::audio::decode_to_pcm(path)?;

    // 2. Load Whisper model (cached)
    let model_path = get_model_path()?;  // ~/.l1near/models/whisper-base.en.bin
    let ctx = WhisperContext::new_with_params(&model_path, WhisperContextParameters::default())?;

    // 3. Run inference
    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    params.set_language(Some("en"));
    params.set_print_special(false);
    params.set_print_progress(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);

    let mut state = ctx.create_state()?;
    state.full(params, &samples)?;

    // 4. Extract transcript
    let num_segments = state.full_n_segments()?;
    let mut text = String::new();
    let mut total_confidence = 0.0;

    for i in 0..num_segments {
        text.push_str(&state.full_get_segment_text(i)?);
        text.push(' ');
        // Get average token probability as confidence proxy
        for j in 0..state.full_n_tokens(i)? {
            total_confidence += state.full_get_token_p(i, j)?;
        }
    }

    Ok(TranscriptResult {
        text: text.trim().to_string(),
        confidence: total_confidence / (num_segments.max(1) as f32),
        duration_ms: (samples.len() as u64 * 1000) / 16000,  // 16kHz sample rate
        language: "en".to_string(),
    })
}

fn get_model_path() -> Result<String, Box<dyn std::error::Error>> {
    let home = dirs::home_dir().ok_or("No home directory")?;
    let model_dir = home.join(".l1near").join("models");
    std::fs::create_dir_all(&model_dir)?;

    let model_path = model_dir.join("whisper-base.en.bin");

    if !model_path.exists() {
        // Download model on first use
        download_model(&model_path)?;
    }

    Ok(model_path.to_string_lossy().to_string())
}
```

### Plugin Integration (Future)

When ready to make STT a graphyn-desktop plugin:

```rust
// graphyn-stt/src/plugin.rs

use graphyn_plugin_framework::{Plugin, PluginContext, PluginResult};
use async_trait::async_trait;

pub struct SttPlugin {
    whisper_ctx: WhisperContext,
}

#[async_trait]
impl Plugin for SttPlugin {
    fn id(&self) -> &str { "stt" }
    fn name(&self) -> &str { "Speech to Text" }
    fn version(&self) -> &str { env!("CARGO_PKG_VERSION") }

    async fn execute(&self, ctx: PluginContext) -> Result<PluginResult> {
        let action = ctx.input.get("action").and_then(|v| v.as_str());

        match action {
            Some("transcribe") => {
                let audio_b64 = ctx.input.get("audio")
                    .and_then(|v| v.as_str())
                    .ok_or("Missing audio data")?;

                let audio_bytes = base64::decode(audio_b64)?;
                let samples = decode_audio_bytes(&audio_bytes)?;
                let transcript = self.transcribe(&samples)?;

                Ok(PluginResult::success(serde_json::json!({
                    "text": transcript.text,
                    "confidence": transcript.confidence,
                })))
            }
            _ => Err("Unknown action".into())
        }
    }
}
```

## Privacy

- All STT processing happens **locally** via whisper.cpp
- No audio data leaves the device
- Model files cached in `~/.l1near/models/`
- Only transcripts sent to AI for task parsing

## Next Steps

1. [ ] Add Tauri to l1near (`npm add @tauri-apps/cli @tauri-apps/api`)
2. [ ] Create `src-tauri/` with Rust backend
3. [ ] Implement `transcribe_audio` command with whisper-rs
4. [ ] Build VoiceCapture.tsx with MediaRecorder
5. [ ] Connect to BLE voice events from useDevice
6. [ ] Test end-to-end flow: Knob → Recording → Transcript → Task
