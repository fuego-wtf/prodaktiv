import { useState, useCallback, useEffect } from 'react';
import {
  connectDevice,
  disconnectDevice,
  sendCommand,
  isBluetoothSupported,
  setEventHandlers,
  clearEventHandlers,
  getConnectionState,
  resetVoiceState,
  lockPhone as lockPhoneCommand,
  unlockPhone as unlockPhoneCommand,
  Command,
  LockState,
  PhonePresence,
  VoiceEvent,
  DeviceState as BluetoothDeviceState,
  VoiceState,
} from '../services/bluetooth';
import { VoiceEventPacket } from '../services/device-protocol';
import { encodeCommand } from '../services/device-protocol';
import { DeviceConnectionState, Phase } from '../types';

/** Callback for voice events from the device */
export type VoiceEventCallback = (event: VoiceEventPacket) => void;

interface UseDeviceOptions {
  /** Called when voice events are received from the device */
  onVoiceEvent?: VoiceEventCallback;
}

interface UseDeviceReturn {
  // State
  isConnected: boolean;
  isLocked: boolean;
  hasPhone: boolean;
  batteryLevel: number;
  dialPosition: number;
  connectionState: DeviceConnectionState;
  lastError: string | undefined;
  voiceState: VoiceState;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  lockPhone: () => Promise<void>;
  unlockPhone: () => Promise<void>;
  syncState: (timerSeconds: number, phase: Phase, sessionCount: number) => Promise<void>;
  /** Reset voice state to idle (call after processing audio) */
  resetVoice: () => void;

  // Meta
  isSupported: boolean;
}

export function useDevice(options: UseDeviceOptions = {}): UseDeviceReturn {
  const { onVoiceEvent } = options;

  const [connectionState, setConnectionState] = useState<DeviceConnectionState>('disconnected');
  const [isLocked, setIsLocked] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [hasPhone, setHasPhone] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [dialPosition, setDialPosition] = useState(0);
  const [lastError, setLastError] = useState<string | undefined>(undefined);

  // Sync state from bluetooth service
  const syncFromBluetoothState = useCallback((state: BluetoothDeviceState) => {
    // Map bluetooth connection state to our DeviceConnectionState
    switch (state.connectionState) {
      case 'connected':
        setConnectionState('connected');
        break;
      case 'connecting':
      case 'reconnecting':
        setConnectionState('connecting');
        break;
      case 'disconnected':
      default:
        setConnectionState('disconnected');
        break;
    }

    setIsLocked(state.lockState === LockState.LOCKED);
    setHasPhone(state.phonePresence === PhonePresence.PRESENT);
    setBatteryLevel(state.batteryLevel);
    setDialPosition(state.dialPosition);
    setVoiceState(state.voiceState);
  }, []);

  // Setup event handlers on mount
  useEffect(() => {
    setEventHandlers({
      onStateChange: syncFromBluetoothState,
      onLockEngaged: () => setIsLocked(true),
      onLockReleased: () => setIsLocked(false),
      onPhonePlaced: () => setHasPhone(true),
      onPhoneRemoved: () => setHasPhone(false),
      onDialRotated: (delta) => setDialPosition((prev) => prev + delta),
      onVoiceEvent: (event) => {
        // Update local voice state
        if (event.event === VoiceEvent.VOICE_START || event.event === VoiceEvent.VOICE_TOGGLE_ON) {
          setVoiceState('recording');
        } else if (event.event === VoiceEvent.VOICE_STOP || event.event === VoiceEvent.VOICE_TOGGLE_OFF) {
          setVoiceState('processing');
        }
        // Call external handler if provided
        onVoiceEvent?.(event);
      },
      onError: (error) => {
        setLastError(error.message);
        setConnectionState('error');
      },
      onDisconnect: () => {
        setConnectionState('disconnected');
        setVoiceState('idle');
      },
    });

    // Sync initial state if already connected
    const currentState = getConnectionState();
    syncFromBluetoothState(currentState);

    return () => {
      clearEventHandlers();
    };
  }, [syncFromBluetoothState, onVoiceEvent]);

  const connect = useCallback(async () => {
    if (!isBluetoothSupported()) {
      setLastError('Web Bluetooth is not supported');
      setConnectionState('error');
      return;
    }

    setConnectionState('connecting');
    setLastError(undefined);

    try {
      const success = await connectDevice();
      if (success) {
        setConnectionState('connected');
      } else {
        // User may have cancelled - don't show error
        setConnectionState('disconnected');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setLastError(errorMessage);
      setConnectionState('error');
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await disconnectDevice();
    } catch (err) {
      console.warn('[useDevice] Error during disconnect:', err);
    }
    setConnectionState('disconnected');
    setIsLocked(false);
    setHasPhone(false);
    setVoiceState('idle');
  }, []);

  const resetVoice = useCallback(() => {
    resetVoiceState();
    setVoiceState('idle');
  }, []);

  const lockPhone = useCallback(async () => {
    if (connectionState !== 'connected') {
      throw new Error('Device not connected');
    }
    await lockPhoneCommand();
  }, [connectionState]);

  const unlockPhone = useCallback(async () => {
    if (connectionState !== 'connected') {
      throw new Error('Device not connected');
    }
    await unlockPhoneCommand();
  }, [connectionState]);

  const syncState = useCallback(
    async (timerSeconds: number, phase: Phase, sessionCount: number) => {
      if (connectionState !== 'connected') {
        throw new Error('Device not connected');
      }

      // Map Phase to a numeric value for the device display
      const phaseMap: Record<Phase, number> = {
        PLANNING: 0x00,
        FOCUS: 0x01,
        BREAK: 0x02,
        ADMIN: 0x03,
        SHUTDOWN: 0x04,
        COMPLETED: 0x05,
        DEEP_WORK_1: 0x06,
        DEEP_WORK_2: 0x07,
        BUILD: 0x08,
      };

      // Build sync payload: [phase, timerLow, timerHigh, sessionCount, reserved...]
      const payload = [
        phaseMap[phase] ?? 0x00,
        timerSeconds & 0xff,
        (timerSeconds >> 8) & 0xff,
        sessionCount & 0xff,
        0x00, // reserved
        0x00, // reserved
        0x00, // reserved
        0x00, // reserved
      ];

      await sendCommand(Command.SYNC_STATE, payload);
    },
    [connectionState]
  );

  return {
    // State
    isConnected: connectionState === 'connected',
    isLocked,
    hasPhone,
    batteryLevel,
    dialPosition,
    connectionState,
    lastError,
    voiceState,

    // Actions
    connect,
    disconnect,
    lockPhone,
    unlockPhone,
    syncState,
    resetVoice,

    // Meta
    isSupported: isBluetoothSupported(),
  };
}
