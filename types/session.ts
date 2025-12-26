/**
 * Session State Machine Types for LIN34R
 * Tasks: FCS-372, FCS-373
 *
 * This module defines a comprehensive state machine for managing focus sessions,
 * breaks, and day-end shutdown workflows.
 */

// ============================================================================
// Session Phase Enum
// ============================================================================

/**
 * SessionPhase represents the four core phases of the LIN34R workflow.
 *
 * Phase Transitions:
 *   PLANNING -> FOCUS (user starts a session)
 *   FOCUS -> BREAK (session timer ends or user ends early)
 *   BREAK -> PLANNING (break timer ends or user skips)
 *   PLANNING -> SHUTDOWN (user initiates day-end)
 *   SHUTDOWN -> PLANNING (shutdown cancelled or complete)
 */
export enum SessionPhase {
  PLANNING = 'PLANNING',
  FOCUS = 'FOCUS',
  BREAK = 'BREAK',
  SHUTDOWN = 'SHUTDOWN',
}

// ============================================================================
// Session Configuration
// ============================================================================

/**
 * SessionConfig holds the duration settings for different session types.
 * All durations are in seconds.
 */
export interface SessionConfig {
  /** Default focus session duration (default: 90 minutes = 5400 seconds) */
  focusDuration: number;
  /** Default break duration (default: 15 minutes = 900 seconds) */
  breakDuration: number;
  /** Emergency/minimum viable mode duration (default: 20 minutes = 1200 seconds) */
  emergencyDuration: number;
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  focusDuration: 90 * 60,    // 90 minutes
  breakDuration: 15 * 60,    // 15 minutes
  emergencyDuration: 20 * 60, // 20 minutes
};

// ============================================================================
// Session State
// ============================================================================

/**
 * SessionState represents the complete state of the session timer and workflow.
 */
export interface SessionState {
  /** Current phase of the session workflow */
  phase: SessionPhase;
  /** Remaining timer seconds (counts down when running) */
  timerSeconds: number;
  /** Whether the timer is currently counting down */
  isTimerRunning: boolean;
  /** Number of completed focus sessions today (0-indexed for scoring) */
  sessionCount: number;
  /** ID of the task currently being focused on (null during planning/break) */
  activeTaskId: string | null;
  /** Emergency mode flag - uses shorter session duration */
  isMinimumViable: boolean;
}

export const INITIAL_SESSION_STATE: SessionState = {
  phase: SessionPhase.PLANNING,
  timerSeconds: DEFAULT_SESSION_CONFIG.focusDuration,
  isTimerRunning: false,
  sessionCount: 0,
  activeTaskId: null,
  isMinimumViable: false,
};

// ============================================================================
// Session Actions (Discriminated Union)
// ============================================================================

/**
 * SessionAction is a discriminated union of all possible actions that can
 * modify the session state. Each action type carries its own payload.
 */
export type SessionAction =
  | { type: 'START_FOCUS'; payload: { taskId: string; config?: Partial<SessionConfig> } }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESUME_TIMER' }
  | { type: 'END_SESSION' }
  | { type: 'TICK' }
  | { type: 'SET_TASK'; payload: { taskId: string | null } }
  | { type: 'TOGGLE_EMERGENCY_MODE'; payload?: { config?: Partial<SessionConfig> } }
  | { type: 'START_BREAK'; payload?: { config?: Partial<SessionConfig> } }
  | { type: 'SKIP_BREAK' }
  | { type: 'START_SHUTDOWN' }
  | { type: 'COMPLETE_SHUTDOWN' }
  | { type: 'CANCEL_SHUTDOWN' }
  | { type: 'RESET_DAY'; payload?: { config?: Partial<SessionConfig> } };

// ============================================================================
// Session Reducer
// ============================================================================

/**
 * Validates whether a phase transition is allowed.
 * Returns true if the transition is valid, false otherwise.
 */
function isValidTransition(from: SessionPhase, to: SessionPhase): boolean {
  const validTransitions: Record<SessionPhase, SessionPhase[]> = {
    [SessionPhase.PLANNING]: [SessionPhase.FOCUS, SessionPhase.SHUTDOWN],
    [SessionPhase.FOCUS]: [SessionPhase.BREAK, SessionPhase.PLANNING],
    [SessionPhase.BREAK]: [SessionPhase.PLANNING],
    [SessionPhase.SHUTDOWN]: [SessionPhase.PLANNING],
  };

  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Gets the effective config by merging defaults with overrides.
 */
function getEffectiveConfig(override?: Partial<SessionConfig>): SessionConfig {
  return {
    ...DEFAULT_SESSION_CONFIG,
    ...override,
  };
}

/**
 * sessionReducer handles all session state transitions.
 * It enforces valid phase transitions and maintains state consistency.
 *
 * @param state - Current session state
 * @param action - Action to apply
 * @returns New session state (or same state if action is invalid)
 */
export function sessionReducer(
  state: SessionState,
  action: SessionAction
): SessionState {
  switch (action.type) {
    case 'START_FOCUS': {
      // Can only start focus from PLANNING phase
      if (!isValidTransition(state.phase, SessionPhase.FOCUS)) {
        console.warn(`Invalid transition: Cannot start focus from ${state.phase}`);
        return state;
      }

      const config = getEffectiveConfig(action.payload.config);
      const duration = state.isMinimumViable
        ? config.emergencyDuration
        : config.focusDuration;

      return {
        ...state,
        phase: SessionPhase.FOCUS,
        timerSeconds: duration,
        isTimerRunning: true,
        activeTaskId: action.payload.taskId,
      };
    }

    case 'PAUSE_TIMER': {
      // Can only pause during FOCUS or BREAK
      if (state.phase !== SessionPhase.FOCUS && state.phase !== SessionPhase.BREAK) {
        return state;
      }
      return {
        ...state,
        isTimerRunning: false,
      };
    }

    case 'RESUME_TIMER': {
      // Can only resume during FOCUS or BREAK when paused
      if (state.phase !== SessionPhase.FOCUS && state.phase !== SessionPhase.BREAK) {
        return state;
      }
      if (state.timerSeconds <= 0) {
        return state;
      }
      return {
        ...state,
        isTimerRunning: true,
      };
    }

    case 'END_SESSION': {
      // End session transitions FOCUS -> BREAK or BREAK -> PLANNING
      if (state.phase === SessionPhase.FOCUS) {
        const config = getEffectiveConfig();
        return {
          ...state,
          phase: SessionPhase.BREAK,
          timerSeconds: config.breakDuration,
          isTimerRunning: false, // Start paused so user controls when break begins
          sessionCount: state.sessionCount + 1,
          activeTaskId: null,
        };
      }

      if (state.phase === SessionPhase.BREAK) {
        const config = getEffectiveConfig();
        const duration = state.isMinimumViable
          ? config.emergencyDuration
          : config.focusDuration;
        return {
          ...state,
          phase: SessionPhase.PLANNING,
          timerSeconds: duration,
          isTimerRunning: false,
        };
      }

      return state;
    }

    case 'TICK': {
      // Only tick when timer is running
      if (!state.isTimerRunning || state.timerSeconds <= 0) {
        return state;
      }

      const newSeconds = state.timerSeconds - 1;

      // If timer reaches zero, auto-trigger session end
      if (newSeconds <= 0) {
        return {
          ...state,
          timerSeconds: 0,
          isTimerRunning: false,
        };
      }

      return {
        ...state,
        timerSeconds: newSeconds,
      };
    }

    case 'SET_TASK': {
      // Can set task in PLANNING or FOCUS phase
      if (state.phase !== SessionPhase.PLANNING && state.phase !== SessionPhase.FOCUS) {
        return state;
      }
      return {
        ...state,
        activeTaskId: action.payload.taskId,
      };
    }

    case 'TOGGLE_EMERGENCY_MODE': {
      const newIsMinimumViable = !state.isMinimumViable;
      const config = getEffectiveConfig(action.payload?.config);

      // When toggling emergency mode, reset to planning with appropriate duration
      return {
        ...state,
        isMinimumViable: newIsMinimumViable,
        phase: SessionPhase.PLANNING,
        timerSeconds: newIsMinimumViable ? config.emergencyDuration : config.focusDuration,
        isTimerRunning: false,
        activeTaskId: null,
      };
    }

    case 'START_BREAK': {
      // Manually start break (from FOCUS)
      if (!isValidTransition(state.phase, SessionPhase.BREAK)) {
        console.warn(`Invalid transition: Cannot start break from ${state.phase}`);
        return state;
      }

      const config = getEffectiveConfig(action.payload?.config);
      return {
        ...state,
        phase: SessionPhase.BREAK,
        timerSeconds: config.breakDuration,
        isTimerRunning: true,
        activeTaskId: null,
        sessionCount: state.sessionCount + 1,
      };
    }

    case 'SKIP_BREAK': {
      // Skip break and return to planning
      if (state.phase !== SessionPhase.BREAK) {
        return state;
      }

      const config = getEffectiveConfig();
      const duration = state.isMinimumViable
        ? config.emergencyDuration
        : config.focusDuration;

      return {
        ...state,
        phase: SessionPhase.PLANNING,
        timerSeconds: duration,
        isTimerRunning: false,
      };
    }

    case 'START_SHUTDOWN': {
      // Can only start shutdown from PLANNING
      if (!isValidTransition(state.phase, SessionPhase.SHUTDOWN)) {
        console.warn(`Invalid transition: Cannot start shutdown from ${state.phase}`);
        return state;
      }

      return {
        ...state,
        phase: SessionPhase.SHUTDOWN,
        isTimerRunning: false,
        activeTaskId: null,
      };
    }

    case 'COMPLETE_SHUTDOWN':
    case 'CANCEL_SHUTDOWN': {
      // Return to planning after shutdown
      if (state.phase !== SessionPhase.SHUTDOWN) {
        return state;
      }

      const config = getEffectiveConfig();
      const duration = state.isMinimumViable
        ? config.emergencyDuration
        : config.focusDuration;

      return {
        ...state,
        phase: SessionPhase.PLANNING,
        timerSeconds: duration,
        isTimerRunning: false,
      };
    }

    case 'RESET_DAY': {
      const config = getEffectiveConfig(action.payload?.config);
      return {
        ...INITIAL_SESSION_STATE,
        timerSeconds: config.focusDuration,
      };
    }

    default: {
      // Exhaustive check - this should never happen with proper TypeScript
      const _exhaustiveCheck: never = action;
      console.warn('Unknown action:', _exhaustiveCheck);
      return state;
    }
  }
}

// ============================================================================
// Utility Types & Functions
// ============================================================================

/**
 * Type guard to check if a phase allows timer operations.
 */
export function isTimerPhase(phase: SessionPhase): boolean {
  return phase === SessionPhase.FOCUS || phase === SessionPhase.BREAK;
}

/**
 * Format seconds as MM:SS or HH:MM:SS for display.
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get a human-readable label for the current phase.
 */
export function getPhaseLabel(phase: SessionPhase, isMinimumViable: boolean): string {
  const labels: Record<SessionPhase, string> = {
    [SessionPhase.PLANNING]: isMinimumViable ? 'Emergency Planning' : 'Planning',
    [SessionPhase.FOCUS]: isMinimumViable ? 'Emergency Sprint' : 'Deep Work',
    [SessionPhase.BREAK]: 'Break',
    [SessionPhase.SHUTDOWN]: 'Day Shutdown',
  };
  return labels[phase];
}

/**
 * Get the expected duration for a phase given the config.
 */
export function getPhaseDuration(
  phase: SessionPhase,
  isMinimumViable: boolean,
  config: SessionConfig = DEFAULT_SESSION_CONFIG
): number {
  switch (phase) {
    case SessionPhase.FOCUS:
      return isMinimumViable ? config.emergencyDuration : config.focusDuration;
    case SessionPhase.BREAK:
      return config.breakDuration;
    case SessionPhase.PLANNING:
    case SessionPhase.SHUTDOWN:
      return 0; // No timer for these phases
  }
}
