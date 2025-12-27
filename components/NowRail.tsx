import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DayLog, Phase, Task, ChatEntry, DeviceConnectionState } from '../types';
import { PhoneLock } from './PhoneLock';
import { ConfirmDialog } from './ConfirmDialog';
import { useTimer, formatTime } from '../hooks/useTimer';
import { Play, Pause, Square, MessageSquare, CheckCircle2, Clock, Coffee, AlertTriangle, Send, Lock, Crosshair, ChevronRight, User, Smartphone } from 'lucide-react';

interface NowRailProps {
  log: DayLog;
  updateLog: (updates: Partial<DayLog>) => void;
  onSessionEnd: () => void;
  // Device props
  deviceConnectionState: DeviceConnectionState;
  isDeviceLocked: boolean;
  deviceHasPhone: boolean;
  onDeviceLock: () => Promise<void>;
  onDeviceUnlock: () => Promise<void>;
  onDeviceSync: (timerSeconds: number, phase: Phase, sessionCount: number) => Promise<void>;
}

export const NowRail: React.FC<NowRailProps> = ({
  log,
  updateLog,
  onSessionEnd,
  deviceConnectionState,
  isDeviceLocked,
  deviceHasPhone,
  onDeviceLock,
  onDeviceUnlock,
  onDeviceSync
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState("");

  // Dialog states
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [blockedTaskMessage, setBlockedTaskMessage] = useState<string | null>(null);

  // Stable callbacks for useTimer
  const handleTimerTick = useCallback((seconds: number) => {
    updateLog({ timerSeconds: seconds });
  }, [updateLog]);

  const handleTimerComplete = useCallback(() => {
    updateLog({ isTimerRunning: false });
    const newEntry: ChatEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sender: 'system',
      message: 'Timer Finished.'
    };
    updateLog({ sessionLog: [...log.sessionLog, newEntry] });
  }, [updateLog, log.sessionLog]);

  // Web Worker-based timer (works in background tabs)
  const timer = useTimer({
    initialSeconds: log.timerSeconds,
    onTick: handleTimerTick,
    onComplete: handleTimerComplete,
  });

  // Sync timer running state with log state
  useEffect(() => {
    if (log.isTimerRunning && !timer.isRunning) {
      timer.start();
    } else if (!log.isTimerRunning && timer.isRunning) {
      timer.pause();
    }
  }, [log.isTimerRunning, timer.isRunning, timer]);

  // Reset timer when phase changes (new session/break durations)
  const prevPhaseRef = useRef(log.currentPhase);
  useEffect(() => {
    if (prevPhaseRef.current !== log.currentPhase) {
      timer.reset(log.timerSeconds);
      prevPhaseRef.current = log.currentPhase;
    }
  }, [log.currentPhase, log.timerSeconds, timer]);

  // Auto-scroll chat (skip initial render to prevent page scroll on load)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.sessionLog]);

  // Sync timer state to device every 10 seconds during active sessions
  useEffect(() => {
    if (deviceConnectionState !== 'connected') return;
    if (!log.isTimerRunning) return;

    // Sync immediately when timer starts
    onDeviceSync(log.timerSeconds, log.currentPhase, log.sessionCount).catch(console.warn);

    // Then sync every 10 seconds
    const syncInterval = window.setInterval(() => {
      onDeviceSync(log.timerSeconds, log.currentPhase, log.sessionCount).catch(console.warn);
    }, 10000);

    return () => window.clearInterval(syncInterval);
  }, [deviceConnectionState, log.isTimerRunning, log.currentPhase]);


  const addLogEntry = (sender: 'user' | 'system' | 'ai', message: string) => {
    const newEntry: ChatEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sender,
        message
    };
    updateLog({ sessionLog: [...log.sessionLog, newEntry] });
  };

  const toggleTimer = () => {
    const newState = !log.isTimerRunning;
    updateLog({ isTimerRunning: newState });
    addLogEntry('system', newState ? 'Timer Resumed' : 'Timer Paused');
  };

  const handleTaskToggle = (taskId: string) => {
    const task = log.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check dependencies
    const isBlocked = task.dependencies.some(depId => {
        const dep = log.tasks.find(t => t.id === depId);
        return dep && !dep.done;
    });

    if (isBlocked && !task.done) {
        setBlockedTaskMessage("This task is blocked by dependencies.");
        return;
    }

    const newStatus = !task.done;
    const updatedTasks = log.tasks.map(t => 
        t.id === taskId ? { ...t, done: newStatus } : t
    );
    
    // If completing the active task, unset active task
    const activeUpdate = (log.activeTaskId === taskId && newStatus) ? { activeTaskId: null } : {};

    updateLog({ tasks: updatedTasks, ...activeUpdate });

    if (newStatus) {
        addLogEntry('system', `Completed: ${task.title}`);
    } else {
        addLogEntry('system', `Undid: ${task.title}`);
    }
  };

  const setActiveTask = (taskId: string) => {
      // Check if blocked
      const task = log.tasks.find(t => t.id === taskId);
      if (!task) return;
      const isBlocked = task.dependencies.some(depId => {
        const dep = log.tasks.find(t => t.id === depId);
        return dep && !dep.done;
    });
    if (isBlocked) {
        setBlockedTaskMessage("Cannot focus on a blocked task.");
        return;
    }
    updateLog({ activeTaskId: taskId });
    addLogEntry('system', `Focusing on: ${task.title}`);
  };

  const submitChat = () => {
    if (!chatInput.trim()) return;
    addLogEntry('user', chatInput);
    setChatInput("");
  };

  const completeSession = () => {
    setShowEndSessionDialog(true);
  };

  const confirmEndSession = () => {
    setShowEndSessionDialog(false);

    // Stop the Web Worker timer
    timer.pause();

    // Update state
    updateLog({ isTimerRunning: false });

    onSessionEnd();
  };

  if (log.currentPhase === 'PLANNING' && !log.isMinimumViable) {
    return null; 
  }

  // --- RENDERING ---

  const isFocus = log.currentPhase === 'FOCUS';
  const isBreak = log.currentPhase === 'BREAK';
  const activeTask = log.activeTaskId ? log.tasks.find(t => t.id === log.activeTaskId) : null;

  const isInSession = isFocus || isBreak;

  return (
    <section className={`mb-12 ${isInSession ? '' : 'sticky top-24'} z-20`}>
       <div className={`border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row overflow-hidden ${isInSession ? 'min-h-[70vh]' : 'max-h-[600px]'} transition-colors`}>
         
         {/* Left: Console / Tasks */}
         <div className="flex-1 border-r-2 border-black flex flex-col bg-gray-50">
            {/* Header */}
            <div className={`p-4 border-b-2 border-black flex justify-between items-center ${isFocus ? 'bg-black text-white' : 'bg-stripes-gray'}`}>
                <div className="flex items-center gap-3">
                    {isFocus ? <Play className={log.isTimerRunning ? 'animate-pulse' : ''} size={20}/> : <Coffee size={20} />}
                    <div>
                        <h2 className="font-bold font-mono uppercase tracking-wider text-sm">
                            {isFocus ? `Focus Session #${log.sessionCount + 1}` : 'Recharge Break'}
                        </h2>
                        <div className="text-xs font-mono opacity-80">
                            {log.mainObjective || (isBreak ? "Step away from screen" : "No Theme Set")}
                        </div>
                    </div>
                </div>
                <div className="font-mono font-bold text-3xl tabular-nums">
                    {formatTime(log.timerSeconds)}
                </div>
            </div>

            {/* Active Task (Focus Mode) */}
            {isFocus && activeTask && !activeTask.done && (
                <div className="bg-blue-600 text-white p-4 flex flex-col gap-2 shrink-0 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-80 justify-between">
                         <span className="flex items-center gap-1"><Crosshair size={12} className="animate-spin-slow" /> Current Target</span>
                         {/* Assignee Display */}
                         {activeTask.assignee && (
                             <div className="flex items-center gap-1 bg-blue-700 px-2 py-0.5 rounded-full">
                                 {activeTask.assignee.avatarUrl ? (
                                     <img src={activeTask.assignee.avatarUrl} className="w-3 h-3 rounded-full border border-white/30" />
                                 ) : (
                                     <User size={10} />
                                 )}
                                 <span className="truncate max-w-[80px]">{activeTask.assignee.name}</span>
                             </div>
                         )}
                    </div>
                    <div className="font-mono font-bold text-lg leading-tight">
                        {activeTask.title}
                    </div>
                    {/* Task metadata: Linear ID, Team, Project */}
                    <div className="flex flex-wrap items-center gap-2">
                        {activeTask.linearIdentifier && (
                            <div className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">
                                {activeTask.linearIdentifier}
                            </div>
                        )}
                        {activeTask.team && (
                            <div className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                                <span className="opacity-60">repo:</span>
                                <span className="font-bold">{activeTask.team.key}</span>
                            </div>
                        )}
                        {activeTask.project && (
                            <div
                                className="text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1"
                                style={{ backgroundColor: activeTask.project.color ? `${activeTask.project.color}40` : 'rgba(255,255,255,0.1)' }}
                            >
                                {activeTask.project.icon && <span>{activeTask.project.icon}</span>}
                                <span>{activeTask.project.name}</span>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => handleTaskToggle(activeTask.id)}
                        className="mt-2 bg-white text-blue-600 font-bold font-mono text-xs py-2 px-4 self-start hover:bg-gray-100 flex items-center gap-2"
                    >
                        <CheckCircle2 size={14} /> MARK COMPLETE
                    </button>
                </div>
            )}

            {/* Task List (Only visible in Focus) */}
            {isFocus && (
                <div className="flex-1 overflow-y-auto p-4 bg-white relative">
                    {!activeTask && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-30">
                            <div className="text-center">
                                <Crosshair size={48} className="mx-auto mb-2 text-gray-400" />
                                <p className="font-mono font-bold text-gray-400">SELECT A TARGET</p>
                            </div>
                        </div>
                    )}
                    
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
                        <CheckCircle2 size={12}/> Task Queue
                    </h3>
                    <div className="space-y-2">
                        {log.tasks.filter(t => !t.done).map(task => {
                            const isBlocked = task.dependencies.some(depId => {
                                const dep = log.tasks.find(t => t.id === depId);
                                return dep && !dep.done;
                            });
                            const isActive = log.activeTaskId === task.id;

                            if (isActive) return null; // Already shown above

                            return (
                                <div key={task.id} className={`flex items-start justify-between gap-3 p-3 border transition-all bg-white hover:shadow-sm ${isBlocked ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-black'}`}>
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                         <button 
                                            onClick={() => setActiveTask(task.id)}
                                            disabled={isBlocked}
                                            className={`mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center border rounded-full transition-colors ${isBlocked ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-300 text-gray-300 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50'}`}
                                            title={isBlocked ? "Blocked" : "Focus on this task"}
                                        >
                                           {isBlocked ? <Lock size={10} /> : <Play size={8} fill="currentColor" />}
                                        </button>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                {task.assignee && task.assignee.avatarUrl && (
                                                    <img src={task.assignee.avatarUrl} className="w-3 h-3 rounded-full border border-gray-200" title={`Assigned to ${task.assignee.name}`}/>
                                                )}
                                                {task.team && (
                                                    <span className="text-[10px] font-mono text-blue-500 bg-blue-50 px-1 rounded" title={task.team.name}>
                                                        {task.team.key}
                                                    </span>
                                                )}
                                                {task.linearIdentifier && (
                                                    <span className="text-[10px] font-mono text-gray-400">
                                                        {task.linearIdentifier}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={`font-mono text-sm leading-tight truncate ${isBlocked ? 'text-gray-400' : 'text-black'}`}>
                                                {task.title}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Quick Complete (Optional, maybe keep it simple to just Focus) */}
                                    {/* Let's allow quick complete only if not blocked */}
                                    {!isBlocked && (
                                         <button 
                                            onClick={() => handleTaskToggle(task.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-green-600 transition-opacity"
                                            title="Quick Complete"
                                         >
                                            <CheckCircle2 size={16} />
                                         </button>
                                    )}
                                </div>
                            );
                        })}
                         {log.tasks.length === 0 && (
                            <div className="text-gray-400 text-xs font-mono italic p-2">No tasks queued. Add some in the Planner.</div>
                        )}
                         {log.tasks.every(t => t.done) && log.tasks.length > 0 && (
                            <div className="text-green-600 text-xs font-mono font-bold p-2 flex items-center gap-2">
                                <CheckCircle2 size={14}/> All tasks completed!
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Break View */}
            {isBreak && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-green-50/30">
                    <Coffee size={48} className="text-green-600 mb-4 opacity-50" />
                    <p className="font-mono text-green-800 text-center max-w-xs">
                        Refill water. Stretch. Don't look at your phone.
                    </p>
                </div>
            )}

            {/* Controls */}
            <div className="p-3 border-t-2 border-black flex gap-2 bg-white">
                <button 
                    onClick={toggleTimer}
                    className={`flex-1 py-3 font-bold font-mono text-xs flex items-center justify-center gap-2 border-2 border-black transition-all hover:bg-gray-100 ${log.isTimerRunning ? 'bg-white text-black' : 'bg-black text-white'}`}
                >
                    {log.isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                    {log.isTimerRunning ? "PAUSE TIMER" : "RESUME TIMER"}
                </button>
                <button 
                    onClick={completeSession}
                    className="px-4 border-2 border-black bg-white hover:bg-gray-50 font-bold text-xs"
                >
                    <Square size={14} fill="black"/>
                </button>
            </div>
         </div>

         {/* Right: Session Chat Log + Phone Lock */}
         <div className="w-full md:w-80 flex flex-col bg-gray-100/50 md:border-l-0 border-t-2 md:border-t-0 border-black h-[300px] md:h-auto">
             {/* Phone Lock (only when device connected) */}
             {deviceConnectionState === 'connected' && (
               <div className="p-3 border-b border-gray-200 bg-white">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2 text-xs font-bold font-mono text-gray-500">
                     <Smartphone size={12} /> DEVICE
                   </div>
                   <div className={`flex items-center gap-1 text-[10px] font-mono ${isDeviceLocked ? 'text-red-600' : 'text-green-600'}`}>
                     <span className={`w-1.5 h-1.5 rounded-full ${isDeviceLocked ? 'bg-red-500' : 'bg-green-500'}`} />
                     {isDeviceLocked ? 'LOCKED' : 'UNLOCKED'}
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <button
                     onClick={onDeviceLock}
                     disabled={isDeviceLocked || !deviceHasPhone}
                     className={`flex-1 py-2 text-[10px] font-bold font-mono flex items-center justify-center gap-1 transition-all ${
                       isDeviceLocked || !deviceHasPhone
                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                         : 'bg-red-600 text-white hover:bg-red-700'
                     }`}
                   >
                     <Lock size={10} /> LOCK
                   </button>
                   <button
                     onClick={onDeviceUnlock}
                     disabled={!isDeviceLocked}
                     className={`flex-1 py-2 text-[10px] font-bold font-mono flex items-center justify-center gap-1 transition-all ${
                       !isDeviceLocked
                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                         : 'bg-green-600 text-white hover:bg-green-700'
                     }`}
                   >
                     <Lock size={10} /> UNLOCK
                   </button>
                 </div>
                 {!deviceHasPhone && (
                   <p className="text-[9px] text-gray-400 mt-1 text-center">Place phone on device</p>
                 )}
               </div>
             )}

             <div className="p-2 border-b border-gray-200 bg-white/50 text-xs font-bold font-mono text-gray-500 flex items-center gap-2">
                <MessageSquare size={12}/> SESSION LOG
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                {log.sessionLog.length === 0 && (
                    <div className="text-gray-400 text-center mt-10">Session started...</div>
                )}
                {log.sessionLog.map(entry => (
                    <div key={entry.id} className={`flex flex-col ${entry.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-2 rounded max-w-[90%] ${
                            entry.sender === 'system' ? 'bg-gray-200 text-gray-600 text-[10px] uppercase tracking-wide' :
                            entry.sender === 'user' ? 'bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]' :
                            'bg-purple-100 text-purple-900'
                        }`}>
                            {entry.message}
                        </div>
                        <span className="text-[9px] text-gray-300 mt-0.5 px-1">
                            {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                ))}
                <div ref={chatEndRef} />
             </div>

             <div className="p-2 bg-white border-t border-gray-200 flex gap-2">
                <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitChat()}
                    placeholder="Log a note..."
                    className="flex-1 bg-transparent text-xs font-mono outline-none"
                />
                <button onClick={submitChat} className="text-black hover:bg-gray-100 p-1 rounded">
                    <Send size={14} />
                </button>
             </div>
         </div>

       </div>

       {/* End Session Dialog */}
       <ConfirmDialog
         isOpen={showEndSessionDialog}
         title="End Session"
         message={log.currentPhase === 'FOCUS'
           ? "End this focus session and start your break?"
           : "End break and return to planning?"}
         confirmLabel="End"
         cancelLabel="Keep Going"
         variant="warning"
         onConfirm={confirmEndSession}
         onCancel={() => setShowEndSessionDialog(false)}
       />

       {/* Blocked Task Alert */}
       <ConfirmDialog
         isOpen={!!blockedTaskMessage}
         title="Blocked"
         message={blockedTaskMessage || ""}
         confirmLabel="OK"
         cancelLabel="Cancel"
         variant="default"
         onConfirm={() => setBlockedTaskMessage(null)}
         onCancel={() => setBlockedTaskMessage(null)}
       />
    </section>
  );
};