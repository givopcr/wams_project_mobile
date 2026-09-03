import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    TrendingUp,
    Wrench,
    Package,
    Clock,
    AlertTriangle,
    ChevronRight,
    ArrowUpRight,
    Calendar,
    Activity,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';

/**
 * 1. Top Barang Paling Sering Dipinjam (Horizontal Bar Chart)
 */
export function TopBarangHorizontalChart({ data = [] }) {
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const maxVal = Math.max(...data.map((d) => d.total_peminjaman || 0), 1);

    return (
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all h-full">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E0E0E0]/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-[#D84040] shrink-0">
                            <Package size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-[#1D1616] leading-tight flex items-center gap-2">
                                Top Barang Paling Sering Dipinjam
                            </h3>
                            <p className="text-[11px] font-semibold text-[#6B7280] mt-0.5">
                                Peringkat barang dengan frekuensi peminjaman tertinggi
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/barang"
                        className="text-xs font-bold text-[#D84040] hover:text-[#8E1616] inline-flex items-center gap-1 transition-colors"
                        title="Lihat Master Barang"
                    >
                        Semua
                        <ChevronRight size={14} />
                    </Link>
                </div>

                {/* Horizontal Bars List */}
                <div className="mt-5 space-y-4">
                    {data.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400">
                            Belum ada data peminjaman barang.
                        </div>
                    ) : (
                        data.map((item, idx) => {
                            const isHovered = hoveredIdx === idx;
                            const percentage = Math.round((item.total_peminjaman / maxVal) * 100);
                            const rankColor =
                                idx === 0
                                    ? 'bg-[#D84040] text-white shadow-xs'
                                    : idx === 1
                                    ? 'bg-[#1D1616] text-white'
                                    : 'bg-[#EEEEEE] text-[#1D1616] font-bold';

                            return (
                                <div
                                    key={item.id || idx}
                                    onMouseEnter={() => setHoveredIdx(idx)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                    className={`p-2.5 rounded-xl transition-all ${
                                        isHovered ? 'bg-[#EEEEEE]/50 shadow-2xs' : 'hover:bg-[#EEEEEE]/30'
                                    }`}
                                >
                                    {/* Item Info Line */}
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${rankColor}`}
                                            >
                                                {item.rank || idx + 1}
                                            </span>
                                            <span className="text-xs font-bold text-[#1D1616] truncate">
                                                {item.nama_barang}
                                            </span>
                                            <span className="text-[10px] font-semibold text-[#6B7280] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 hidden sm:inline">
                                                {item.kategori}
                                            </span>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-black text-[#D84040]">
                                                {item.total_peminjaman}
                                            </span>
                                            <span className="text-[10px] font-semibold text-[#6B7280] ml-1">
                                                kali dipinjam
                                            </span>
                                        </div>
                                    </div>

                                    {/* Horizontal Bar Track */}
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[#D84040] to-[#8E1616]"
                                            style={{ width: `${Math.max(percentage, 8)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Footer Summary */}
            <div className="mt-4 pt-3 border-t border-[#E0E0E0]/80 flex items-center justify-between text-[11px] font-semibold text-[#6B7280]">
                <span>Total 5 Barang Terpopuler</span>
                <span className="text-[#D84040] font-bold flex items-center gap-1">
                    <TrendingUp size={12} />
                    Sirkulasi Aktif
                </span>
            </div>
        </div>
    );
}

/**
 * 2. Top Unit Yang Sering Maintenance (Horizontal Bar Chart)
 */
export function TopUnitMaintenanceChart({ data = [] }) {
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const maxVal = Math.max(...data.map((d) => d.total_maintenance || 0), 1);

    return (
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all h-full">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E0E0E0]/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                            <Wrench size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-[#1D1616] leading-tight flex items-center gap-2">
                                Top Unit Sering Maintenance
                            </h3>
                            <p className="text-[11px] font-semibold text-[#6B7280] mt-0.5">
                                Ranking unit fisik berdasarkan riwayat servis & perbaikan
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/unit"
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 transition-colors"
                        title="Lihat Semua Unit"
                    >
                        Semua
                        <ChevronRight size={14} />
                    </Link>
                </div>

                {/* Horizontal Bars List */}
                <div className="mt-5 space-y-4">
                    {data.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400">
                            Belum ada unit yang membutuhkan maintenance.
                        </div>
                    ) : (
                        data.map((item, idx) => {
                            const isHovered = hoveredIdx === idx;
                            const percentage = Math.round((item.total_maintenance / maxVal) * 100);
                            const isMaintenanceNow = item.status === 'maintenance';

                            return (
                                <div
                                    key={item.id || idx}
                                    onMouseEnter={() => setHoveredIdx(idx)}
                                    onMouseLeave={() => setHoveredIdx(null)}
                                    className={`p-2.5 rounded-xl transition-all ${
                                        isHovered ? 'bg-[#EEEEEE]/50 shadow-2xs' : 'hover:bg-[#EEEEEE]/30'
                                    }`}
                                >
                                    {/* Item Info Line */}
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black shrink-0">
                                                {item.rank || idx + 1}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-[#1D1616] bg-[#EEEEEE] px-1.5 py-0.5 rounded border border-[#E0E0E0]">
                                                {item.kode_unit}
                                            </span>
                                            <span className="text-xs font-semibold text-[#1D1616] truncate">
                                                {item.nama_barang}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs font-black text-amber-700">
                                                {item.total_maintenance}x
                                            </span>
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                    isMaintenanceNow
                                                        ? 'bg-rose-50 text-[#D84040] border-rose-200'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}
                                            >
                                                {isMaintenanceNow ? 'Sedang Servis' : 'Aktif'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Horizontal Bar Track */}
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-amber-500 to-amber-600"
                                            style={{ width: `${Math.max(percentage, 8)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Footer Summary */}
            <div className="mt-4 pt-3 border-t border-[#E0E0E0]/80 flex items-center justify-between text-[11px] font-semibold text-[#6B7280]">
                <span>Monitoring Kondisi Unit Fisik</span>
                <span className="text-amber-700 font-bold flex items-center gap-1">
                    <ShieldAlert size={12} />
                    Perlu Inspeksi Rutin
                </span>
            </div>
        </div>
    );
}

/**
 * 3. Statistik Keterlambatan (Line Chart with Hari / Minggu / Bulan toggle)
 */
export function OverdueTrendLineChart({ overdueStats = {} }) {
    const [period, setPeriod] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const data = overdueStats[period] || [];
    const values = data.map((d) => d.count || 0);
    const maxVal = Math.max(...values, 5);
    const minVal = 0;
    const totalCount = values.reduce((sum, v) => sum + v, 0);
    const avgCount = values.length > 0 ? (totalCount / values.length).toFixed(1) : 0;
    const peakIndex = values.indexOf(Math.max(...values));

    // SVG coordinates setup
    const svgWidth = 680;
    const svgHeight = 200;
    const paddingLeft = 40;
    const paddingRight = 25;
    const paddingTop = 25;
    const paddingBottom = 35;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    // Compute coordinate points
    const points = data.map((d, i) => {
        const x =
            data.length > 1
                ? paddingLeft + (i / (data.length - 1)) * chartWidth
                : paddingLeft + chartWidth / 2;
        const normalizedY = maxVal > 0 ? d.count / maxVal : 0;
        const y = paddingTop + chartHeight - normalizedY * chartHeight;
        return { x, y, ...d };
    });

    // Create smooth Bezier curve SVG path
    const generateSmoothPath = (pts) => {
        if (pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const current = pts[i];
            const next = pts[i + 1];
            const controlX = (current.x + next.x) / 2;
            path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
        }
        return path;
    };

    const linePath = generateSmoothPath(points);

    // Area path closing at the bottom
    const areaPath =
        points.length > 0
            ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${
                  paddingTop + chartHeight
              } Z`
            : '';

    const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[peakIndex];

    return (
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs hover:shadow-sm transition-all">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E0E0E0]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-[#D84040] shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-[#1D1616]">
                                Statistik & Tren Keterlambatan
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#D84040] border border-rose-200">
                                Melebihi 24 Jam
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#6B7280] mt-0.5">
                            Grafik tren keterlambatan pengembalian unit workshop berdasarkan rentang waktu
                        </p>
                    </div>
                </div>

                {/* Filter Toggle: Hari, Minggu, Bulan */}
                <div className="flex items-center bg-[#EEEEEE] p-1 rounded-xl border border-[#E0E0E0] self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setPeriod('daily')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            period === 'daily'
                                ? 'bg-white text-[#D84040] shadow-2xs'
                                : 'text-[#6B7280] hover:text-[#1D1616]'
                        }`}
                    >
                        Harian (7 Hari)
                    </button>
                    <button
                        type="button"
                        onClick={() => setPeriod('weekly')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            period === 'weekly'
                                ? 'bg-white text-[#D84040] shadow-2xs'
                                : 'text-[#6B7280] hover:text-[#1D1616]'
                        }`}
                    >
                        Mingguan (4 Minggu)
                    </button>
                    <button
                        type="button"
                        onClick={() => setPeriod('monthly')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            period === 'monthly'
                                ? 'bg-white text-[#D84040] shadow-2xs'
                                : 'text-[#6B7280] hover:text-[#1D1616]'
                        }`}
                    >
                        Bulanan (6 Bulan)
                    </button>
                </div>
            </div>

            {/* Metric KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                <div className="bg-[#EEEEEE]/50 border border-[#E0E0E0]/80 rounded-xl p-3">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280] block">
                        TOTAL TERLAMBAT
                    </span>
                    <span className="text-xl font-black text-[#D84040] mt-0.5 block">
                        {totalCount} Kasus
                    </span>
                </div>
                <div className="bg-[#EEEEEE]/50 border border-[#E0E0E0]/80 rounded-xl p-3">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280] block">
                        RATA-RATA / PERIODE
                    </span>
                    <span className="text-xl font-black text-[#1D1616] mt-0.5 block">
                        {avgCount} / {period === 'daily' ? 'Hari' : period === 'weekly' ? 'Minggu' : 'Bulan'}
                    </span>
                </div>
                <div className="bg-[#EEEEEE]/50 border border-[#E0E0E0]/80 rounded-xl p-3">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280] block">
                        PUNCAK TERTINGGI
                    </span>
                    <span className="text-xl font-black text-[#1D1616] mt-0.5 block">
                        {Math.max(...values, 0)} Kasus
                    </span>
                </div>
                <div className="bg-[#EEEEEE]/50 border border-[#E0E0E0]/80 rounded-xl p-3">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280] block">
                        STATUS SIRKULASI
                    </span>
                    <span className="text-xl font-black text-emerald-700 mt-0.5 block flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        Terkendali
                    </span>
                </div>
            </div>

            {/* Line Chart Area */}
            <div className="relative w-full pt-4 select-none">
                {/* Floating Tooltip */}
                {activePoint && (
                    <div
                        className="absolute -top-3 transform -translate-x-1/2 bg-white border border-[#E0E0E0] shadow-md rounded-xl px-3 py-1.5 z-20 pointer-events-none transition-all duration-150 whitespace-nowrap text-left"
                        style={{
                            left: `${(activePoint.x / svgWidth) * 100}%`,
                        }}
                    >
                        <div className="text-xs font-black text-[#D84040]">
                            {activePoint.count} Keterlambatan
                        </div>
                        <div className="text-[10px] font-medium text-[#6B7280]">
                            {activePoint.date || activePoint.sublabel || activePoint.label}
                        </div>
                    </div>
                )}

                {/* SVG Graph */}
                <div className="w-full overflow-hidden">
                    <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-48 sm:h-56 overflow-visible"
                    >
                        <defs>
                            {/* Gradient Area Fill */}
                            <linearGradient id="overdueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#D84040" stopOpacity="0.30" />
                                <stop offset="85%" stopColor="#D84040" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal Dashed Grid Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                            const y = paddingTop + chartHeight * (1 - ratio);
                            const val = Math.round(maxVal * ratio);
                            return (
                                <g key={i}>
                                    <line
                                        x1={paddingLeft}
                                        y1={y}
                                        x2={svgWidth - paddingRight}
                                        y2={y}
                                        stroke="#E5E7EB"
                                        strokeDasharray="4 4"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={paddingLeft - 8}
                                        y={y + 3.5}
                                        fill="#9CA3AF"
                                        fontSize="10"
                                        fontWeight="600"
                                        textAnchor="end"
                                    >
                                        {val}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Area Fill */}
                        {areaPath && <path d={areaPath} fill="url(#overdueAreaGrad)" />}

                        {/* Smooth Line Curve */}
                        {linePath && (
                            <path
                                d={linePath}
                                fill="none"
                                stroke="#D84040"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Data Points (Circles) */}
                        {points.map((pt, i) => {
                            const isHovered = hoveredIndex === i;
                            const isPeak = i === peakIndex;

                            return (
                                <g
                                    key={i}
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {/* Invisible larger hover target */}
                                    <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                                    {/* Visible Data Point */}
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={isHovered ? 6 : isPeak ? 4.5 : 3.5}
                                        fill="#FFFFFF"
                                        stroke={isHovered ? '#8E1616' : '#D84040'}
                                        strokeWidth={isHovered ? 3 : 2.5}
                                        className="transition-all duration-150"
                                    />

                                    {/* X-Axis Label */}
                                    <text
                                        x={pt.x}
                                        y={paddingTop + chartHeight + 20}
                                        fill={isHovered ? '#1D1616' : '#6B7280'}
                                        fontSize="11"
                                        fontWeight={isHovered ? '700' : '600'}
                                        textAnchor="middle"
                                    >
                                        {pt.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        </div>
    );
}
