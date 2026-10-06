import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Calendar,
    Boxes,
    Package,
    Layers,
    BookOpen,
    QrCode,
    Users,
    BarChart3,
    LogOut,
    Menu,
    X,
    Bell,
    Settings,
    Search,
    CheckCircle2,
    AlertCircle,
    Scan,
    Shield,
    Sparkles,
    ArrowUpRight,
    RefreshCw,
    Smartphone,
    AlertTriangle,
    Clock
} from 'lucide-react';
import NotificationToastContainer from '@/Components/NotificationToast';
import PageSkeleton from '@/Components/PageSkeleton';

// Module-level global state: survives Inertia client-side page transitions
// so the notification doesn't re-trigger when clicking around/switching pages
let globalHasAlertedOverdue = false;
let globalBellClicked = false;
const globalAlertedOverdueIds = new Set();
const globalAlertedToastIds = new Set();
let globalLastCheckedTime = null;
let globalNotificationHistory = [];
let globalUnreadCount = 0;

export default function AuthenticatedLayout({ title, children }) {
    const { auth, flash, url } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [overdueLoans, setOverdueLoans] = useState([]);
    const [notificationHistory, setNotificationHistory] = useState(globalNotificationHistory);
    const [unreadCount, setUnreadCount] = useState(globalUnreadCount);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [bellClicked, setBellClicked] = useState(globalBellClicked);
    const [isTesting, setIsTesting] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [loadingPath, setLoadingPath] = useState('');

    const user = auth?.user;
    const dropdownRef = useRef(null);

    // Listen to Inertia page transitions to show skeleton loading
    useEffect(() => {
        const unbindStart = router.on('start', (event) => {
            // Ignore in-page background actions / preserveState (like live search or filter dropdowns)
            if (event?.detail?.visit?.preserveState) {
                return;
            }
            const target = event?.detail?.visit?.url;
            let path = '';
            if (typeof target === 'string') {
                path = target;
            } else if (target?.pathname) {
                path = target.pathname;
            } else if (target?.href) {
                try {
                    path = new URL(target.href).pathname;
                } catch (e) {
                    path = String(target);
                }
            }
            setLoadingPath(path);
            setIsPageLoading(true);
        });

        const unbindFinish = router.on('finish', () => {
            setIsPageLoading(false);
            setLoadingPath('');
        });

        const unbindCancel = router.on('cancel', () => {
            setIsPageLoading(false);
            setLoadingPath('');
        });

        const unbindError = router.on('error', () => {
            setIsPageLoading(false);
            setLoadingPath('');
        });

        return () => {
            unbindStart();
            unbindFinish();
            unbindCancel();
            unbindError();
        };
    }, []);

    // Ensure skeleton turns off whenever url prop updates
    useEffect(() => {
        setIsPageLoading(false);
        setLoadingPath('');
    }, [url]);

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Kalender', href: '/admin/calendar', icon: Calendar },
        { name: 'Barang', href: '/admin/barang', icon: Package },
        { name: 'Logbook', href: '/admin/logbook', icon: BookOpen },
        { name: 'QR Code', href: '/admin/qrcode', icon: QrCode },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Laporan', href: '/admin/reports', icon: BarChart3 },
    ];

    // Live ticking timer every second for real-time overdue counting
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Format elapsed overdue time in real-time ("Terlambat 9 Jam 24 menit")
    const formatOverdueElapsed = (batasKembaliStr) => {
        if (!batasKembaliStr) return '0 menit';
        const target = new Date(batasKembaliStr).getTime();
        const diff = Math.max(0, currentTime - target);
        const totalSeconds = Math.floor(diff / 1000);

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        let parts = [];
        if (days > 0) parts.push(`${days} Hari`);
        if (hours > 0) parts.push(`${hours} Jam`);
        parts.push(`${minutes} menit`);

        return `Terlambat ${parts.join(' ')}`;
    };

    // Chime sound on new standard transaction
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.38);
        } catch (e) {
            // Browser autoplay policy might restrict audio before interaction
        }
    };

    // Urgent alarm chime on overdue loan alert (double pulse alert)
    const playAlarmSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const playPulse = (freq, startTime, duration) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.14, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            playPulse(740, ctx.currentTime, 0.14);
            playPulse(880, ctx.currentTime + 0.18, 0.22);
        } catch (e) {
            // Browser autoplay policy might restrict audio before interaction
        }
    };

    const handleDismissToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // Unlock AudioContext on first user interaction to satisfy browser autoplay policies
    useEffect(() => {
        const unlockAudio = () => {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    const ctx = new AudioContext();
                    ctx.resume().then(() => ctx.close());
                }
            } catch (e) {}
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
        window.addEventListener('click', unlockAudio);
        window.addEventListener('keydown', unlockAudio);
        return () => {
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
    }, []);

    // Live Polling for transactions (Peminjaman & Pengembalian) & Active Overdues
    useEffect(() => {
        let isMounted = true;

        const pollTransactions = async () => {
            try {
                const sinceParam = globalLastCheckedTime
                    ? `?since=${encodeURIComponent(globalLastCheckedTime)}`
                    : '';
                const res = await fetch(`/admin/notifications/check${sinceParam}`, {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!res.ok) return;
                const data = await res.json();

                if (!isMounted) return;

                if (data.server_time) {
                    globalLastCheckedTime = data.server_time;
                }

                // Update daftar peminjaman terlambat (overdue)
                if (data.overdues) {
                    setOverdueLoans(data.overdues);

                    // Cukup muncul sekali tiap admin membuka website ulang (tidak muncul saat ganti-ganti halaman)
                    if (!globalHasAlertedOverdue && data.overdues.length > 0) {
                        globalHasAlertedOverdue = true;
                        playAlarmSound();
                        setToasts((prev) => [...data.overdues.slice(0, 3), ...prev].slice(0, 6));
                        data.overdues.forEach((item) => globalAlertedOverdueIds.add(item.id));
                    } else if (globalHasAlertedOverdue) {
                        // Jika ada unit baru yang baru saja melewati batas waktu saat admin sedang standby
                        const brandNewOverdues = data.overdues.filter(
                            (item) => !globalAlertedOverdueIds.has(item.id)
                        );
                        if (brandNewOverdues.length > 0) {
                            globalBellClicked = false;
                            setBellClicked(false);
                            playAlarmSound();
                            setToasts((prev) => [...brandNewOverdues.slice(0, 2), ...prev].slice(0, 6));
                            brandNewOverdues.forEach((item) => globalAlertedOverdueIds.add(item.id));
                        }
                    }

                    // Bersihkan tracking untuk item yang sudah dikembalikan oleh user
                    const currentOverdueIds = new Set(data.overdues.map((o) => o.id));
                    for (const id of globalAlertedOverdueIds) {
                        if (!currentOverdueIds.has(id) && !id.startsWith('sim_')) {
                            globalAlertedOverdueIds.delete(id);
                        }
                    }
                }

                // Update riwayat notifikasi lengkap di dropdown bel
                if (data.history && data.history.length > 0) {
                    globalNotificationHistory = data.history;
                    setNotificationHistory(data.history);
                }

                // Proses notifikasi popup toast langsung (Peminjaman & Pengembalian Real-Time)
                if (data.notifications && data.notifications.length > 0) {
                    const freshNotifications = data.notifications.filter(
                        (n) => !globalAlertedToastIds.has(n.id)
                    );

                    if (freshNotifications.length > 0) {
                        freshNotifications.forEach((n) => globalAlertedToastIds.add(n.id));

                        globalBellClicked = false;
                        setBellClicked(false);
                        globalUnreadCount += freshNotifications.length;
                        setUnreadCount(globalUnreadCount);

                        playNotificationSound();

                        setToasts((prev) => [
                            ...freshNotifications,
                            ...prev.filter((t) => !freshNotifications.some((f) => f.id === t.id)),
                        ].slice(0, 6));
                    }
                }
            } catch (err) {
                // Ignore transient network errors
            }
        };

        // Initial setup poll
        pollTransactions();

        // Interval poll every 3.5 seconds
        const intervalId = setInterval(pollTransactions, 3500);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNotifDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Click handler for notification bell: stops animation & turns icon gray
    const handleBellClick = () => {
        globalBellClicked = true;
        setBellClicked(true);
        globalUnreadCount = 0;
        setUnreadCount(0);
        setShowNotifDropdown((prev) => !prev);
    };

    const hasUnreadAlert = !bellClicked && (unreadCount > 0 || toasts.length > 0 || overdueLoans.length > 0);
    const badgeCount = unreadCount > 0
        ? unreadCount
        : (toasts.length > 0 ? toasts.length : overdueLoans.length);

    // Trigger test simulated notification
    const handleTriggerTest = async (type = 'borrow', kondisi = 'baik') => {
        globalBellClicked = false;
        setBellClicked(false);
        setIsTesting(true);
        try {
            const res = await fetch(`/admin/notifications/test?type=${type}&kondisi=${kondisi}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (res.ok) {
                const data = await res.json();
                if (data.notification) {
                    if (type === 'overdue') {
                        playAlarmSound();
                        setOverdueLoans((prev) => [data.notification, ...prev.filter((o) => o.id !== data.notification.id)]);
                    } else {
                        playNotificationSound();
                        setNotificationHistory((prev) => [data.notification, ...prev].slice(0, 15));
                        globalNotificationHistory = [data.notification, ...globalNotificationHistory].slice(0, 15);
                    }
                    globalAlertedToastIds.add(data.notification.id);
                    setToasts((prev) => [data.notification, ...prev.filter((t) => t.id !== data.notification.id)].slice(0, 6));
                    globalAlertedOverdueIds.add(data.notification.id);
                    setIsTesting(false);
                    return;
                }
            }
        } catch (err) {
            console.error('Test notification fetch error:', err);
        }

        // Guaranteed instant fallback
        const isReturn = type === 'return';
        const isOverdue = type === 'overdue';

        if (isOverdue) {
            const simulatedBatas = new Date(Date.now() - 14 * 60 * 1000 - 22 * 1000).toISOString();
            const fallbackOverdue = {
                id: 'sim_overdue_' + Date.now(),
                logbook_id: 999,
                type: 'overdue',
                title: 'Peringatan: Melebihi Batas Waktu!',
                user_name: user?.nama || 'Ahmad Syarifudin',
                user_nip: '199503152020011002',
                barang_name: 'Mesin Bor Cordless 18V',
                kode_unit: 'BOR-101-01',
                kondisi: 'baik',
                status_transaksi: 'dipinjam',
                batas_kembali: simulatedBatas,
                batas_kembali_formatted: 'Hari ini, ' + new Date(simulatedBatas).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                seconds_overdue: 862,
                message: `Peminjaman Mesin Bor Cordless 18V (BOR-101-01) oleh ${user?.nama || 'Ahmad Syarifudin'} telah melebihi batas waktu.`,
                time: '14 menit lalu',
                timestamp: simulatedBatas,
            };

            playAlarmSound();
            setToasts((prev) => [fallbackOverdue, ...prev].slice(0, 6));
            setOverdueLoans((prev) => [fallbackOverdue, ...prev.filter((o) => !o.id.startsWith('sim_'))]);
            globalAlertedOverdueIds.add(fallbackOverdue.id);
            setIsTesting(false);
            return;
        }

        const fallbackNotif = {
            id: 'sim_' + Date.now(),
            logbook_id: 999,
            type,
            title: isReturn ? 'Pengembalian Barang Selesai' : 'Peminjaman Barang Baru',
            user_name: user?.nama || 'Ahmad Syarifudin',
            user_nip: '199503152020011002',
            barang_name: 'Mesin Bor Cordless 18V',
            kode_unit: 'BOR-101-01',
            kondisi: kondisi,
            status_transaksi: isReturn ? 'dikembalikan' : 'dipinjam',
            message: isReturn
                ? `${user?.nama || 'Ahmad Syarifudin'} telah mengembalikan Mesin Bor Cordless 18V (BOR-101-01). Kondisi unit: ${kondisi === 'rusak' ? 'Rusak' : 'Baik'}.`
                : `${user?.nama || 'Ahmad Syarifudin'} (NIP: 199503152020011002) baru saja meminjam Mesin Bor Cordless 18V (BOR-101-01).`,
            time: 'Baru saja',
            timestamp: new Date().toISOString(),
        };

        playNotificationSound();
        setToasts((prev) => [fallbackNotif, ...prev].slice(0, 5));
        setNotificationHistory((prev) => [fallbackNotif, ...prev].slice(0, 15));
        setIsTesting(false);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-[#EEEEEE] text-[#1D1616] flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-[#1D1616]/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E0E0E0] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header */}
                <div className="h-20 flex items-center justify-between px-7 border-b border-[#E0E0E0]">
                    <Link href="/admin/dashboard" className="flex items-center gap-3.5">
                        <img
                            src="/images/wams_logo.png"
                            alt="WAMS Logo"
                            className="w-10 h-10 object-contain drop-shadow-xs"
                        />
                        <div>
                            <span className="font-extrabold text-[22px] tracking-tight text-[#1D1616] block leading-none">
                                WAMS
                            </span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1D1616] hover:bg-[#EEEEEE] lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
                    {navItems.map((item) => {
                        const currentUrl = url || window.location.pathname;
                        const active =
                            currentUrl === item.href ||
                            (item.href !== '/admin/dashboard' && currentUrl.startsWith(item.href));
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform active:scale-95 ${
                                    active
                                        ? 'bg-[#D84040] text-white shadow-xs translate-x-1'
                                        : 'text-[#525866] hover:bg-[#EEEEEE] hover:text-[#1D1616] hover:translate-x-1'
                                }`}
                            >
                                <Icon
                                    size={19}
                                    className={`transition-transform duration-200 ${active ? 'text-white scale-105' : 'text-[#6B7280]'}`}
                                />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Profile info in Sidebar bottom */}
                <div className="p-4 mx-3 mb-4 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#D84040] flex items-center justify-center font-bold text-sm text-white shrink-0">
                                {user?.nama?.charAt(0) || 'A'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-[#1D1616] truncate">{user?.nama}</p>
                                <span className="inline-flex items-center gap-1 text-[10px] text-[#6B7280] font-medium">
                                    <Shield size={10} className="text-[#D84040]" />
                                    {user?.role?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="p-2 text-[#6B7280] hover:text-[#D84040] hover:bg-white rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                {/* Navbar Header */}
                <header className="h-20 sticky top-0 z-30 bg-white border-b border-[#E0E0E0] px-6 lg:px-10 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-xl text-[#6B7280] hover:bg-[#EEEEEE] lg:hidden"
                        >
                            <Menu size={22} />
                        </button>
                        <h1 key={title} className="text-xl lg:text-2xl font-extrabold text-[#1D1616] tracking-tight animate-title-enter">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 lg:gap-5" ref={dropdownRef}>
                        {/* Tombol Pintas Tampilan Mobile User */}
                        <Link
                            href="/user/dashboard"
                            title="Buka Tampilan Mobile User"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-[#D84040] hover:text-white text-[#D84040] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                            <Smartphone size={16} />
                            <span className="hidden sm:inline">Tampilan Mobile User</span>
                        </Link>

                        {/* Setting Icon Button */}
                        <Link
                            href="/admin/users"
                            title="Pengaturan Akun"
                            className="w-10 h-10 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] hover:bg-[#E5E5E5] text-[#525866] hover:text-[#1D1616] flex items-center justify-center transition-colors"
                        >
                            <Settings size={18} />
                        </Link>

                        {/* Notification Bell Icon & Popover */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={handleBellClick}
                                title="Notifikasi"
                                className="w-10 h-10 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] hover:bg-[#E5E5E5] text-[#1D1616] flex items-center justify-center transition-colors relative cursor-pointer"
                            >
                                <Bell
                                    size={18}
                                    className={
                                        hasUnreadAlert
                                            ? 'text-[#D84040] animate-bounce'
                                            : 'text-[#525866]'
                                    }
                                />
                                {hasUnreadAlert && (
                                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#D84040] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                                        {badgeCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown Menu */}
                            {showNotifDropdown && (
                                <div className="absolute right-0 mt-3 w-80 sm:w-[420px] bg-white rounded-2xl border border-[#E0E0E0] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.16)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full ${
                                                    overdueLoans.length > 0
                                                        ? 'bg-[#D84040]'
                                                        : 'bg-emerald-500'
                                                }`}
                                            ></div>
                                            <h4 className="font-bold text-sm text-[#1D1616]">
                                                Notifikasi
                                            </h4>
                                        </div>
                                        {overdueLoans.length > 0 && (
                                            <span className="text-[10.5px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1 shadow-2xs">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#D84040]"></span>
                                                {overdueLoans.length} Terlambat
                                            </span>
                                        )}
                                    </div>

                                    {/* Active Overdue Loans Section */}
                                    {overdueLoans.length > 0 && (
                                        <div className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-rose-50 via-red-50/60 to-rose-50 border border-rose-200 shadow-2xs">
                                            <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
                                                <div className="flex items-center gap-1.5">
                                                    <AlertTriangle size={15} className="text-[#D84040] shrink-0" />
                                                    <span className="text-xs font-black text-rose-900 tracking-tight">
                                                        Terlambat
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-2 space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                                                {overdueLoans.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="p-2.5 bg-white rounded-xl border border-rose-200 hover:border-rose-400 transition-all text-left shadow-2xs"
                                                    >
                                                        <div className="flex items-start justify-between gap-1.5">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="font-extrabold text-xs text-[#1D1616] truncate" title={item.barang_name}>
                                                                    {item.barang_name}
                                                                </div>
                                                                <div className="text-[11px] font-mono font-semibold text-[#D84040] truncate">
                                                                    Unit: {item.kode_unit}
                                                                </div>
                                                            </div>
                                                            {/* Real-time Ticking Counter */}
                                                            <div className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 text-[11px] font-semibold tracking-tight flex items-center gap-1 shadow-2xs">
                                                                <Clock size={12} className="text-[#D84040] animate-pulse shrink-0" />
                                                                <span>{formatOverdueElapsed(item.batas_kembali)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 pt-1.5 flex items-center justify-between text-[11px] border-t border-gray-100 text-gray-600">
                                                            <span className="truncate max-w-[170px] sm:max-w-[210px]" title={item.user_name}>
                                                                Peminjam: <strong className="text-[#1D1616]">{item.user_name}</strong>
                                                            </span>
                                                            <Link
                                                                href="/admin/logbook"
                                                                onClick={() => setShowNotifDropdown(false)}
                                                                className="text-[10.5px] font-bold text-[#D84040] hover:text-[#8E1616] hover:underline shrink-0"
                                                            >
                                                                Logbook →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Simulation Buttons inside dropdown */}
                                    <div className="mt-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="text-[11px] font-semibold text-gray-500 mb-2">
                                            Uji Coba Tampilan Toast:
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleTriggerTest('borrow', 'baik');
                                                    setShowNotifDropdown(false);
                                                }}
                                                className="py-1.5 px-1 bg-white hover:bg-gray-100 text-[#1D1616] border border-gray-300 rounded-lg text-[10.5px] font-bold transition-colors shadow-2xs text-center cursor-pointer"
                                                title="Peminjaman (Ikon Hitam)"
                                            >
                                                • Pinjam
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleTriggerTest('return', 'baik');
                                                    setShowNotifDropdown(false);
                                                }}
                                                className="py-1.5 px-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-[10.5px] font-bold transition-colors shadow-2xs text-center cursor-pointer"
                                                title="Pengembalian Baik (Ikon Hijau)"
                                            >
                                                ✓ Kembali
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleTriggerTest('return', 'rusak');
                                                    setShowNotifDropdown(false);
                                                }}
                                                className="py-1.5 px-1 bg-white hover:bg-red-50 text-[#D84040] border border-red-300 rounded-lg text-[10.5px] font-bold transition-colors shadow-2xs text-center cursor-pointer"
                                                title="Pengembalian Rusak (Ikon Merah)"
                                            >
                                                ✕ Rusak
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleTriggerTest('overdue');
                                                    setShowNotifDropdown(false);
                                                }}
                                                className="py-1.5 px-1 bg-rose-50 hover:bg-rose-100 text-[#D84040] border border-rose-300 rounded-lg text-[10.5px] font-bold transition-colors shadow-2xs text-center cursor-pointer"
                                                title="Keterlambatan / Overdue (Alarm)"
                                            >
                                                ⚠️ Terlambat
                                            </button>
                                        </div>
                                    </div>

                                    {/* Recent Log History */}
                                    <div className="mt-3 max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {notificationHistory.length === 0 ? (
                                            <div className="py-6 text-center text-xs text-gray-400">
                                                Menunggu transaksi peminjaman atau pengembalian barang dari pengguna...
                                            </div>
                                        ) : (
                                            notificationHistory.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left text-xs"
                                                >
                                                    <div className="flex items-center justify-between font-bold text-[#1D1616]">
                                                        <span>{item.title}</span>
                                                        <span className="text-[10px] font-normal text-gray-400">
                                                            {item.time || 'Baru saja'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mt-0.5 text-[11px] leading-tight">
                                                        {item.message}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                                        <Link
                                            href="/admin/logbook"
                                            onClick={() => setShowNotifDropdown(false)}
                                            className="text-xs font-bold text-[#D84040] hover:text-[#8E1616] inline-flex items-center gap-1"
                                        >
                                            Buka Halaman Logbook
                                            <ArrowUpRight size={13} />
                                        </Link>
                                        {(toasts.length > 0 || overdueLoans.some((o) => o.id.startsWith('sim_'))) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setToasts([]);
                                                    setOverdueLoans((prev) => prev.filter((o) => !o.id.startsWith('sim_')));
                                                }}
                                                className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                                            >
                                                Bersihkan Toast
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Avatar Badge */}
                        <div className="w-10 h-10 rounded-xl bg-[#D84040] hover:bg-[#8E1616] text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors shadow-xs">
                            {user?.nama?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mx-6 lg:mx-10 mt-5 p-4 rounded-xl bg-white border-l-4 border-emerald-600 text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-xs border border-[#E0E0E0]">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-6 lg:mx-10 mt-5 p-4 rounded-xl bg-white border-l-4 border-[#D84040] text-[#8E1616] text-xs font-semibold flex items-center gap-3 shadow-xs border border-[#E0E0E0]">
                        <AlertCircle size={18} className="text-[#D84040] shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Page Content with key={url} to trigger page transition animation on every navigation */}
                <main key={url || window.location.pathname} className="flex-1 p-6 lg:p-10 animate-page-enter">
                    {isPageLoading ? <PageSkeleton path={loadingPath || url} /> : children}
                </main>

                {/* Live Floating Notification Toast Container */}
                <NotificationToastContainer toasts={toasts} onDismiss={handleDismissToast} />
            </div>
        </div>
    );
}
