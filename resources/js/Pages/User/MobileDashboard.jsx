import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import {
    Wrench,
    Zap,
    Cpu,
    Cog,
    Bell,
    CheckCircle2,
    Hourglass,
    Hammer,
    AlarmClock,
    CornerDownLeft,
    Play,
    Gauge
} from 'lucide-react';

export default function MobileDashboard({
    stats = { dipinjam: 0, menunggu: 0, selesai: 0 },
    activeLoans = [],
    categories = [],
    recentActivity = [],
    user = {}
}) {
    const now = new Date();
    const initialWeekday = now.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    const [selectedDayIndex, setSelectedDayIndex] = useState(
        initialWeekday >= 1 && initialWeekday <= 5 ? initialWeekday - 1 : 0
    );
    const [notifOpen, setNotifOpen] = useState(false);

    // Filter active borrowed items (status === 'dipinjam') for Featured Return Card & Date Strip
    const activeBorrows = activeLoans.filter((l) => l.status_transaksi === 'dipinjam');

    // Generate Monday - Friday of current week matching Flutter _getDynamicWeekDays()
    const getDynamicWeekDays = () => {
        const current = new Date();
        const dayOfWeek = current.getDay(); // 0 (Sun) to 6 (Sat)
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(current);
        monday.setDate(current.getDate() + diffToMonday);

        const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'];
        const days = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const isToday =
                d.getFullYear() === current.getFullYear() &&
                d.getMonth() === current.getMonth() &&
                d.getDate() === current.getDate();

            days.push({
                day: dayLabels[i],
                date: String(d.getDate()),
                fullDate: d,
                isToday,
            });
        }
        return days;
    };

    const weekDays = getDynamicWeekDays();

    const formatIndonesianShortDate = (isoStr) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return '';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${d.getDate()} ${months[d.getMonth()]}`;
    };

    const formatRelativeTime = (isoStr) => {
        if (!isoStr) return '-';
        const dt = new Date(isoStr);
        if (isNaN(dt.getTime())) return isoStr;
        const diffMs = Date.now() - dt.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays <= 0) {
            if (diffHours <= 0) {
                return diffMin <= 1 ? 'Baru saja' : `${diffMin} mnt lalu`;
            }
            return `${diffHours} jam lalu`;
        } else if (diffDays === 1) {
            return 'Kemarin';
        } else if (diffDays < 7) {
            return `${diffDays} hari lalu`;
        }
        return formatIndonesianShortDate(isoStr);
    };

    // Category Card Style matching Flutter _getCategoryCardStyle()
    const getCategoryCardStyle = (name) => {
        const lower = (name || '').toLowerCase();
        if (lower.includes('perkakas') || lower.includes('tangan')) {
            return {
                icon: Wrench,
                iconColor: '#DC2626',
                bgColor: '#FFF1F2',
                borderColor: '#FECACA',
            };
        }
        if (lower.includes('elektronik') || lower.includes('listrik') || lower.includes('ukur')) {
            return {
                icon: Zap,
                iconColor: '#D97706',
                bgColor: '#FEF3C7',
                borderColor: '#FDE68A',
            };
        }
        if (lower.includes('komponen') || lower.includes('chip') || lower.includes('board') || lower.includes('habis')) {
            return {
                icon: Cpu,
                iconColor: '#059669',
                bgColor: '#ECFDF5',
                borderColor: '#A7F3D0',
            };
        }
        return {
            icon: Cog,
            iconColor: '#2563EB',
            bgColor: '#EFF6FF',
            borderColor: '#BFDBFE',
        };
    };

    return (
        <UserMobileLayout title="Beranda" hideAppBar noPadding>
            <Head title="Beranda - WAMS Mobile" />

            {/* Subtle Workshop Blueprint Graph Paper Grid Background */}
            <div
                className="min-h-screen relative pb-8"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(0, 0, 0, 0.025) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 0, 0, 0.025) 1px, transparent 1px)
                    `,
                    backgroundSize: '24px 24px',
                }}
            >
                {/* 1. HEADER MERAH DENGAN TEPI LENGKUNG DI BAWAH (_buildCurvedRedHeader) */}
                <div className="w-full bg-gradient-to-br from-[#991B1B] via-[#8E1616] to-[#7F1D1D] rounded-b-[22px] shadow-[0_6px_16px_rgba(142,22,22,0.22)] px-5 pt-4 pb-6 relative z-20">
                    {/* Top Bar: (W) Logo + WAMS + Bell Icon */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-white p-[2.5px] shadow-[0_2px_6px_rgba(0,0,0,0.18)] flex items-center justify-center overflow-hidden">
                                <img
                                    src="/images/wams_logo.png"
                                    alt="WAMS Logo"
                                    className="w-full h-full object-contain rounded-full"
                                />
                            </div>
                            <span className="text-[22px] font-black text-white tracking-[0.5px]">
                                WAMS
                            </span>
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer relative"
                                aria-label="Notifikasi"
                            >
                                <Bell size={23} />
                                <span className="absolute right-2.5 top-2 w-2 h-2 rounded-full bg-[#FCA5A5]" />
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#CBD5E1] p-3 text-[#0F172A] z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <p className="text-xs font-extrabold text-[#0F172A] mb-1">
                                        Notifikasi WAMS
                                    </p>
                                    {activeBorrows.length > 0 ? (
                                        <p className="text-[11px] text-[#64748B]">
                                            Anda memiliki <strong>{activeBorrows.length} alat</strong> yang sedang dipinjam. Pastikan dikembalikan tepat waktu.
                                        </p>
                                    ) : (
                                        <p className="text-[11px] text-[#64748B]">
                                            Tidak ada notifikasi baru.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Info: Real dynamic user data */}
                    <div className="mt-4">
                        <h2 className="text-[22px] font-black text-white tracking-[-0.4px] leading-tight">
                            {user?.nama || 'Teknisi'}
                        </h2>
                        <div className="mt-1.5 inline-block px-2.5 py-1 rounded-[8px] bg-black/22 border border-white/20">
                            <span className="text-[12px] text-white font-bold tracking-[0.4px] block">
                                {user?.nip ? `NIP ${user.nip}` : 'Pengguna WAMS'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content Body with Horizontal Padding (18px matching Flutter) */}
                <div className="px-[18px] pt-3.5 space-y-[18px]">
                    {/* 2. DATE STRIP CARD (_buildDateStripCard) */}
                    <div className="w-full bg-white rounded-[14px] border-[1.2px] border-[#CBD5E1] p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] flex items-center justify-around">
                        {weekDays.map((item, index) => {
                            const isSelected = index === selectedDayIndex;
                            const isToday = item.isToday;
                            const fullDate = item.fullDate;

                            // Check if any active borrow has deadline on this date
                            const matchingBorrows = activeBorrows.filter((b) => {
                                if (!b.batas_kembali_raw) return false;
                                const dt = new Date(b.batas_kembali_raw);
                                if (isNaN(dt.getTime())) return false;
                                return (
                                    dt.getFullYear() === fullDate.getFullYear() &&
                                    dt.getMonth() === fullDate.getMonth() &&
                                    dt.getDate() === fullDate.getDate()
                                );
                            });

                            const hasDeadline = matchingBorrows.length > 0;
                            let deadlineColor = '#DC2626';
                            if (hasDeadline) {
                                let isOverdue = false;
                                let isNear = false;
                                matchingBorrows.forEach((b) => {
                                    const dt = new Date(b.batas_kembali_raw);
                                    const diffHours = (dt.getTime() - Date.now()) / 3600000;
                                    if (diffHours < 0) isOverdue = true;
                                    else if (diffHours <= 24) isNear = true;
                                });
                                if (isOverdue) deadlineColor = '#DC2626';
                                else if (isNear) deadlineColor = '#E11D48';
                                else deadlineColor = '#EA580C';
                            }

                            const dayTextColor = isSelected
                                ? '#8E1616'
                                : hasDeadline
                                ? deadlineColor
                                : isToday
                                ? '#8E1616'
                                : '#64748B';

                            const boxBg = isSelected
                                ? '#8E1616'
                                : hasDeadline
                                ? `${deadlineColor}14`
                                : '#F8FAFC';

                            const boxBorder = isSelected
                                ? '1.8px solid #8E1616'
                                : hasDeadline
                                ? `2px solid ${deadlineColor}`
                                : isToday
                                ? '1.5px solid #8E1616'
                                : '1px solid #E2E8F0';

                            const numColor = isSelected
                                ? '#FFFFFF'
                                : hasDeadline
                                ? deadlineColor
                                : isToday
                                ? '#8E1616'
                                : '#0F172A';

                            return (
                                <button
                                    key={item.day}
                                    type="button"
                                    onClick={() => setSelectedDayIndex(index)}
                                    className="flex flex-col items-center cursor-pointer group"
                                >
                                    <span
                                        style={{ color: dayTextColor }}
                                        className={`text-[12px] ${
                                            isToday || hasDeadline ? 'font-black' : 'font-bold'
                                        }`}
                                    >
                                        {item.day}
                                    </span>
                                    <div
                                        style={{
                                            backgroundColor: boxBg,
                                            border: boxBorder,
                                            color: numColor,
                                        }}
                                        className={`mt-1.5 w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[14px] font-black transition-all duration-200 ${
                                            isSelected ? 'shadow-[0_2px_6px_rgba(142,22,22,0.35)]' : ''
                                        }`}
                                    >
                                        {item.date}
                                    </div>
                                    {isToday ? (
                                        <span className="mt-1 w-[5px] h-[5px] rounded-full bg-[#8E1616]" />
                                    ) : hasDeadline ? (
                                        <span
                                            style={{ backgroundColor: deadlineColor }}
                                            className="mt-1 w-[5px] h-[5px] rounded-full"
                                        />
                                    ) : (
                                        <span className="mt-1 w-[5px] h-[5px]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* 3. STATUS SAYA (Dipinjam | Menunggu | Selesai) (_buildStatusSayaSection) */}
                    <div>
                        <h3 className="text-[16px] font-black text-[#0F172A] tracking-[-0.3px] mb-2.5">
                            Status Saya
                        </h3>
                        <div className="grid grid-cols-3 gap-2.5">
                            {/* Card 1: Dipinjam */}
                            <Link
                                href="/user/riwayat?tab=aktif"
                                className="bg-white rounded-[14px] border-[1.2px] border-[#CBD5E1] shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col items-center hover:border-[#DC2626] transition-all"
                            >
                                <div className="h-[4px] w-full bg-[#DC2626]" />
                                <div className="py-3.5 px-2 flex flex-col items-center">
                                    <div className="w-[42px] h-[42px] rounded-[10px] bg-[#FEE2E2] border border-[#DC2626]/20 shadow-[0_2px_4px_rgba(220,38,38,0.12)] flex items-center justify-center text-[#DC2626]">
                                        <Hammer size={21} />
                                    </div>
                                    <span className="mt-2 text-[26px] font-black text-[#0F172A] leading-none">
                                        {stats.dipinjam}
                                    </span>
                                    <span className="mt-1 text-[12px] font-bold text-[#475569]">
                                        Dipinjam
                                    </span>
                                </div>
                            </Link>

                            {/* Card 2: Menunggu */}
                            <Link
                                href="/user/riwayat?tab=semua"
                                className="bg-white rounded-[14px] border-[1.2px] border-[#CBD5E1] shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col items-center hover:border-[#D97706] transition-all"
                            >
                                <div className="h-[4px] w-full bg-[#D97706]" />
                                <div className="py-3.5 px-2 flex flex-col items-center">
                                    <div className="w-[42px] h-[42px] rounded-[10px] bg-[#FEF3C7] border border-[#D97706]/20 shadow-[0_2px_4px_rgba(217,119,6,0.12)] flex items-center justify-center text-[#D97706]">
                                        <Hourglass size={21} />
                                    </div>
                                    <span className="mt-2 text-[26px] font-black text-[#0F172A] leading-none">
                                        {stats.menunggu}
                                    </span>
                                    <span className="mt-1 text-[12px] font-bold text-[#475569]">
                                        Menunggu
                                    </span>
                                </div>
                            </Link>

                            {/* Card 3: Selesai */}
                            <Link
                                href="/user/riwayat?tab=selesai"
                                className="bg-white rounded-[14px] border-[1.2px] border-[#CBD5E1] shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col items-center hover:border-[#059669] transition-all"
                            >
                                <div className="h-[4px] w-full bg-[#059669]" />
                                <div className="py-3.5 px-2 flex flex-col items-center">
                                    <div className="w-[42px] h-[42px] rounded-[10px] bg-[#D1FAE5] border border-[#059669]/20 shadow-[0_2px_4px_rgba(5,150,105,0.12)] flex items-center justify-center text-[#059669]">
                                        <CheckCircle2 size={21} />
                                    </div>
                                    <span className="mt-2 text-[26px] font-black text-[#0F172A] leading-none">
                                        {stats.selesai}
                                    </span>
                                    <span className="mt-1 text-[12px] font-bold text-[#475569]">
                                        Selesai
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* 4. STATUS ALAT / SEGERA DIKEMBALIKAN (_buildFeaturedReturnCard & _CardStackBorrowSection) */}
                    <FeaturedReturnSection
                        activeBorrows={activeBorrows}
                        formatShortDate={formatIndonesianShortDate}
                    />

                    {/* 5. KATEGORI PERALATAN (_buildKategoriSection) */}
                    <div className="pt-1">
                        <div className="flex items-center justify-between mb-2.5">
                            <h3 className="text-[16px] font-extrabold text-[#1E293B] tracking-[-0.3px]">
                                Kategori Peralatan
                            </h3>
                            <Link
                                href="/user/katalog"
                                className="text-[13px] font-bold text-[#8E1616] hover:underline"
                            >
                                Lihat semua &gt;
                            </Link>
                        </div>

                        {categories.length === 0 ? (
                            <div className="w-full py-6 px-4 bg-white rounded-[16px] border border-[#E2E8F0] text-center text-xs text-[#94A3B8]">
                                Belum ada kategori peralatan.
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                                {categories.map((kat) => {
                                    const style = getCategoryCardStyle(kat.nama_kategori);
                                    const Icon = style.icon;
                                    const readyLabel = kat.is_habis_pakai
                                        ? `${kat.total_barang} bahan`
                                        : `${kat.tersedia ?? 0} unit siap`;

                                    return (
                                        <Link
                                            key={kat.id}
                                            href={`/user/katalog?kategori_id=${kat.id}&mode=category_list`}
                                            style={{
                                                backgroundColor: style.bgColor,
                                                borderColor: style.borderColor,
                                            }}
                                            className="w-[122px] h-[146px] px-2.5 py-3 rounded-[14px] border-[1.2px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] flex flex-col justify-between items-center shrink-0 transition-transform active:scale-95"
                                        >
                                            {/* Top Icon Container */}
                                            <div
                                                style={{ borderColor: style.borderColor }}
                                                className="w-[40px] h-[40px] rounded-[10px] bg-white border shadow-[0_1px_4px_rgba(15,23,42,0.04)] flex items-center justify-center"
                                            >
                                                <Icon size={22} style={{ color: style.iconColor }} />
                                            </div>

                                            {/* Name & Quantity */}
                                            <div className="w-full text-center">
                                                <p className="text-[13px] font-black text-[#0F172A] leading-tight truncate">
                                                    {kat.nama_kategori}
                                                </p>
                                                <span
                                                    style={{
                                                        borderColor: style.borderColor,
                                                        color: style.iconColor,
                                                    }}
                                                    className="mt-1 inline-block px-1.5 py-0.5 bg-white rounded-[6px] border text-[10px] font-extrabold"
                                                >
                                                    {readyLabel}
                                                </span>
                                            </div>

                                            {/* Button: ▶ Lihat */}
                                            <div className="w-full py-1 bg-white rounded-[8px] border border-[#CBD5E1] shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex items-center justify-center gap-1">
                                                <Play size={10} className="text-[#8E1616] fill-[#8E1616]" />
                                                <span className="text-[10px] font-extrabold text-[#0F172A]">
                                                    Lihat
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 6. AKTIVITAS TERBARU (_buildAktivitasTerbaruSection) */}
                    <div className="pt-1">
                        <h3 className="text-[16px] font-black text-[#0F172A] tracking-[-0.3px] mb-2.5">
                            Aktivitas Terbaru
                        </h3>

                        <div className="w-full bg-white rounded-[14px] border-[1.2px] border-[#CBD5E1] px-4 py-1.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                            {recentActivity.length === 0 ? (
                                <div className="py-5 text-center text-[12px] text-[#94A3B8] font-medium">
                                    Belum ada aktivitas transaksi
                                </div>
                            ) : (
                                recentActivity.slice(0, 4).map((act, index, arr) => {
                                    const isDone = act.status_transaksi === 'dikembalikan';
                                    const isPending = act.status_transaksi === 'menunggu_persetujuan';
                                    const isLast = index === arr.length - 1;

                                    const actionName = isDone
                                        ? 'dikembalikan'
                                        : isPending
                                        ? 'diajukan'
                                        : act.status_transaksi === 'ditolak'
                                        ? 'ditolak'
                                        : act.status_transaksi === 'dibatalkan'
                                        ? 'dibatalkan'
                                        : 'dipinjam';

                                    const itemLabel =
                                        act.kode_unit && act.kode_unit !== '-'
                                            ? act.kode_unit
                                            : act.nama_barang;

                                    const dotColor = isDone
                                        ? '#059669'
                                        : isPending
                                        ? '#D97706'
                                        : '#DC2626';

                                    return (
                                        <div key={act.id}>
                                            <Link
                                                href={`/user/riwayat?detail_id=${act.id}`}
                                                className="py-[11px] flex items-center justify-between gap-2.5 hover:opacity-80 transition-opacity"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                    <span
                                                        style={{ backgroundColor: dotColor }}
                                                        className="w-[10px] h-[10px] rounded-full shrink-0"
                                                    />
                                                    <span className="text-[13px] font-extrabold text-[#0F172A] truncate">
                                                        {itemLabel} {actionName}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-[#64748B] font-semibold shrink-0">
                                                    {formatRelativeTime(act.tanggal_pinjam_raw)}
                                                </span>
                                            </Link>
                                            {!isLast && <div className="h-[1px] bg-[#E2E8F0]" />}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UserMobileLayout>
    );
}

/**
 * Featured Return Card / Deck of Cards Carousel (_buildFeaturedReturnCard & _CardStackBorrowSection)
 */
function FeaturedReturnSection({ activeBorrows = [], formatShortDate }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const touchStartX = useRef(null);

    if (activeBorrows.length === 0) {
        // Kondisi Aman: Semua Alat Tersimpan Rapi
        return (
            <div className="w-full bg-white rounded-[16px] border-[1.5px] border-[#10B981] px-[18px] py-[14px] shadow-[0_3px_12px_rgba(16,185,129,0.10)] flex items-center justify-between gap-3.5">
                <div className="min-w-0 flex-1">
                    <h4 className="text-[15.5px] font-black text-[#0F172A] tracking-[-0.3px] truncate">
                        Semua Alat Tersimpan Rapi
                    </h4>
                    <p className="text-[12px] text-[#64748B] font-semibold mt-1 truncate">
                        Tidak ada pinjaman aktif · Siap dipinjam
                    </p>
                </div>
                <div className="w-[50px] h-[50px] rounded-[14px] bg-[#ECFDF5] border-[1.5px] border-[#A7F3D0] shadow-[0_2px_8px_rgba(16,185,129,0.10)] flex items-center justify-center shrink-0">
                    <CheckCircle2 size={26} className="text-[#059669]" />
                </div>
            </div>
        );
    }

    const total = activeBorrows.length;
    const safeIndex = currentIndex >= total ? 0 : currentIndex;
    const currentItem = activeBorrows[safeIndex];
    const nextItem = activeBorrows[(safeIndex + 1) % total];
    const thirdItem = activeBorrows[(safeIndex + 2) % total];

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        if (touchStartX.current === null || total <= 1) return;
        const delta = e.touches[0].clientX - touchStartX.current;
        setDragOffset(delta);
    };

    const handleTouchEnd = () => {
        if (total > 1) {
            if (dragOffset < -45) {
                setCurrentIndex((safeIndex + 1) % total);
            } else if (dragOffset > 45) {
                setCurrentIndex((safeIndex - 1 + total) % total);
            }
        }
        setDragOffset(0);
        touchStartX.current = null;
    };

    return (
        <div>
            <div
                className={`relative ${total > 1 ? 'min-h-[168px]' : ''}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* 3rd card in stack */}
                {total >= 3 && (
                    <div className="absolute top-[18px] left-0 right-0 scale-[0.90] origin-top opacity-55 pointer-events-none">
                        <SingleBorrowCard item={thirdItem} formatShortDate={formatShortDate} />
                    </div>
                )}

                {/* 2nd card in stack */}
                {total >= 2 && (
                    <div className="absolute top-[10px] left-0 right-0 scale-[0.95] origin-top opacity-85 pointer-events-none">
                        <SingleBorrowCard item={nextItem} formatShortDate={formatShortDate} />
                    </div>
                )}

                {/* Top Interactive Card */}
                <div
                    style={{
                        transform: `translateX(${dragOffset}px) rotate(${(dragOffset / 320) * 4}deg)`,
                    }}
                    className="relative z-10 transition-transform duration-150"
                >
                    <SingleBorrowCard item={currentItem} formatShortDate={formatShortDate} isInteractive />
                </div>
            </div>

            {/* Indicator Dots if multiple active borrows */}
            {total > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                    {activeBorrows.map((_, idx) => {
                        const isCur = idx === safeIndex;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-[6px] rounded-full transition-all duration-250 cursor-pointer ${
                                    isCur ? 'w-[22px] bg-[#8E1616]' : 'w-[6px] bg-[#CBD5E1]'
                                }`}
                                aria-label={`Pinjaman ${idx + 1}`}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function SingleBorrowCard({ item, formatShortDate, isInteractive = false }) {
    const sisaRaw = item.remaining_text || 'sisa 2 hari';
    const sisaDisplay = sisaRaw.toLowerCase().startsWith('sisa ')
        ? `S${sisaRaw.slice(1)}`
        : `Sisa ${sisaRaw}`;

    return (
        <div className="w-full bg-white rounded-[16px] border-[1.5px] border-[#DC2626] p-4 shadow-[0_3px_12px_rgba(220,38,38,0.12)] flex items-center justify-between gap-3">
            {/* Left Content Column */}
            <div className="min-w-0 flex-1">
                {/* Badge Status */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#FEE2E2] border-[1.2px] border-[#FCA5A5]">
                    <AlarmClock size={13} className="text-[#DC2626] animate-pulse shrink-0" />
                    <span className="text-[10.5px] font-extrabold text-[#B91C1C] tracking-[0.3px] uppercase truncate">
                        SEGERA DIKEMBALIKAN · {sisaRaw.toUpperCase()}
                    </span>
                </div>

                {/* Tool Title */}
                <h4 className="mt-2 text-[16px] font-black text-[#0F172A] tracking-[-0.3px] truncate">
                    {item.nama_barang}
                </h4>

                {/* Tool Subtitle */}
                <p className="mt-0.5 text-[12px] text-[#64748B] font-semibold truncate">
                    Kode: {item.kode_unit} · {sisaDisplay}
                </p>

                {/* Action Row */}
                <div className="mt-2.5 flex items-center gap-3">
                    {isInteractive ? (
                        <Link
                            href={`/user/riwayat?detail_id=${item.id}`}
                            className="px-3.5 py-2 bg-[#8E1616] hover:bg-[#7F1D1D] text-white rounded-[10px] shadow-[0_2px_4px_rgba(15,23,42,0.08)] inline-flex items-center gap-1.5 text-[12px] font-extrabold transition-colors"
                        >
                            <CornerDownLeft size={14} />
                            <span>Kembalikan</span>
                        </Link>
                    ) : (
                        <div className="px-3.5 py-2 bg-[#8E1616] text-white rounded-[10px] inline-flex items-center gap-1.5 text-[12px] font-extrabold">
                            <CornerDownLeft size={14} />
                            <span>Kembalikan</span>
                        </div>
                    )}

                    {item.batas_kembali_raw && (
                        <span className="text-[12px] font-bold text-[#475569]">
                            {formatShortDate(item.batas_kembali_raw)}
                        </span>
                    )}
                </div>
            </div>

            {/* Right Squircle Container (Tool Real Photo) */}
            <div className="w-[76px] h-[76px] rounded-[14px] bg-white border-[1.5px] border-[#FECACA] shadow-[0_2px_8px_rgba(220,38,38,0.10)] overflow-hidden flex items-center justify-center shrink-0">
                {item.gambar_url ? (
                    <img
                        src={item.gambar_url}
                        alt={item.nama_barang}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Wrench size={34} className="text-[#8E1616]" />
                )}
            </div>
        </div>
    );
}
