import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Boxes,
    Package,
    Layers,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Users,
    ArrowUpRight,
    QrCode,
    Sparkles
} from 'lucide-react';

export default function Dashboard({ stats = {}, recentLogbooks = [], kategoriSummary = [] }) {
    const s = {
        total_kategori: 0,
        total_barang: 0,
        total_unit: 0,
        unit_tersedia: 0,
        unit_dipinjam: 0,
        unit_maintenance: 0,
        ...stats,
    };

    const statCards = [
        {
            title: 'Total Kategori',
            value: s.total_kategori,
            icon: Boxes,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
            href: '/admin/kategori',
        },
        {
            title: 'Master Barang',
            value: s.total_barang,
            icon: Package,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10 border-indigo-500/20',
            href: '/admin/barang',
        },
        {
            title: 'Total Unit Fisik',
            value: s.total_unit,
            icon: Layers,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10 border-cyan-500/20',
            href: '/admin/unit',
        },
        {
            title: 'Unit Tersedia',
            value: s.unit_tersedia,
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            href: '/admin/unit?status=tersedia',
        },
        {
            title: 'Unit Dipinjam',
            value: s.unit_dipinjam,
            icon: Clock,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
            href: '/admin/unit?status=dipinjam',
        },
        {
            title: 'Unit Maintenance',
            value: s.unit_maintenance,
            icon: AlertTriangle,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10 border-rose-500/20',
            href: '/admin/unit?status=maintenance',
        },
    ];

    return (
        <AuthenticatedLayout title="Dashboard Overview">
            <Head title="Dashboard" />

            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 p-6 lg:p-8 mb-8 shadow-xl">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
                        <Sparkles size={14} />
                        WAMS Realtime Workshop Control
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                        Selamat Datang di WAMS Dashboard
                    </h2>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                        Pantau sirkulasi alat workshop, ketersediaan unit fisik, transaksi logbook, dan status maintenance secara terpusat & akurat.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={idx}
                            href={card.href}
                            className={`p-5 rounded-2xl border ${card.bg} bg-slate-900/80 backdrop-blur-sm hover:border-slate-700 transition-all group flex flex-col justify-between`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                                    <Icon size={20} className={card.color} />
                                </div>
                                <ArrowUpRight size={16} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
                            </div>
                            <div>
                                <span className="text-2xl lg:text-3xl font-black text-white block tracking-tight">
                                    {card.value}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{card.title}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Logbook Activities */}
                <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-white">Aktivitas Transaksi Terbaru</h3>
                            <p className="text-xs text-slate-400">Peminjaman & pengembalian unit alat fisik</p>
                        </div>
                        <Link
                            href="/admin/logbook"
                            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                            Lihat Semua <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                                    <th className="pb-3">User</th>
                                    <th className="pb-3">Barang & Unit</th>
                                    <th className="pb-3">Waktu</th>
                                    <th className="pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {recentLogbooks.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-slate-500">
                                            Belum ada aktivitas transaksi.
                                        </td>
                                    </tr>
                                ) : (
                                    recentLogbooks.map((log) => {
                                        const isDipinjam = log.status_transaksi === 'dipinjam';
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-800/30">
                                                <td className="py-3">
                                                    <div className="font-semibold text-white">{log.user?.nama || 'N/A'}</div>
                                                    <div className="text-[10px] text-slate-500">{log.user?.nip || log.user?.email}</div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="font-medium text-slate-200">
                                                        {log.barang_unit?.barang?.nama_barang || 'Barang'}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-blue-400">
                                                        {log.barang_unit?.kode_unit}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-slate-400">
                                                    {new Date(log.tanggal_pinjam).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td className="py-3">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                                            isDipinjam
                                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        }`}
                                                    >
                                                        {isDipinjam ? 'Dipinjam' : 'Dikembalikan'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Kategori Overview Quick Widget */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-bold text-white">Ringkasan Kategori</h3>
                                <p className="text-xs text-slate-400">Ketersediaan per kategori</p>
                            </div>
                            <Link href="/admin/qrcode" className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white" title="QR Codes">
                                <QrCode size={16} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {kategoriSummary.map((kat) => (
                                <div key={kat.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-xs text-slate-200">{kat.nama_kategori}</span>
                                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                                            {kat.tersedia}/{kat.total_unit} Tersedia
                                        </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                                            style={{
                                                width: `${kat.total_unit > 0 ? (kat.tersedia / kat.total_unit) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                        <Link
                            href="/admin/kategori"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
                        >
                            Kelola Semua Kategori & QR <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
