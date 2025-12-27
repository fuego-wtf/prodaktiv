import React, { useState, useEffect } from 'react';
import { Lock, Loader2, Check, ArrowRight } from 'lucide-react';

export const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Force page to start at top - disable browser scroll restoration
  useEffect(() => {
    // Disable browser's scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // Immediate scroll
    window.scrollTo(0, 0);
    // Delayed scroll to catch any async rendering
    const timeout = setTimeout(() => window.scrollTo(0, 0), 0);
    return () => clearTimeout(timeout);
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
    <div className="h-screen w-screen flex flex-col bg-white text-zinc-950 overflow-hidden">
      {/* Header - Pinned Top */}
      <header className="flex-shrink-0 h-14 border-b border-zinc-100 bg-white">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-950 text-white p-1.5 rounded">
              <Lock size={16} strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold font-mono tracking-tight">PRODAKTIV</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <button
              onClick={onEnter}
              className="hidden sm:block text-zinc-500 hover:text-zinc-950 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={onEnter}
              className="bg-zinc-950 text-white px-4 py-2 rounded text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Hero Section */}
        <section className="px-6 py-8 lg:py-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8 lg:mb-12">
              <span className="font-mono">Prodaktiv System.</span>{' '}
              <span className="text-zinc-400">The complete deep work ecosystem.</span>
            </h1>

            {/* Product Hero - Laptop + Device */}
            <div className="flex flex-col lg:flex-row items-end justify-center gap-6 lg:gap-12">
              {/* Laptop Mockup */}
              <div className="relative w-full max-w-md mx-auto lg:mx-0">
                <div className="bg-zinc-900 rounded-t-xl p-1.5 pb-0">
                  <div className="bg-zinc-950 rounded-t-lg overflow-hidden aspect-[16/10]">
                    <div className="h-full p-3 font-mono text-[10px]">
                      <div className="flex items-center justify-between mb-3 text-zinc-500">
                        <span>PRODAKTIV</span>
                        <span className="text-green-400">88:43</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-zinc-400 text-[8px]">Friday, December 26</div>
                        <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                          <div className="text-zinc-300 text-[9px] mb-1">[WTF-147] Create BusAgent provider</div>
                          <div className="text-zinc-600 text-[7px]">IN PROGRESS</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-800 h-2 rounded-b-xl"></div>
                <div className="bg-zinc-700 h-0.5 w-1/3 mx-auto rounded-b"></div>
              </div>

              {/* Hardware Device */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <div className="bg-gradient-to-b from-zinc-200 to-zinc-300 rounded-lg p-3 pb-2 shadow-lg">
                  <div className="bg-zinc-800 rounded w-16 h-24 mb-2 flex items-center justify-center relative">
                    <div className="absolute top-1.5 w-5 h-0.5 bg-zinc-700 rounded-full"></div>
                    <div className="text-zinc-600 text-[6px] font-mono">PHONE</div>
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-900 shadow-md flex items-center justify-center border-2 border-zinc-600">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex flex-col items-center justify-center">
                          <span className="text-[5px] text-zinc-500 font-mono leading-none">LOCKED</span>
                          <span className="text-zinc-900 font-mono text-[10px] font-bold">66:41</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-0.5 h-4 bg-zinc-400 mx-auto rounded-b"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Software + Hardware Cards */}
        <section className="px-6 py-6 border-t border-zinc-100">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-4">
            <div className="bg-zinc-50 rounded-lg p-4 flex gap-4">
              <div className="flex-shrink-0 w-16 h-12 bg-zinc-900 rounded overflow-hidden">
                <div className="p-1.5 font-mono text-[4px] text-zinc-400">
                  <div className="text-green-400">90:21</div>
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold mb-0.5">The Software</h3>
                <p className="text-zinc-500 text-xs">AI task management. Linear sync.</p>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-lg p-4 flex gap-4">
              <div className="flex-shrink-0 w-16 h-12 bg-zinc-200 rounded flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-b from-zinc-600 to-zinc-800 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-zinc-100"></div>
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold mb-0.5">The Hardware</h3>
                <p className="text-zinc-500 text-xs">E-ink display. Phone lock.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist Section */}
        <section className="px-6 py-8 border-t border-zinc-100 bg-zinc-50">
          <div className="max-w-sm mx-auto text-center">
            <h2 className="text-xl font-bold mb-1">Join the Waitlist</h2>
            <p className="text-zinc-500 text-xs mb-4">Hardware Q2 2025. Beta available now.</p>

            {status === 'success' ? (
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium py-2">
                <Check size={16} />
                <span>You're on the list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="flex-1 h-10 px-3 rounded bg-white border border-zinc-200 text-zinc-950 placeholder-zinc-400 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || !email}
                  className="h-10 px-4 rounded bg-zinc-950 text-white text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {status === 'loading' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      Join <ArrowRight size={12} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-6">
              <button
                onClick={onEnter}
                className="h-10 rounded bg-zinc-950 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
              >
                Try Beta
              </button>
              <button
                disabled
                className="h-10 rounded bg-zinc-200 text-zinc-400 text-xs font-medium cursor-not-allowed"
              >
                Pre-order $299
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Pinned Bottom */}
      <footer className="flex-shrink-0 h-12 border-t border-zinc-100 bg-white">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Lock size={10} />
            <span className="font-mono">PRODAKTIV</span>
          </div>
          <div>© {new Date().getFullYear()} Graphyn</div>
        </div>
      </footer>
    </div>
  );
};
