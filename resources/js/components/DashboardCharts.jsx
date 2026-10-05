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
                        title="Lihat Barang"
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
                                    className={`p-2.5 rounded-xl transition-all ${isHovered ? 'bg-[#EEEEEE]/50 shadow-2xs' : 'hover:bg-[#EEEEEE]/30'
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
                        href="/admin/barang"
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 transition-colors"
                        title="Lihat Semua Barang"
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
                                    className={`p-2.5 rounded-xl transition-all ${isHovered ? 'bg-[#EEEEEE]/50 shadow-2xs' : 'hover:bg-[#EEEEEE]/30'
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
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isMaintenanceNow
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
 * 3. Statistik Keterlambatan (Smooth Spline Wave Chart - Full Width Responsive)
 */
export function OverdueTrendLineChart({ overdueStats = {} }) {
    const [period, setPeriod] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const data = overdueStats[period] || [];
    const values = data.map((d) => d.count || 0);
    const maxVal = Math.max(...values, 5);
    const totalCount = values.reduce((sum, v) => sum + v, 0);
    const avgCount = values.length > 0 ? (totalCount / values.length).toFixed(1) : 0;

    // SVG coordinates setup: Canvas 1000 units with preserveAspectRatio="none"
    const svgWidth = 1000;
    const svgHeight = 175;
    const paddingLeft = 16;
    const paddingRight = 16;
    const paddingTop = 22;
    const paddingBottom = 16;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;
    const baselineY = paddingTop + chartHeight;

    // Compute coordinate points stretching across full width
    const points = data.map((d, i) => {
        const x =
            data.length > 1
                ? paddingLeft + (i / (data.length - 1)) * chartWidth
                : paddingLeft + chartWidth / 2;
        const normalizedY = maxVal > 0 ? d.count / maxVal : 0;
        const y = baselineY - normalizedY * (chartHeight * 0.85);
        return { x, y, index: i, ...d };
    });

    // Catmull-Rom Spline to Cubic Bezier curve for fluid, rounded wave crests and troughs
    const generateSplinePath = (pts, tension = 0.82) => {
        if (!pts || pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

        let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        const n = pts.length;

        for (let i = 0; i < n - 1; i++) {
            const pPrev = i > 0 ? pts[i - 1] : { x: pts[0].x - (pts[1].x - pts[0].x) * 0.5, y: pts[0].y };
            const pCurr = pts[i];
            const pNext = pts[i + 1];
            const pAfter = i + 2 < n ? pts[i + 2] : { x: pNext.x + (pNext.x - pCurr.x) * 0.5, y: pNext.y };

            const c1x = pCurr.x + (pNext.x - pPrev.x) * (tension / 6);
            let c1y = pCurr.y + (pNext.y - pPrev.y) * (tension / 6);

            const c2x = pNext.x - (pAfter.x - pCurr.x) * (tension / 6);
            let c2y = pNext.y - (pAfter.y - pCurr.y) * (tension / 6);

            // Clamp so control points don't dip below baseline or overshoot upper bounds
            c1y = Math.min(baselineY, Math.max(paddingTop - 15, c1y));
            c2y = Math.min(baselineY, Math.max(paddingTop - 15, c2y));

            path += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${pNext.x.toFixed(2)} ${pNext.y.toFixed(2)}`;
        }
        return path;
    };

    const linePath = generateSplinePath(points);

    // Area path closed cleanly at the bottom baseline
    const areaPath =
        points.length > 0
            ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`
            : '';

    // Guideline threshold line Y (around 72% height of chart)
    const thresholdY = paddingTop + chartHeight * 0.28;

    const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

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
                                Monitoring 24 Jam
                            </span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#6B7280] mt-0.5">
                            Grafik tren fluktuasi keterlambatan pengembalian unit workshop berdasarkan rentang waktu
                        </p>
                    </div>
                </div>

                {/* Filter Toggle: Hari, Minggu, Bulan */}
                <div className="flex items-center bg-[#EEEEEE] p-1 rounded-xl border border-[#E0E0E0] self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setPeriod('daily')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 mb-3">
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

            {/* Line Chart Area - Full Width with Zero Side Wastage */}
            <div className="relative w-full pt-4 select-none">
                {/* Floating Tooltip */}
                {activePoint && (
                    <div
                        className="absolute -top-3 bg-white border border-rose-200 shadow-lg shadow-rose-500/10 rounded-xl px-3 py-1.5 z-20 pointer-events-none transition-all duration-150 whitespace-nowrap text-left"
                        style={{
                            left: `${(activePoint.x / svgWidth) * 100}%`,
                            transform:
                                hoveredIndex === 0
                                    ? 'translateX(0%)'
                                    : hoveredIndex === points.length - 1
                                    ? 'translateX(-100%)'
                                    : 'translateX(-50%)',
                        }}
                    >
                        <div className="text-xs font-black text-[#D84040] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D84040]" />
                            {activePoint.count} Keterlambatan
                        </div>
                        <div className="text-[10px] font-medium text-[#6B7280]">
                            {activePoint.date || activePoint.sublabel || activePoint.label}
                        </div>
                    </div>
                )}

                {/* SVG Graph stretching edge-to-edge with preserveAspectRatio="none" */}
                <div className="w-full">
                    <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        preserveAspectRatio="none"
                        className="w-full h-44 sm:h-52 overflow-visible"
                    >
                        <defs>
                            {/* Smooth Coral Red Gradient Area Fill matching WAMS palette */}
                            <linearGradient id="overdueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#D84040" stopOpacity="0.32" />
                                <stop offset="45%" stopColor="#D84040" stopOpacity="0.12" />
                                <stop offset="98%" stopColor="#D84040" stopOpacity="0.00" />
                            </linearGradient>
                        </defs>

                        {/* Single Horizontal Dashed Guideline running edge-to-edge */}
                        <line
                            x1={0}
                            y1={thresholdY}
                            x2={svgWidth}
                            y2={thresholdY}
                            stroke="#CBD5E1"
                            strokeDasharray="5 5"
                            strokeWidth="1.2"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* Area Fill */}
                        {areaPath && <path d={areaPath} fill="url(#overdueAreaGrad)" />}

                        {/* Smooth Red Spline Curve Line */}
                        {linePath && (
                            <path
                                d={linePath}
                                fill="none"
                                stroke="#D84040"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        {/* Interactive Hover Columns & Active Indicator */}
                        {points.map((pt, i) => {
                            const isHovered = hoveredIndex === i;
                            const colWidth = svgWidth / points.length;
                            const colX = i === 0 ? 0 : pt.x - colWidth / 2;

                            return (
                                <g
                                    key={i}
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {/* Invisible wide hover column target */}
                                    <rect
                                        x={colX}
                                        y={0}
                                        width={colWidth}
                                        height={svgHeight}
                                        fill="transparent"
                                    />

                                    {/* Vertical dashed guide line on hover */}
                                    {isHovered && (
                                        <line
                                            x1={pt.x}
                                            y1={pt.y}
                                            x2={pt.x}
                                            y2={baselineY}
                                            stroke="#FCA5A5"
                                            strokeDasharray="3 3"
                                            strokeWidth="1.5"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    )}

                                    {/* Active Point Halo & Circle on Hover */}
                                    {isHovered && (
                                        <>
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r="12"
                                                fill="#D84040"
                                                fillOpacity="0.22"
                                            />
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r="5"
                                                fill="#D84040"
                                                stroke="#FFFFFF"
                                                strokeWidth="2.5"
                                            />
                                        </>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Clean X-Axis Labels Row Aligned Full Width */}
                    <div className="flex justify-between items-center pt-3 px-2 sm:px-3 select-none">
                        {points.map((pt, i) => (
                            <button
                                key={i}
                                type="button"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className={`text-xs font-semibold transition-all cursor-pointer ${
                                    hoveredIndex === i
                                        ? 'text-[#D84040] font-bold scale-105'
                                        : 'text-[#6B7280] hover:text-[#1D1616]'
                                }`}
                            >
                                {pt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
