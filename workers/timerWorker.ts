/**
 * Web Worker for high-precision timing
 *
 * This worker provides accurate timing that won't drift when the browser tab
 * is backgrounded. Browsers throttle setInterval in inactive tabs, but
 * Web Workers continue running at full speed.
 *
 * Messages:
 *   Incoming:
 *     - { type: 'start', seconds: number } - Start countdown from given seconds
 *     - { type: 'pause' } - Pause the timer
 *     - { type: 'resume' } - Resume the timer
 *     - { type: 'stop' } - Stop and reset the timer
 *     - { type: 'set', seconds: number } - Set remaining seconds without starting
 *
 *   Outgoing:
 *     - { type: 'tick', seconds: number } - Sent every second with remaining time
 *     - { type: 'complete' } - Sent when timer reaches 0
 *     - { type: 'paused', seconds: number } - Confirmation of pause with current time
 *     - { type: 'resumed', seconds: number } - Confirmation of resume with current time
 */

interface TimerMessage {
  type: 'start' | 'pause' | 'resume' | 'stop' | 'set';
  seconds?: number;
}

interface TimerResponse {
  type: 'tick' | 'complete' | 'paused' | 'resumed' | 'started' | 'stopped';
  seconds: number;
}

let intervalId: ReturnType<typeof setInterval> | null = null;
let remainingSeconds = 0;
let isRunning = false;

// Track actual elapsed time for drift correction
let lastTickTime = 0;
let expectedNextTick = 0;

function tick() {
  const now = Date.now();

  if (remainingSeconds > 0) {
    remainingSeconds--;

    // Calculate drift and adjust next interval
    const drift = now - expectedNextTick;
    expectedNextTick = now + 1000 - drift;

    self.postMessage({ type: 'tick', seconds: remainingSeconds } as TimerResponse);

    if (remainingSeconds === 0) {
      stop();
      self.postMessage({ type: 'complete', seconds: 0 } as TimerResponse);
    }
  }
}

function start(seconds: number) {
  stop(); // Clear any existing interval
  remainingSeconds = seconds;
  isRunning = true;
  lastTickTime = Date.now();
  expectedNextTick = lastTickTime + 1000;

  // Use setInterval with drift correction
  intervalId = setInterval(tick, 1000);

  self.postMessage({ type: 'started', seconds: remainingSeconds } as TimerResponse);
}

function pause() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  isRunning = false;
  self.postMessage({ type: 'paused', seconds: remainingSeconds } as TimerResponse);
}

function resume() {
  if (!isRunning && remainingSeconds > 0) {
    isRunning = true;
    lastTickTime = Date.now();
    expectedNextTick = lastTickTime + 1000;
    intervalId = setInterval(tick, 1000);
    self.postMessage({ type: 'resumed', seconds: remainingSeconds } as TimerResponse);
  }
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  isRunning = false;
  self.postMessage({ type: 'stopped', seconds: remainingSeconds } as TimerResponse);
}

function setSeconds(seconds: number) {
  remainingSeconds = seconds;
  // If running, restart to pick up new time
  if (isRunning) {
    start(seconds);
  } else {
    self.postMessage({ type: 'tick', seconds: remainingSeconds } as TimerResponse);
  }
}

self.onmessage = (event: MessageEvent<TimerMessage>) => {
  const { type, seconds } = event.data;

  switch (type) {
    case 'start':
      if (typeof seconds === 'number' && seconds >= 0) {
        start(seconds);
      }
      break;
    case 'pause':
      pause();
      break;
    case 'resume':
      resume();
      break;
    case 'stop':
      stop();
      remainingSeconds = 0;
      break;
    case 'set':
      if (typeof seconds === 'number' && seconds >= 0) {
        setSeconds(seconds);
      }
      break;
  }
};

// Indicate worker is ready
self.postMessage({ type: 'tick', seconds: 0 } as TimerResponse);
