import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    BarChart3,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Boxes,
    Package,
    Wrench,
    FileSpreadsheet,
    Printer,
    Search,
    TrendingUp,
    ShieldCheck,
    Layers,
    UserCheck,
    Filter,
    ArrowUpRight,
    HelpCircle,
    Activity
} from 'lucide-react';
import {
    TotalBarangIcon,
    UnitTersediaIcon,
    BarangDipinjamIcon
} from '@/components/DashboardCardIcons';

export default function ReportsIndex({
    filters = {},
    summary = {},
    logbooks = [],
    category_stats = [],
    asset_utilization = [],
    maintenance_reports = [],
    asset_conditions = {}
}) {
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'logbook', 'categories', 'maintenance'
    const [selectedPeriod, setSelectedPeriod] = useState(filters.period || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [logbookSearch, setLogbookSearch] = useState('');
    const [logbookStatusFilter, setLogbookStatusFilter] = useState('all');

    // Handle Period Filter Changes
    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
        if (period !== 'custom') {
            router.get('/admin/reports', {
                period: period,
            }, { preserveState: true, preserveScroll: true });
        }
    };

    const handleCustomFilterSubmit = (e) => {
        if (e) e.preventDefault();
        if (!startDate || !endDate) return;
        router.get('/admin/reports', {
            period: 'custom',
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true, preserveScroll: true });
    };

    // Filter Logbooks locally by search and status
    const filteredLogbooks = logbooks.filter((item) => {
        const matchesSearch =
            item.user_nama.toLowerCase().includes(logbookSearch.toLowerCase()) ||
            item.user_nip.toLowerCase().includes(logbookSearch.toLowerCase()) ||
            item.nama_barang.toLowerCase().includes(logbookSearch.toLowerCase()) ||
            item.kode_unit.toLowerCase().includes(logbookSearch.toLowerCase()) ||
            item.kategori.toLowerCase().includes(logbookSearch.toLowerCase());

        const matchesStatus =
            logbookStatusFilter === 'all' || item.status_transaksi === logbookStatusFilter;

        return matchesSearch && matchesStatus;
    });

    // Export links with current active filters
    const exportQueryString = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedPeriod === 'custom' ? { start_date: startDate, end_date: endDate } : {}),
    }).toString();

    const excelExportUrl = `/admin/reports/export-excel?${exportQueryString}`;
    const pdfExportUrl = `/admin/reports/print-pdf?${exportQueryString}`;

    return (
        <AuthenticatedLayout title="Laporan & Statistik">
            <Head title="Laporan & Statistik - WAMS" />

            <div className="space-y-7 max-w-7xl mx-auto pb-12">
                {/* 1. TOP HEADER & FILTER BAR */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-5 sm:p-6 shadow-2xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        {/* Title Info */}
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#D84040] text-xs font-bold mb-2 border border-rose-200">
                                <BarChart3 size={13} />
                                <span>Rekap Eksekutif & Statistik</span>
                            </div>
                            <h1 className="text-2xl font-black text-[#1D1616] tracking-tight">
                                Laporan & Statistik Sirkulasi
                            </h1>
                            <p className="text-xs text-[#6B7280] font-medium mt-1">
                                Data real-time logbook, utilisasi aset, kesehatan unit fisik, dan riwayat pemeliharaan.
                            </p>
                        </div>

                        {/* Export Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <a
                                href={excelExportUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                                title="Unduh berkas spreadsheet CSV / Excel"
                            >
                                <FileSpreadsheet size={15} />
                                <span>Export Excel</span>
                            </a>

                            <a
                                href={pdfExportUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D1616] hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                                title="Buka format cetak & simpan PDF"
                            >
                                <Printer size={15} />
                                <span>Export PDF / Cetak</span>
                            </a>
                        </div>
                    </div>

                    {/* Filter Period Controls */}
                    <div className="mt-6 pt-5 border-t border-[#E0E0E0] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Quick Period Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-[#EEEEEE]/80 p-1.5 rounded-xl border border-[#E0E0E0]">
                            {[
                                { key: 'all', label: 'Semua Waktu' },
                                { key: 'today', label: 'Hari Ini' },
                                { key: 'week', label: 'Minggu Ini' },
                                { key: 'month', label: 'Bulan Ini' },
                                { key: 'year', label: 'Tahun Ini' },
                                { key: 'custom', label: 'Kustom Tanggal' },
                            ].map((p) => {
                                const isActive = selectedPeriod === p.key;
                                return (
                                    <button
                                        key={p.key}
                                        type="button"
                                        onClick={() => handlePeriodChange(p.key)}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-white text-[#1D1616] shadow-2xs'
                                                : 'text-[#6B7280] hover:text-[#1D1616] hover:bg-white/50'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Date Range Inputs (Only show when selectedPeriod is custom) */}
                        {selectedPeriod === 'custom' && (
                            <form
                                onSubmit={handleCustomFilterSubmit}
                                className="flex flex-wrap items-center gap-2 w-full md:w-auto"
                            >
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-1.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                                    required
                                />
                                <span className="text-xs text-[#6B7280] font-bold">s/d</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-1.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] font-semibold focus:outline-none focus:border-[#D84040]"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                >
                                    Terapkan
                                </button>
                            </form>
                        )}

                        {/* Active Filter Indicator Badge */}
                        <div className="text-xs font-semibold text-[#6B7280] flex items-center gap-1.5 self-end md:self-auto">
                            <span>Filter Aktif:</span>
                            <span className="font-bold text-[#1D1616] bg-[#EEEEEE] px-2.5 py-1 rounded-md border border-[#E0E0E0]">
                                {filters.period_label || 'Semua Periode'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. SECTION 1: RINGKASAN STATISTIK (6 KPI CARDS) */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-base font-extrabold text-[#1D1616]">
                            1. Ringkasan Statistik Utama
                        </h2>
                        <span className="text-[11px] font-semibold text-[#6B7280]">
                            Sirkulasi pada {filters.period_label}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {/* Card 1: Total Peminjaman */}
                        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-[#D84040] shrink-0">
                                <TotalBarangIcon size={22} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl font-black text-[#1D1616] tracking-tight">
                                    {summary.total_peminjaman ?? 0}
                                </h3>
                                <p className="text-[11px] font-bold text-[#6B7280] truncate">
                                    Total Peminjaman
                                </p>
                                <span className="text-[10px] font-medium text-[#D84040]">
                                    Sirkulasi periode
                                </span>
                            </div>
                        </div>

                        {/* Card 2: Total Pengembalian */}
                        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                <CheckCircle2 size={22} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl font-black text-[#1D1616] tracking-tight">
                                    {summary.total_pengembalian ?? 0}
                                </h3>
                                <p className="text-[11px] font-bold text-[#6B7280] truncate">
                                    Total Pengembalian
                                </p>
                                <span className="text-[10px] font-medium text-emerald-600">
                                    Unit kembali aman
                                </span>
                            </div>
                        </div>

                        {/* Card 3: Total Keterlambatan */}
                        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                                <Clock size={22} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl font-black text-[#1D1616] tracking-tight">
                                    {summary.total_keterlambatan ?? 0}
                                </h3>
                                <p className="text-[11px] font-bold text-[#6B7280] truncate">
                                    Keterlambatan
                                </p>
                                <span className="text-[10px] font-medium text-amber-600">
                                    Pinjam &gt; 24 Jam
                                </span>
                            </div>
                        </div>

                        {/* Card 4: Total Unit Fisik */}
                        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                                <Boxes size={22} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl font-black text-[#1D1616] tracking-tight">
                                    {summary.total_unit ?? 0}
                                </h3>
                                <p className="text-[11px] font-bold text-[#6B7280] truncate">
                                    Total Unit Fisik
                                </p>
                                <span className="text-[10px] font-medium text-blue-600">
                                    Aset terdaftar
                                </span>
                            </div>
                        </div>

                        {/* Card 5: Unit Sedang Dipinjam */}
                        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                                <BarangDipinjamIcon size={22} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl font-black text-[#1D1616] tracking-tight">
                                    {summary.unit_dipinjam ?? 0}
                                </h3>
                                <p className="text-[11px] font-bold text-[#6B7280] truncate">
                                    Sedang Dipinjam
                                </p>
                                <span className="text-[10px] font-medium text-purple-600">
                                    Unit di teknisi
                                </span>
                            </div>
                        </div>

                        {/* Card 6: Unit Maintenance */}
                        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-[#D84040] shrink-0">
                                <Wrench size={22} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl font-black text-[#1D1616] tracking-tight">
                                    {summary.unit_maintenance ?? 0}
                                </h3>
                                <p className="text-[11px] font-bold text-[#6B7280] truncate">
                                    Unit Maintenance
                                </p>
                                <span className="text-[10px] font-medium text-[#D84040]">
                                    Perlu perawatan
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SECTION 2: UTILISASI ASET & KONDISI ASET DUA KOLOM */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Top Borrowed Items (Utilisasi Aset) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#D84040]" />
                                        <h3 className="text-base font-extrabold text-[#1D1616]">
                                            Utilisasi Aset (Barang Paling Sering Dipinjam)
                                        </h3>
                                    </div>
                                    <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                                        Peringkat barang berdasarkan frekuensi sirkulasi dan permintaan teknisi
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-[#6B7280] bg-[#EEEEEE] px-2.5 py-1 rounded-lg">
                                    Top Model
                                </span>
                            </div>

                            <div className="space-y-3.5 mt-4">
                                {asset_utilization.slice(0, 5).map((item, idx) => (
                                    <div
                                        key={item.id || idx}
                                        className="p-3.5 rounded-xl border border-[#E0E0E0] bg-white hover:bg-[#FAFAFA] transition-colors"
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="w-6 h-6 rounded-lg bg-[#EEEEEE] flex items-center justify-center text-xs font-black text-[#1D1616] shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-extrabold text-[#1D1616] truncate">
                                                        {item.nama_barang}
                                                    </h4>
                                                    <p className="text-[10px] text-[#6B7280] font-medium">
                                                        {item.kode_barang} &bull; {item.kategori} &bull; Lokasi: {item.lokasi}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <span className="text-xs font-black text-[#1D1616]">
                                                    {item.frekuensi_pinjam} kali
                                                </span>
                                                <span className="text-[10px] font-semibold text-[#6B7280] block">
                                                    {item.active_borrowed}/{item.total_unit} Unit Dipinjam
                                                </span>
                                            </div>
                                        </div>

                                        {/* Utilization Progress Bar */}
                                        <div className="w-full bg-[#EEEEEE] h-2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#D84040] rounded-full transition-all duration-500"
                                                style={{ width: `${Math.max(item.persentase_utilisasi, 5)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {asset_utilization.length === 0 && (
                                    <div className="text-center py-8 text-xs text-[#6B7280]">
                                        Belum ada data utilisasi peminjaman barang untuk periode ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Kondisi Aset Breakdown (Sesuai Nilai Aktual DB) */}
                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <h3 className="text-base font-extrabold text-[#1D1616]">
                                    Kondisi Aset Workshop
                                </h3>
                            </div>
                            <p className="text-xs text-[#6B7280] font-medium">
                                Status kelayakan seluruh {asset_conditions.total ?? 0} unit fisik
                            </p>

                            {/* Multi-segment Distribution Bar */}
                            <div className="mt-5 mb-4">
                                <div className="w-full h-3.5 bg-[#EEEEEE] rounded-full overflow-hidden flex gap-0.5 p-0.5">
                                    <div
                                        className="h-full bg-emerald-500 rounded-l-full transition-all"
                                        style={{ width: `${asset_conditions.baik?.percentage ?? 0}%` }}
                                        title={`Baik: ${asset_conditions.baik?.percentage ?? 0}%`}
                                    />
                                    <div
                                        className="h-full bg-amber-500 transition-all"
                                        style={{ width: `${asset_conditions.maintenance?.percentage ?? 0}%` }}
                                        title={`Maintenance: ${asset_conditions.maintenance?.percentage ?? 0}%`}
                                    />
                                    <div
                                        className="h-full bg-rose-500 rounded-r-full transition-all"
                                        style={{ width: `${asset_conditions.rusak?.percentage ?? 0}%` }}
                                        title={`Rusak: ${asset_conditions.rusak?.percentage ?? 0}%`}
                                    />
                                </div>
                            </div>

                            {/* Breakdown List Items */}
                            <div className="space-y-3 pt-2">
                                {/* Baik */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <div>
                                            <h4 className="text-xs font-bold text-emerald-900">
                                                Kondisi Baik (Layak Pakai)
                                            </h4>
                                            <p className="text-[10px] text-emerald-700 font-medium">
                                                Siap digunakan untuk operasional
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-emerald-900">
                                            {asset_conditions.baik?.count ?? 0} Unit
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-700 block">
                                            {asset_conditions.baik?.percentage ?? 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Maintenance */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                        <div>
                                            <h4 className="text-xs font-bold text-amber-900">
                                                Status Maintenance
                                            </h4>
                                            <p className="text-[10px] text-amber-700 font-medium">
                                                Dalam proses perbaikan berkala
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-amber-900">
                                            {asset_conditions.maintenance?.count ?? 0} Unit
                                        </span>
                                        <span className="text-[10px] font-bold text-amber-700 block">
                                            {asset_conditions.maintenance?.percentage ?? 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Rusak */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                        <div>
                                            <h4 className="text-xs font-bold text-rose-900">
                                                Kondisi Rusak
                                            </h4>
                                            <p className="text-[10px] text-rose-700 font-medium">
                                                Memerlukan penggantian suku cadang
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-rose-900">
                                            {asset_conditions.rusak?.count ?? 0} Unit
                                        </span>
                                        <span className="text-[10px] font-bold text-rose-700 block">
                                            {asset_conditions.rusak?.percentage ?? 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. SECTION 3: STATISTIK KATEGORI BARANG */}
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                                <h3 className="text-base font-extrabold text-[#1D1616]">
                                    3. Statistik per Kategori Barang
                                </h3>
                            </div>
                            <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                                Distribusi unit fisik, ketersediaan, dan frekuensi peminjaman per kategori workshop
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#E0E0E0] bg-[#EEEEEE]/50 text-[11px] font-bold text-[#6B7280]">
                                    <th className="p-3.5 rounded-l-xl">Kategori</th>
                                    <th className="p-3.5 text-center">Model Master</th>
                                    <th className="p-3.5 text-center">Total Unit Fisik</th>
                                    <th className="p-3.5 text-center">Tersedia</th>
                                    <th className="p-3.5 text-center">Sedang Dipinjam</th>
                                    <th className="p-3.5 text-center">Maintenance</th>
                                    <th className="p-3.5 text-center rounded-r-xl">Frekuensi Dipinjam</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0] text-xs">
                                {category_stats.map((cat, idx) => (
                                    <tr key={cat.id || idx} className="hover:bg-[#FAFAFA] transition-colors">
                                        <td className="p-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                    <Layers size={16} />
                                                </div>
                                                <div>
                                                    <span className="font-extrabold text-[#1D1616] block">
                                                        {cat.nama_kategori}
                                                    </span>
                                                    <span className="text-[10px] text-[#6B7280]">
                                                        Pangsa {cat.persentase_utilisasi}% dari total sirkulasi
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3.5 text-center font-bold text-[#1D1616]">
                                            {cat.total_barang} Model
                                        </td>
                                        <td className="p-3.5 text-center font-black text-[#1D1616]">
                                            {cat.total_unit} Unit
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-600 border border-blue-200">
                                                {cat.unit_tersedia}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 text-purple-600 border border-purple-200">
                                                {cat.unit_dipinjam}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-[#D84040] border border-rose-200">
                                                {cat.unit_maintenance}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center font-black text-[#1D1616]">
                                            <span className="text-sm">{cat.frekuensi_pinjam}</span>{' '}
                                            <span className="text-[10px] text-[#6B7280] font-semibold">kali</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. SECTION 4: REKAP LOGBOOK SIRKULASI TRANSAKSI */}
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#1D1616]" />
                                <h3 className="text-base font-extrabold text-[#1D1616]">
                                    4. Rekap Logbook Transaksi Keluar & Masuk
                                </h3>
                            </div>
                            <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                                Catatan riwayat peminjaman dan pengembalian unit fisik oleh teknisi
                            </p>
                        </div>

                        {/* Search and Status Filter */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    value={logbookSearch}
                                    onChange={(e) => setLogbookSearch(e.target.value)}
                                    placeholder="Cari teknisi, NIP, barang, unit..."
                                    className="w-full pl-9 pr-4 py-2 bg-[#EEEEEE]/50 border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040] focus:bg-white transition-all"
                                />
                                <Search size={14} className="absolute left-3 top-2.5 text-[#6B7280]" />
                            </div>

                            <select
                                value={logbookStatusFilter}
                                onChange={(e) => setLogbookStatusFilter(e.target.value)}
                                className="px-3 py-2 bg-[#EEEEEE]/50 border border-[#E0E0E0] rounded-xl text-xs font-bold text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                            >
                                <option value="all">Semua Status</option>
                                <option value="dipinjam">Sedang Dipinjam</option>
                                <option value="dikembalikan">Sudah Dikembalikan</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#E0E0E0] bg-[#EEEEEE]/50 text-[11px] font-bold text-[#6B7280]">
                                    <th className="p-3.5 rounded-l-xl">User / Teknisi</th>
                                    <th className="p-3.5">Barang & Kode Unit</th>
                                    <th className="p-3.5">Waktu Pinjam</th>
                                    <th className="p-3.5">Waktu Kembali</th>
                                    <th className="p-3.5">Durasi</th>
                                    <th className="p-3.5 text-center">Status Aktivitas</th>
                                    <th className="p-3.5 text-center rounded-r-xl">Kondisi Unit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0] text-xs">
                                {filteredLogbooks.map((log) => (
                                    <tr key={log.id} className="hover:bg-[#FAFAFA] transition-colors">
                                        <td className="p-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-[#EEEEEE] text-[#1D1616] font-extrabold text-xs flex items-center justify-center border border-[#E0E0E0]">
                                                    {log.user_nama.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-extrabold text-[#1D1616] block">
                                                        {log.user_nama}
                                                    </span>
                                                    <span className="text-[10px] text-[#6B7280] font-mono">
                                                        NIP: {log.user_nip}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-3.5">
                                            <div>
                                                <span className="font-extrabold text-[#1D1616] block">
                                                    {log.nama_barang}
                                                </span>
                                                <span className="text-[10px] font-bold text-[#D84040] font-mono bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                                    {log.kode_unit}
                                                </span>
                                                <span className="text-[10px] text-[#6B7280] ml-1.5">
                                                    &bull; {log.kategori}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-3.5 font-medium text-[#1D1616]">
                                            {log.tanggal_pinjam_formatted}
                                        </td>

                                        <td className="p-3.5 font-medium text-[#6B7280]">
                                            {log.tanggal_kembali_formatted}
                                        </td>

                                        <td className="p-3.5 font-semibold text-[#1D1616]">
                                            {log.durasi}
                                        </td>

                                        <td className="p-3.5 text-center">
                                            {log.status_transaksi === 'dipinjam' ? (
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                        log.is_terlambat
                                                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                                            : 'bg-amber-100 text-amber-700 border border-amber-300'
                                                    }`}
                                                >
                                                    <Clock size={11} />
                                                    {log.is_terlambat ? 'Terlambat' : 'Dipinjam'}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                                                    <CheckCircle2 size={11} />
                                                    Dikembalikan
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-3.5 text-center">
                                            {log.kondisi_kembali === 'baik' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                                                    Baik
                                                </span>
                                            ) : log.kondisi_kembali === 'rusak' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-[#D84040] border border-rose-200 uppercase">
                                                    Rusak
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {filteredLogbooks.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8 text-xs text-[#6B7280]">
                                            Tidak ada riwayat logbook yang cocok dengan filter pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 6. SECTION 5: LAPORAN MAINTENANCE & UNIT PERBAIKAN */}
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <h3 className="text-base font-extrabold text-[#1D1616]">
                                    5. Laporan Maintenance & Riwayat Perbaikan
                                </h3>
                            </div>
                            <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                                Daftar unit fisik workshop yang sedang dalam status maintenance atau mengalami kerusakan
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#E0E0E0] bg-[#EEEEEE]/50 text-[11px] font-bold text-[#6B7280]">
                                    <th className="p-3.5 rounded-l-xl">Kode Unit</th>
                                    <th className="p-3.5">Nama Barang & Kategori</th>
                                    <th className="p-3.5 text-center">Status Unit</th>
                                    <th className="p-3.5 text-center">Kondisi Fisik</th>
                                    <th className="p-3.5">Terakhir Diperbarui</th>
                                    <th className="p-3.5">Pengguna / Pelapor</th>
                                    <th className="p-3.5 rounded-r-xl">Catatan Perbaikan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0] text-xs">
                                {maintenance_reports.map((m, idx) => (
                                    <tr key={m.id || idx} className="hover:bg-[#FAFAFA] transition-colors">
                                        <td className="p-3.5 font-mono font-bold text-[#D84040]">
                                            <span className="bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                                                {m.kode_unit}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            <span className="font-extrabold text-[#1D1616] block">
                                                {m.nama_barang}
                                            </span>
                                            <span className="text-[10px] text-[#6B7280]">
                                                {m.kode_barang} &bull; {m.kategori}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                <Wrench size={11} />
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                                    m.kondisi === 'baik'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                }`}
                                            >
                                                {m.kondisi}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-[#6B7280] font-medium">
                                            {m.tanggal_update}
                                        </td>
                                        <td className="p-3.5 font-bold text-[#1D1616]">
                                            {m.pelapor_terakhir}
                                        </td>
                                        <td className="p-3.5 text-[#6B7280]">
                                            {m.catatan}
                                        </td>
                                    </tr>
                                ))}

                                {maintenance_reports.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8 text-xs text-emerald-600 font-bold">
                                            Seluruh unit dalam kondisi baik dan tidak ada unit dalam status maintenance.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
