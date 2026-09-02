import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    Plus,
    X,
    User,
    Package,
    Tag,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Layers,
    ArrowRight,
    ExternalLink,
    AlertTriangle,
    Wrench,
    Cpu
} from 'lucide-react';

export default function CalendarIndex({
    initialYear = 2026,
    initialMonth = 10,
    loans = [],
    upcomingLoans = [],
    users = [],
    availableUnits = [],
}) {
    // Current viewed date state
    const [currentDate, setCurrentDate] = useState(new Date(initialYear, initialMonth - 1, 1));
    const [viewMode, setViewMode] = useState('month'); // 'day' | 'week' | 'month'

    // Selected loan for Detail Modal
    const [selectedLoan, setSelectedLoan] = useState(null);

    // Create Modal State
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Form for scheduling a new loan
    const { data, setData, post, processing, reset, errors } = useForm({
        user_id: users.length > 0 ? users[0].id : '',
        barang_unit_id: availableUnits.length > 0 ? availableUnits[0].id : '',
        tanggal_pinjam: new Date().toISOString().slice(0, 16),
        batas_kembali: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    });

    // Sidebar Pagination State (Limit to 5 users/items per page matching reference)
    const [sidebarPage, setSidebarPage] = useState(1);
    const itemsPerPage = 5;

    const totalSidebarPages = Math.max(1, Math.ceil(upcomingLoans.length / itemsPerPage));
    const paginatedUpcomingLoans = useMemo(() => {
        const start = (sidebarPage - 1) * itemsPerPage;
        return upcomingLoans.slice(start, start + itemsPerPage);
    }, [upcomingLoans, sidebarPage]);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed

    const monthNamesEn = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthNamesId = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Navigation handlers
    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const handleToday = () => {
        const now = new Date();
        setCurrentDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    };

    // Calculate calendar grid days for the month (Monday-first)
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

        // Day of week for 1st of month: 0 (Sun) to 6 (Sat)
        // Convert to Monday-first: 0 (Mon) to 6 (Sun)
        let firstDayWeekIndex = firstDayOfMonth.getDay() - 1;
        if (firstDayWeekIndex < 0) firstDayWeekIndex = 6;

        const daysInMonth = lastDayOfMonth.getDate();
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

        const days = [];

        // 1. Previous month trailing days
        for (let i = firstDayWeekIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthLastDay - i;
            const dateObj = new Date(currentYear, currentMonth - 1, dayNum);
            const dateStr = dateObj.toISOString().slice(0, 10);
            days.push({
                day: dayNum,
                date: dateObj,
                dateStr,
                isCurrentMonth: false,
                isPrevMonth: true,
            });
        }

        // 2. Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(currentYear, currentMonth, i);
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                day: i,
                date: dateObj,
                dateStr,
                isCurrentMonth: true,
            });
        }

        // 3. Next month leading days to complete 35 or 42 cells (7 columns)
        const totalCells = days.length > 35 ? 42 : 35;
        const remaining = totalCells - days.length;
        for (let i = 1; i <= remaining; i++) {
            const dateObj = new Date(currentYear, currentMonth + 1, i);
            const dateStr = dateObj.toISOString().slice(0, 10);
            days.push({
                day: i,
                date: dateObj,
                dateStr,
                isCurrentMonth: false,
                isNextMonth: true,
            });
        }

        return days;
    }, [currentYear, currentMonth]);

    // Map loans to specific dates
    const loansByDate = useMemo(() => {
        const map = {};

        loans.forEach((loan) => {
            if (!loan.tanggal_pinjam_date) return;
            const startStr = loan.tanggal_pinjam_date;
            const endStr = loan.batas_kembali_date || startStr;

            const startDate = new Date(startStr);
            const endDate = new Date(endStr);

            // Iterate through every date between start and end (inclusive)
            let curr = new Date(startDate);
            while (curr <= endDate) {
                const dateKey = curr.toISOString().slice(0, 10);
                if (!map[dateKey]) map[dateKey] = [];

                const isStart = dateKey === startStr;
                const isEnd = dateKey === endStr;

                map[dateKey].push({
                    ...loan,
                    isStart,
                    isEnd,
                });

                curr.setDate(curr.getDate() + 1);
            }
        });

        return map;
    }, [loans]);

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post('/admin/calendar/peminjaman', {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            },
        });
    };

    const isTodayDate = (date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    return (
        <AuthenticatedLayout title="Kalender Peminjaman">
            <Head title="Kalender Peminjaman & Jadwal Batas Pengembalian - WAMS" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Outer Layout: Main Calendar (Left) + Upcoming Sidebar (Right) */}
                <div className="flex flex-col xl:flex-row gap-6 items-start">
                    {/* ============================================================ */}
                    {/* MAIN CALENDAR CARD (EXACT STYLE MATCHING REFERENCE IMAGE)     */}
                    {/* ============================================================ */}
                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs flex-1 w-full overflow-hidden">
                        {/* 1. Header Controls Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                            {/* Left: Today Button */}
                            <div>
                                <button
                                    type="button"
                                    onClick={handleToday}
                                    className="px-4 py-1.5 text-xs font-semibold text-[#1D1616] bg-white hover:bg-gray-100 rounded-lg border border-[#E0E0E0] transition-colors shadow-2xs cursor-pointer"
                                >
                                    Today
                                </button>
                            </div>

                            {/* Center: < Month Year > Navigation */}
                            <div className="flex items-center gap-4 self-center">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                                    title="Bulan Sebelumnya"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <h2 className="text-base sm:text-lg font-extrabold text-[#1E293B] tracking-tight">
                                    {monthNamesEn[currentMonth]} {currentYear}
                                </h2>

                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                                    title="Bulan Berikutnya"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Right: View Switcher [Day] [Week] [Month] */}
                            <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0] self-end sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('day')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        viewMode === 'day'
                                            ? 'bg-[#3B82F6] text-white shadow-xs font-bold'
                                            : 'text-[#64748B] hover:text-[#0F172A]'
                                    }`}
                                >
                                    Day
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('week')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        viewMode === 'week'
                                            ? 'bg-[#3B82F6] text-white shadow-xs font-bold'
                                            : 'text-[#64748B] hover:text-[#0F172A]'
                                    }`}
                                >
                                    Week
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('month')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        viewMode === 'month'
                                            ? 'bg-[#3B82F6] text-white shadow-xs font-bold'
                                            : 'text-[#64748B] hover:text-[#0F172A]'
                                    }`}
                                >
                                    Month
                                </button>
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* VIEW MODE 1: MONTH VIEW (REFERENCE IMAGE GRID)               */}
                        {/* ============================================================ */}
                        {viewMode === 'month' && (
                            <div className="mt-4">
                                {/* Week Days Header (MON, TUE, WED, THU, FRI, SAT, SUN) */}
                                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-3 px-1 grid grid-cols-7 text-center mb-2">
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">MON</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">TUE</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">WED</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">THU</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">FRI</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">SAT</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">SUN</span>
                                </div>

                                {/* Calendar 7-Column Grid */}
                                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden grid grid-cols-7 divide-x divide-y divide-[#E2E8F0] bg-[#E2E8F0]">
                                    {calendarDays.map((cell, idx) => {
                                        const dayLoans = loansByDate[cell.dateStr] || [];
                                        const isToday = isTodayDate(cell.date);

                                        return (
                                            <div
                                                key={idx}
                                                className={`min-h-[105px] sm:min-h-[120px] p-2 flex flex-col justify-between transition-colors relative ${
                                                    cell.isCurrentMonth
                                                        ? 'bg-white hover:bg-slate-50/70'
                                                        : 'calendar-striped-cell text-gray-400'
                                                }`}
                                            >
                                                {/* Cell Top Header: Day Number */}
                                                <div className="flex items-center justify-end">
                                                    {isToday ? (
                                                        <span className="w-6 h-6 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                                            {cell.day}
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className={`text-xs font-bold select-none ${
                                                                cell.isCurrentMonth ? 'text-[#1E293B]' : 'text-[#94A3B8]'
                                                            }`}
                                                        >
                                                            {cell.day}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Event Pills Area */}
                                                <div className="space-y-1 my-1 overflow-y-auto max-h-[75px] custom-scrollbar">
                                                    {dayLoans.map((loan) => {
                                                        const theme = loan.theme || {
                                                            bg: '#EDE9FE',
                                                            border: '#7C3AED',
                                                            text: '#5B21B6',
                                                        };

                                                        return (
                                                            <div
                                                                key={`${loan.id}-${cell.dateStr}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedLoan(loan);
                                                                }}
                                                                style={{
                                                                    backgroundColor: theme.bg,
                                                                    borderLeftColor: theme.border,
                                                                    color: theme.text,
                                                                }}
                                                                className="px-2 py-1 rounded-sm border-l-4 text-[10px] font-bold truncate cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xs select-none flex items-center justify-between gap-1"
                                                                title={`Dipinjam: ${loan.nama_barang} (${loan.kode_unit}) oleh ${loan.user_name}\nBatas: ${loan.batas_kembali_formatted}`}
                                                            >
                                                                <span className="truncate leading-tight">
                                                                    {loan.nama_barang}
                                                                </span>
                                                                {loan.isEnd && (
                                                                    <span
                                                                        className="text-[8px] uppercase tracking-wider font-extrabold px-1 py-0.2 rounded bg-black/10 shrink-0"
                                                                        title="Batas Pengembalian"
                                                                    >
                                                                        Batas
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Cell bottom indicator if active loans */}
                                                <div className="h-1.5">
                                                    {dayLoans.length > 0 && cell.isCurrentMonth && (
                                                        <span className="text-[9px] font-bold text-[#64748B] flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                                                            {dayLoans.length} pinjam
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* VIEW MODE 2: WEEK VIEW                                       */}
                        {/* ============================================================ */}
                        {viewMode === 'week' && (
                            <div className="mt-4 border border-[#E2E8F0] rounded-xl overflow-hidden">
                                <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-4 text-center">
                                    <h3 className="text-xs font-bold text-[#1E293B]">
                                        Tampilan Jadwal Mingguan (7 Hari)
                                    </h3>
                                    <p className="text-[11px] text-[#64748B] mt-0.5">
                                        Menampilkan jadwal peminjaman dan batas pengembalian pada minggu ini
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0] bg-white">
                                    {calendarDays.slice(0, 7).map((cell, idx) => {
                                        const dayLoans = loansByDate[cell.dateStr] || [];
                                        const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

                                        return (
                                            <div key={idx} className="p-3 min-h-[220px] flex flex-col justify-start">
                                                <div className="text-center pb-2 border-b border-[#E2E8F0]">
                                                    <span className="text-[11px] font-bold text-[#64748B] block">
                                                        {dayNames[idx]}
                                                    </span>
                                                    <span className="text-base font-extrabold text-[#1E293B]">
                                                        {cell.day} {monthNamesEn[currentMonth].slice(0, 3)}
                                                    </span>
                                                </div>
                                                <div className="mt-3 space-y-2 flex-1">
                                                    {dayLoans.length === 0 ? (
                                                        <span className="text-[10px] text-gray-400 block text-center mt-4">
                                                            Tidak ada jadwal
                                                        </span>
                                                    ) : (
                                                        dayLoans.map((loan) => (
                                                            <div
                                                                key={`${loan.id}-${cell.dateStr}`}
                                                                onClick={() => setSelectedLoan(loan)}
                                                                style={{
                                                                    backgroundColor: loan.theme?.bg,
                                                                    borderLeftColor: loan.theme?.border,
                                                                    color: loan.theme?.text,
                                                                }}
                                                                className="p-2 rounded border-l-4 text-xs font-bold cursor-pointer hover:shadow-xs transition-shadow"
                                                            >
                                                                <p className="truncate">{loan.nama_barang}</p>
                                                                <p className="text-[10px] opacity-80 mt-0.5">
                                                                    Oleh: {loan.user_name}
                                                                </p>
                                                                <span className="text-[9px] block mt-1 font-mono font-bold bg-white/60 px-1 py-0.5 rounded">
                                                                    Batas: {loan.batas_kembali ? loan.batas_kembali.slice(11, 16) : '-'}
                                                                </span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* VIEW MODE 3: DAY VIEW                                        */}
                        {/* ============================================================ */}
                        {viewMode === 'day' && (
                            <div className="mt-4 border border-[#E2E8F0] rounded-xl overflow-hidden bg-white p-6">
                                <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                                    <div>
                                        <h3 className="text-base font-extrabold text-[#1E293B]">
                                            Jadwal Harian: {currentDate.getDate()} {monthNamesId[currentMonth]} {currentYear}
                                        </h3>
                                        <p className="text-xs text-[#64748B] mt-0.5">
                                            Rincian peminjaman aktif dan batas pengembalian barang di tanggal ini
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                                        {(loansByDate[currentDate.toISOString().slice(0, 10)] || []).length} Transaksi Terdata
                                    </span>
                                </div>

                                <div className="mt-4 divide-y divide-[#E2E8F0]">
                                    {(loansByDate[currentDate.toISOString().slice(0, 10)] || []).length === 0 ? (
                                        <div className="py-12 text-center text-xs text-[#64748B]">
                                            Tidak ada peminjaman aktif atau batas pengembalian pada tanggal ini.
                                        </div>
                                    ) : (
                                        (loansByDate[currentDate.toISOString().slice(0, 10)] || []).map((loan) => (
                                            <div
                                                key={loan.id}
                                                onClick={() => setSelectedLoan(loan)}
                                                className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50 px-3 rounded-xl cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        style={{ backgroundColor: loan.theme?.bg, color: loan.theme?.text }}
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                                                    >
                                                        <Package size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-extrabold text-[#1E293B]">
                                                            {loan.nama_barang} ({loan.kode_unit})
                                                        </h4>
                                                        <p className="text-[11px] text-[#64748B] mt-0.5">
                                                            Peminjam: <span className="font-bold text-[#1E293B]">{loan.user_name}</span> • NIP: {loan.user_nip}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-xs font-extrabold text-[#1E293B]">
                                                        Batas: {loan.batas_kembali_formatted}
                                                    </div>
                                                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                                                        loan.status_transaksi === 'dipinjam'
                                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}>
                                                        {loan.status_transaksi === 'dipinjam' ? 'Sedang Dipinjam' : 'Selesai'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ============================================================ */}
                    {/* RIGHT SIDEBAR: "UPCOMING & UP NEXT" PANEL                    */}
                    {/* (MATCHING 'YOU ARE GOING TO' SECTION IN REFERENCE IMAGE)     */}
                    {/* ============================================================ */}
                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-2xs w-full xl:w-88 shrink-0 space-y-5">
                        {/* Top Action Button: + Add New Event / Catat Peminjaman */}
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(true)}
                            className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                            <Plus size={16} />
                            <span>+ Add New Event</span>
                        </button>

                        {/* Title: You are going to / Tenggat Peminjaman */}
                        <div className="pt-2">
                            <h3 className="text-sm font-extrabold text-[#1E293B] tracking-tight">
                                You are going to
                            </h3>
                            <p className="text-[11px] text-[#64748B] mt-0.5">
                                Jadwal sirkulasi dan batas pengembalian terdekat
                            </p>
                        </div>

                        {/* List of upcoming items with avatars matching reference */}
                        <div className="space-y-4">
                            {paginatedUpcomingLoans.length === 0 ? (
                                <div className="py-8 text-center text-xs text-[#64748B]">
                                    Belum ada peminjaman aktif saat ini.
                                </div>
                            ) : (
                                paginatedUpcomingLoans.map((item, idx) => {
                                    // Avatar color presets matching reference image
                                    const avatarColors = [
                                        'bg-purple-500',
                                        'bg-pink-500',
                                        'bg-orange-500',
                                        'bg-blue-500',
                                        'bg-emerald-500',
                                    ];
                                    const avatarBg = avatarColors[idx % avatarColors.length];

                                    return (
                                        <div
                                            key={item.id}
                                            className="p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-slate-50/50 transition-all flex items-start gap-3.5 group cursor-pointer"
                                            onClick={() => {
                                                const found = loans.find((l) => l.id === item.id);
                                                if (found) setSelectedLoan(found);
                                            }}
                                        >
                                            {/* Circular Avatar / Icon */}
                                            <div
                                                className={`w-10 h-10 rounded-full ${avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                                            >
                                                {item.nama_barang ? item.nama_barang.charAt(0) : 'B'}
                                            </div>

                                            {/* Details */}
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-xs font-bold text-[#1E293B] leading-snug truncate group-hover:text-[#3B82F6] transition-colors">
                                                    {item.nama_barang}
                                                </h4>
                                                <p className="text-[11px] font-semibold text-[#64748B] mt-0.5">
                                                    Batas: {item.batas_kembali}
                                                </p>
                                                <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                                                    {item.kode_unit} • {item.lokasi}
                                                </p>

                                                {/* Mini User Tag */}
                                                <div className="mt-2 flex items-center gap-1.5">
                                                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-[9px] font-black flex items-center justify-center">
                                                        {item.user_name.slice(0, 2).toUpperCase()}
                                                    </span>
                                                    <span className="text-[11px] font-semibold text-[#1E293B] truncate">
                                                        {item.user_name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Pagination (Matching Image 2: [1] 2 ...) */}
                        {totalSidebarPages > 1 && (
                            <div className="pt-2 flex items-center justify-center gap-2 select-none">
                                {Array.from({ length: totalSidebarPages }, (_, i) => i + 1).map((pageNum) => {
                                    const isActive = sidebarPage === pageNum;
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            onClick={() => setSidebarPage(pageNum)}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-[#F4F4F5] border border-[#E4E4E7] text-[#18181B] shadow-2xs'
                                                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F4F5]'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Bottom Link: See More / Lihat Semua Logbook */}
                        <div className="pt-3 border-t border-[#E0E0E0]">
                            <Link
                                href="/admin/logbook"
                                className="w-full py-2 px-3 text-xs font-bold text-[#64748B] hover:text-[#1E293B] bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                            >
                                <span>See More Logbook</span>
                                <ArrowRight size={13} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================ */}
            {/* DETAIL MODAL: SIAPA MEMINJAM & KAPAN BATAS PENGEMBALIAN       */}
            {/* ============================================================ */}
            {selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8 border border-gray-100">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <span
                                    className={`w-3 h-3 rounded-full ${
                                        selectedLoan.status_transaksi === 'dipinjam'
                                            ? selectedLoan.is_overdue
                                                ? 'bg-rose-500'
                                                : 'bg-amber-500'
                                            : 'bg-emerald-500'
                                    }`}
                                />
                                <h3 className="text-base font-extrabold text-[#1E293B]">
                                    Rincian Jadwal Peminjaman
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedLoan(null)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body Details */}
                        <div className="mt-5 space-y-4">
                            {/* Barang Info Card */}
                            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex items-start gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#3B82F6] shrink-0 font-black">
                                    <Package size={22} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-extrabold text-[#1E293B]">
                                        {selectedLoan.nama_barang}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-800">
                                            {selectedLoan.kode_unit}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium">
                                            • Kategori: {selectedLoan.nama_kategori}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                                        <MapPin size={12} className="text-[#3B82F6]" />
                                        {selectedLoan.lokasi}
                                    </p>
                                </div>
                            </div>

                            {/* Peminjam Info (Siapa yang meminjam) */}
                            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block mb-1">
                                    Informasi Peminjam
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                                        {selectedLoan.user_name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-blue-950">
                                            {selectedLoan.user_name}
                                        </p>
                                        <p className="text-xs text-blue-800 font-semibold">
                                            NIP: {selectedLoan.user_nip}
                                        </p>
                                        <p className="text-[11px] text-blue-600">
                                            {selectedLoan.user_email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Peminjaman & Batas Waktu */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                                        Tanggal Pinjam
                                    </span>
                                    <span className="text-xs font-extrabold text-[#1E293B] block mt-1">
                                        {selectedLoan.tanggal_pinjam_formatted}
                                    </span>
                                </div>

                                <div className={`border rounded-xl p-3 ${
                                    selectedLoan.is_overdue
                                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                                        : 'bg-amber-50 border-amber-200 text-amber-900'
                                }`}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                                        Batas Pengembalian
                                    </span>
                                    <span className="text-xs font-extrabold block mt-1">
                                        {selectedLoan.batas_kembali_formatted}
                                    </span>
                                </div>
                            </div>

                            {/* Status Transaksi */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                                <span className="font-semibold text-gray-600">Status Sirkulasi:</span>
                                <span className={`inline-flex items-center gap-1 font-bold px-3 py-1 rounded-full ${
                                    selectedLoan.status_transaksi === 'dipinjam'
                                        ? selectedLoan.is_overdue
                                            ? 'bg-rose-100 text-rose-800'
                                            : 'bg-amber-100 text-amber-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                    {selectedLoan.status_transaksi === 'dipinjam' ? (
                                        selectedLoan.is_overdue ? (
                                            <>
                                                <AlertTriangle size={12} /> Terlambat
                                            </>
                                        ) : (
                                            <>
                                                <Clock size={12} /> Sedang Dipinjam
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <CheckCircle2 size={12} /> Selesai Dikembalikan
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setSelectedLoan(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Tutup
                            </button>
                            <Link
                                href="/admin/logbook"
                                className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                            >
                                Buka di Logbook
                                <ExternalLink size={13} />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODAL: CATAT / JADWALKAN PEMINJAMAN BARU KE KALENDER         */}
            {/* ============================================================ */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl my-8 border border-gray-100">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-extrabold text-[#1E293B]">
                                    Catat / Jadwalkan Peminjaman
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Tambahkan jadwal peminjaman baru ke kalender admin
                                </p>
                            </div>
                            <button
                                onClick={() => setCreateModalOpen(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                            {/* Pilih Peminjam (User) */}
                            <div>
                                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                                    Pilih Peminjam (Teknisi / User)
                                </label>
                                <select
                                    value={data.user_id}
                                    onChange={(e) => setData('user_id', e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:border-[#3B82F6]"
                                >
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nama} (NIP: {u.nip || '-'})
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && <p className="text-rose-500 text-xs mt-1">{errors.user_id}</p>}
                            </div>

                            {/* Pilih Unit Barang */}
                            <div>
                                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                                    Unit Fisik Barang (Status: Tersedia)
                                </label>
                                {availableUnits.length === 0 ? (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                                        Tidak ada unit barang berstatus tersedia saat ini.
                                    </div>
                                ) : (
                                    <select
                                        value={data.barang_unit_id}
                                        onChange={(e) => setData('barang_unit_id', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:border-[#3B82F6]"
                                    >
                                        {availableUnits.map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.kode_unit} - {unit.nama_barang}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {errors.barang_unit_id && (
                                    <p className="text-rose-500 text-xs mt-1">{errors.barang_unit_id}</p>
                                )}
                            </div>

                            {/* Tanggal & Waktu Pinjam */}
                            <div>
                                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                                    Tanggal & Jam Pinjam
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.tanggal_pinjam}
                                    onChange={(e) => setData('tanggal_pinjam', e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:border-[#3B82F6]"
                                />
                                {errors.tanggal_pinjam && (
                                    <p className="text-rose-500 text-xs mt-1">{errors.tanggal_pinjam}</p>
                                )}
                            </div>

                            {/* Batas Pengembalian */}
                            <div>
                                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                                    Batas Pengembalian (Tenggat Waktu)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.batas_kembali}
                                    onChange={(e) => setData('batas_kembali', e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:border-[#3B82F6]"
                                />
                                {errors.batas_kembali && (
                                    <p className="text-rose-500 text-xs mt-1">{errors.batas_kembali}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || availableUnits.length === 0}
                                    className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                                >
                                    {processing ? 'Menjadwalkan...' : 'Simpan ke Kalender'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
