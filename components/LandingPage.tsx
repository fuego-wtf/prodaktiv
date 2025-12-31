import React, { useState, useEffect } from 'react';
import { Lock, Loader2, Check, ArrowRight, Crosshair, Timer, Smartphone, Play } from 'lucide-react';

// Hardware Specs - clean technical style
const HardwareSpecs = () => (
  <div className="font-mono text-xs space-y-1 text-gray-600">
    <div className="flex justify-between border-b border-gray-200 pb-1">
      <span>Display</span>
      <span className="text-black">2.9" E-Ink</span>
    </div>
    <div className="flex justify-between border-b border-gray-200 pb-1">
      <span>Charging</span>
      <span className="text-black">15W Qi Wireless</span>
    </div>
    <div className="flex justify-between border-b border-gray-200 pb-1">
      <span>Lock</span>
      <span className="text-black">Solenoid Actuated</span>
    </div>
    <div className="flex justify-between border-b border-gray-200 pb-1">
      <span>Input</span>
      <span className="text-black">Rotary Encoder + Button</span>
    </div>
    <div className="flex justify-between">
      <span>Material</span>
      <span className="text-black">Brushed Aluminum</span>
    </div>
  </div>
);

export const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [timerDisplay, setTimerDisplay] = useState('90:00');

  // Force page to start at top - disable browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    const timeout = setTimeout(() => window.scrollTo(0, 0), 0);
    return () => clearTimeout(timeout);
  }, []);

  // Fake timer countdown for visual effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerDisplay(prev => {
        const [mins, secs] = prev.split(':').map(Number);
        if (secs > 0) return `${mins}:${String(secs - 1).padStart(2, '0')}`;
        if (mins > 0) return `${mins - 1}:59`;
        return '90:00';
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'prodaktiv-landing' }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setEmail('');
      } else {
        console.error('Waitlist error:', data.error);
        setStatus('idle');
      }
    } catch (error) {
      console.error('Waitlist error:', error);
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {/* Header */}
      <header className="bg-white border-b-2 border-black">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded">
              <Lock size={18} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-lg font-bold font-mono tracking-tight">Prodaktiv</span>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Deep Work System</div>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <button
              onClick={onEnter}
              className="hidden sm:block text-gray-600 hover:text-black font-mono text-sm"
            >
              Log in
            </button>
            <button
              onClick={onEnter}
              className="bg-black text-white px-4 py-2 font-mono text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero - Focus Session Preview */}
        <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
          {/* Black Header Bar */}
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Play size={20} className="animate-pulse" />
              <div>
                <h2 className="font-bold font-mono uppercase tracking-wider text-sm">Focus Session #1</h2>
                <div className="text-xs font-mono opacity-80">Ship Your Work</div>
              </div>
            </div>
            <div className="font-mono font-bold text-4xl tabular-nums">
              {timerDisplay}
            </div>
          </div>

          {/* Blue Current Target */}
          <div className="bg-blue-600 text-white p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-80 mb-2">
              <Crosshair size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
              <span>Current Target</span>
            </div>
            <div className="font-mono font-bold text-xl mb-3">
              Lock your phone. Enter deep work.
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded">Hardware + Software</span>
              <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded">90-min sessions</span>
              <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded">Linear sync</span>
            </div>
          </div>

          {/* Task Queue Preview */}
          <div className="p-4 bg-gray-50 border-t-2 border-black">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-3 h-3 border border-gray-300 rounded-full" />
              Task Queue
            </div>
            <div className="space-y-2">
              {['Physical phone dock locks device during session', 'E-ink display shows timer + current task', 'AI breaks down projects into focused sprints'].map((task, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-mono text-gray-600">
                  <span className="w-4 h-4 border-2 border-gray-300 rounded-full shrink-0" />
                  {task}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hardware Hero Image with Labels */}
        <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-12 overflow-hidden">
          <div className="relative">
            <img
              src="/og-image.jpg"
              alt="Prodaktiv hardware dock - brushed aluminum with e-ink display and phone lock"
              className="w-full"
            />
            {/* E-ink Display Label - points to screen on left */}
            <div className="absolute top-[32%] sm:top-[40%] left-[3%] sm:left-[5%] flex items-center gap-1 sm:gap-2">
              <span className="bg-black text-white text-[8px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1">E-INK</span>
              <div className="hidden sm:block w-8 h-[1px] bg-black"></div>
            </div>
            {/* Solenoid Lock Label - points to mechanical lock at bottom left */}
            <div className="absolute top-[48%] sm:top-[56%] left-[3%] sm:left-[12%] flex items-center gap-1 sm:gap-2">
              <span className="bg-blue-600 text-white text-[8px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1">LOCK</span>
              <div className="hidden sm:block w-16 h-[1px] bg-blue-600"></div>
            </div>
            {/* Phone Dock Label - points to phone area on right */}
            <div className="absolute top-[32%] sm:top-[38%] right-[3%] sm:right-[5%] flex items-center gap-1 sm:gap-2">
              <div className="hidden sm:block w-28 h-[1px] bg-black"></div>
              <span className="bg-black text-white text-[8px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1">DOCK</span>
            </div>
            {/* Rotary Knob Label - points to silver knob in center, right-aligned */}
            <div className="absolute top-[48%] sm:top-[52%] right-[3%] sm:right-[26%] flex items-center gap-1 sm:gap-2">
              <div className="hidden sm:block w-16 h-[1px] bg-blue-600"></div>
              <span className="bg-blue-600 text-white text-[8px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1">KNOB</span>
            </div>
            {/* Material Label */}
            <div className="absolute bottom-[5%] sm:bottom-[8%] left-[50%] -translate-x-1/2">
              <span className="bg-white/90 text-black text-[8px] sm:text-xs font-mono px-2 sm:px-3 py-0.5 sm:py-1 border border-black whitespace-nowrap">ALUMINUM · 15W QI</span>
            </div>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center">
                <Timer size={24} />
              </div>
              <div>
                <h3 className="font-bold font-mono">The Software</h3>
                <p className="text-xs font-mono text-green-600">Beta available now</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">AI task management with Linear sync. 90-minute deep work sessions with Pomodoro tracking.</p>
            <button
              onClick={onEnter}
              className="w-full bg-black text-white py-3 font-mono font-bold text-sm hover:bg-gray-800"
            >
              Try Beta Free
            </button>
          </div>

          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="font-bold font-mono">The Hardware</h3>
                <p className="text-xs font-mono text-gray-500">Shipping Q2 2026</p>
              </div>
            </div>
            <div className="mb-4 bg-gray-50 border border-gray-200 p-4">
              <HardwareSpecs />
            </div>
            <button
              disabled
              className="w-full bg-gray-200 text-gray-500 py-3 font-mono font-bold text-sm cursor-not-allowed"
            >
              Pre-order $299 — Coming Soon
            </button>
          </div>
        </div>

        {/* Waitlist Section */}
        <div className="border-2 border-black bg-blue-600 text-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
          <div className="max-w-md mx-auto text-center">
            <h2 className="font-mono font-bold text-2xl mb-2">Join the Waitlist</h2>
            <p className="text-blue-100 text-sm mb-6">Hardware pre-orders opening Q1 2026</p>

            {status === 'success' ? (
              <div className="flex items-center justify-center gap-2 bg-white text-blue-600 py-3 font-mono font-bold">
                <Check size={18} />
                <span>You're on the list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 h-12 px-4 bg-white text-black font-mono text-sm focus:outline-none"
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || !email}
                  className="h-12 px-6 bg-black text-white font-mono font-bold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {status === 'loading' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Join <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: 'Phone Lock', desc: 'Physical dock locks your phone during sessions' },
            { title: 'E-Ink Display', desc: 'See timer and current task without distractions' },
            { title: 'Linear Sync', desc: 'Import tasks directly from your engineering workflow' },
          ].map((feature) => (
            <div key={feature.title} className="border-2 border-black bg-white p-4">
              <h3 className="font-bold font-mono text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-white mt-12">
        <div className="max-w-6xl mx-auto h-14 flex items-center justify-between px-6 text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-2">
            <Lock size={12} />
            <span>PRODAKTIV</span>
          </div>
          <div>© {new Date().getFullYear()} Graphyn</div>
        </div>
      </footer>
    </div>
  );
};
