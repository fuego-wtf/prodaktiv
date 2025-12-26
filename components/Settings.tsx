import React, { useState } from 'react';
import { AppSettings } from '../types';
import { X, Key, Bot, AlertCircle } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  updateSettings: (s: AppSettings) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, onClose }) => {
  const [error, setError] = useState("");

  const validateLinearKey = (key: string) => {
    if (!key) return true; // Allow empty to clear
    return key.startsWith('lin_api_');
  };

  const handleChange = (val: string) => {
    updateSettings({...settings, linearApiKey: val});
    if (val && !val.startsWith('lin_api_')) {
        setError("Key format invalid. Must start with 'lin_api_'");
    } else {
        setError("");
    }
  };

  const handleSave = () => {
    if (!validateLinearKey(settings.linearApiKey)) {
        setError("Invalid Linear API Key format. It should start with 'lin_api_'");
        return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white max-w-md w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center p-4 border-b-2 border-black bg-gray-50">
            <h2 className="font-bold font-mono uppercase">System Configuration</h2>
            <button onClick={onClose}><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-6">
            
            {/* Linear Config */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-black text-white p-1"><Key size={14}/></div>
                    <label className="font-bold font-mono text-sm uppercase">Linear API Key</label>
                </div>
                <input 
                    type="password"
                    value={settings.linearApiKey}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="lin_api_..."
                    className={`w-full border-2 p-2 font-mono text-xs outline-none transition-colors ${error ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-black'}`}
                />
                {error ? (
                    <p className="text-[10px] text-red-600 mt-1 font-mono flex items-center gap-1 font-bold">
                       <AlertCircle size={10} /> {error}
                    </p>
                ) : (
                     <p className="text-[10px] text-gray-400 mt-1 font-mono">
                        Format: lin_api_... (found in Linear Profile settings)
                    </p>
                )}
            </div>

            {/* Gemini Config */}
            <div>
                 <div className="flex items-center gap-2 mb-2">
                    <div className="bg-purple-600 text-white p-1"><Bot size={14}/></div>
                    <label className="font-bold font-mono text-sm uppercase">Gemini Agent Key</label>
                </div>
                 <input 
                    type="password"
                    value={settings.geminiApiKey}
                    onChange={(e) => updateSettings({...settings, geminiApiKey: e.target.value})}
                    placeholder="AIza..."
                    className="w-full border-2 border-gray-200 p-2 font-mono text-xs focus:border-black outline-none"
                />
                 <p className="text-[10px] text-gray-400 mt-1 font-mono">
                    Required for "Agent Mode" planning.
                </p>
            </div>

            <button 
                onClick={handleSave}
                className="w-full bg-black text-white font-bold font-mono py-3 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!!error}
            >
                SAVE & CLOSE
            </button>

        </div>
      </div>
    </div>
  );
};