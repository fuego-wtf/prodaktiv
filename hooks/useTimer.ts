import { useState, useEffect, useRef, useCallback } from 'react';
import TimerWorker from '../workers/timerWorker?worker';

export interface UseTimerOptions {
  initialSeconds: number;
  onTick?: (seconds: number) => void;
  onComplete?: () => void;
}

export interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: (seconds?: number) => void;
}

/**
 * Format seconds into MM:SS string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * High-precision timer hook using Web Workers
 *
 * This hook provides an accurate countdown timer that continues running
 * even when the browser tab is in the background. Regular setInterval
 * gets throttled by browsers in inactive tabs, causing timer drift.
 * Web Workers run in a separate thread and are not subject to this throttling.
 *
 * @example
 * ```tsx
 * const { seconds, isRunning, start, pause, reset } = useTimer({
 *   initialSeconds: 90 * 60, // 90 minutes
 *   onTick: (s) => console.log(`${s} seconds remaining`),
 *   onComplete: () => console.log('Timer finished!')
 * });
 * ```
 */
export function useTimer(options: UseTimerOptions): UseTimerReturn {
  const { initialSeconds, onTick, onComplete } = options;

  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const onTickRef = useRef(onTick);
  const onCompleteRef = useRef(onComplete);

  // Keep callback refs up to date without causing re-renders
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Initialize the Web Worker
  useEffect(() => {
    workerRef.current = new TimerWorker();

    workerRef.current.onmessage = (event) => {
      const { type, seconds: workerSeconds } = event.data;

      switch (type) {
        case 'tick':
          setSeconds(workerSeconds);
          onTickRef.current?.(workerSeconds);
          break;
        case 'complete':
          setSeconds(0);
          setIsRunning(false);
          onCompleteRef.current?.();
          break;
        case 'started':
        case 'resumed':
          setSeconds(workerSeconds);
          setIsRunning(true);
          break;
        case 'paused':
        case 'stopped':
          setSeconds(workerSeconds);
          setIsRunning(false);
          break;
      }
    };

    // Set initial seconds in worker
    workerRef.current.postMessage({ type: 'set', seconds: initialSeconds });

    // Cleanup on unmount
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []); // Only run on mount/unmount

  // Sync initial seconds when they change externally
  useEffect(() => {
    if (workerRef.current && !isRunning) {
      workerRef.current.postMessage({ type: 'set', seconds: initialSeconds });
      setSeconds(initialSeconds);
    }
  }, [initialSeconds, isRunning]);

  const start = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'start', seconds });
    }
  }, [seconds]);

  const pause = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'pause' });
    }
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    const targetSeconds = newSeconds ?? initialSeconds;
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'stop' });
      workerRef.current.postMessage({ type: 'set', seconds: targetSeconds });
      setSeconds(targetSeconds);
      setIsRunning(false);
    }
  }, [initialSeconds]);

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
  };
}
