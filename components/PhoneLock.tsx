import React from 'react';
import { Lock, Unlock, Smartphone, SmartphoneNfc } from 'lucide-react';
import { DeviceConnectionState } from '../types';

interface PhoneLockProps {
  connectionState: DeviceConnectionState;
  isLocked: boolean;
  hasPhone: boolean;
  onLock: () => void;
  onUnlock: () => void;
}

export const PhoneLock: React.FC<PhoneLockProps> = ({
  connectionState,
  isLocked,
  hasPhone,
  onLock,
  onUnlock
}) => {
  // Only show when device is connected
  if (connectionState !== 'connected') {
    return null;
  }

  return (
    <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-black text-white p-1">
          <Smartphone size={14} />
        </div>
        <span className="font-bold font-mono text-xs uppercase">Phone Lock</span>
      </div>

      {/* Status Display */}
      <div className="mb-4">
        <PhoneStatusIndicator hasPhone={hasPhone} isLocked={isLocked} />
      </div>

      {/* Controls */}
      {hasPhone ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onLock}
            disabled={isLocked}
            className={`
              flex items-center justify-center gap-2 py-3 font-bold font-mono text-xs
              transition-all duration-200
              ${isLocked
                ? 'bg-red-600 text-white cursor-default'
                : 'bg-zinc-100 text-zinc-600 hover:bg-red-600 hover:text-white border border-zinc-200'
              }
            `}
          >
            <Lock size={14} />
            {isLocked ? 'LOCKED' : 'LOCK'}
          </button>
          <button
            onClick={onUnlock}
            disabled={!isLocked}
            className={`
              flex items-center justify-center gap-2 py-3 font-bold font-mono text-xs
              transition-all duration-200
              ${!isLocked
                ? 'bg-green-600 text-white cursor-default'
                : 'bg-zinc-100 text-zinc-600 hover:bg-green-600 hover:text-white border border-zinc-200'
              }
            `}
          >
            <Unlock size={14} />
            {!isLocked ? 'FREE' : 'UNLOCK'}
          </button>
        </div>
      ) : (
        <div className="bg-zinc-50 border border-dashed border-zinc-300 py-4 text-center">
          <p className="text-xs text-zinc-500 font-mono">
            Place phone on device to enable lock
          </p>
        </div>
      )}
    </div>
  );
};

interface PhoneStatusIndicatorProps {
  hasPhone: boolean;
  isLocked: boolean;
}

const PhoneStatusIndicator: React.FC<PhoneStatusIndicatorProps> = ({ hasPhone, isLocked }) => {
  const getStatusConfig = () => {
    if (!hasPhone) {
      return {
        icon: SmartphoneNfc,
        iconBg: 'bg-zinc-200',
        iconColor: 'text-zinc-500',
        ringColor: 'border-zinc-200',
        statusText: 'No Phone Detected',
        statusColor: 'text-zinc-500',
        description: 'Place your phone on the Prodaktiv device'
      };
    }
    if (isLocked) {
      return {
        icon: Lock,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        ringColor: 'border-red-200',
        statusText: 'Phone Locked',
        statusColor: 'text-red-600',
        description: 'Phone secured in Deep Work mode'
      };
    }
    return {
      icon: Unlock,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      ringColor: 'border-green-200',
      statusText: 'Phone Unlocked',
      statusColor: 'text-green-600',
      description: 'Phone can be removed from device'
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-4">
      {/* Device Visual */}
      <div className="relative">
        {/* Outer ring */}
        <div className={`w-16 h-16 rounded-full border-4 ${config.ringColor} flex items-center justify-center bg-white`}>
          {/* Inner icon */}
          <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center`}>
            <Icon size={20} className={config.iconColor} />
          </div>
        </div>

        {/* Status dot */}
        {hasPhone && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
            {isLocked && (
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-4 w-4 ${isLocked ? 'bg-red-500' : 'bg-green-500'}`} />
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="flex-1">
        <p className={`font-bold font-mono text-sm ${config.statusColor}`}>
          {config.statusText}
        </p>
        <p className="text-xs text-zinc-500">
          {config.description}
        </p>
      </div>
    </div>
  );
};
