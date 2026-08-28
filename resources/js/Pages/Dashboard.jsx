import React, { useState } from 'react';
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
    Send,
    ChevronRight,
    Plus,
    Wrench,
    Activity,
    Shield
} from 'lucide-react';

export default function Dashboard({
    stats = {},
    recentLogbooks = [],
    kategoriSummary = [],
    quickUsers = [],
    weeklyActivity = [],
    categoryDistribution = [],
    monthlyHistory = []
}) {
    const s = {
        total_kategori: 0,
        total_barang: 0,
        total_unit: 0,
        unit_tersedia: 0,
        unit_dipinjam: 0,
        unit_maintenance: 0,
        total_user: 0,
        transaksi_aktif: 0,
        ...stats,
    };

    const [selectedUser, setSelectedUser] = useState(quickUsers[0]?.nama || 'Teknisi Workshop');
    const [pinjamItemCode, setPinjamItemCode] = useState('');
    const [actionMsg, setActionMsg] = useState(null);

    const handleQuickAction = (e) => {
        e.preventDefault();
        if (pinjamItemCode.trim()) {
            setActionMsg(`Instruksi cek unit "${pinjamItemCode}" untuk ${selectedUser} diteruskan.`);
            setTimeout(() => setActionMsg(null), 4000);
            setPinjamItemCode('');
        }
    };

    // Max values for weekly bar chart
    const maxBarVal = Math.max(...weeklyActivity.map((w) => Math.max(w.pinjam, w.kembali)), 15);

    // Points for Flat SVG area/line chart
    const points = monthlyHistory.map((m, idx) => {
        const x = 40 + idx * 75;
        const y = 160 - (m.count / 80) * 120;
        return { x, y, month: m.month, count: m.count };
    });

    const pathD = points.reduce((acc, pt, idx, arr) => {
        if (idx === 0) return `M ${pt.x} ${pt.y}`;
        const prev = arr[idx - 1];
        const cp1x = prev.x + (pt.x - prev.x) / 2;
        const cp1y = prev.y;
        const cp2x = prev.x + (pt.x - prev.x) / 2;
        const cp2y = pt.y;
        return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1]?.x || 490} 180 L ${points[0]?.x || 40} 180 Z`;

    const flatPaletteColors = ['#F62440', '#1E232A', '#D97706', '#059669', '#2563EB'];

    return (
        <AuthenticatedLayout title="Overview">
            <Head title="Admin Dashboard - WAMS" />

            <div className="space-y-8 max-w-7xl mx-auto">
                {/* 1. TOP SECTION: FLAT KPI CARDS & RECENT TRANSACTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left 2 Cols: 2 Flat Primary Cards */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#1E232A]">Status Unit Workshop</h2>
                            <Link
                                href="/admin/unit"
                                className="text-xs font-bold text-[#F62440] hover:underline"
                            >
                                Lihat Semua Unit →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Card 1: Flat Coral Red Accent Card */}
                            <div className="rounded-2xl bg-[#F62440] text-white p-6 flex flex-col justify-between h-[215px] border border-[#F62440]">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-white/85 uppercase tracking-wider">Unit Siap Pakai</p>
                                            <h3 className="text-3xl font-extrabold tracking-tight mt-1">
                                                {s.unit_tersedia} <span className="text-sm font-semibold text-white/80">/ {s.total_unit} Unit</span>
                                            </h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                            <Boxes size={20} className="text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                                    <div className="bg-black/10 rounded-lg p-2">
                                        <p className="text-[10px] text-white/80 uppercase font-semibold">KATEGORI</p>
                                        <p className="font-bold text-sm text-white mt-0.5">{s.total_kategori} Kategori</p>
                                    </div>
                                    <div className="bg-black/10 rounded-lg p-2">
                                        <p className="text-[10px] text-white/80 uppercase font-semibold">MASTER BARANG</p>
                                        <p className="font-bold text-sm text-white mt-0.5">{s.total_barang} Model</p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                                    <span className="font-mono font-semibold tracking-wider text-white/95">
                                        WAMS-UNIT-READY
                                    </span>
                                    <span className="font-bold bg-white text-[#F62440] px-2.5 py-0.5 rounded-md text-[11px]">
                                        OPERASIONAL
                                    </span>
                                </div>
                            </div>

                            {/* Card 2: Flat Warm Cream Card */}
                            <div className="rounded-2xl bg-[#FFF2DB] border border-[#F0DFC4] text-[#1E232A] p-6 flex flex-col justify-between h-[215px]">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Unit Sedang Dipinjam</p>
                                            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-[#1E232A]">
                                                {s.unit_dipinjam} <span className="text-sm font-semibold text-[#6B7280]">Unit Aktif</span>
                                            </h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-[#FFE5BF] border border-[#F0DFC4] flex items-center justify-center">
                                            <Clock size={20} className="text-[#F62440]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                                    <div className="bg-[#FFE5BF] rounded-lg p-2 border border-[#F0DFC4]">
                                        <p className="text-[10px] text-[#6B7280] uppercase font-semibold">PERLU CEK</p>
                                        <p className="font-bold text-sm text-[#F62440] mt-0.5">{s.unit_maintenance} Unit</p>
                                    </div>
                                    <div className="bg-[#FFE5BF] rounded-lg p-2 border border-[#F0DFC4]">
                                        <p className="text-[10px] text-[#6B7280] uppercase font-semibold">USER AKTIF</p>
                                        <p className="font-bold text-sm text-[#1E232A] mt-0.5">{s.total_user} Teknisi</p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-[#F0DFC4] flex items-center justify-between text-xs">
                                    <span className="font-mono font-semibold text-[#6B7280]">
                                        LOGB-ACTIVE-{s.transaksi_aktif}
                                    </span>
                                    <Link
                                        href="/admin/logbook"
                                        className="font-bold text-[#F62440] hover:underline"
                                    >
                                        Buka Logbook →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Recent Transactions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#1E232A]">Transaksi Terbaru</h2>
                            <Link
                                href="/admin/logbook"
                                className="text-xs font-bold text-[#F62440] hover:underline"
                            >
                                Semua Log
                            </Link>
                        </div>

                        <div className="bg-[#FFF2DB] rounded-2xl border border-[#F0DFC4] p-4 h-[215px] overflow-y-auto space-y-2.5 custom-scrollbar">
                            {recentLogbooks.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-xs text-[#6B7280]">
                                    Belum ada transaksi logbook tercatat.
                                </div>
                            ) : (
                                recentLogbooks.map((log) => {
                                    const isDipinjam = log.status_transaksi === 'dipinjam';
                                    return (
                                        <div key={log.id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#FFFAF3] border border-[#F0DFC4]">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                                                        isDipinjam
                                                            ? 'bg-[#FFE5BF] text-[#D97706]'
                                                            : 'bg-[#F62440]/10 text-[#F62440]'
                                                    }`}
                                                >
                                                    {isDipinjam ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-[#1E232A] truncate">
                                                        {log.barang_unit?.barang?.nama_barang || 'Barang Workshop'}
                                                    </p>
                                                    <p className="text-[11px] text-[#6B7280] truncate">
                                                        {log.user?.nama || 'Teknisi'} • {new Date(log.tanggal_pinjam).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span
                                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-block ${
                                                        isDipinjam
                                                            ? 'bg-[#F62440] text-white'
                                                            : 'bg-[#FFE5BF] text-[#1E232A]'
                                                    }`}
                                                >
                                                    {isDipinjam ? 'PINJAM' : 'KEMBALI'}
                                                </span>
                                                <p className="text-[10px] font-mono text-[#6B7280] mt-0.5">
                                                    {log.barang_unit?.kode_unit}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. MIDDLE SECTION: WEEKLY ACTIVITY (BAR CHART) & ASSET STATISTICS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left 2 Cols: Flat Weekly Activity Bar Chart */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#1E232A]">Aktivitas Sirkulasi Mingguan</h2>
                            {/* Legend */}
                            <div className="flex items-center gap-4 text-xs font-semibold">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-md bg-[#F62440]" />
                                    <span className="text-[#525866]">Peminjaman</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-md bg-[#1E232A]" />
                                    <span className="text-[#525866]">Pengembalian</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#FFF2DB] rounded-2xl border border-[#F0DFC4] p-6">
                            {/* Bar Chart Graphics */}
                            <div className="h-56 flex items-end justify-between gap-3 lg:gap-6 pt-4 px-2 border-b border-[#F0DFC4]">
                                {weeklyActivity.map((w, idx) => {
                                    const pinjamHeight = Math.max(12, (w.pinjam / maxBarVal) * 160);
                                    const kembaliHeight = Math.max(12, (w.kembali / maxBarVal) * 160);
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div className="w-full flex items-end justify-center gap-1.5 h-44">
                                                {/* Bar Pinjam (Coral Red) */}
                                                <div
                                                    title={`Peminjaman: ${w.pinjam}`}
                                                    className="w-3.5 lg:w-5 bg-[#F62440] rounded-t-md transition-all hover:opacity-90"
                                                    style={{ height: `${pinjamHeight}px` }}
                                                />
                                                {/* Bar Kembali (Dark Slate) */}
                                                <div
                                                    title={`Pengembalian: ${w.kembali}`}
                                                    className="w-3.5 lg:w-5 bg-[#1E232A] rounded-t-md transition-all hover:opacity-90"
                                                    style={{ height: `${kembaliHeight}px` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-[#6B7280] group-hover:text-[#F62440]">
                                                {w.day}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Flat Category / Asset Statistics */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#1E232A]">Distribusi Kategori</h2>
                        <div className="bg-[#FFF2DB] rounded-2xl border border-[#F0DFC4] p-6 flex flex-col justify-between min-h-[300px]">
                            {/* Donut Chart SVG */}
                            <div className="relative w-44 h-44 mx-auto my-2">
                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="36"
                                        fill="transparent"
                                        stroke="#F62440"
                                        strokeWidth="20"
                                        strokeDasharray="75 163"
                                        strokeDashoffset="0"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="36"
                                        fill="transparent"
                                        stroke="#1E232A"
                                        strokeWidth="20"
                                        strokeDasharray="50 188"
                                        strokeDashoffset="-75"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="36"
                                        fill="transparent"
                                        stroke="#FFE5BF"
                                        strokeWidth="20"
                                        strokeDasharray="60 178"
                                        strokeDashoffset="-125"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="36"
                                        fill="transparent"
                                        stroke="#D97706"
                                        strokeWidth="20"
                                        strokeDasharray="43 195"
                                        strokeDashoffset="-185"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xl font-extrabold text-[#1E232A]">{s.total_unit}</span>
                                    <span className="text-[10px] text-[#6B7280] font-bold uppercase">Total Unit</span>
                                </div>
                            </div>

                            {/* Flat Legend Tags */}
                            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#F0DFC4] text-xs">
                                {categoryDistribution.slice(0, 4).map((cat, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-[#FFFAF3] border border-[#F0DFC4]">
                                        <span
                                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                                            style={{ backgroundColor: flatPaletteColors[idx % flatPaletteColors.length] }}
                                        />
                                        <span className="text-[#1E232A] font-semibold truncate text-[11px]">{cat.name} ({cat.percentage}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
