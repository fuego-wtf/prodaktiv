import React, { useState } from 'react';
import { Key, ArrowRight, X, AlertCircle } from 'lucide-react';

interface LoginModalProps {
    onComplete: (key: string) => void;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onComplete, onClose }) => {
    const [key, setKey] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (!key.trim().startsWith('lin_api_')) {
            setError("Invalid Key. Must start with 'lin_api_'");
            return;
        }
        onComplete(key.trim());
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 hover:bg-gray-100 p-1 rounded transition-colors"><X size={20}/></button>
                
                <div className="mb-6">
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg mb-4 shadow-lg">
                        <Key size={24} />
                    </div>
                    <h2 className="text-2xl font-bold font-mono tracking-tight">Connect Linear</h2>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                        To activate the Prodaktiv System, please enter your personal API key. 
                        Your key is stored locally on your device.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                             <label className="text-xs font-bold font-mono uppercase text-gray-400">API Key</label>
                             <a href="https://linear.app/settings/api" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline font-mono">
                                Get Key &rarr;
                            </a>
                        </div>
                       
                        <input 
                            type="password" 
                            className={`w-full border-2 p-3 font-mono text-sm outline-none transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-black'}`}
                            placeholder="lin_api_..."
                            value={key}
                            onChange={(e) => {
                                setKey(e.target.value);
                                setError("");
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            autoFocus
                        />
                        {error && (
                            <div className="flex items-center gap-1 text-red-500 text-xs font-bold mt-2 animate-in slide-in-from-top-1">
                                <AlertCircle size={12}/> {error}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleSubmit}
                        disabled={!key}
                        className="w-full bg-black text-white font-bold font-mono py-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.99]"
                    >
                        INITIALIZE SYSTEM <ArrowRight size={16} />
                    </button>
                    
                    <div className="text-center pt-2">
                        <p className="text-[10px] text-gray-400 font-mono">
                            By connecting, you agree to enter Deep Work mode.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}