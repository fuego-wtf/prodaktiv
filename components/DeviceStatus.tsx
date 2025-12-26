import React from 'react';
import { Bluetooth, BluetoothOff, BluetoothConnected } from 'lucide-react';
import { DeviceConnectionState } from '../types';

interface DeviceStatusProps {
  connectionState: DeviceConnectionState;
  lastError?: string;
  onConnect: () => void;
}

export const DeviceStatus: React.FC<DeviceStatusProps> = ({
  connectionState,
  lastError,
  onConnect
}) => {
  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          dotColor: 'bg-green-500',
          text: 'LIN34R Connected',
          icon: BluetoothConnected,
          pulse: false,
          clickable: false
        };
      case 'connecting':
        return {
          dotColor: 'bg-amber-500',
          text: 'Connecting...',
          icon: Bluetooth,
          pulse: true,
          clickable: false
        };
      case 'error':
        return {
          dotColor: 'bg-red-500',
          text: lastError || 'Connection Error',
          icon: BluetoothOff,
          pulse: false,
          clickable: true
        };
      case 'disconnected':
      default:
        return {
          dotColor: 'bg-gray-400',
          text: 'Connect Device',
          icon: BluetoothOff,
          pulse: false,
          clickable: true
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const handleClick = () => {
    if (config.clickable) {
      onConnect();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!config.clickable}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md
        font-mono text-xs transition-all duration-200
        ${config.clickable
          ? 'hover:bg-zinc-100 cursor-pointer'
          : 'cursor-default'
        }
        ${connectionState === 'error' ? 'text-red-600' : 'text-zinc-600'}
      `}
      title={connectionState === 'error' ? lastError : undefined}
    >
      {/* Status Dot */}
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75 animate-ping`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
      </span>

      {/* Icon */}
      <Icon size={14} strokeWidth={2} />

      {/* Text */}
      <span className="hidden sm:inline whitespace-nowrap">
        {config.text}
      </span>
    </button>
  );
};
