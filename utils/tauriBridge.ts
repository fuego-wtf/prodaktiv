/**
 * Tauri Bridge - Conditional feature detection for web vs desktop modes
 *
 * Mode 1: Web (Marketing/Onboarding)
 *   - Basic Linear integration
 *   - Timer + Planner
 *   - No STT, hardware, or plugins
 *
 * Mode 2: Desktop (Graphyn Users)
 *   - Full experience with graphyn-desktop
 *   - ESP32 BLE hardware
 *   - Local STT via whisper-rs
 *   - Multi-agent orchestration
 */

declare global {
  interface Window {
    __TAURI__?: {
      tauri: {
        invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
      };
    };
    // Graphyn desktop provides additional context
    __GRAPHYN__?: {
      plugins: {
        invoke: <T>(pluginId: string, action: string, args?: Record<string, unknown>) => Promise<T>;
      };
    };
  }
}

// Environment detection
export const isDesktop = (): boolean => typeof window.__TAURI__ !== 'undefined';
export const isWeb = (): boolean => !isDesktop();
export const isGraphyn = (): boolean => typeof window.__GRAPHYN__ !== 'undefined';

// Web Bluetooth support detection
export const hasBluetooth = (): boolean =>
  typeof navigator !== 'undefined' && 'bluetooth' in navigator;

// Feature flags based on environment
export const features = {
  // Desktop-only features (require native code)
  voiceToText: isDesktop(),       // Needs whisper-rs
  localWhisper: isDesktop(),      // Needs whisper-rs
  multiAgent: isGraphyn(),        // Needs plugin framework

  // Available on both web and desktop (when hardware present)
  bleHardware: hasBluetooth(),    // Web Bluetooth API works in Chrome/Edge
  phoneLock: hasBluetooth(),      // Works if device connected

  // Universal features (both web and desktop)
  linearBasic: true,
  timer: true,
  planner: true,
  scoreboard: true,
  dayShape: true,
};

// Types for Tauri commands
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
  teamId?: string;
  projectId?: string;
}

export interface VoiceEvent {
  type: 'start' | 'stop' | 'toggle_on' | 'toggle_off';
  timestamp: number;
  duration_ms?: number;
}

// Tauri command wrappers (only work in desktop mode)
export async function transcribeAudio(audioPath: string): Promise<TranscriptResult> {
  if (!isDesktop()) {
    throw new Error('STT is only available in desktop mode');
  }
  return window.__TAURI__!.tauri.invoke('transcribe_audio', { path: audioPath });
}

export async function parseTaskFromTranscript(transcript: string): Promise<LinearTaskDraft> {
  if (!isDesktop()) {
    throw new Error('Task parsing is only available in desktop mode');
  }
  return window.__TAURI__!.tauri.invoke('parse_task_from_transcript', { transcript });
}

export async function createLinearIssue(draft: LinearTaskDraft, apiKey: string): Promise<string> {
  if (!isDesktop()) {
    throw new Error('Direct Linear creation is only available in desktop mode');
  }
  return window.__TAURI__!.tauri.invoke('create_linear_issue', { draft, apiKey });
}

export async function saveAudioRecording(data: Uint8Array, filename: string): Promise<string> {
  if (!isDesktop()) {
    throw new Error('Audio saving is only available in desktop mode');
  }
  return window.__TAURI__!.tauri.invoke('save_audio_recording', {
    data: Array.from(data),
    filename,
  });
}

// Graphyn plugin invocation (for multi-agent orchestration)
export async function invokePlugin<T>(
  pluginId: string,
  action: string,
  args?: Record<string, unknown>
): Promise<T> {
  if (!isGraphyn()) {
    throw new Error('Plugin invocation requires graphyn-desktop');
  }
  return window.__GRAPHYN__!.plugins.invoke<T>(pluginId, action, args);
}

// Voice-to-Plan flow (complete workflow)
export async function voiceToPlan(audioBlob: Blob): Promise<{
  transcript: TranscriptResult;
  taskDraft: LinearTaskDraft;
}> {
  if (!isDesktop()) {
    throw new Error('Voice-to-Plan is only available in desktop mode');
  }

  // 1. Convert blob to array buffer
  const arrayBuffer = await audioBlob.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  // 2. Save to temp file
  const tempPath = await saveAudioRecording(data, `voice_${Date.now()}.wav`);

  // 3. Transcribe
  const transcript = await transcribeAudio(tempPath);

  // 4. Parse to task
  const taskDraft = await parseTaskFromTranscript(transcript.text);

  return { transcript, taskDraft };
}

// Web fallback for Linear API (uses fetch directly)
export async function createLinearIssueWeb(
  draft: LinearTaskDraft,
  apiKey: string
): Promise<{ id: string; identifier: string }> {
  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({
      query: `
        mutation CreateIssue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              id
              identifier
            }
          }
        }
      `,
      variables: {
        input: {
          title: draft.title,
          description: draft.description,
          estimate: draft.estimate,
          labelIds: draft.labels,
          priority: draft.priority,
          teamId: draft.teamId,
          projectId: draft.projectId,
        },
      },
    }),
  });

  const result = await response.json();
  if (!result.data?.issueCreate?.success) {
    throw new Error('Failed to create Linear issue');
  }

  return result.data.issueCreate.issue;
}
