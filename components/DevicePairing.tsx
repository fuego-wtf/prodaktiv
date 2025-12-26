import React, { useState, useEffect } from 'react';
import { X, Bluetooth, Loader2, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import { DeviceConnectionState } from '../types';

interface DevicePairingProps {
  connectionState: DeviceConnectionState;
  lastError?: string;
  isSupported: boolean;
  onConnect: () => Promise<void>;
  onClose: () => void;
}

type PairingStep = 'instructions' | 'scanning' | 'success' | 'error';

export const DevicePairing: React.FC<DevicePairingProps> = ({
  connectionState,
  lastError,
  isSupported,
  onConnect,
  onClose
}) => {
  const [step, setStep] = useState<PairingStep>('instructions');

  // Sync step with connection state
  useEffect(() => {
    if (connectionState === 'connecting') {
      setStep('scanning');
    } else if (connectionState === 'connected') {
      setStep('success');
    } else if (connectionState === 'error') {
      setStep('error');
    }
  }, [connectionState]);

  // Auto-close on success after delay
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, onClose]);

  const handleScan = async () => {
    setStep('scanning');
    try {
      await onConnect();
    } catch {
      setStep('error');
    }
  };

  const handleRetry = () => {
    setStep('instructions');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-black bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded-md">
              <Bluetooth size={20} />
            </div>
            <div>
              <h2 className="font-bold font-mono uppercase text-sm">Device Pairing</h2>
              <p className="text-xs text-zinc-500 font-mono">LIN34R Physical Controller</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSupported ? (
            <NotSupportedContent />
          ) : step === 'instructions' ? (
            <InstructionsContent onScan={handleScan} />
          ) : step === 'scanning' ? (
            <ScanningContent />
          ) : step === 'success' ? (
            <SuccessContent />
          ) : (
            <ErrorContent error={lastError} onRetry={handleRetry} />
          )}
        </div>
      </div>
    </div>
  );
};

const NotSupportedContent: React.FC = () => (
  <div className="text-center py-8 space-y-4">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
      <AlertCircle size={32} className="text-red-600" />
    </div>
    <div>
      <h3 className="font-bold font-mono text-lg mb-2">Browser Not Supported</h3>
      <p className="text-zinc-500 text-sm max-w-sm mx-auto">
        Web Bluetooth is not available in this browser. Please use Chrome, Edge, or Opera on desktop.
      </p>
    </div>
  </div>
);

const InstructionsContent: React.FC<{ onScan: () => void }> = ({ onScan }) => (
  <div className="space-y-6">
    {/* Device Visual */}
    <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-lg p-8 flex items-center justify-center">
      <div className="relative">
        {/* Simplified device illustration */}
        <div className="w-32 h-20 bg-zinc-900 rounded-lg border-2 border-zinc-700 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-600 bg-zinc-800" />
        </div>
        {/* Pulsing BLE indicator */}
        <div className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500" />
        </div>
      </div>
    </div>

    {/* Instructions */}
    <div className="space-y-3">
      <h3 className="font-bold font-mono text-sm uppercase text-zinc-400">Setup Instructions</h3>
      <ol className="space-y-3 text-sm">
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-mono text-xs font-bold">1</span>
          <span className="text-zinc-600 pt-0.5">Hold the dial button for 3 seconds until the LED pulses blue</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-mono text-xs font-bold">2</span>
          <span className="text-zinc-600 pt-0.5">Click "Scan for Device" below to begin pairing</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-mono text-xs font-bold">3</span>
          <span className="text-zinc-600 pt-0.5">Select "LIN34R" from the browser's device picker</span>
        </li>
      </ol>
    </div>

    {/* Scan Button */}
    <button
      onClick={onScan}
      className="w-full bg-black text-white font-bold font-mono py-4 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3 shadow-md"
    >
      <Bluetooth size={18} />
      SCAN FOR DEVICE
    </button>
  </div>
);

const ScanningContent: React.FC = () => (
  <div className="text-center py-12 space-y-6">
    {/* Scanning Animation */}
    <div className="relative w-24 h-24 mx-auto">
      {/* Outer rings */}
      <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute inset-2 rounded-full border-2 border-blue-300 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
      <div className="absolute inset-4 rounded-full border-2 border-blue-400 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <Loader2 size={24} className="text-white animate-spin" />
        </div>
      </div>
    </div>

    <div>
      <h3 className="font-bold font-mono text-lg mb-2">Scanning...</h3>
      <p className="text-zinc-500 text-sm">
        Looking for LIN34R device nearby
      </p>
    </div>

    <p className="text-xs text-zinc-400 font-mono">
      Make sure the device LED is pulsing blue
    </p>
  </div>
);

const SuccessContent: React.FC = () => (
  <div className="text-center py-12 space-y-4">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
      <CheckCircle2 size={48} className="text-green-600" />
    </div>
    <div>
      <h3 className="font-bold font-mono text-lg mb-2 text-green-600">Connected!</h3>
      <p className="text-zinc-500 text-sm">
        LIN34R device paired successfully
      </p>
    </div>
  </div>
);

const ErrorContent: React.FC<{ error?: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="text-center py-8 space-y-6">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
      <AlertCircle size={32} className="text-red-600" />
    </div>
    <div>
      <h3 className="font-bold font-mono text-lg mb-2 text-red-600">Connection Failed</h3>
      <p className="text-zinc-500 text-sm max-w-sm mx-auto">
        {error || 'Unable to connect to the device. Please try again.'}
      </p>
    </div>

    <div className="space-y-3">
      <button
        onClick={onRetry}
        className="w-full bg-black text-white font-bold font-mono py-3 hover:bg-zinc-800 transition-colors"
      >
        TRY AGAIN
      </button>
      <p className="text-xs text-zinc-400 font-mono">
        Ensure the device is in pairing mode and nearby
      </p>
    </div>
  </div>
);
