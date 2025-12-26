import React from 'react';
import { Target, Activity } from 'lucide-react';
import { DeviceStatus } from './DeviceStatus';
import { DeviceConnectionState } from '../types';

interface HeaderProps {
  score: number;
  deviceConnectionState: DeviceConnectionState;
  deviceLastError?: string;
  onDeviceConnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  deviceConnectionState,
  deviceLastError,
  onDeviceConnect
}) => {
  const target = 7;
  const progressPercent = Math.min(100, (score / 10) * 100);
  const targetPercent = (target / 10) * 100;

  return (
    <header className="py-6 mb-8 border-b-2 border-black">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-2">
              <Target size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-tighter">Prodaktiv</h1>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Graphyn.xyz Plugin</p>
            </div>
          </div>

          {/* Device Connection Status */}
          <div className="border-l border-gray-200 pl-4">
            <DeviceStatus
              connectionState={deviceConnectionState}
              lastError={deviceLastError}
              onConnect={onDeviceConnect}
            />
          </div>
        </div>
        
        <div className="flex flex-col items-end">
           <div className="flex items-center gap-2">
            {score >= 7 && (
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 mr-2">
                <Activity size={12} />
                <span>ON TRACK</span>
              </div>
            )}
            <span className="text-xs font-mono uppercase text-gray-500">Score</span>
            <div className={`text-2xl font-mono font-bold ${score >= 7 ? 'text-black' : 'text-gray-400'}`}>
              {score}<span className="text-sm text-gray-300">/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        {/* Target Marker */}
        <div 
            className="absolute top-0 bottom-0 w-0.5 bg-black z-10 opacity-20"
            style={{ left: `${targetPercent}%` }}
        ></div>
        {/* Fill */}
        <div 
            className={`absolute top-0 bottom-0 transition-all duration-500 ${score >= 7 ? 'bg-green-500' : 'bg-black'}`}
            style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1 text-[10px] font-mono text-gray-400 uppercase">
        <span>0</span>
        <span className="pl-8">Target (7)</span>
        <span>10</span>
      </div>
    </header>
  );
};