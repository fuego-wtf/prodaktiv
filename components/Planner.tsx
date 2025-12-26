import React, { useState, useRef, useEffect } from 'react';
import { DayLog, LinearIssue, AppSettings, Task, LinearAssignee } from '../types';
import { PenTool, Ban, GitBranch, Plus, Trash2, ArrowRight, GripVertical, Link2, Lock, CornerDownRight, XCircle, Copy, Check, User } from 'lucide-react';
import { LinearPicker } from './LinearPicker';
import { fetchLinearUsers } from '../services/linear';
import { planDayFromTask } from '../services/agent';

interface PlannerProps {
  log: DayLog;
  updateLog: (updates: Partial<DayLog>) => void;
  settings: AppSettings;
  openSettings: () => void;
}

export const Planner: React.FC<PlannerProps> = ({ log, updateLog, settings, openSettings }) => {
  const [showLinear, setShowLinear] = useState(false);
  const [manualTaskInput, setManualTaskInput] = useState("");
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  
  // Assignee Data
  const [availableAssignees, setAvailableAssignees] = useState<LinearAssignee[]>([]);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState<string | null>(null);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Dependency Mode State
  const [linkingTaskId, setLinkingTaskId] = useState<string | null>(null);

  // Visualization State
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [dependencyLines, setDependencyLines] = useState<{
    id: string;
    path: string;
    isHighlighted: boolean;
    color: string;
  }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Users
  useEffect(() => {
      if (settings.linearApiKey) {
          fetchLinearUsers(settings.linearApiKey).then(setAvailableAssignees);
      }
  }, [settings.linearApiKey]);

  // Re-calculate lines on task change or resize
  useEffect(() => {
    const calculateLines = () => {
        if (!listRef.current) return;
        const listRect = listRef.current.getBoundingClientRect();
        const lines: typeof dependencyLines = [];

        log.tasks.forEach(task => {
            const targetEl = itemRefs.current.get(task.id);
            if (!targetEl) return;
            const targetRect = targetEl.getBoundingClientRect();
            // Connect to the left side (near the link icon)
            const targetY = targetRect.top - listRect.top + targetRect.height / 2;
            const targetX = 20; // Approx indentation

            task.dependencies.forEach(depId => {
                const sourceEl = itemRefs.current.get(depId);
                if (!sourceEl) return;
                const sourceRect = sourceEl.getBoundingClientRect();
                const sourceY = sourceRect.top - listRect.top + sourceRect.height / 2;
                const sourceX = 20;

                // Determine highlight status
                const isRelevant = hoveredTaskId === task.id || hoveredTaskId === depId;
                
                // Curve logic
                const distY = Math.abs(targetY - sourceY);
                const controlOffset = 40 + (distY / 10); // Wider curve for longer distances
                
                const path = `M ${sourceX} ${sourceY} C ${-controlOffset} ${sourceY}, ${-controlOffset} ${targetY}, ${targetX} ${targetY}`;
                
                lines.push({
                    id: `${depId}-${task.id}`,
                    path,
                    isHighlighted: isRelevant,
                    color: isRelevant ? '#3b82f6' : '#e5e7eb' // blue-500 or gray-200
                });
            });
        });
        setDependencyLines(lines);
    };

    calculateLines();
    // Add resize listener just in case
    window.addEventListener('resize', calculateLines);
    return () => window.removeEventListener('resize', calculateLines);
  }, [log.tasks, hoveredTaskId]);


  const handleLinearSelect = (issues: LinearIssue[]) => {
    setShowLinear(false);
    if (issues.length === 0) return;

    // Filter out issues that are already in the task queue (by linearId)
    const existingLinearIds = new Set(log.tasks.map(t => t.linearId).filter(Boolean));
    const newIssues = issues.filter(i => !existingLinearIds.has(i.id));

    if (newIssues.length === 0) return; // All selected issues already exist

    const newTasks: Task[] = newIssues.map(i => ({
        id: crypto.randomUUID(),
        title: i.title,
        linearId: i.id,
        linearIdentifier: i.identifier,
        done: false,
        dependencies: [],
        assignee: i.assignee,
        team: i.team,
        project: i.project
    }));

    updateLog({ tasks: [...log.tasks, ...newTasks] });

    if (!log.mainObjective && settings.geminiApiKey) {
        handleSmartSuggest(newIssues[0]);
    }
  };

  const handleSmartSuggest = async (issue: LinearIssue) => {
    setIsAgentThinking(true);
    try {
        const plan = await planDayFromTask(issue, settings.geminiApiKey);
        if (plan.mainObjective) {
            updateLog({ mainObjective: plan.mainObjective });
        }
    } catch(e) {
        // Fail silently
    } finally {
        setIsAgentThinking(false);
    }
  };

  const addManualTask = () => {
    if (!manualTaskInput.trim()) return;
    const newTask: Task = {
        id: crypto.randomUUID(),
        title: manualTaskInput,
        done: false,
        dependencies: []
    };
    updateLog({ tasks: [...log.tasks, newTask] });
    setManualTaskInput("");
  };

  const removeTask = (id: string) => {
    const updatedTasks = log.tasks
        .filter(t => t.id !== id)
        .map(t => ({
            ...t,
            dependencies: t.dependencies.filter(depId => depId !== id)
        }));
    updateLog({ tasks: updatedTasks });
  };

  const startSession = () => {
    updateLog({ 
        currentPhase: 'FOCUS',
        timerSeconds: 90 * 60,
        isTimerRunning: true,
        sessionLog: [...log.sessionLog, {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            sender: 'system',
            message: `Session #${log.sessionCount + 1} Started`
        }]
    });
  };

  const updateAssignee = (taskId: string, assignee: LinearAssignee | undefined) => {
      const updatedTasks = log.tasks.map(t => t.id === taskId ? { ...t, assignee } : t);
      updateLog({ tasks: updatedTasks });
      setAssigneeMenuOpen(null);
  };

  // --- Dependency Logic ---

  const toggleLinkingMode = (taskId: string) => {
    if (linkingTaskId === taskId) {
        setLinkingTaskId(null);
    } else {
        setLinkingTaskId(taskId);
    }
  };

  const handleLinkTask = (targetTaskId: string) => {
    if (!linkingTaskId || linkingTaskId === targetTaskId) return;

    if (isCircular(linkingTaskId, targetTaskId)) {
        alert("Cannot link: Circular dependency detected.");
        return;
    }

    const tasks = [...log.tasks];
    const sourceTaskIndex = tasks.findIndex(t => t.id === linkingTaskId);
    if (sourceTaskIndex === -1) return;

    const sourceTask = tasks[sourceTaskIndex];
    
    let newDeps = [...sourceTask.dependencies];
    if (newDeps.includes(targetTaskId)) {
        newDeps = newDeps.filter(d => d !== targetTaskId);
    } else {
        newDeps.push(targetTaskId);
    }

    tasks[sourceTaskIndex] = { ...sourceTask, dependencies: newDeps };
    updateLog({ tasks });
  };

  const isCircular = (sourceId: string, targetId: string): boolean => {
    const check = (currentId: string): boolean => {
        const task = log.tasks.find(t => t.id === currentId);
        if (!task) return false;
        if (task.dependencies.includes(sourceId)) return true;
        return task.dependencies.some(depId => check(depId));
    };
    return check(targetId);
  };

  // --- Copy Logic ---
  const handleCopyTask = (task: Task) => {
      const text = task.linearIdentifier 
        ? `[${task.linearIdentifier}] ${task.title}`
        : task.title;
      navigator.clipboard.writeText(text);
      setCopiedId(task.id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Drag and Drop Handlers ---

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (index !== draggedIndex) {
        setDropIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
        setDraggedIndex(null);
        setDropIndex(null);
        return;
    }

    const newTasks = [...log.tasks];
    const [movedItem] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(index, 0, movedItem);

    updateLog({ tasks: newTasks });
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const getTaskTitle = (id: string) => log.tasks.find(t => t.id === id)?.title || "Unknown";

  const getRelationStyle = (taskId: string) => {
      if (!hoveredTaskId) return '';
      if (taskId === hoveredTaskId) return 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 z-10';
      
      const hoveredTask = log.tasks.find(t => t.id === hoveredTaskId);
      
      // Is this task a dependency of the hovered task? (Parent)
      // hoveredTask depends on THIS
      if (hoveredTask?.dependencies.includes(taskId)) {
          return 'border-yellow-500 bg-yellow-50 ring-1 ring-yellow-500 z-10';
      }

      // Is this task dependent on the hovered task? (Child)
      // THIS depends on hoveredTask
      const thisTask = log.tasks.find(t => t.id === taskId);
      if (thisTask?.dependencies.includes(hoveredTaskId)) {
          return 'border-purple-500 bg-purple-50 ring-1 ring-purple-500 z-10';
      }
      
      return 'opacity-40'; // Dim unrelated
  };

  return (
    <section className="mb-12 opacity-90 transition-opacity">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold font-mono flex items-center gap-2">
            <span className="bg-black text-white px-2 py-0.5 text-sm">STAGE</span> TASK QUEUE
        </h2>
        
        <div className="flex gap-2">
            <button 
                onClick={() => {
                    if (!settings.linearApiKey) {
                        alert("Configure Linear API Key in Settings first.");
                        openSettings();
                    } else {
                        setShowLinear(!showLinear);
                    }
                }}
                className={`text-xs font-bold font-mono flex items-center gap-1 px-3 py-1.5 transition-colors border-2 border-black shadow-sm ${showLinear ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
                <GitBranch size={12}/> {showLinear ? 'CLOSE LINEAR' : 'ADD FROM LINEAR'}
            </button>
        </div>
      </div>

      {showLinear && (
        <LinearPicker 
            apiKey={settings.linearApiKey}
            onClose={() => setShowLinear(false)}
            onSelect={handleLinearSelect}
        />
      )}
      
      {linkingTaskId && (
         <div className="bg-blue-50 border border-blue-200 p-3 mb-4 flex items-center justify-between animate-in fade-in">
             <div className="flex items-center gap-2 text-blue-800 text-xs font-mono font-bold">
                 <Link2 size={14} className="animate-pulse"/> 
                 <span>LINKING MODE: Select a dependency for "{getTaskTitle(linkingTaskId)}"</span>
             </div>
             <button onClick={() => setLinkingTaskId(null)} className="text-blue-500 hover:text-blue-800"><XCircle size={16}/></button>
         </div>
      )}

      <div className="space-y-6">
        {/* Task Queue List */}
        <div className="bg-white border-2 border-gray-200 p-4 min-h-[150px]">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                <input 
                    type="text"
                    value={manualTaskInput}
                    onChange={(e) => setManualTaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addManualTask()}
                    placeholder="Add a task manually (Enter)..."
                    className="flex-1 font-mono text-sm outline-none bg-transparent"
                />
                <button 
                    onClick={addManualTask} 
                    className="bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-gray-800 flex items-center gap-1"
                >
                    ADD <Plus size={12}/>
                </button>
            </div>

            {log.tasks.length === 0 ? (
                <div className="text-center text-gray-400 font-mono text-xs py-8">
                    Queue is empty. Add tasks to start a session.
                </div>
            ) : (
                <div className="relative pl-8" ref={listRef} onMouseLeave={() => setHoveredTaskId(null)}>
                    {/* SVG Overlay for Dependencies */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
                        <defs>
                            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
                            </marker>
                            <marker id="arrowhead-gray" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="#e5e7eb" />
                            </marker>
                        </defs>
                        {dependencyLines.map(line => (
                            <path 
                                key={line.id}
                                d={line.path}
                                stroke={line.color}
                                strokeWidth={line.isHighlighted ? 2 : 1}
                                fill="none"
                                markerEnd={line.isHighlighted ? "url(#arrowhead)" : "url(#arrowhead-gray)"}
                                className="transition-all duration-300"
                            />
                        ))}
                    </svg>

                    <div className="space-y-1 relative z-10" onDragLeave={() => setDropIndex(null)}>
                        {log.tasks.map((task, index) => {
                            const isDragging = draggedIndex === index;
                            const isDropTarget = dropIndex === index && draggedIndex !== index;
                            const isLinkingSource = linkingTaskId === task.id;
                            const isDependency = linkingTaskId && log.tasks.find(t => t.id === linkingTaskId)?.dependencies.includes(task.id);
                            const isBlocked = task.dependencies.length > 0 && !task.dependencies.every(depId => log.tasks.find(t => t.id === depId)?.done);
                            const relationClass = getRelationStyle(task.id);

                            return (
                                <React.Fragment key={task.id}>
                                    {/* Drop Indicator */}
                                    {isDropTarget && draggedIndex !== null && index < draggedIndex && (
                                        <div className="h-0.5 bg-blue-500 my-1 rounded-full" />
                                    )}
                                    
                                    <div 
                                        ref={(el) => {
                                            if (el) itemRefs.current.set(task.id, el);
                                            else itemRefs.current.delete(task.id);
                                        }}
                                        draggable={!linkingTaskId}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => linkingTaskId && handleLinkTask(task.id)}
                                        onMouseEnter={() => setHoveredTaskId(task.id)}
                                        className={`
                                            relative flex items-center justify-between p-2 transition-all border
                                            ${isDragging ? 'opacity-30 border-dashed border-gray-400 bg-gray-50' : 'border-transparent bg-white'}
                                            ${linkingTaskId && !isLinkingSource ? 'cursor-pointer hover:bg-blue-50 border-blue-100' : ''}
                                            ${isLinkingSource ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50' : ''}
                                            ${isDependency ? 'bg-green-50 border-green-200' : ''}
                                            ${!linkingTaskId && !isDragging ? relationClass : ''}
                                            ${!linkingTaskId && !isDragging && !relationClass ? 'hover:border-gray-200 hover:bg-gray-50' : ''}
                                        `}
                                    >
                                        <div className="flex flex-col w-full">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {/* Drag Handle or Link Status */}
                                                {linkingTaskId ? (
                                                     <div className="w-4 flex justify-center">
                                                        {isLinkingSource ? <div className="w-2 h-2 bg-blue-500 rounded-full"/> : 
                                                         isDependency ? <div className="w-2 h-2 bg-green-500 rounded-full"/> :
                                                         <div className="w-2 h-2 border border-blue-300 rounded-full"/>}
                                                     </div>
                                                ) : (
                                                    <GripVertical size={14} className="text-gray-300 cursor-grab active:cursor-grabbing shrink-0" />
                                                )}
                                                
                                                {/* Labels */}
                                                {task.linearIdentifier ? (
                                                    <span className="text-[10px] font-bold font-mono bg-blue-50 text-blue-600 px-1 rounded shrink-0">
                                                        {task.linearIdentifier}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold font-mono bg-gray-100 text-gray-500 px-1 rounded shrink-0">
                                                        MANUAL
                                                    </span>
                                                )}
                                                
                                                {/* Title & Status */}
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    {isBlocked && <Lock size={12} className="text-red-400 shrink-0" />}
                                                    <span className={`font-mono text-sm truncate ${task.done ? 'line-through text-gray-400' : isBlocked ? 'text-gray-400' : 'text-black'}`}>
                                                        {task.title}
                                                    </span>
                                                </div>

                                                {/* Assignee */}
                                                <div className="relative shrink-0">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setAssigneeMenuOpen(assigneeMenuOpen === task.id ? null : task.id); }}
                                                        className="w-6 h-6 rounded-full flex items-center justify-center border border-gray-200 hover:border-blue-500 transition-colors bg-gray-50 overflow-hidden"
                                                        title={task.assignee ? task.assignee.name : 'Unassigned'}
                                                    >
                                                        {task.assignee?.avatarUrl ? (
                                                            <img src={task.assignee.avatarUrl} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={12} className="text-gray-400" />
                                                        )}
                                                    </button>
                                                    
                                                    {assigneeMenuOpen === task.id && (
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border-2 border-black shadow-lg z-20 max-h-40 overflow-y-auto">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); updateAssignee(task.id, undefined); }}
                                                                className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-500"
                                                            >
                                                                <div className="w-4 h-4 rounded-full border border-dashed border-gray-300 flex items-center justify-center"><User size={10}/></div>
                                                                Unassigned
                                                            </button>
                                                            {availableAssignees.map(user => (
                                                                <button 
                                                                    key={user.id}
                                                                    onClick={(e) => { e.stopPropagation(); updateAssignee(task.id, user); }}
                                                                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    {user.avatarUrl ? <img src={user.avatarUrl} className="w-4 h-4 rounded-full"/> : <div className="w-4 h-4 rounded-full bg-gray-200"/>}
                                                                    <span className="truncate">{user.name}</span>
                                                                    {task.assignee?.id === user.id && <Check size={10} className="ml-auto"/>}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {task.linearIdentifier && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleCopyTask(task); }}
                                                            className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded"
                                                            title="Copy Task ID & Title"
                                                        >
                                                            {copiedId === task.id ? <Check size={14} className="text-green-600"/> : <Copy size={14}/>}
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); toggleLinkingMode(task.id); }}
                                                        className={`p-1 rounded hover:bg-gray-200 ${task.dependencies.length > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-300'}`}
                                                        title="Link Dependencies"
                                                    >
                                                        <Link2 size={14}/>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
                                                        className="text-gray-300 hover:text-red-500 p-1"
                                                    >
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Drop Indicator (Bottom) */}
                                    {isDropTarget && draggedIndex !== null && index > draggedIndex && (
                                        <div className="h-0.5 bg-blue-500 my-1 rounded-full" />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

        {/* Start Button */}
        {log.currentPhase === 'PLANNING' && (
            <button 
                onClick={startSession}
                disabled={log.tasks.length === 0}
                className="w-full bg-black text-white py-4 font-bold font-mono hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
            >
                LAUNCH FOCUS SESSION <ArrowRight size={18} />
            </button>
        )}

        {/* Day Context */}
        <div className="bg-gray-50 p-4 border border-gray-200">
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-gray-200 p-1"><PenTool size={12} /></div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Day Theme (Optional)
              </label>
            </div>
            <input
              type="text"
              value={log.mainObjective}
              onChange={(e) => updateLog({ mainObjective: e.target.value })}
              className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none font-medium text-sm"
              placeholder="e.g. Shipping the V2 Interface"
            />
          </div>
          
            <div className="mt-4">
                <div className="flex items-center gap-2 mb-1">
                <Ban size={12} className="text-gray-500"/>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Distraction Rule
                </label>
                </div>
                <input
                type="text"
                value={log.distractionRule}
                onChange={(e) => updateLog({ distractionRule: e.target.value })}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs font-mono text-gray-600 placeholder-gray-400"
                placeholder="e.g. No social media until Deep Work #1 is done"
                />
            </div>
        </div>
      </div>
    </section>
  );
};