import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LinearIssue, LinearAssignee } from '../types';
import { fetchLinearIssues, fetchLinearViewer, fetchLinearUsers } from '../services/linear';
import { X, Loader2, GitPullRequest, AlertCircle, Search, CheckCircle2, Circle, ArrowRight, ChevronDown, User, Filter, Trash2, Plus } from 'lucide-react';

interface LinearPickerProps {
  apiKey: string;
  onSelect: (issues: LinearIssue[]) => void;
  onClose: () => void;
}

export const LinearPicker: React.FC<LinearPickerProps> = ({ apiKey, onSelect, onClose }) => {
  const [issues, setIssues] = useState<LinearIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [viewer, setViewer] = useState<LinearAssignee | null>(null);
  const [allUsers, setAllUsers] = useState<LinearAssignee[]>([]);
  
  // Filter State
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL'); // 'ALL' | 'ME' | userId
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  // Selection State: Map of ID -> Issue Object to persist across searches
  // Using a map ensures unique selection by ID
  const [selectedIssuesMap, setSelectedIssuesMap] = useState<Map<string, LinearIssue>>(new Map());
  
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: '' });

  const loadingRef = useRef(false);
  const pageInfoRef = useRef({ hasNextPage: false, endCursor: '' });
  const debouncedQueryRef = useRef("");

  useEffect(() => {
    // Load Viewer and Users
    fetchLinearViewer(apiKey)
      .then(setViewer)
      .catch(e => console.warn("Could not load viewer", e));
      
    fetchLinearUsers(apiKey)
      .then(setAllUsers)
      .catch(e => console.warn("Could not load users", e));
  }, [apiKey]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      debouncedQueryRef.current = searchQuery;
    }, 400); 
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadIssues = useCallback(async (cursor?: string, query?: string, assignee?: string) => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      if (!cursor) {
          setLoading(true);
          setError("");
      } else {
          setLoadingMore(true);
      }

      // Resolve filter ID
      let apiAssigneeId = undefined;
      if (assignee === 'ME' && viewer) {
          apiAssigneeId = viewer.id;
      } else if (assignee && assignee !== 'ALL' && assignee !== 'ME') {
          apiAssigneeId = assignee;
      }

      const data = await fetchLinearIssues(apiKey, cursor, query, apiAssigneeId);
      
      if (cursor) {
        setIssues(prev => {
            const existingIds = new Set(prev.map(i => i.id));
            const newNodes = data.nodes.filter(n => !existingIds.has(n.id));
            return [...prev, ...newNodes];
        });
      } else {
        setIssues(data.nodes);
      }
      
      setPageInfo(data.pageInfo);
      pageInfoRef.current = data.pageInfo;

    } catch (err: any) {
      let msg = err.message || "Failed to fetch issues.";
      if (typeof msg !== 'string') {
          msg = JSON.stringify(msg);
      }
      msg = msg.replace(/^Error: /, '');
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [apiKey, viewer]);

  // Reload when query or filter changes
  useEffect(() => {
    if (assigneeFilter === 'ME' && !viewer) return; // Wait for viewer to load

    // Only clear the displayed issues list, NEVER the selections
    setIssues([]); 
    setPageInfo({ hasNextPage: false, endCursor: '' });
    pageInfoRef.current = { hasNextPage: false, endCursor: '' };
    loadIssues(undefined, debouncedQuery, assigneeFilter);
  }, [debouncedQuery, assigneeFilter, loadIssues, viewer]);

  const handleNextPage = () => {
    if (pageInfoRef.current.hasNextPage && !loadingRef.current) {
      loadIssues(pageInfoRef.current.endCursor, debouncedQueryRef.current, assigneeFilter);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      handleNextPage();
    }
  };

  const toggleIssue = (issue: LinearIssue) => {
    const newMap = new Map(selectedIssuesMap);
    if (newMap.has(issue.id)) {
        newMap.delete(issue.id);
    } else {
        newMap.set(issue.id, issue);
    }
    setSelectedIssuesMap(newMap);
  };

  const handleConfirm = () => {
    onSelect(Array.from(selectedIssuesMap.values()));
  };

  return (
    <div className="border-2 border-black bg-white mb-6 animate-in fade-in slide-in-from-top-2 flex flex-col h-[500px] shadow-sm relative z-10">
        <div className="flex justify-between items-center p-3 border-b-2 border-black bg-gray-50 shrink-0">
            <h3 className="font-bold font-mono uppercase text-xs flex items-center gap-2">
                <GitPullRequest size={14} /> Import from Linear
            </h3>
            <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded transition-colors"><X size={16}/></button>
        </div>

        <div className="p-2 border-b border-gray-100 flex items-center gap-2 shrink-0 bg-white">
            <Search size={14} className="text-gray-400 ml-1" />
            <input 
                type="text"
                placeholder="Search identifier or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-1 text-xs font-mono outline-none placeholder:text-gray-300 bg-transparent"
                autoFocus
            />
            
            {/* Assignee Filter Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold font-mono border rounded hover:bg-gray-50 ${assigneeFilter !== 'ALL' ? 'bg-black text-white border-black hover:bg-gray-800' : 'text-gray-500 border-gray-200'}`}
                >
                    <Filter size={10} />
                    {assigneeFilter === 'ALL' ? 'ALL' : assigneeFilter === 'ME' ? 'ME' : 'FILTERED'}
                    <ChevronDown size={10} />
                </button>
                
                {showFilterMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border-2 border-black shadow-lg z-20 max-h-60 overflow-y-auto">
                         <div className="py-1">
                             <button 
                                onClick={() => { setAssigneeFilter('ALL'); setShowFilterMenu(false); }}
                                className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-gray-50 flex items-center justify-between"
                             >
                                 <span>All Issues</span>
                                 {assigneeFilter === 'ALL' && <CheckCircle2 size={12} />}
                             </button>
                             
                             {viewer && (
                                <button 
                                    onClick={() => { setAssigneeFilter('ME'); setShowFilterMenu(false); }}
                                    className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-gray-50 flex items-center justify-between font-bold"
                                >
                                    <div className="flex items-center gap-2">
                                        {viewer.avatarUrl ? <img src={viewer.avatarUrl} className="w-4 h-4 rounded-full"/> : <User size={12}/>}
                                        <span>My Issues</span>
                                    </div>
                                    {assigneeFilter === 'ME' && <CheckCircle2 size={12} />}
                                </button>
                             )}

                             {allUsers.length > 0 && <div className="border-t border-gray-100 my-1"></div>}

                             {allUsers.filter(a => a.id !== viewer?.id).map(user => (
                                 <button 
                                    key={user.id}
                                    onClick={() => { setAssigneeFilter(user.id); setShowFilterMenu(false); }}
                                    className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-gray-50 flex items-center justify-between text-gray-600"
                                >
                                    <div className="flex items-center gap-2">
                                        {user.avatarUrl ? <img src={user.avatarUrl} className="w-4 h-4 rounded-full"/> : <User size={12}/>}
                                        <span className="truncate">{user.name}</span>
                                    </div>
                                    {assigneeFilter === user.id && <CheckCircle2 size={12} />}
                                </button>
                             ))}
                         </div>
                    </div>
                )}
            </div>
        </div>

        <div 
            className="overflow-y-auto p-0 flex-1"
            onScroll={handleScroll}
        >
            {loading && (
                <div className="flex justify-center p-6 text-gray-400">
                    <Loader2 className="animate-spin" size={20} />
                </div>
            )}
            
            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs font-mono flex gap-2 items-start border-b border-red-100 break-words">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> 
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && issues.length === 0 && (
                <div className="p-6 text-center text-gray-400 font-mono text-xs">
                    {debouncedQuery ? (
                        <span>No issues found matching "{debouncedQuery}"</span>
                    ) : (
                        <>
                            No issues found.<br/>
                            {assigneeFilter !== 'ALL' && <span className="opacity-50">Try clearing the filter.</span>}
                        </>
                    )}
                </div>
            )}

            <div className="divide-y divide-gray-100">
                {issues.map(issue => {
                    const isSelected = selectedIssuesMap.has(issue.id);
                    return (
                        <div 
                            key={issue.id}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 group transition-all flex items-center gap-3 ${isSelected ? 'bg-blue-50/50' : ''}`}
                        >
                            {/* Toggle Area */}
                            <div 
                                onClick={() => toggleIssue(issue)}
                                onMouseDown={(e) => e.preventDefault()} // Prevent search input blur
                                className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer"
                            >
                                <div className={`shrink-0 ${isSelected ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>
                                    {isSelected ? <CheckCircle2 size={16} fill="white" className="text-black" /> : <Circle size={16} />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`font-mono text-xs font-bold shrink-0 ${isSelected ? 'text-black' : 'text-gray-400'}`}>
                                            {issue.identifier}
                                        </span>
                                        {/* Assignee Pill */}
                                        {issue.assignee ? (
                                            <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-full" title={`Assigned to ${issue.assignee.name}`}>
                                                {issue.assignee.avatarUrl ? (
                                                    <img src={issue.assignee.avatarUrl} alt="" className="w-3 h-3 rounded-full"/>
                                                ) : (
                                                    <User size={10} className="text-gray-500" />
                                                )}
                                                <span className="text-[9px] font-mono text-gray-600 truncate max-w-[60px]">{issue.assignee.name}</span>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 px-1.5 py-0.5 rounded-full text-[9px] font-mono text-gray-400">Unassigned</div>
                                        )}
                                    </div>
                                    <div className={`font-medium text-sm truncate ${isSelected ? 'text-black' : 'text-gray-700'}`}>{issue.title}</div>
                                </div>
                            </div>
                            
                            {/* Actions Area */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] uppercase border border-gray-200 px-1.5 py-0.5 rounded text-gray-400 shrink-0 min-w-[70px] text-center">
                                    {issue.state?.name || 'Active'}
                                </span>
                                
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect([issue]);
                                    }}
                                    className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-gray-800 transition-all shadow-sm flex items-center gap-1 whitespace-nowrap"
                                    title="Import just this task"
                                >
                                    <Plus size={10} /> ADD
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Persistent Footer */}
        <div className="p-3 border-t-2 border-black bg-gray-50 flex justify-between items-center shrink-0 z-20">
            <div className="flex items-center gap-3">
                <div className="text-xs font-mono font-bold">
                    {selectedIssuesMap.size} selected
                </div>
                {selectedIssuesMap.size > 0 && (
                    <button 
                        onClick={() => setSelectedIssuesMap(new Map())}
                        className="text-[10px] font-mono text-gray-500 hover:text-red-500 flex items-center gap-1"
                    >
                        <Trash2 size={10} /> Clear
                    </button>
                )}
            </div>
            <button 
                onClick={handleConfirm}
                disabled={selectedIssuesMap.size === 0}
                className="bg-black text-white px-4 py-2 text-xs font-bold font-mono flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                IMPORT SELECTED <ArrowRight size={14} />
            </button>
        </div>
    </div>
  );
};