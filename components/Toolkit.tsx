import React, { useState } from 'react';
import { DayLog } from '../types';
import { ChevronsRight, Lock, Zap, RefreshCw } from 'lucide-react';

interface ToolkitProps {
  microSteps: string[];
  updateMicroSteps: (steps: string[]) => void;
}

export const Toolkit: React.FC<ToolkitProps> = ({ microSteps, updateMicroSteps }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...microSteps];
    newSteps[index] = value;
    updateMicroSteps(newSteps);
  };

  const clearSteps = () => {
    updateMicroSteps(["", "", ""]);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 hover:border-black hover:text-black transition-colors font-mono font-bold flex items-center justify-center gap-2 group"
      >
        <Zap className="group-hover:text-yellow-500 transition-colors" size={18} />
        STALLED? OPEN ANTI-LAZY TOOLKIT
      </button>
    );
  }

  return (
    <section className="mb-12 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="p-4 bg-black text-white flex justify-between items-center">
        <h3 className="font-mono font-bold flex items-center gap-2">
          <Lock size={16} /> ANTI-LAZY PROTOCOL
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-xs underline">CLOSE</button>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h4 className="font-bold text-sm uppercase mb-1">Micro-Step Rule (60 Seconds)</h4>
          <p className="text-xs text-gray-500 mb-4">
            Write next 3 actions (each &lt;2 mins). Then do #1 immediately.
          </p>
          
          <div className="space-y-3">
            {microSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="font-mono font-bold text-gray-400">{idx + 1}</span>
                <input 
                  type="text"
                  value={step}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  className="w-full border-b border-gray-200 focus:border-black outline-none py-1 text-sm"
                  placeholder={`Micro-step ${idx + 1}...`}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button 
                onClick={clearSteps}
                className="flex items-center gap-2 px-3 py-1 text-xs font-bold border border-gray-200 hover:bg-gray-50"
            >
                <RefreshCw size={12} /> CLEAR
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
            <h4 className="font-bold text-sm uppercase mb-2">Environment Checklist</h4>
            <ul className="text-sm space-y-2 text-gray-600 font-mono">
                <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div> Phone outside the room
                </li>
                <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div> Close non-essential tabs
                </li>
                <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div> Start ritual (Water/Music)
                </li>
            </ul>
        </div>
      </div>
    </section>
  );
};