import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BarChart3, Clock, Sparkles } from 'lucide-react';

export default function ReportsIndex() {
    return (
        <AuthenticatedLayout title="Laporan & Analytics">
            <Head title="Laporan & Analytics" />

            <div className="max-w-xl mx-auto mt-12 text-center bg-slate-900/90 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-6 text-blue-400">
                    <BarChart3 size={32} />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
                    <Clock size={13} />
                    <span>Tahap Pengembangan Awal</span>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">
                    Laporan & Analytics
                </h2>

                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    Fitur ini akan segera tersedia. Modul ini disiapkan untuk mengekspor laporan sirkulasi aset (PDF/Excel), utilisasi alat bulanan, tren kerusakan alat, dan histori peminjaman per departemen.
                </p>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Sparkles size={14} className="text-blue-400" />
                    <span>Struktur database & endpoint reporting siap diintegrasikan.</span>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
