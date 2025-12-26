/**
 * LIN34R Web Bluetooth Service
 *
 * Handles connection, communication, and state management for the
 * LIN34R focus timer device via Web Bluetooth API.
 */

import {
  SERVICE_UUIDS,
  LIN34R_SERVICE_UUID,
  CHARACTERISTIC_UUIDS,
  Command,
  DeviceEvent,
  VoiceEvent,
  encodeCommand,
  encodeStartFocus,
  encodeSetDuration,
  decodeEvent,
  decodeStatePacket,
  decodeBatteryLevel,
  decodeDialRotation,
  decodeVoiceEvent,
  getEventName,
  getVoiceEventName,
  StatePacket,
  EventPacket,
  VoiceEventPacket,
  TimerState,
  LockState,
  PhonePresence,
} from './device-protocol';

// ============================================================================
// Types
// ============================================================================

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export type VoiceState = 'idle' | 'recording' | 'processing';

export interface DeviceState {
  connectionState: ConnectionState;
  deviceName: string | null;
  batteryLevel: number;
  timerState: TimerState;
  timerDurationMinutes: number;
  timerRemainingSeconds: number;
  lockState: LockState;
  phonePresence: PhonePresence;
  dialPosition: number;
  firmwareVersion: string | null;
  lastEventTime: number;
  reconnectAttempts: number;
  voiceState: VoiceState;
}

export interface BluetoothEventHandlers {
  onStateChange?: (state: DeviceState) => void;
  onEvent?: (event: EventPacket) => void;
  onDialRotated?: (delta: number) => void;
  onPhonePlaced?: () => void;
  onPhoneRemoved?: () => void;
  onLockEngaged?: () => void;
  onLockReleased?: () => void;
  onButtonPressed?: () => void;
  onTimerComplete?: () => void;
  onVoiceEvent?: (event: VoiceEventPacket) => void;
  onError?: (error: Error) => void;
  onDisconnect?: () => void;
}

// ============================================================================
// State
// ============================================================================

let device: BluetoothDevice | null = null;
let server: BluetoothRemoteGATTServer | null = null;
let sessionService: BluetoothRemoteGATTService | null = null;
let voiceService: BluetoothRemoteGATTService | null = null;
let commandCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
let eventCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
let stateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
let batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
let voiceCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

let eventHandlers: BluetoothEventHandlers = {};
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let isReconnecting = false;

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 2000;
const COMMAND_TIMEOUT_MS = 5000;

const state: DeviceState = {
  connectionState: 'disconnected',
  deviceName: null,
  batteryLevel: 0,
  timerState: TimerState.IDLE,
  timerDurationMinutes: 0,
  timerRemainingSeconds: 0,
  lockState: LockState.UNLOCKED,
  phonePresence: PhonePresence.ABSENT,
  dialPosition: 0,
  firmwareVersion: null,
  lastEventTime: 0,
  reconnectAttempts: 0,
  voiceState: 'idle',
};

// ============================================================================
// Utility Functions
// ============================================================================

function updateState(updates: Partial<DeviceState>): void {
  Object.assign(state, updates);
  eventHandlers.onStateChange?.(getConnectionState());
}

function emitError(error: Error): void {
  console.error('[Bluetooth]', error.message);
  eventHandlers.onError?.(error);
}

/**
 * Check if Web Bluetooth is available
 */
export function isBluetoothSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

/**
 * Check if Web Bluetooth is available with detailed error
 */
export function checkBluetoothSupport(): { supported: boolean; error?: string } {
  if (!isBluetoothSupported()) {
    return {
      supported: false,
      error: 'Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.',
    };
  }
  return { supported: true };
}

// ============================================================================
// Connection Management
// ============================================================================

/**
 * Scan for and connect to a LIN34R device
 */
export async function connectDevice(): Promise<boolean> {
  const support = checkBluetoothSupport();
  if (!support.supported) {
    emitError(new Error(support.error!));
    return false;
  }

  if (state.connectionState === 'connected') {
    console.log('[Bluetooth] Already connected');
    return true;
  }

  updateState({ connectionState: 'connecting', reconnectAttempts: 0 });

  try {
    // Request device with LIN34R service filter
    device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: [LIN34R_SERVICE_UUID] },
        { namePrefix: 'LIN34R' },
      ],
      optionalServices: [
        SERVICE_UUIDS.TIMER,
        SERVICE_UUIDS.LOCK,
        SERVICE_UUIDS.SESSION,
        SERVICE_UUIDS.DEVICE_INFO,
        SERVICE_UUIDS.VOICE,
        LIN34R_SERVICE_UUID,
      ],
    });

    if (!device) {
      throw new Error('No device selected');
    }

    if (!device.gatt) {
      throw new Error('GATT not available on device');
    }

    // Listen for disconnection
    device.addEventListener('gattserverdisconnected', handleDisconnection);

    updateState({ deviceName: device.name || 'LIN34R Device' });

    // Connect to GATT server
    server = await device.gatt.connect();
    console.log('[Bluetooth] Connected to GATT server');

    // Get services and characteristics
    await setupServicesAndCharacteristics();

    // Subscribe to notifications
    await subscribeToNotifications();

    // Request initial state sync
    await sendCommand(Command.SYNC_STATE);

    updateState({ connectionState: 'connected' });
    console.log('[Bluetooth] Device ready');

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('User cancelled') || message.includes('cancelled')) {
      console.log('[Bluetooth] User cancelled device selection');
      updateState({ connectionState: 'disconnected' });
      return false;
    }

    emitError(new Error(`Connection failed: ${message}`));
    updateState({ connectionState: 'disconnected' });
    return false;
  }
}

/**
 * Setup GATT services and characteristics after connection
 */
async function setupServicesAndCharacteristics(): Promise<void> {
  if (!server) throw new Error('Not connected');

  try {
    // Get Session service (primary for commands/events)
    sessionService = await server.getPrimaryService(LIN34R_SERVICE_UUID);

    // Get command characteristic
    commandCharacteristic = await sessionService.getCharacteristic(
      CHARACTERISTIC_UUIDS.SESSION_COMMAND
    );

    // Get event notification characteristic
    eventCharacteristic = await sessionService.getCharacteristic(
      CHARACTERISTIC_UUIDS.SESSION_EVENTS
    );

    // Get state characteristic
    stateCharacteristic = await sessionService.getCharacteristic(
      CHARACTERISTIC_UUIDS.SESSION_STATE
    );

    // Try to get battery characteristic from device info service
    try {
      const deviceInfoService = await server.getPrimaryService(SERVICE_UUIDS.DEVICE_INFO);
      batteryCharacteristic = await deviceInfoService.getCharacteristic(
        CHARACTERISTIC_UUIDS.BATTERY_LEVEL
      );
    } catch {
      console.log('[Bluetooth] Battery characteristic not available');
    }

    // Try to get voice service and characteristic
    try {
      voiceService = await server.getPrimaryService(SERVICE_UUIDS.VOICE);
      voiceCharacteristic = await voiceService.getCharacteristic(
        CHARACTERISTIC_UUIDS.VOICE_EVENTS
      );
      console.log('[Bluetooth] Voice characteristic available');
    } catch {
      console.log('[Bluetooth] Voice characteristic not available');
    }
  } catch (error) {
    throw new Error(`Failed to setup characteristics: ${error}`);
  }
}

/**
 * Disconnect from the device
 */
export async function disconnectDevice(): Promise<void> {
  // Clear reconnect timeout if pending
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  isReconnecting = false;

  // Unsubscribe from notifications
  if (eventCharacteristic) {
    try {
      eventCharacteristic.removeEventListener('characteristicvaluechanged', handleEventNotification);
      await eventCharacteristic.stopNotifications();
    } catch {
      // Ignore errors during cleanup
    }
  }

  if (stateCharacteristic) {
    try {
      stateCharacteristic.removeEventListener('characteristicvaluechanged', handleStateNotification);
      await stateCharacteristic.stopNotifications();
    } catch {
      // Ignore errors during cleanup
    }
  }

  if (batteryCharacteristic) {
    try {
      batteryCharacteristic.removeEventListener('characteristicvaluechanged', handleBatteryNotification);
      await batteryCharacteristic.stopNotifications();
    } catch {
      // Ignore errors during cleanup
    }
  }

  if (voiceCharacteristic) {
    try {
      voiceCharacteristic.removeEventListener('characteristicvaluechanged', handleVoiceNotification);
      await voiceCharacteristic.stopNotifications();
    } catch {
      // Ignore errors during cleanup
    }
  }

  // Disconnect GATT
  if (device?.gatt?.connected) {
    device.gatt.disconnect();
  }

  // Remove event listener
  if (device) {
    device.removeEventListener('gattserverdisconnected', handleDisconnection);
  }

  // Reset references
  device = null;
  server = null;
  sessionService = null;
  voiceService = null;
  commandCharacteristic = null;
  eventCharacteristic = null;
  stateCharacteristic = null;
  batteryCharacteristic = null;
  voiceCharacteristic = null;

  // Reset state
  updateState({
    connectionState: 'disconnected',
    deviceName: null,
    reconnectAttempts: 0,
    voiceState: 'idle',
  });

  eventHandlers.onDisconnect?.();
  console.log('[Bluetooth] Disconnected');
}

/**
 * Handle unexpected disconnection
 */
function handleDisconnection(): void {
  console.log('[Bluetooth] Device disconnected unexpectedly');

  if (isReconnecting) return;

  updateState({ connectionState: 'disconnected' });

  // Attempt to reconnect
  if (state.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    attemptReconnect();
  } else {
    eventHandlers.onDisconnect?.();
    emitError(new Error('Device disconnected. Max reconnection attempts reached.'));
  }
}

/**
 * Attempt to reconnect to the device
 */
async function attemptReconnect(): Promise<void> {
  if (!device || isReconnecting) return;

  isReconnecting = true;
  const attempt = state.reconnectAttempts + 1;
  updateState({
    connectionState: 'reconnecting',
    reconnectAttempts: attempt,
  });

  console.log(`[Bluetooth] Reconnection attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS}`);

  reconnectTimeout = setTimeout(async () => {
    try {
      if (!device?.gatt) {
        throw new Error('Device no longer available');
      }

      server = await device.gatt.connect();
      await setupServicesAndCharacteristics();
      await subscribeToNotifications();
      await sendCommand(Command.SYNC_STATE);

      updateState({
        connectionState: 'connected',
        reconnectAttempts: 0,
      });

      isReconnecting = false;
      console.log('[Bluetooth] Reconnected successfully');
    } catch (error) {
      isReconnecting = false;

      if (state.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        attemptReconnect();
      } else {
        await disconnectDevice();
        emitError(new Error('Failed to reconnect after multiple attempts'));
      }
    }
  }, RECONNECT_DELAY_MS);
}

// ============================================================================
// Notifications
// ============================================================================

/**
 * Subscribe to device notifications (events, battery, state)
 */
export async function subscribeToNotifications(): Promise<void> {
  // Subscribe to session events
  if (eventCharacteristic) {
    await eventCharacteristic.startNotifications();
    eventCharacteristic.addEventListener(
      'characteristicvaluechanged',
      handleEventNotification
    );
  }

  // Subscribe to state changes
  if (stateCharacteristic) {
    await stateCharacteristic.startNotifications();
    stateCharacteristic.addEventListener(
      'characteristicvaluechanged',
      handleStateNotification
    );

    // Read initial state
    try {
      const initialState = await stateCharacteristic.readValue();
      processStateData(initialState);
    } catch {
      console.log('[Bluetooth] Could not read initial state');
    }
  }

  // Subscribe to battery level if available
  if (batteryCharacteristic) {
    try {
      await batteryCharacteristic.startNotifications();
      batteryCharacteristic.addEventListener(
        'characteristicvaluechanged',
        handleBatteryNotification
      );

      // Read initial battery level
      const batteryData = await batteryCharacteristic.readValue();
      updateState({ batteryLevel: decodeBatteryLevel(batteryData) });
    } catch (error) {
      console.log('[Bluetooth] Could not subscribe to battery notifications');
    }
  }

  // Subscribe to voice events if available
  if (voiceCharacteristic) {
    try {
      await voiceCharacteristic.startNotifications();
      voiceCharacteristic.addEventListener(
        'characteristicvaluechanged',
        handleVoiceNotification
      );
      console.log('[Bluetooth] Subscribed to voice notifications');
    } catch (error) {
      console.log('[Bluetooth] Could not subscribe to voice notifications');
    }
  }

  console.log('[Bluetooth] Subscribed to notifications');
}

/**
 * Handle incoming event notification
 */
function handleEventNotification(event: Event): void {
  const target = event.target as BluetoothRemoteGATTCharacteristic;
  const value = target.value;

  if (!value) return;

  try {
    const eventPacket = decodeEvent(value);
    updateState({ lastEventTime: Date.now() });

    console.log(`[Bluetooth] Event: ${getEventName(eventPacket.event)}`);
    eventHandlers.onEvent?.(eventPacket);

    // Dispatch to specific handlers
    switch (eventPacket.event) {
      case DeviceEvent.DIAL_ROTATED:
        const delta = decodeDialRotation(eventPacket.payload);
        updateState({ dialPosition: state.dialPosition + delta });
        eventHandlers.onDialRotated?.(delta);
        break;

      case DeviceEvent.PHONE_PLACED:
        updateState({ phonePresence: PhonePresence.PRESENT });
        eventHandlers.onPhonePlaced?.();
        break;

      case DeviceEvent.PHONE_REMOVED:
        updateState({ phonePresence: PhonePresence.ABSENT });
        eventHandlers.onPhoneRemoved?.();
        break;

      case DeviceEvent.LOCK_ENGAGED:
        updateState({ lockState: LockState.LOCKED });
        eventHandlers.onLockEngaged?.();
        break;

      case DeviceEvent.LOCK_RELEASED:
        updateState({ lockState: LockState.UNLOCKED });
        eventHandlers.onLockReleased?.();
        break;

      case DeviceEvent.BUTTON_PRESSED:
        eventHandlers.onButtonPressed?.();
        break;

      case DeviceEvent.TIMER_COMPLETE:
        updateState({ timerState: TimerState.COMPLETED, timerRemainingSeconds: 0 });
        eventHandlers.onTimerComplete?.();
        break;

      case DeviceEvent.BATTERY_CHANGED:
        if (eventPacket.payload.length > 0) {
          updateState({ batteryLevel: eventPacket.payload[0] });
        }
        break;

      case DeviceEvent.ERROR:
        emitError(new Error(`Device error: code ${eventPacket.payload[0]}`));
        break;
    }
  } catch (error) {
    console.error('[Bluetooth] Failed to decode event:', error);
  }
}

/**
 * Handle state characteristic notification
 */
function handleStateNotification(event: Event): void {
  const target = event.target as BluetoothRemoteGATTCharacteristic;
  const value = target.value;

  if (!value) return;

  processStateData(value);
}

/**
 * Process state data from device
 */
function processStateData(data: DataView): void {
  try {
    const statePacket = decodeStatePacket(data);
    updateState({
      timerState: statePacket.timerState,
      timerDurationMinutes: statePacket.timerDurationMinutes,
      timerRemainingSeconds: statePacket.timerRemainingSeconds,
      lockState: statePacket.lockState,
      phonePresence: statePacket.phonePresence,
      batteryLevel: statePacket.batteryPercent,
      dialPosition: statePacket.dialPosition,
      firmwareVersion: statePacket.firmwareVersion,
    });
  } catch (error) {
    console.error('[Bluetooth] Failed to decode state:', error);
  }
}

/**
 * Handle battery level notification
 */
function handleBatteryNotification(event: Event): void {
  const target = event.target as BluetoothRemoteGATTCharacteristic;
  const value = target.value;

  if (!value) return;

  const level = decodeBatteryLevel(value);
  updateState({ batteryLevel: level });
}

/**
 * Handle voice event notification
 */
function handleVoiceNotification(event: Event): void {
  const target = event.target as BluetoothRemoteGATTCharacteristic;
  const value = target.value;

  if (!value) return;

  try {
    const voiceEventPacket = decodeVoiceEvent(value);
    console.log(`[Bluetooth] Voice Event: ${getVoiceEventName(voiceEventPacket.event)}`);

    // Update voice state based on event
    switch (voiceEventPacket.event) {
      case VoiceEvent.VOICE_START:
      case VoiceEvent.VOICE_TOGGLE_ON:
        updateState({ voiceState: 'recording' });
        break;

      case VoiceEvent.VOICE_STOP:
      case VoiceEvent.VOICE_TOGGLE_OFF:
        // Set to processing - the app should set back to idle after processing audio
        updateState({ voiceState: 'processing' });
        break;
    }

    // Dispatch to handler
    eventHandlers.onVoiceEvent?.(voiceEventPacket);
  } catch (error) {
    console.error('[Bluetooth] Failed to decode voice event:', error);
  }
}

/**
 * Manually reset voice state to idle (call after audio processing is complete)
 */
export function resetVoiceState(): void {
  updateState({ voiceState: 'idle' });
}

// ============================================================================
// Commands
// ============================================================================

/**
 * Send a command to the device
 */
export async function sendCommand(
  command: Command,
  payload: number[] = []
): Promise<void> {
  if (!commandCharacteristic) {
    throw new Error('Not connected to device');
  }

  const packet = encodeCommand(command, payload);

  try {
    await Promise.race([
      commandCharacteristic.writeValueWithResponse(packet),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Command timeout')), COMMAND_TIMEOUT_MS)
      ),
    ]);
    console.log(`[Bluetooth] Command sent: ${Command[command]}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to send command: ${message}`);
  }
}

/**
 * Send raw command bytes (for compatibility)
 */
export async function sendRawCommand(commandBytes: Uint8Array): Promise<void> {
  if (!commandCharacteristic) {
    throw new Error('Not connected to device');
  }
  await commandCharacteristic.writeValueWithResponse(commandBytes);
}

/**
 * Start a focus session
 */
export async function startFocus(durationMinutes: number): Promise<void> {
  if (!commandCharacteristic) {
    throw new Error('Not connected to device');
  }

  const packet = encodeStartFocus(durationMinutes);
  await commandCharacteristic.writeValueWithResponse(packet);

  updateState({
    timerState: TimerState.RUNNING,
    timerDurationMinutes: durationMinutes,
    timerRemainingSeconds: durationMinutes * 60,
  });

  console.log(`[Bluetooth] Started focus session: ${durationMinutes} minutes`);
}

/**
 * End the current session
 */
export async function endSession(): Promise<void> {
  await sendCommand(Command.END_SESSION);
  updateState({ timerState: TimerState.IDLE, timerRemainingSeconds: 0 });
}

/**
 * Lock the phone
 */
export async function lockPhone(): Promise<void> {
  await sendCommand(Command.LOCK_PHONE);
  updateState({ lockState: LockState.LOCKING });
}

/**
 * Unlock the phone
 */
export async function unlockPhone(): Promise<void> {
  await sendCommand(Command.UNLOCK_PHONE);
  updateState({ lockState: LockState.UNLOCKING });
}

/**
 * Pause the current session
 */
export async function pauseSession(): Promise<void> {
  await sendCommand(Command.PAUSE_SESSION);
  updateState({ timerState: TimerState.PAUSED });
}

/**
 * Resume a paused session
 */
export async function resumeSession(): Promise<void> {
  await sendCommand(Command.RESUME_SESSION);
  updateState({ timerState: TimerState.RUNNING });
}

/**
 * Set timer duration
 */
export async function setDuration(durationMinutes: number): Promise<void> {
  if (!commandCharacteristic) {
    throw new Error('Not connected to device');
  }

  const packet = encodeSetDuration(durationMinutes);
  await commandCharacteristic.writeValueWithResponse(packet);
  updateState({ timerDurationMinutes: durationMinutes });
}

/**
 * Request state sync from device
 */
export async function syncState(): Promise<void> {
  await sendCommand(Command.SYNC_STATE);
}

// ============================================================================
// State Access
// ============================================================================

/**
 * Get current connection state
 */
export function getConnectionState(): DeviceState {
  return { ...state };
}

/**
 * Check if device is connected
 */
export function isConnected(): boolean {
  return state.connectionState === 'connected';
}

/**
 * Get device name
 */
export function getDeviceName(): string | null {
  return state.deviceName;
}

/**
 * Register event handlers
 */
export function setEventHandlers(handlers: BluetoothEventHandlers): void {
  eventHandlers = { ...handlers };
}

/**
 * Clear event handlers
 */
export function clearEventHandlers(): void {
  eventHandlers = {};
}

// ============================================================================
// Debug Helpers
// ============================================================================

/**
 * Get debug info about current connection
 */
export function getDebugInfo(): object {
  return {
    hasDevice: !!device,
    deviceName: device?.name || null,
    isGattConnected: device?.gatt?.connected || false,
    hasServer: !!server,
    hasCommandChar: !!commandCharacteristic,
    hasEventChar: !!eventCharacteristic,
    hasStateChar: !!stateCharacteristic,
    hasBatteryChar: !!batteryCharacteristic,
    hasVoiceChar: !!voiceCharacteristic,
    state: getConnectionState(),
  };
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export {
  Command,
  DeviceEvent,
  VoiceEvent,
  TimerState,
  LockState,
  PhonePresence,
} from './device-protocol';
