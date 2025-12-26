
export type Phase = 'PLANNING' | 'FOCUS' | 'BREAK' | 'ADMIN' | 'SHUTDOWN' | 'COMPLETED' | 'DEEP_WORK_1' | 'DEEP_WORK_2' | 'BUILD';

export type ShipFormat = 'CODE' | 'WRITING' | 'DESIGN' | 'STRATEGY' | 'PERSONAL';

export interface ScoreState {
  deepWork1: number; // 0, 1, 2
  deepWork2: number; // 0, 1, 2
  shipped: boolean;   // 2 pts
  move: boolean;      // 1 pt
  foodWater: boolean; // 1 pt
  shutdown: boolean;  // 1 pt
  distraction: boolean; // 1 pt
}

export interface LinearAssignee {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface LinearTeam {
  id: string;
  name: string;
  key: string;
}

export interface LinearProject {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  url: string;
  state?: {
    name: string;
    type: string;
  };
  assignee?: LinearAssignee;
  team?: LinearTeam;
  project?: LinearProject;
}

export interface AppSettings {
  linearApiKey: string;
  geminiApiKey: string;
}

// Device (BLE) Types
export type DeviceConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface DeviceState {
  connectionState: DeviceConnectionState;
  isLocked: boolean;
  hasPhone: boolean;
  batteryLevel: number;
  dialPosition: number;
  lastError?: string;
}

export const INITIAL_DEVICE_STATE: DeviceState = {
  connectionState: 'disconnected',
  isLocked: false,
  hasPhone: false,
  batteryLevel: 100,
  dialPosition: 0,
};

export interface Task {
  id: string;
  title: string;
  done: boolean;
  linearId?: string;
  linearIdentifier?: string;
  dependencies: string[]; // Array of Task IDs that block this task
  assignee?: LinearAssignee;
  team?: LinearTeam;
  project?: LinearProject;
}

export interface ChatEntry {
  id: string;
  timestamp: number;
  sender: 'system' | 'user' | 'ai';
  message: string;
}

export interface DayLog {
  date: string;
  mainObjective: string; // "Day Theme"
  shipFormat: ShipFormat;
  definitionOfDone: string;
  supportingTaskA: string;
  supportingTaskB: string;
  antiFailRule: string;
  distractionRule: string;
  
  tasks: Task[];
  activeTaskId: string | null; // The single task currently being focused on
  sessionLog: ChatEntry[];
  sessionCount: number;

  scores: ScoreState;
  microSteps: string[];
  isMinimumViable: boolean;
  
  // State for the "Now" Rail
  currentPhase: Phase;
  currentFirstAction: string;
  timerSeconds: number; // Remaining time
  isTimerRunning: boolean;

  // Tomorrow's Plan (filled during shutdown)
  tomorrowMainObjective: string;
  tomorrowFirstAction: string;
}

export const INITIAL_SCORE: ScoreState = {
  deepWork1: 0,
  deepWork2: 0,
  shipped: false,
  move: false,
  foodWater: false,
  shutdown: false,
  distraction: false,
};

export const INITIAL_DAY_LOG: DayLog = {
  date: new Date().toISOString().split('T')[0],
  mainObjective: "",
  shipFormat: 'CODE',
  definitionOfDone: "",
  supportingTaskA: "",
  supportingTaskB: "",
  antiFailRule: "If I miss deep work: I must do a 20m salvage sprint before bed.",
  distractionRule: "Phone outside the room during Deep Work.",
  scores: INITIAL_SCORE,
  microSteps: ["", "", ""],
  isMinimumViable: false,
  
  tasks: [],
  activeTaskId: null,
  sessionLog: [],
  sessionCount: 0,

  currentPhase: 'PLANNING',
  currentFirstAction: "",
  timerSeconds: 90 * 60,
  isTimerRunning: false,

  tomorrowMainObjective: "",
  tomorrowFirstAction: "",
};

export const INITIAL_SETTINGS: AppSettings = {
  linearApiKey: "",
  geminiApiKey: "", 
};