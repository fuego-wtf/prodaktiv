import React from 'react';
import { Sun, Sunset, Moon, Clock, Play } from 'lucide-react';
import { Phase } from '../types';

interface DayShapeProps {
  currentPhase: Phase;
}

export const DayShape: React.FC<DayShapeProps> = ({ currentPhase }) => {
  
  const getPhaseStatus = (section: string[]) => {
    if (section.includes(currentPhase)) return 'active';
    // This is simple logic, could be more robust if we tracked completed phases separately
    return 'inactive';
  };

  const PhaseItem = ({ phases, label }: { phases: Phase[], label: string }) => {
    const isActive = phases.includes(currentPhase);
    return (
        <li className={`flex items-center gap-2 ${isActive ? 'font-bold text-black' : ''}`}>
             {isActive && <Play size={10} fill="black" />}
             {!isActive && <span className="w-2.5"></span>}
             {label}
        </li>
    );
  }

  return (
    <div className="hidden lg:block w-80 shrink-0 border-l border-gray-200 pl-8 ml-8">
      <h2 className="text-xs font-bold font-mono text-gray-400 uppercase tracking-widest mb-6 sticky top-0">
        Flow State
      </h2>
      
      <div className="space-y-8 sticky top-12">
        <div className={`relative pl-6 border-l-2 pb-2 transition-colors ${['PLANNING', 'DEEP_WORK_1', 'BREAK', 'DEEP_WORK_2'].includes(currentPhase) ? 'border-black' : 'border-gray-100'}`}>
          <div className="absolute -left-[9px] top-0 bg-white p-1">
            <Sun size={16} className="text-black" />
          </div>
          <h3 className="font-bold text-sm uppercase mb-1">Morning</h3>
          <ul className="text-xs space-y-2 text-gray-600 font-mono">
            <PhaseItem phases={['PLANNING']} label="Plan (10m)" />
            <PhaseItem phases={['DEEP_WORK_1']} label="Deep Work #1 (90m)" />
            <PhaseItem phases={['BREAK']} label="Break (20m)" />
            <PhaseItem phases={['DEEP_WORK_2']} label="Deep Work #2 (60m)" />
          </ul>
        </div>

        <div className={`relative pl-6 border-l-2 pb-2 transition-colors ${['ADMIN'].includes(currentPhase) ? 'border-black' : 'border-gray-100'}`}>
           <div className="absolute -left-[9px] top-0 bg-white p-1">
            <Clock size={16} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-sm uppercase mb-1">Midday</h3>
           <ul className="text-xs space-y-2 text-gray-600 font-mono">
             <PhaseItem phases={['ADMIN']} label="Admin Block (30m)" />
          </ul>
        </div>

        <div className={`relative pl-6 border-l-2 pb-2 transition-colors ${['BUILD'].includes(currentPhase) ? 'border-black' : 'border-gray-100'}`}>
           <div className="absolute -left-[9px] top-0 bg-white p-1">
            <Sunset size={16} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-sm uppercase mb-1">Evening</h3>
           <ul className="text-xs space-y-2 text-gray-600 font-mono">
            <PhaseItem phases={['BUILD']} label="Build & Leverage" />
          </ul>
        </div>

        <div className={`relative pl-6 border-l-2 pb-2 transition-colors ${['SHUTDOWN'].includes(currentPhase) ? 'border-black' : 'border-gray-100'}`}>
           <div className="absolute -left-[9px] top-0 bg-white p-1">
            <Moon size={16} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-sm uppercase mb-1">Shutdown</h3>
          <ul className="text-xs space-y-2 text-gray-600 font-mono">
             <PhaseItem phases={['SHUTDOWN']} label="Shutdown Ritual" />
          </ul>
        </div>
      </div>
    </div>
  );
};