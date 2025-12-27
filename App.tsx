import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Planner } from './components/Planner';
import { Scoreboard } from './components/Scoreboard';
import { Toolkit } from './components/Toolkit';
import { DayShape } from './components/DayShape';
import { NowRail } from './components/NowRail';
import { Settings } from './components/Settings';
import { LandingPage } from './components/LandingPage';
import { LoginModal } from './components/LoginModal';
import { DevicePairing } from './components/DevicePairing';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useDevice } from './hooks/useDevice';
import { DayLog, ScoreState, INITIAL_DAY_LOG, Phase, AppSettings, INITIAL_SETTINGS, ChatEntry } from './types';
import { ShieldAlert, RotateCcw, Settings as SettingsIcon, Sidebar, PanelRightClose, PanelRightOpen } from 'lucide-react';

const STORAGE_KEY = 'prodaktiv_app_data_v1';
const SETTINGS_KEY = 'prodaktiv_app_settings';
const VIEW_KEY = 'prodaktiv_view_preference';

const App: React.FC = () => {
  const [log, setLog] = useState<DayLog>(INITIAL_DAY_LOG);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // View State: 'LANDING' | 'APP'
  // Always start at LANDING to show the design.
  const [currentView, setCurrentView] = useState<'LANDING' | 'APP'>('LANDING');
  // Auth Modal State
  const [showAuth, setShowAuth] = useState(false);
  // Device Pairing Modal
  const [showDevicePairing, setShowDevicePairing] = useState(false);
  // Reset Day Confirm
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // BLE Device Hook
  const device = useDevice();

  // Load from local storage on mount
  useEffect(() => {
    // Disable browser scroll restoration globally
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Explicitly enforce LANDING view on fresh load
    setCurrentView('LANDING');

    const initializeApp = () => {
        try {
            // Load Log
            const savedLog = localStorage.getItem(STORAGE_KEY);
            if (savedLog) {
              try {
                const parsed = JSON.parse(savedLog);
                // Migration helper for new tasks structure
                const migratedTasks = (parsed.tasks || []).map((t: any) => ({
                    ...t,
                    dependencies: t.dependencies || []
                }));

                const migrated = {
                    ...INITIAL_DAY_LOG,
                    ...parsed,
                    scores: { ...INITIAL_DAY_LOG.scores, ...parsed.scores },
                    tasks: migratedTasks,
                    sessionLog: parsed.sessionLog || [],
                };
                setLog(migrated);
              } catch (e) {
                console.error("Failed to parse log", e);
              }
            }
            
            // Load Settings
            const savedSettings = localStorage.getItem(SETTINGS_KEY);
            if (savedSettings) {
                try {
                    setSettings(JSON.parse(savedSettings));
                } catch (e) {}
            } else if (process.env.API_KEY) {
                // Fallback to env var if available (for demo purposes)
                setSettings(s => ({...s, geminiApiKey: process.env.API_KEY || ''}));
            }
        } catch (error) {
            console.error("Initialization error:", error);
        } finally {
            // Ensure we mark as loaded so saving can eventually happen
            setLoaded(true);
        }
    };

    initializeApp();
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [log, settings, loaded]);

  // Auto-close sidebar on focus start
  useEffect(() => {
    if (log.currentPhase === 'FOCUS') {
        setIsSidebarOpen(false);
    }
  }, [log.currentPhase]);

  const enterApp = () => {
      setCurrentView('APP');
      // Force scroll to top when entering app (immediate + delayed for async renders)
      window.scrollTo(0, 0);
      setTimeout(() => window.scrollTo(0, 0), 0);
      setTimeout(() => window.scrollTo(0, 0), 100);
  };

  const handleEnterRequest = () => {
      // Check if we already have a key
      if (settings.linearApiKey && settings.linearApiKey.startsWith('lin_api_')) {
          enterApp();
      } else {
          setShowAuth(true);
      }
  };

  const handleAuthComplete = (key: string) => {
      // Update Settings state - useEffect will handle localStorage
      setSettings(prev => ({ ...prev, linearApiKey: key }));
      setShowAuth(false);
      enterApp();
  };

  const updateLog = (updates: Partial<DayLog>) => {
    setLog(prev => ({ ...prev, ...updates }));
  };

  const updateScore = (key: keyof ScoreState, value: any) => {
    setLog(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [key]: value
      }
    }));
  };

  const handleSessionEnd = () => {
    setLog(prev => {
        let scoreUpdates: Partial<ScoreState> = {};
        const points = (prev.currentPhase === 'FOCUS') ? 2 : 0;
        
        // Score updates: Only apply if in FOCUS
        if (prev.currentPhase === 'FOCUS') {
            if (prev.sessionCount === 0) scoreUpdates.deepWork1 = points;
            else if (prev.sessionCount === 1) scoreUpdates.deepWork2 = points;
        }

        // Phase transitions
        let updates: Partial<DayLog> = {};
        let logMessage = "";
        
        if (prev.currentPhase === 'FOCUS') {
            updates = {
                currentPhase: 'BREAK',
                timerSeconds: 15 * 60,
                isTimerRunning: false, // Start paused to allow user to take a breath/control start
                sessionCount: prev.sessionCount + 1,
                activeTaskId: null,
            };
            logMessage = 'Session Ended. Break (15m) ready to start.';
        } else {
            // Ending a BREAK (or other) returns to PLANNING
             updates = {
                currentPhase: 'PLANNING',
                isTimerRunning: false,
                timerSeconds: 90 * 60
            };
            logMessage = 'Break Over. Ready for next session.';
        }

        const newEntry: ChatEntry = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            sender: 'system',
            message: logMessage
        };

        return {
            ...prev,
            scores: { ...prev.scores, ...scoreUpdates },
            ...updates,
            sessionLog: [...prev.sessionLog, newEntry]
        };
    });
  };

  const calculateScore = (): number => {
    let total = 0;
    // deepWork1 and 2 are now numbers (0, 1, 2)
    total += (log.scores.deepWork1 || 0);
    total += (log.scores.deepWork2 || 0);
    
    if (log.scores.shipped) total += 2;
    if (log.scores.move) total += 1;
    if (log.scores.foodWater) total += 1;
    if (log.scores.shutdown) total += 1;
    if (log.scores.distraction) total += 1;
    return total;
  };

  const resetDay = () => {
    setShowResetConfirm(true);
  };

  const confirmResetDay = () => {
    setShowResetConfirm(false);
    setLog({
        ...INITIAL_DAY_LOG,
        date: new Date().toISOString().split('T')[0]
    });
  };

  const toggleMinViable = () => {
    const newState = !log.isMinimumViable;
    let updates: Partial<DayLog> = { isMinimumViable: newState };
    
    if (newState) {
        updates.currentPhase = 'PLANNING'; 
        updates.timerSeconds = 20 * 60; 
        updates.isTimerRunning = false;
        updates.mainObjective = ""; 
    } else {
        updates.timerSeconds = 90 * 60;
    }
    
    updateLog(updates);
  };

  // REMOVED: if (!loaded) return null; 
  // This allows the Landing Page (default view) to render immediately while data loads async.

  if (currentView === 'LANDING') {
      return (
        <>
            <LandingPage onEnter={handleEnterRequest} />
            {showAuth && (
                <LoginModal 
                    onComplete={handleAuthComplete} 
                    onClose={() => setShowAuth(false)} 
                />
            )}
        </>
      );
  }

  return (
    <div className="min-h-screen bg-white text-system-black font-sans selection:bg-black selection:text-white animate-in fade-in duration-300">
      <div className="max-w-[1400px] mx-auto px-6 pb-20">
        
        <Header
          score={calculateScore()}
          deviceConnectionState={device.connectionState}
          deviceLastError={device.lastError}
          onDeviceConnect={() => setShowDevicePairing(true)}
        />

        <div className="flex flex-col lg:flex-row relative">
          <main className="flex-1 min-w-0 transition-all duration-300">
            {/* Control Bar */}
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/90 backdrop-blur-sm z-30 py-4 border-b border-gray-100">
                <div className="text-sm font-mono text-gray-400">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex gap-4 items-center">
                     <button 
                        onClick={() => setShowSettings(true)}
                        className="text-xs font-bold font-mono text-gray-400 hover:text-black flex items-center gap-1"
                    >
                        <SettingsIcon size={14} />
                    </button>
                     <button 
                        onClick={toggleMinViable}
                        className={`text-xs font-bold font-mono flex items-center gap-1 ${log.isMinimumViable ? 'text-red-600' : 'text-gray-400 hover:text-black'}`}
                    >
                        <ShieldAlert size={14} />
                        {log.isMinimumViable ? 'EXIT EMERGENCY' : 'EMERGENCY MODE'}
                    </button>
                    <button 
                        onClick={resetDay}
                        className="text-xs font-bold font-mono text-gray-400 hover:text-black flex items-center gap-1"
                    >
                        <RotateCcw size={14} />
                        CLEAR
                    </button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-gray-400 hover:text-black transition-colors"
                        title="Toggle Flow Panel"
                    >
                        {isSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                    </button>
                </div>
            </div>

            {/* 1. Session Console (Visible during FOCUS/BREAK) */}
            <NowRail
                log={log}
                updateLog={updateLog}
                onSessionEnd={handleSessionEnd}
                deviceConnectionState={device.connectionState}
                isDeviceLocked={device.isLocked}
                deviceHasPhone={device.hasPhone}
                onDeviceLock={device.lockPhone}
                onDeviceUnlock={device.unlockPhone}
                onDeviceSync={device.syncState}
            />

            {/* 2. Planner - Hidden during FOCUS/BREAK */}
            {!log.isMinimumViable && log.currentPhase === 'PLANNING' && (
                <>
                    <Planner
                        log={log}
                        updateLog={updateLog}
                        settings={settings}
                        openSettings={() => setShowSettings(true)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Scoreboard
                            log={log}
                            updateScore={updateScore}
                            currentScore={calculateScore()}
                        />
                        <Toolkit
                            microSteps={log.microSteps}
                            updateMicroSteps={(steps) => updateLog({ microSteps: steps })}
                        />
                    </div>
                </>
            )}

          </main>

          {/* Collapsible Sidebar */}
          <div className={`${isSidebarOpen ? 'w-80 opacity-100 ml-8' : 'w-0 opacity-0 ml-0'} shrink-0 transition-all duration-300 overflow-hidden`}>
             <div className="w-80">
                <DayShape currentPhase={log.currentPhase} />
             </div>
          </div>
        </div>
      </div>
      
      {showSettings && (
        <Settings
            settings={settings}
            updateSettings={setSettings}
            onClose={() => setShowSettings(false)}
        />
      )}

      {showDevicePairing && (
        <DevicePairing
          connectionState={device.connectionState}
          lastError={device.lastError}
          isSupported={device.isSupported}
          onConnect={device.connect}
          onClose={() => setShowDevicePairing(false)}
        />
      )}

      {/* Reset Day Confirmation */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Day"
        message="Start a fresh day? This will clear all today's progress."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmResetDay}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};

export default App;