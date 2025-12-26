/**
 * L1NEAR Device BLE Protocol Definitions
 *
 * This module defines the GATT services, characteristics, commands,
 * and events for communicating with the L1NEAR focus timer device.
 */

// ============================================================================
// GATT Service UUIDs
// ============================================================================

export const SERVICE_UUIDS = {
  /** Primary timer service - controls focus sessions */
  TIMER: '00001800-0000-1000-8000-00805f9b34fb',
  /** Phone lock mechanism control */
  LOCK: '00001801-0000-1000-8000-00805f9b34fb',
  /** Session state synchronization */
  SESSION: '00001802-0000-1000-8000-00805f9b34fb',
  /** Device information (firmware version, battery, etc.) */
  DEVICE_INFO: '0000180a-0000-1000-8000-00805f9b34fb',
  /** Voice recording service */
  VOICE: '00004c53-0000-1000-8000-00805f9b34fb',
} as const;

// Custom L1NEAR service UUID (for device filtering during scan)
export const L1NEAR_SERVICE_UUID = '4c494e34-5234-4c49-4e33-345200000001';

// ============================================================================
// Characteristic UUIDs
// ============================================================================

export const CHARACTERISTIC_UUIDS = {
  // Timer Service Characteristics
  TIMER_STATE: '00002a00-0000-1000-8000-00805f9b34fb',
  TIMER_DURATION: '00002a01-0000-1000-8000-00805f9b34fb',
  TIMER_REMAINING: '00002a02-0000-1000-8000-00805f9b34fb',
  DIAL_POSITION: '00002a03-0000-1000-8000-00805f9b34fb',

  // Lock Service Characteristics
  LOCK_STATE: '00002a10-0000-1000-8000-00805f9b34fb',
  PHONE_PRESENCE: '00002a11-0000-1000-8000-00805f9b34fb',

  // Session Service Characteristics
  SESSION_COMMAND: '00002a20-0000-1000-8000-00805f9b34fb',
  SESSION_STATE: '00002a21-0000-1000-8000-00805f9b34fb',
  SESSION_EVENTS: '00002a22-0000-1000-8000-00805f9b34fb',

  // Device Info Characteristics
  FIRMWARE_VERSION: '00002a26-0000-1000-8000-00805f9b34fb',
  BATTERY_LEVEL: '00002a19-0000-1000-8000-00805f9b34fb',

  // Voice Service Characteristics
  /** Voice events (notify only - device sends recording events to app) */
  VOICE_EVENTS: '00004c53-0001-1000-8000-00805f9b34fb',
} as const;

// ============================================================================
// Commands (App -> Device)
// ============================================================================

export enum Command {
  /** Start a focus session with specified duration */
  START_FOCUS = 0x01,
  /** End the current session early */
  END_SESSION = 0x02,
  /** Engage the phone lock mechanism */
  LOCK_PHONE = 0x03,
  /** Release the phone lock */
  UNLOCK_PHONE = 0x04,
  /** Request full state synchronization */
  SYNC_STATE = 0x05,
  /** Set timer duration (minutes) */
  SET_DURATION = 0x06,
  /** Pause the current session */
  PAUSE_SESSION = 0x07,
  /** Resume a paused session */
  RESUME_SESSION = 0x08,
  /** Reset device to idle state */
  RESET = 0x09,
  /** Acknowledge an event */
  ACK_EVENT = 0x0A,
}

// ============================================================================
// Events (Device -> App)
// ============================================================================

export enum DeviceEvent {
  /** Dial was rotated (includes delta) */
  DIAL_ROTATED = 0x10,
  /** Phone was placed on the dock */
  PHONE_PLACED = 0x11,
  /** Phone was removed from the dock */
  PHONE_REMOVED = 0x12,
  /** Lock mechanism engaged */
  LOCK_ENGAGED = 0x13,
  /** Lock mechanism released */
  LOCK_RELEASED = 0x14,
  /** Physical button was pressed */
  BUTTON_PRESSED = 0x15,
  /** Timer reached zero */
  TIMER_COMPLETE = 0x16,
  /** Session was interrupted */
  SESSION_INTERRUPTED = 0x17,
  /** Battery level changed */
  BATTERY_CHANGED = 0x18,
  /** Error occurred */
  ERROR = 0xFF,
}

// ============================================================================
// Voice Events (Device -> App via Voice Characteristic)
// ============================================================================

export enum VoiceEvent {
  /** Recording started (push-to-talk style) */
  VOICE_START = 0x10,
  /** Recording stopped - process the captured audio */
  VOICE_STOP = 0x11,
  /** Toggle mode: recording started */
  VOICE_TOGGLE_ON = 0x12,
  /** Toggle mode: recording stopped */
  VOICE_TOGGLE_OFF = 0x13,
}

// ============================================================================
// State Enums
// ============================================================================

export enum TimerState {
  IDLE = 0x00,
  RUNNING = 0x01,
  PAUSED = 0x02,
  COMPLETED = 0x03,
}

export enum LockState {
  UNLOCKED = 0x00,
  LOCKED = 0x01,
  LOCKING = 0x02,
  UNLOCKING = 0x03,
  ERROR = 0xFF,
}

export enum PhonePresence {
  ABSENT = 0x00,
  PRESENT = 0x01,
}

// ============================================================================
// Packet Structures
// ============================================================================

export interface CommandPacket {
  command: Command;
  payload: Uint8Array;
  sequence: number;
}

export interface EventPacket {
  event: DeviceEvent;
  payload: Uint8Array;
  timestamp: number;
  sequence: number;
}

export interface StatePacket {
  timerState: TimerState;
  timerDurationMinutes: number;
  timerRemainingSeconds: number;
  lockState: LockState;
  phonePresence: PhonePresence;
  batteryPercent: number;
  dialPosition: number;
  firmwareVersion: string;
}

export interface VoiceEventPacket {
  event: VoiceEvent;
  timestamp: number;
  /** Optional duration in milliseconds (for VOICE_STOP/VOICE_TOGGLE_OFF) */
  durationMs?: number;
}

// ============================================================================
// Binary Encoding/Decoding
// ============================================================================

let commandSequence = 0;

/**
 * Encode a command into a binary packet for transmission
 */
export function encodeCommand(command: Command, payload: number[] = []): Uint8Array {
  const sequence = (commandSequence++) & 0xFF;
  const packet = new Uint8Array(3 + payload.length);

  // Header
  packet[0] = 0xAA; // Start byte
  packet[1] = command;
  packet[2] = sequence;

  // Payload
  for (let i = 0; i < payload.length; i++) {
    packet[3 + i] = payload[i];
  }

  return packet;
}

/**
 * Encode START_FOCUS command with duration
 */
export function encodeStartFocus(durationMinutes: number): Uint8Array {
  // Duration as 2 bytes (little-endian)
  const payload = [
    durationMinutes & 0xFF,
    (durationMinutes >> 8) & 0xFF,
  ];
  return encodeCommand(Command.START_FOCUS, payload);
}

/**
 * Encode SET_DURATION command
 */
export function encodeSetDuration(durationMinutes: number): Uint8Array {
  const payload = [
    durationMinutes & 0xFF,
    (durationMinutes >> 8) & 0xFF,
  ];
  return encodeCommand(Command.SET_DURATION, payload);
}

/**
 * Decode an event packet from the device
 */
export function decodeEvent(data: DataView): EventPacket {
  if (data.byteLength < 4) {
    throw new Error('Event packet too short');
  }

  const startByte = data.getUint8(0);
  if (startByte !== 0xBB) {
    throw new Error(`Invalid event start byte: ${startByte}`);
  }

  const event = data.getUint8(1) as DeviceEvent;
  const sequence = data.getUint8(2);
  const payloadLength = data.getUint8(3);

  const payload = new Uint8Array(payloadLength);
  for (let i = 0; i < payloadLength; i++) {
    payload[i] = data.getUint8(4 + i);
  }

  // Timestamp is last 4 bytes if present
  let timestamp = Date.now();
  if (data.byteLength >= 4 + payloadLength + 4) {
    timestamp = data.getUint32(4 + payloadLength, true);
  }

  return { event, payload, timestamp, sequence };
}

/**
 * Decode dial rotation delta from event payload
 */
export function decodeDialRotation(payload: Uint8Array): number {
  if (payload.length < 2) return 0;
  // Signed 16-bit little-endian
  const raw = payload[0] | (payload[1] << 8);
  return raw > 32767 ? raw - 65536 : raw;
}

/**
 * Decode a state sync packet from the device
 */
export function decodeStatePacket(data: DataView): StatePacket {
  if (data.byteLength < 16) {
    throw new Error('State packet too short');
  }

  const startByte = data.getUint8(0);
  if (startByte !== 0xCC) {
    throw new Error(`Invalid state start byte: ${startByte}`);
  }

  const timerState = data.getUint8(1) as TimerState;
  const timerDurationMinutes = data.getUint16(2, true);
  const timerRemainingSeconds = data.getUint16(4, true);
  const lockState = data.getUint8(6) as LockState;
  const phonePresence = data.getUint8(7) as PhonePresence;
  const batteryPercent = data.getUint8(8);
  const dialPosition = data.getUint16(9, true);

  // Firmware version as 3 bytes (major.minor.patch)
  const fwMajor = data.getUint8(11);
  const fwMinor = data.getUint8(12);
  const fwPatch = data.getUint8(13);
  const firmwareVersion = `${fwMajor}.${fwMinor}.${fwPatch}`;

  return {
    timerState,
    timerDurationMinutes,
    timerRemainingSeconds,
    lockState,
    phonePresence,
    batteryPercent,
    dialPosition,
    firmwareVersion,
  };
}

/**
 * Decode battery level from characteristic value
 */
export function decodeBatteryLevel(data: DataView): number {
  return data.getUint8(0);
}

/**
 * Decode timer remaining seconds from characteristic value
 */
export function decodeTimerRemaining(data: DataView): number {
  return data.getUint16(0, true);
}

/**
 * Decode a voice event from the voice characteristic
 *
 * Packet format:
 * - Byte 0: Start byte (0xDD)
 * - Byte 1: Voice event type
 * - Bytes 2-5: Timestamp (uint32, little-endian) - optional
 * - Bytes 6-9: Duration in ms (uint32, little-endian) - optional, for stop events
 */
export function decodeVoiceEvent(data: DataView): VoiceEventPacket {
  if (data.byteLength < 2) {
    throw new Error('Voice event packet too short');
  }

  const startByte = data.getUint8(0);
  if (startByte !== 0xDD) {
    throw new Error(`Invalid voice event start byte: ${startByte}`);
  }

  const event = data.getUint8(1) as VoiceEvent;

  let timestamp = Date.now();
  if (data.byteLength >= 6) {
    timestamp = data.getUint32(2, true);
  }

  let durationMs: number | undefined;
  if (data.byteLength >= 10 && (event === VoiceEvent.VOICE_STOP || event === VoiceEvent.VOICE_TOGGLE_OFF)) {
    durationMs = data.getUint32(6, true);
  }

  return { event, timestamp, durationMs };
}

/**
 * Get human-readable name for a voice event
 */
export function getVoiceEventName(event: VoiceEvent): string {
  return VoiceEvent[event] || `UNKNOWN(${event})`;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get human-readable name for a command
 */
export function getCommandName(command: Command): string {
  return Command[command] || `UNKNOWN(${command})`;
}

/**
 * Get human-readable name for an event
 */
export function getEventName(event: DeviceEvent): string {
  return DeviceEvent[event] || `UNKNOWN(${event})`;
}

/**
 * Get human-readable name for timer state
 */
export function getTimerStateName(state: TimerState): string {
  return TimerState[state] || `UNKNOWN(${state})`;
}

/**
 * Get human-readable name for lock state
 */
export function getLockStateName(state: LockState): string {
  return LockState[state] || `UNKNOWN(${state})`;
}
