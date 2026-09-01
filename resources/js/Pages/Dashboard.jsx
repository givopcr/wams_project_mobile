import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Boxes,
    Package,
    Layers,
    CheckCircle2,
    Clock,
    Wrench,
    Cpu,
    Activity,
    Users,
    ArrowUpRight,
    TrendingUp,
    ShieldCheck,
    Calendar,
    ChevronRight,
    Sparkles,
    MoreHorizontal
} from 'lucide-react';
import {
    TotalBarangIcon,
    UnitTersediaIcon,
    BarangDipinjamIcon,
    BarangBaikIcon
} from '@/components/DashboardCardIcons';

// Category Rounded Bar Chart Component
function CategoryBarChart({ data = [], color = '#2563EB' }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    if (!data || data.length === 0) return null;

    const values = data.map((d) => d.count);
    const maxVal = Math.max(...values, 5);
    const midVal = Math.round(maxVal / 2);

    // Default to peak day if no bar is hovered
    const peakIndex = values.indexOf(Math.max(...values));
    const activeIndex = hoveredIndex !== null ? hoveredIndex : peakIndex;
    const activeItem = data[activeIndex] || data[0];

    const formatDate = (dateStr, dayStr) => {
        if (!dateStr) return `Hari ${dayStr}`;
        try {
            const d = new Date(dateStr);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            const fullDays = {
                'Sen': 'Senin',
                'Sel': 'Selasa',
                'Rab': 'Rabu',
                'Kam': 'Kamis',
                'Jum': 'Jumat',
                'Sab': 'Sabtu',
                'Min': 'Minggu'
            };
            const dayFull = fullDays[dayStr] || dayStr;
            return `${dayFull}, ${d.getDate()} ${months[d.getMonth()]}`;
        } catch {
            return `Hari ${dayStr}`;
        }
    };

    return (
        <div className="relative w-full pt-14 pb-1 select-none">
            {/* Floating Tooltip matching reference design */}
            {activeItem && (
                <div
                    className="absolute top-0 transform -translate-x-1/2 bg-white border border-[#E0E0E0] shadow-sm rounded-xl px-3 py-1.5 z-20 pointer-events-none transition-all duration-150 whitespace-nowrap text-left"
                    style={{
                        left: `${((activeIndex + 0.5) / data.length) * 82 + 12}%`,
                    }}
                >
                    <div className="text-xs font-black text-[#1D1616] leading-tight">
                        {activeItem.count} Peminjaman
                    </div>
                    <div className="text-[10px] font-medium text-[#6B7280] leading-tight mt-0.5">
                        {formatDate(activeItem.date, activeItem.day)}
                    </div>
                </div>
            )}

            {/* Chart Grid & Bars Area */}
            <div className="relative h-28 flex">
                {/* Y-Axis Labels */}
                <div className="w-7 shrink-0 flex flex-col justify-between text-[10px] font-semibold text-[#8C93A0] pr-1.5 pb-0.5 select-none text-right">
                    <span>{maxVal}</span>
                    <span>{midVal}</span>
                    <span>0</span>
                </div>

                {/* Bars & Grid Lines Area */}
                <div className="relative flex-1 h-full">
                    {/* 3 Horizontal Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        <div className="w-full border-b border-[#E5E7EB]" />
                        <div className="w-full border-b border-[#E5E7EB]" />
                        <div className="w-full border-b border-[#E5E7EB]" />
                    </div>

                    {/* Bars Container */}
                    <div className="relative z-10 flex items-end justify-between h-full px-1.5">
                        {data.map((d, idx) => {
                            const isSelected = activeIndex === idx;
                            const heightPercent = Math.max((d.count / maxVal) * 92, 8);

                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer group px-0.5 sm:px-1"
                                    onMouseEnter={() => setHoveredIndex(idx)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <div
                                        className="w-full max-w-[26px] rounded-t-md transition-all duration-200"
                                        style={{
                                            height: `${heightPercent}%`,
                                            backgroundColor: isSelected ? color : '#E9EEF5',
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* X-Axis Day Labels */}
            <div className="flex items-center justify-between pl-7 pr-1.5 pt-2 text-[11px] font-semibold text-[#6B7280]">
                {data.map((d, i) => (
                    <span
                        key={i}
                        className={`flex-1 text-center transition-colors ${
                            activeIndex === i ? 'text-[#1D1616] font-bold' : ''
                        }`}
                    >
                        {d.day}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function Dashboard({
    stats = {},
    categoryCharts = [],
    recentUsersActivity = []
}) {
    const { auth } = usePage().props;
    const userName = auth?.user?.nama || 'Admin';

    const s = {
        total_kategori: 3,
        total_barang: 0,
        total_unit: 0,
        unit_tersedia: 0,
        unit_dipinjam: 0,
        unit_maintenance: 0,
        unit_baik: 0,
        persentase_baik: 100,
        total_user: 0,
        transaksi_aktif: 0,
        transaksi_selesai: 0,
        ...stats,
    };

    // Category styling & icons
    const categoryConfig = {
        Perkakas: {
            icon: Wrench,
            color: '#D84040',
            badgeBg: 'bg-rose-50',
            badgeBorder: 'border-rose-200',
            badgeText: 'text-[#D84040]',
            iconBg: 'bg-[#D84040]/10 text-[#D84040]',
            gradientId: 'grad-perkakas',
        },
        Elektronik: {
            icon: Cpu,
            color: '#2563EB',
            badgeBg: 'bg-blue-50',
            badgeBorder: 'border-blue-200',
            badgeText: 'text-blue-600',
            iconBg: 'bg-blue-500/10 text-blue-600',
            gradientId: 'grad-elektronik',
        },
        Komponen: {
            icon: Layers,
            color: '#059669',
            badgeBg: 'bg-emerald-50',
            badgeBorder: 'border-emerald-200',
            badgeText: 'text-emerald-600',
            iconBg: 'bg-emerald-500/10 text-emerald-600',
            gradientId: 'grad-komponen',
        },
    };

    return (
        <AuthenticatedLayout title="Dashboard">
            <Head title="Admin Dashboard - WAMS" />

            <div className="space-y-7 max-w-7xl mx-auto">
                {/* 1. TOP ROW: 4 KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Card 1: Barang yang sedang dipinjam */}
                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-2xs hover:shadow-sm transition-all relative flex items-center gap-4">
                        <div className="w-13 h-13 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                            <BarangDipinjamIcon size={24} />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-baseline gap-1.5">
                                <h3 className="text-2xl font-black text-[#1D1616] tracking-tight">
                                    {s.unit_dipinjam}
                                </h3>
                                <span className="text-[11px] font-semibold text-[#6B7280]">Unit Aktif</span>
                            </div>
                            <p className="text-xs font-semibold text-[#6B7280] truncate mt-0.5">
                                Barang Sedang Dipinjam
                            </p>
                            <p className="text-[11px] font-medium text-amber-600 mt-1 flex items-center gap-1">
                                <Clock size={11} />
                                Terdata dalam logbook
                            </p>
                        </div>
                        <div className="absolute top-3.5 right-3.5 text-gray-300">
                            <MoreHorizontal size={16} />
                        </div>
                    </div>

                    {/* Card 2: Total jumlah unit yang tersedia */}
                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-2xs hover:shadow-sm transition-all relative flex items-center gap-4">
                        <div className="w-13 h-13 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                            <UnitTersediaIcon size={24} />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-baseline gap-1.5">
                                <h3 className="text-2xl font-black text-[#1D1616] tracking-tight">
                                    {s.unit_tersedia}
                                </h3>
                                <span className="text-[11px] font-semibold text-[#6B7280]">/ {s.total_unit} Unit</span>
                            </div>
                            <p className="text-xs font-semibold text-[#6B7280] truncate mt-0.5">
                                Total Unit Tersedia
                            </p>
                            <p className="text-[11px] font-medium text-blue-600 mt-1 flex items-center gap-1">
                                <Boxes size={11} />
                                Siap di workshop
                            </p>
                        </div>
                        <div className="absolute top-3.5 right-3.5 text-gray-300">
                            <MoreHorizontal size={16} />
                        </div>
                    </div>

                    {/* Card 3: Jumlah total barang */}
                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-2xs hover:shadow-sm transition-all relative flex items-center gap-4">
                        <div className="w-13 h-13 rounded-full bg-rose-500/10 flex items-center justify-center text-[#D84040] shrink-0">
                            <TotalBarangIcon size={24} />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-baseline gap-1.5">
                                <h3 className="text-2xl font-black text-[#1D1616] tracking-tight">
                                    {s.total_barang}
                                </h3>
                                <span className="text-[11px] font-semibold text-[#6B7280]">Model Master</span>
                            </div>
                            <p className="text-xs font-semibold text-[#6B7280] truncate mt-0.5">
                                Jumlah Total Barang
                            </p>
                            <p className="text-[11px] font-medium text-[#D84040] mt-1 flex items-center gap-1">
                                <Package size={11} />
                                {s.total_kategori} kategori
                            </p>
                        </div>
                        <div className="absolute top-3.5 right-3.5 text-gray-300">
                            <MoreHorizontal size={16} />
                        </div>
                    </div>

                    {/* Card 4: Persentase barang yang masih baik */}
                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-2xs hover:shadow-sm transition-all relative flex items-center gap-4">
                        <div className="w-13 h-13 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                            <i className="fi fi-br-task-checklist text-[22px] leading-none flex items-center justify-center"></i>
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-baseline gap-1.5">
                                <h3 className="text-2xl font-black text-[#1D1616] tracking-tight">
                                    {s.persentase_baik}%
                                </h3>
                                <span className="text-[11px] font-semibold text-emerald-600 font-mono">
                                    ({s.unit_baik}/{s.total_unit})
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-[#6B7280] truncate mt-0.5">
                                Persentase Barang Baik
                            </p>
                            <p className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                                <ShieldCheck size={11} />
                                Kondisi layak pakai
                            </p>
                        </div>
                        <div className="absolute top-3.5 right-3.5 text-gray-300">
                            <MoreHorizontal size={16} />
                        </div>
                    </div>
                </div>

                {/* 2. MIDDLE ROW: 3 CATEGORY CARDS (PERKAKAS, ELEKTRONIK, KOMPONEN) WITH DAILY LOAN GRAPHS */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-[#1D1616]">
                            Monitoring
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {categoryCharts.map((cat, idx) => {
                            const config = categoryConfig[cat.name] || {
                                icon: Package,
                                color: '#D84040',
                                badgeBg: 'bg-rose-50',
                                badgeBorder: 'border-rose-200',
                                badgeText: 'text-[#D84040]',
                                iconBg: 'bg-[#D84040]/10 text-[#D84040]',
                                gradientId: `grad-cat-${idx}`,
                            };
                            const IconComponent = config.icon;

                            return (
                                <div
                                    key={cat.id || idx}
                                    className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all"
                                >
                                    {/* Card Header: Icon & Category Name */}
                                    <div>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${config.iconBg}`}
                                                >
                                                    <IconComponent size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-extrabold text-[#1D1616] leading-tight">
                                                        {cat.name}
                                                    </h3>
                                                    <p className="text-[11px] font-semibold text-[#6B7280] mt-0.5">
                                                        {cat.total_unit} Unit • {cat.total_barang} Model
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${config.badgeBg} ${config.badgeBorder} ${config.badgeText}`}
                                            >
                                                {cat.unit_dipinjam} Dipinjam
                                            </span>
                                        </div>

                                        {/* Status & Loan Metrics */}
                                        <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-[#E0E0E0]/80">
                                            <div className="bg-[#EEEEEE]/70 rounded-xl p-2.5">
                                                <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                                                    PUNCAK RAMAI
                                                </span>
                                                <span className="text-xs font-extrabold text-[#1D1616] mt-0.5 block">
                                                    Hari {cat.peak_day} ({cat.max_daily_loans} item)
                                                </span>
                                            </div>
                                            <div className="bg-[#EEEEEE]/70 rounded-xl p-2.5">
                                                <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                                                    TOTAL 7 HARI
                                                </span>
                                                <span className="text-xs font-extrabold text-[#1D1616] mt-0.5 block">
                                                    {cat.total_loans_week} Peminjaman
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bar Chart (Day by day loans) */}
                                    <div className="mt-4 pt-2">
                                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B7280] mb-2 px-1">
                                            <span>Grafik Peminjaman Harian</span>
                                            <span className="text-[10px] font-bold text-[#1D1616] flex items-center gap-1">
                                                <TrendingUp size={11} className={config.badgeText} />
                                                Tren Sirkulasi
                                            </span>
                                        </div>

                                        <CategoryBarChart
                                            data={cat.daily_loans}
                                            color={config.color}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. BOTTOM ROW: CARD WITH 3 LIST USER RECENT BORROW / RETURN */}
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#E0E0E0]">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#D84040]" />
                                <h2 className="text-lg font-extrabold text-[#1D1616]">
                                    Aktivitas Terkini Sirkulasi User
                                </h2>
                            </div>
                            <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                                3 data pengguna terakhir yang meminjam atau mengembalikan barang
                            </p>
                        </div>

                        <Link
                            href="/admin/logbook"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D84040] hover:text-[#8E1616] transition-colors"
                        >
                            Lihat Semua Logbook
                            <ChevronRight size={14} />
                        </Link>
                    </div>

                    {/* List Items */}
                    <div className="divide-y divide-[#E0E0E0]/80">
                        {recentUsersActivity.length === 0 ? (
                            <div className="py-12 text-center text-xs text-[#6B7280] font-medium">
                                Belum ada riwayat transaksi peminjaman atau pengembalian terbaru.
                            </div>
                        ) : (
                            recentUsersActivity.map((log) => {
                                const isDipinjam = log.status_transaksi === 'dipinjam';
                                const initials = log.user_name
                                    ? log.user_name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .slice(0, 2)
                                        .join('')
                                        .toUpperCase()
                                    : 'TK';

                                return (
                                    <div
                                        key={log.id}
                                        className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#EEEEEE]/40 px-2 rounded-xl transition-colors"
                                    >
                                        {/* User Info */}
                                        <div className="flex items-center gap-3.5 min-w-[220px]">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${isDipinjam
                                                        ? 'bg-[#D84040] text-white'
                                                        : 'bg-[#1D1616] text-white'
                                                    }`}
                                            >
                                                {initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-extrabold text-[#1D1616] truncate">
                                                    {log.user_name}
                                                </p>
                                                <p className="text-[11px] font-semibold text-[#6B7280] truncate">
                                                    NIP: {log.user_nip}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Barang & Unit */}
                                        <div className="min-w-[200px]">
                                            <p className="text-xs font-bold text-[#1D1616]">
                                                {log.nama_barang}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-mono font-bold bg-[#EEEEEE] border border-[#E0E0E0] px-2 py-0.5 rounded text-[#1D1616]">
                                                    {log.kode_unit}
                                                </span>
                                                <span className="text-[11px] font-medium text-[#6B7280]">
                                                    • {log.kategori}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Waktu Transaksi */}
                                        <div className="text-xs text-[#6B7280] font-medium min-w-[140px] flex items-center gap-1.5">
                                            <Calendar size={13} className="text-[#6B7280]" />
                                            <span>{log.formatted_date}</span>
                                        </div>

                                        {/* Status Badge & Action */}
                                        <div className="flex items-center justify-between md:justify-end gap-3 min-w-[150px]">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold ${isDipinjam
                                                        ? 'bg-rose-50 text-[#D84040] border border-rose-200'
                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}
                                            >
                                                {isDipinjam ? (
                                                    <>
                                                        <Clock size={12} />
                                                        MEMINJAM
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={12} />
                                                        DIKEMBALIKAN
                                                    </>
                                                )}
                                            </span>

                                            <Link
                                                href="/admin/logbook"
                                                className="text-xs font-bold text-[#6B7280] hover:text-[#1D1616] p-1.5 rounded-lg hover:bg-white transition-colors"
                                                title="Lihat Detail Transaksi"
                                            >
                                                <ArrowUpRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
