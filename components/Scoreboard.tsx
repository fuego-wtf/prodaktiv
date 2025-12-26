import React from 'react';
import { DayLog, ScoreState } from '../types';
import { CheckSquare, XSquare, Zap, Coffee, Moon, Ban, CheckCircle2 } from 'lucide-react';

interface ScoreboardProps {
  log: DayLog;
  updateScore: (key: keyof ScoreState, value: any) => void;
  currentScore: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ log, updateScore, currentScore }) => {
  
  const toggleBoolean = (key: keyof ScoreState) => {
    updateScore(key, !log.scores[key]);
  };

  const toggleDeepWork = (key: 'deepWork1' | 'deepWork2') => {
    // Cycle: 0 -> 2 (Full) -> 1 (Partial) -> 0
    const current = log.scores[key];
    let next = 0;
    if (current === 0) next = 2;
    else if (current === 2) next = 1;
    else next = 0;
    updateScore(key, next);
  };

  const DeepWorkItem = ({ 
    itemKey, 
    label, 
    duration 
  }: { 
    itemKey: 'deepWork1' | 'deepWork2'; 
    label: string; 
    duration: string;
  }) => {
    const val = log.scores[itemKey];
    return (
        <div 
        onClick={() => toggleDeepWork(itemKey)}
        className={`
            cursor-pointer flex items-center justify-between p-4 border-2 transition-all mb-3
            ${val === 2 ? 'border-black bg-black text-white' : 
              val === 1 ? 'border-black bg-gray-100 text-black' : 
              'border-gray-200 hover:border-gray-300 text-gray-500'}
        `}
        >
        <div className="flex items-center gap-3">
            <Zap size={18} className={val === 2 ? 'text-yellow-400 fill-current' : ''} />
            <div>
                <span className="font-mono text-sm font-bold uppercase block">{label}</span>
                <span className="text-[10px] opacity-70 font-mono">{duration}</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-xs font-mono">{val} pts</span>
            {val === 2 ? <CheckSquare size={20} /> : val === 1 ? <div className="font-bold text-xs border border-current px-1 rounded">PARTIAL</div> : <XSquare size={20} />}
        </div>
        </div>
    );
  };

  const BooleanItem = ({ 
    itemKey, 
    label, 
    subLabel,
    points, 
    icon: Icon 
  }: { 
    itemKey: keyof ScoreState; 
    label: string; 
    subLabel?: string;
    points: number;
    icon: any;
  }) => (
    <div 
      onClick={() => toggleBoolean(itemKey)}
      className={`
        cursor-pointer flex items-center justify-between p-4 border-2 transition-all mb-3
        ${log.scores[itemKey] 
          ? 'border-gray-800 bg-gray-800 text-white' 
          : 'border-gray-200 hover:border-gray-300 text-gray-500'}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <div>
            <span className="font-mono text-sm font-bold uppercase block">{label}</span>
            {subLabel && <span className="text-[10px] opacity-70 font-mono block max-w-[200px] truncate">{subLabel}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono">{points} pts</span>
        {log.scores[itemKey] ? <CheckSquare size={20} /> : <div className="w-5 h-5 rounded border border-gray-300"></div>}
      </div>
    </div>
  );

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-mono flex items-center gap-2">
          <span className="bg-black text-white px-2 py-0.5 text-sm">MEASURE</span> SCOREBOARD
        </h2>
      </div>

      <div className="flex flex-col">
        {/* Sequence: DW1 -> DW2 -> SHIP -> MOVE -> FOOD -> DISTRACTION -> SHUTDOWN */}
        <DeepWorkItem itemKey="deepWork1" label="Deep Work #1" duration="90m (2pts) / 45m (1pt)" />
        <DeepWorkItem itemKey="deepWork2" label="Deep Work #2" duration="60m (2pts) / 30m (1pt)" />
        
        <BooleanItem itemKey="shipped" label="Objective Shipped" points={2} icon={CheckCircle2} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <BooleanItem itemKey="move" label="Movement" points={1} icon={ActivityIcon} />
             <BooleanItem itemKey="foodWater" label="Food & Water" points={1} icon={Coffee} />
        </div>

        <BooleanItem 
            itemKey="distraction" 
            label="Distraction Controlled" 
            subLabel={log.distractionRule}
            points={1} 
            icon={Ban} 
        />
        <BooleanItem itemKey="shutdown" label="Shutdown Ritual" points={1} icon={Moon} />
      </div>
    </section>
  );
};

const ActivityIcon = ({size}: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
)