import React from 'react';
import { Head } from '@inertiajs/react';

export default function Welcome({ appName, version, phpVersion, status }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4">
                <div className="max-w-2xl w-full p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xl">
                            W
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">{appName || 'WAMS'}</h1>
                            <p className="text-sm text-slate-400">Workshop Asset Management System</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm mb-6 flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span><strong>PHASE 1 Complete:</strong> {status || 'Laravel 12 + Inertia.js + React + Vite is operational!'}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono mb-6">
                        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                            <span className="text-slate-500 block">Framework</span>
                            <span className="text-blue-400 font-semibold">Laravel 12</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                            <span className="text-slate-500 block">Adapter</span>
                            <span className="text-purple-400 font-semibold">Inertia.js v2</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                            <span className="text-slate-500 block">Frontend</span>
                            <span className="text-cyan-400 font-semibold">React 19</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                            <span className="text-slate-500 block">Bundler</span>
                            <span className="text-amber-400 font-semibold">Vite 7</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                            <span className="text-slate-500 block">Auth API</span>
                            <span className="text-rose-400 font-semibold">Sanctum</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                            <span className="text-slate-500 block">PHP Version</span>
                            <span className="text-emerald-400 font-semibold">PHP {phpVersion || '8.4'}</span>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 text-center border-t border-slate-800 pt-4">
                        Ready for Phase 2: Database Design & Migration
                    </div>
                </div>
            </div>
        </>
    );
}
