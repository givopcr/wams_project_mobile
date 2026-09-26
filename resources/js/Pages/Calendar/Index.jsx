import React, { useState, useMemo, useEffect } from 'react';
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
    Cpu,
    Radio
} from 'lucide-react';

export default function CalendarIndex({
    initialYear,
    initialMonth,
    loans = [],
    upcomingLoans = [],
    users = [],
    availableUnits = [],
}) {
    // Current viewed date state initialized to today's date
    const [currentDate, setCurrentDate] = useState(() => {
        if (initialYear && initialMonth) {
            return new Date(initialYear, initialMonth - 1, new Date().getDate());
        }
        return new Date();
    });
    const [viewMode, setViewMode] = useState('month'); // 'day' | 'week' | 'month'
    const [currentTime, setCurrentTime] = useState(Date.now());

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

    // Real-Time Live Clock Ticker & Periodic Data Refresh
    useEffect(() => {
        // Live second ticker
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        // Background polling every 10s to sync calendar with any live transactions
        const pollInterval = setInterval(() => {
            router.reload({
                only: ['loans', 'upcomingLoans'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 10000);

        return () => {
            clearInterval(timer);
            clearInterval(pollInterval);
        };
    }, []);

    // Timezone-safe date parsing helpers to eliminate UTC offset bugs
    const parseLocalDate = (str) => {
        if (!str) return null;
        const datePart = str.slice(0, 10);
        const parts = datePart.split('-');
        if (parts.length < 3) return null;
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    };

    const formatLocalYmd = (date) => {
        if (!date) return '';
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

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
            const dateStr = formatLocalYmd(dateObj);
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
            const dateStr = formatLocalYmd(dateObj);
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
            const dateStr = formatLocalYmd(dateObj);
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

    // Current week days (7 days of the active week containing currentDate)
    const currentWeekDays = useMemo(() => {
        const d = new Date(currentDate);
        let dayIndex = d.getDay() - 1;
        if (dayIndex < 0) dayIndex = 6;

        const monday = new Date(d);
        monday.setDate(d.getDate() - dayIndex);

        const week = [];
        for (let i = 0; i < 7; i++) {
            const dayObj = new Date(monday);
            dayObj.setDate(monday.getDate() + i);
            const dateStr = formatLocalYmd(dayObj);
            week.push({
                day: dayObj.getDate(),
                date: dayObj,
                dateStr,
                isCurrentMonth: dayObj.getMonth() === currentMonth,
            });
        }
        return week;
    }, [currentDate, currentMonth]);

    // Map loans to specific dates with accurate real-time tracking span
    const loansByDate = useMemo(() => {
        const map = {};
        const todayYmd = formatLocalYmd(new Date(currentTime));

        loans.forEach((loan) => {
            if (!loan.tanggal_pinjam_date) return;
            const startStr = loan.tanggal_pinjam_date;
            const batasStr = loan.batas_kembali_date || startStr;
            const isReturned = loan.status_transaksi === 'dikembalikan';
            const kembaliStr = loan.tanggal_kembali_date;

            const startDate = parseLocalDate(startStr);
            if (!startDate) return;

            // Accurate tracking span:
            // - If returned: spans to max(batas_kembali, tanggal_kembali)
            // - If still borrowed: spans to max(batas_kembali, today) so overdue continues live tracking up to now!
            let endDate;
            if (isReturned) {
                const returnedDate = parseLocalDate(kembaliStr);
                const batasDate = parseLocalDate(batasStr);
                endDate = (returnedDate && batasDate && returnedDate > batasDate) ? returnedDate : (batasDate || startDate);
            } else {
                const batasDate = parseLocalDate(batasStr);
                const todayDate = parseLocalDate(todayYmd);
                if (batasDate && todayDate && todayDate > batasDate) {
                    endDate = todayDate;
                } else {
                    endDate = batasDate || startDate;
                }
            }

            let curr = new Date(startDate);
            while (curr <= endDate) {
                const dateKey = formatLocalYmd(curr);
                if (!map[dateKey]) map[dateKey] = [];

                const isStart = dateKey === startStr;
                const isDeadlineDay = dateKey === batasStr;
                const isReturnDay = isReturned && dateKey === kembaliStr;
                const isPastDeadline = batasStr && dateKey > batasStr;

                map[dateKey].push({
                    ...loan,
                    isStart,
                    isDeadlineDay,
                    isReturnDay,
                    isPastDeadline,
                    dateKey,
                });

                curr.setDate(curr.getDate() + 1);
            }
        });

        return map;
    }, [loans, currentTime]);

    // Color definitions matching user specification:
    // Biru : hari User meminjam, batas hari user meminjam
    // Hijau : User mengembalikan secara tepat waktu/ kurang dari waktu yang ditentukan
    // Merah : Ketika user melebihi waktu peminjaman, dan icon dari batas hari peminjaman user akan berubah merah ketika melewatinya
    const STATUS_THEMES = {
        blue: {
            bg: '#EFF6FF',
            border: '#2563EB',
            text: '#1D4ED8',
            badgeBg: '#DBEAFE',
            badgeText: '#1E40AF',
            dot: '#3B82F6',
            isBlue: true,
        },
        green: {
            bg: '#ECFDF5',
            border: '#10B981',
            text: '#047857',
            badgeBg: '#D1FAE5',
            badgeText: '#065F46',
            dot: '#10B981',
            isGreen: true,
        },
        red: {
            bg: '#FEF2F2',
            border: '#DC2626',
            text: '#B91C1C',
            badgeBg: '#FEE2E2',
            badgeText: '#991B1B',
            dot: '#DC2626',
            isRed: true,
        },
    };

    const getLoanDayTheme = (loan, dateKey, isStart, isDeadlineDay) => {
        const isReturned = loan.status_transaksi === 'dikembalikan';

        // 1. Hijau: User mengembalikan secara tepat waktu / kurang dari waktu yang ditentukan
        if (isReturned) {
            const batasTime = loan.batas_kembali ? new Date(loan.batas_kembali).getTime() : null;
            const kembaliTime = loan.tanggal_kembali ? new Date(loan.tanggal_kembali).getTime() : null;
            const isLateReturn = batasTime && kembaliTime && kembaliTime > batasTime;

            if (isLateReturn) {
                // Jika dikembalikan tapi melewati batas waktu, hari batas & hari telat diberi warna Merah
                if (loan.batas_kembali_date && dateKey >= loan.batas_kembali_date) {
                    return STATUS_THEMES.red;
                }
                return STATUS_THEMES.blue;
            }

            // Dikembalikan tepat waktu / lebih awal -> Hijau
            return STATUS_THEMES.green;
        }

        // 2 & 3: Sedang Dipinjam
        const batasTime = loan.batas_kembali ? new Date(loan.batas_kembali).getTime() : null;
        const now = currentTime || Date.now();
        const isPastDeadline = loan.is_overdue || (batasTime && now > batasTime);

        if (isPastDeadline) {
            // Merah: Ketika user melebihi waktu peminjaman, dan icon dari batas hari peminjaman user akan berubah merah ketika melewatinya
            if (loan.batas_kembali_date && dateKey >= loan.batas_kembali_date) {
                return STATUS_THEMES.red;
            }
            // Hari User meminjam & hari sebelum melewati batas: Biru
            return STATUS_THEMES.blue;
        }

        // Biru: Hari User meminjam, batas hari user meminjam (belum melewati waktu)
        return STATUS_THEMES.blue;
    };

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
        if (!date) return false;
        const now = new Date(currentTime);
        return (
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
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
                            {/* Left: Hari Ini Button & Live Indicator */}
                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleToday}
                                    className="px-3.5 py-1.5 text-xs font-bold text-[#1D1616] bg-white hover:bg-gray-100 rounded-lg border border-[#E0E0E0] transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                                >
                                    <Clock size={13} className="text-[#3B82F6]" />
                                    <span>Hari Ini</span>
                                </button>

                                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-lg text-emerald-800 text-[11px] font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                    <span>Real-Time: {new Date(currentTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB</span>
                                </div>
                            </div>

                            {/* Center: < Navigation > */}
                            <div className="flex items-center gap-4 self-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (viewMode === 'day') {
                                            const d = new Date(currentDate);
                                            d.setDate(d.getDate() - 1);
                                            setCurrentDate(d);
                                        } else if (viewMode === 'week') {
                                            const d = new Date(currentDate);
                                            d.setDate(d.getDate() - 7);
                                            setCurrentDate(d);
                                        } else {
                                            handlePrevMonth();
                                        }
                                    }}
                                    className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                                    title="Sebelumnya"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <h2 className="text-base sm:text-lg font-extrabold text-[#1E293B] tracking-tight">
                                    {viewMode === 'day' ? (
                                        `${currentDate.getDate()} ${monthNamesId[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                                    ) : viewMode === 'week' ? (
                                        `${currentWeekDays[0]?.day} - ${currentWeekDays[6]?.day} ${monthNamesId[currentMonth]} ${currentYear}`
                                    ) : (
                                        `${monthNamesId[currentMonth]} ${currentYear}`
                                    )}
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (viewMode === 'day') {
                                            const d = new Date(currentDate);
                                            d.setDate(d.getDate() + 1);
                                            setCurrentDate(d);
                                        } else if (viewMode === 'week') {
                                            const d = new Date(currentDate);
                                            d.setDate(d.getDate() + 7);
                                            setCurrentDate(d);
                                        } else {
                                            handleNextMonth();
                                        }
                                    }}
                                    className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                                    title="Berikutnya"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Right: View Switcher [Hari] [Minggu] [Bulan] */}
                            <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0] self-end sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('day')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${viewMode === 'day'
                                            ? 'bg-[#3B82F6] text-white shadow-xs font-bold'
                                            : 'text-[#64748B] hover:text-[#0F172A]'
                                        }`}
                                >
                                    Hari
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('week')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${viewMode === 'week'
                                            ? 'bg-[#3B82F6] text-white shadow-xs font-bold'
                                            : 'text-[#64748B] hover:text-[#0F172A]'
                                        }`}
                                >
                                    Minggu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('month')}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${viewMode === 'month'
                                            ? 'bg-[#3B82F6] text-white shadow-xs font-bold'
                                            : 'text-[#64748B] hover:text-[#0F172A]'
                                        }`}
                                >
                                    Bulan
                                </button>
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* VIEW MODE 1: MONTH VIEW (REFERENCE IMAGE GRID)               */}
                        {/* ============================================================ */}
                        {viewMode === 'month' && (
                            <div className="mt-4">
                                {/* Week Days Header (SEN, SEL, RAB, KAM, JUM, SAB, MIN) */}
                                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-3 px-1 grid grid-cols-7 text-center mb-2">
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">SEN</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">SEL</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">RAB</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">KAM</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">JUM</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">SAB</span>
                                    <span className="text-[11px] font-extrabold tracking-wider text-[#64748B]">MIN</span>
                                </div>

                                {/* Calendar 7-Column Grid */}
                                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden grid grid-cols-7 divide-x divide-y divide-[#E2E8F0] bg-[#E2E8F0]">
                                    {calendarDays.map((cell, idx) => {
                                        const dayLoans = loansByDate[cell.dateStr] || [];
                                        const isToday = isTodayDate(cell.date);

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setCurrentDate(cell.date);
                                                }}
                                                className={`min-h-[105px] sm:min-h-[120px] p-2 flex flex-col justify-between transition-colors relative min-w-0 overflow-hidden cursor-pointer ${cell.isCurrentMonth
                                                        ? 'bg-white hover:bg-slate-50/70'
                                                        : 'calendar-striped-cell text-gray-400'
                                                    }`}
                                            >
                                                {/* Cell Top Header: Day Number */}
                                                <div className="flex items-center justify-end">
                                                    {isToday ? (
                                                        <span className="w-6 h-6 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs font-bold shadow-xs ring-2 ring-blue-300">
                                                            {cell.day}
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className={`text-xs font-bold select-none ${cell.isCurrentMonth ? 'text-[#1E293B]' : 'text-[#94A3B8]'
                                                                }`}
                                                        >
                                                            {cell.day}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Event Pills Area (overflow-x-hidden ensures no horizontal sliding scrollbar) */}
                                                <div className="space-y-1 my-1 overflow-y-auto overflow-x-hidden max-h-[75px] custom-scrollbar">
                                                    {dayLoans.map((loan) => {
                                                        const theme = getLoanDayTheme(loan, cell.dateStr, loan.isStart, loan.isDeadlineDay);

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
                                                                className="w-full overflow-hidden px-1.5 py-1 rounded-sm border-l-4 text-[10px] font-bold cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xs select-none flex items-center justify-between gap-1"
                                                                title={`Dipinjam: ${loan.nama_barang} (${loan.kode_unit}) oleh ${loan.user_name}\nBatas: ${loan.batas_kembali_formatted}`}
                                                            >
                                                                <span className="truncate min-w-0 flex-1 leading-tight">
                                                                    {loan.nama_barang}
                                                                </span>
                                                                {loan.isReturnDay ? (
                                                                    <span
                                                                        style={{
                                                                            backgroundColor: theme.badgeBg,
                                                                            color: theme.badgeText,
                                                                        }}
                                                                        className="text-[8px] uppercase tracking-wider font-extrabold px-1 py-0.2 rounded shrink-0 whitespace-nowrap shadow-2xs"
                                                                        title={theme.isGreen ? 'Telah Dikembalikan Tepat Waktu' : 'Dikembalikan Melewati Batas'}
                                                                    >
                                                                        Kembali
                                                                    </span>
                                                                ) : loan.isDeadlineDay ? (
                                                                    <span
                                                                        style={{
                                                                            backgroundColor: theme.badgeBg,
                                                                            color: theme.badgeText,
                                                                        }}
                                                                        className="text-[8px] uppercase tracking-wider font-extrabold px-1 py-0.2 rounded shrink-0 whitespace-nowrap shadow-2xs"
                                                                        title={theme.isRed ? 'Melebihi Batas Waktu' : 'Batas Pengembalian'}
                                                                    >
                                                                        Batas
                                                                    </span>
                                                                ) : loan.isPastDeadline ? (
                                                                    <span
                                                                        style={{
                                                                            backgroundColor: theme.badgeBg,
                                                                            color: theme.badgeText,
                                                                        }}
                                                                        className="text-[8px] uppercase tracking-wider font-extrabold px-1 py-0.2 rounded shrink-0 whitespace-nowrap shadow-2xs"
                                                                        title="Terlambat / Melebihi Batas Waktu"
                                                                    >
                                                                        Terlambat
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Cell bottom indicator if active loans */}
                                                <div className="h-1.5">
                                                    {dayLoans.length > 0 && cell.isCurrentMonth && (
                                                        <span className="text-[9px] font-bold text-[#64748B] flex items-center gap-1">
                                                            <span
                                                                style={{
                                                                    backgroundColor: dayLoans.some((l) => getLoanDayTheme(l, cell.dateStr, l.isStart, l.isDeadlineDay).isRed)
                                                                        ? '#DC2626'
                                                                        : dayLoans.every((l) => getLoanDayTheme(l, cell.dateStr, l.isStart, l.isDeadlineDay).isGreen)
                                                                        ? '#10B981'
                                                                        : '#2563EB',
                                                                }}
                                                                className="w-1.5 h-1.5 rounded-full"
                                                            />
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
                        {/* VIEW MODE 2: MINGGU VIEW (REAL-TIME WEEK CONTAINER)           */}
                        {/* ============================================================ */}
                        {viewMode === 'week' && (
                            <div className="mt-4 border border-[#E2E8F0] rounded-xl overflow-hidden">
                                <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-4 text-center">
                                    <h3 className="text-xs font-bold text-[#1E293B]">
                                        Tampilan Jadwal Mingguan (7 Hari Berjalan)
                                    </h3>
                                    <p className="text-[11px] text-[#64748B] mt-0.5">
                                        Menampilkan jadwal peminjaman dan batas pengembalian pada minggu ini
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0] bg-white">
                                    {currentWeekDays.map((cell, idx) => {
                                        const dayLoans = loansByDate[cell.dateStr] || [];
                                        const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
                                        const isToday = isTodayDate(cell.date);

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => setCurrentDate(cell.date)}
                                                className={`p-3 min-h-[220px] flex flex-col justify-start transition-colors cursor-pointer ${
                                                    isToday ? 'bg-blue-50/25' : 'hover:bg-slate-50/50'
                                                }`}
                                            >
                                                <div className="text-center pb-2 border-b border-[#E2E8F0]">
                                                    <span className="text-[11px] font-bold text-[#64748B] block">
                                                        {dayNames[idx]}
                                                    </span>
                                                    <div className="flex items-center justify-center gap-1 mt-0.5">
                                                        <span className={`text-base font-extrabold ${isToday ? 'text-[#3B82F6]' : 'text-[#1E293B]'}`}>
                                                            {cell.day}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-semibold">
                                                            {monthNamesId[cell.date.getMonth()].slice(0, 3)}
                                                        </span>
                                                        {isToday && (
                                                            <span className="w-2 h-2 rounded-full bg-[#3B82F6] ring-2 ring-blue-200" title="Hari Ini" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-3 space-y-2 flex-1">
                                                    {dayLoans.length === 0 ? (
                                                        <span className="text-[10px] text-gray-400 block text-center mt-4">
                                                            Tidak ada jadwal
                                                        </span>
                                                    ) : (
                                                        dayLoans.map((loan) => {
                                                            const theme = getLoanDayTheme(loan, cell.dateStr, loan.isStart, loan.isDeadlineDay);
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
                                                                    className="p-2 rounded border-l-4 text-xs font-bold cursor-pointer hover:shadow-xs transition-shadow"
                                                                >
                                                                    <div className="flex items-center justify-between gap-1">
                                                                        <p className="truncate min-w-0 flex-1">{loan.nama_barang}</p>
                                                                        {loan.isDeadlineDay && (
                                                                            <span
                                                                                style={{
                                                                                    backgroundColor: theme.badgeBg,
                                                                                    color: theme.badgeText,
                                                                                }}
                                                                                className="text-[8px] font-mono font-bold px-1 rounded shadow-2xs shrink-0"
                                                                            >
                                                                                Batas
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[10px] opacity-80 mt-0.5">
                                                                        {loan.user_name}
                                                                    </p>
                                                                    <span
                                                                        style={{
                                                                            backgroundColor: theme.badgeBg,
                                                                            color: theme.badgeText,
                                                                        }}
                                                                        className="text-[9px] inline-block mt-1 font-mono font-bold px-1.5 py-0.5 rounded shadow-2xs"
                                                                    >
                                                                        Batas: {loan.batas_kembali ? loan.batas_kembali.slice(11, 16) : '-'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* VIEW MODE 3: HARI VIEW (REAL-TIME DAILY SCHEDULE)             */}
                        {/* ============================================================ */}
                        {viewMode === 'day' && (
                            <div className="mt-4 border border-[#E2E8F0] rounded-xl overflow-hidden bg-white p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-3">
                                    <div>
                                        <h3 className="text-base font-extrabold text-[#1E293B] flex items-center gap-2">
                                            <span>Jadwal Harian: {currentDate.getDate()} {monthNamesId[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                                            {isTodayDate(currentDate) && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                                                    Hari Ini (Waktu Sekarang)
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-[#64748B] mt-0.5">
                                            Rincian peminjaman aktif dan batas pengembalian barang di tanggal ini
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold self-start sm:self-auto">
                                        {(loansByDate[formatLocalYmd(currentDate)] || []).length} Transaksi Terdata
                                    </span>
                                </div>

                                <div className="mt-4 divide-y divide-[#E2E8F0]">
                                    {(loansByDate[formatLocalYmd(currentDate)] || []).length === 0 ? (
                                        <div className="py-12 text-center text-xs text-[#64748B]">
                                            Tidak ada peminjaman aktif atau batas pengembalian pada tanggal ini.
                                        </div>
                                    ) : (
                                        (loansByDate[formatLocalYmd(currentDate)] || []).map((loan) => {
                                            const theme = getLoanDayTheme(loan, formatLocalYmd(currentDate), loan.isStart, loan.isDeadlineDay);
                                            return (
                                                <div
                                                    key={loan.id}
                                                    onClick={() => setSelectedLoan(loan)}
                                                    className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50 px-3 rounded-xl cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            style={{
                                                                backgroundColor: theme.bg,
                                                                color: theme.text,
                                                                borderColor: theme.border,
                                                            }}
                                                            className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold"
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
                                                        <span
                                                            style={{
                                                                backgroundColor: theme.badgeBg,
                                                                color: theme.badgeText,
                                                            }}
                                                            className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1 border"
                                                        >
                                                            {theme.isGreen ? 'Selesai Dikembalikan' : theme.isRed ? 'Melebihi Batas Waktu' : 'Sedang Dipinjam'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
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
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${isActive
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
                                    className={`w-3 h-3 rounded-full ${selectedLoan.status_transaksi === 'dipinjam'
                                            ? selectedLoan.is_overdue
                                                ? 'bg-rose-500'
                                                : 'bg-blue-600'
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

                                <div className={`border rounded-xl p-3 ${selectedLoan.status_transaksi === 'dipinjam'
                                        ? selectedLoan.is_overdue
                                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                                            : 'bg-blue-50 border-blue-200 text-blue-900'
                                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
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
                                <span className={`inline-flex items-center gap-1 font-bold px-3 py-1 rounded-full ${selectedLoan.status_transaksi === 'dipinjam'
                                        ? selectedLoan.is_overdue
                                            ? 'bg-rose-100 text-rose-800'
                                            : 'bg-blue-100 text-blue-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                    {selectedLoan.status_transaksi === 'dipinjam' ? (
                                        selectedLoan.is_overdue ? (
                                            <>
                                                <AlertTriangle size={12} className="text-rose-600 shrink-0" />
                                                <span>Terlambat</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock size={12} className="text-blue-600 shrink-0" />
                                                <span>Sedang Dipinjam</span>
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                            <span>Selesai Dikembalikan</span>
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
