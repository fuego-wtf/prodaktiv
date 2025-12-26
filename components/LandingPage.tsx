import React from 'react';
import { Target, ArrowRight, Check, Command, Terminal, Zap, Shield, Layout, Box } from 'lucide-react';

export const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white">
        {/* Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
            <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <div className="bg-zinc-900 text-white p-1 rounded-sm">
                        <Target size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-bold font-mono tracking-tight">L1NEAR</span>
                </div>
                
                <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-600">
                    <a href="#" className="hover:text-zinc-900 transition-colors">Manifesto</a>
                    <a href="#" className="hover:text-zinc-900 transition-colors">Changelog</a>
                    <a href="#" className="hover:text-zinc-900 transition-colors">Pricing</a>
                </nav>

                <div className="flex items-center gap-4">
                    <button onClick={onEnter} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 font-mono">
                        Log in
                    </button>
                    <button 
                        onClick={onEnter} 
                        className="bg-zinc-900 text-white px-4 py-2 text-sm font-bold font-mono rounded-md hover:bg-zinc-800 transition-colors flex items-center gap-2"
                    >
                        Get Access <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </header>

        <main className="flex-1">
            {/* Hero Section */}
            <section className="px-6 py-24 md:py-32 max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm font-medium text-zinc-900">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        <span className="font-mono text-xs">v1.2.0 Stable Release</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-zinc-950">
                        The Operating System for <span className="font-mono bg-zinc-100 px-2 rounded-md">Deep Work</span>.
                    </h1>
                    
                    <p className="text-xl text-zinc-500 max-w-[600px] leading-relaxed">
                        Orchestrate your day with military precision. Integrate Linear issues, deploy AI agents, and enter flow state on command.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button onClick={onEnter} className="h-12 px-8 rounded-md bg-zinc-900 text-white font-bold font-mono hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-sm">
                            <Terminal size={18} /> Launch App
                        </button>
                        <button onClick={onEnter} className="h-12 px-8 rounded-md border border-zinc-200 bg-white text-zinc-900 font-bold font-mono hover:bg-zinc-50 transition-all flex items-center justify-center shadow-sm">
                            Read Documentation
                        </button>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-zinc-400 font-mono pt-8">
                        <div className="flex items-center gap-2">
                            <Check size={14} /> Local-first
                        </div>
                        <div className="flex items-center gap-2">
                            <Check size={14} /> Linear Sync
                        </div>
                        <div className="flex items-center gap-2">
                            <Check size={14} /> Gemini AI
                        </div>
                    </div>
                </div>

                {/* Hero Visual - Abstract Interface */}
                <div className="relative rounded-xl border border-zinc-200 bg-zinc-50/50 p-2 shadow-2xl lg:ml-auto w-full max-w-[600px]">
                    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
                        {/* Fake Browser Header */}
                        <div className="flex items-center gap-1.5 border-b border-zinc-100 bg-zinc-50/50 px-4 py-3">
                            <div className="h-3 w-3 rounded-full bg-zinc-200"></div>
                            <div className="h-3 w-3 rounded-full bg-zinc-200"></div>
                            <div className="h-3 w-3 rounded-full bg-zinc-200"></div>
                            <div className="ml-auto font-mono text-xs text-zinc-400">localhost:3000</div>
                        </div>
                        
                        {/* Mock App Content */}
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="h-5 w-32 bg-zinc-900 rounded-sm"></div>
                                    <div className="h-3 w-48 bg-zinc-100 rounded-sm"></div>
                                </div>
                                <div className="h-8 w-8 rounded-full border border-zinc-200 bg-zinc-50"></div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-24 rounded-md border border-zinc-200 bg-zinc-50 p-3 space-y-2">
                                    <div className="h-4 w-4 bg-zinc-200 rounded-sm"></div>
                                    <div className="h-2 w-16 bg-zinc-200 rounded-sm mt-4"></div>
                                </div>
                                <div className="h-24 rounded-md border border-zinc-200 bg-zinc-50 p-3 space-y-2">
                                     <div className="h-4 w-4 bg-zinc-200 rounded-sm"></div>
                                     <div className="h-2 w-12 bg-zinc-200 rounded-sm mt-4"></div>
                                </div>
                                <div className="h-24 rounded-md border border-zinc-900 bg-zinc-900 p-3 space-y-2">
                                     <div className="h-4 w-4 bg-zinc-700 rounded-sm"></div>
                                     <div className="h-2 w-20 bg-zinc-700 rounded-sm mt-4"></div>
                                </div>
                            </div>

                            <div className="rounded-md border border-zinc-200 p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 rounded border border-zinc-300"></div>
                                    <div className="h-3 w-full bg-zinc-100 rounded-sm"></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 rounded border border-zinc-300"></div>
                                    <div className="h-3 w-2/3 bg-zinc-100 rounded-sm"></div>
                                </div>
                                <div className="flex items-center gap-3 opacity-50">
                                    <div className="h-4 w-4 rounded border border-zinc-200 bg-zinc-100"></div>
                                    <div className="h-3 w-1/2 bg-zinc-50 rounded-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="border-t border-zinc-200 bg-zinc-50/50">
                <div className="px-6 py-24 max-w-[1400px] mx-auto">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Core Capabilities</h2>
                        <p className="text-zinc-500 font-mono">Engineered for the 1% of builders.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={Command}
                            title="Linear Integration"
                            description="Import issues directly from your Linear workspace. Bi-directional sync keeps your board updated as you complete tasks."
                        />
                        <FeatureCard 
                            icon={Zap}
                            title="AI Agent Planning"
                            description="Gemini-powered breakdown of complex tasks into actionable micro-steps. Never stall on 'big' tickets again."
                        />
                        <FeatureCard 
                            icon={Shield}
                            title="Anti-Distraction"
                            description="Rigid session timers and 'Emergency Mode' to salvage days that are going off the rails."
                        />
                        <FeatureCard 
                            icon={Layout}
                            title="Day Shaping"
                            description="Visual flow state timeline. Admin blocks, deep work sessions, and shutdown rituals structured for you."
                        />
                        <FeatureCard 
                            icon={Terminal}
                            title="Keyboard First"
                            description="Optimized for speed. Manage your entire workday without leaving the keyboard."
                        />
                         <FeatureCard 
                            icon={Box}
                            title="Local-First Data"
                            description="Your data lives on your device. No cloud latency, no privacy tradeoffs. Pure performance."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-200 bg-white py-12 px-6">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-zinc-900 rounded-sm"></div>
                        <span className="font-mono font-bold">L1NEAR</span>
                    </div>
                    <div className="text-sm text-zinc-500 font-mono">
                        © {new Date().getFullYear()} Graphyn.xyz. All systems nominal.
                    </div>
                </div>
            </footer>
        </main>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="group rounded-xl border border-zinc-200 bg-white p-6 hover:border-zinc-900 transition-colors duration-300">
        <div className="mb-4 inline-block rounded-lg bg-zinc-100 p-3 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
            <Icon size={24} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold font-mono tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">
            {description}
        </p>
    </div>
);
