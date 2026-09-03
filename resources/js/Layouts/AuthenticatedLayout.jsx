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
    RefreshCw
} from 'lucide-react';
import NotificationToastContainer from '@/Components/NotificationToast';

export default function AuthenticatedLayout({ title, children }) {
    const { auth, flash, url } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [notificationHistory, setNotificationHistory] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    const user = auth?.user;
    const lastCheckedTimeRef = useRef(new Date().toISOString());
    const dropdownRef = useRef(null);

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Kalender', href: '/admin/calendar', icon: Calendar },
        { name: 'Master Barang', href: '/admin/barang', icon: Package },
        { name: 'Unit Fisik', href: '/admin/unit', icon: Layers },
        { name: 'Logbook', href: '/admin/logbook', icon: BookOpen },
        { name: 'Generate QR', href: '/admin/qrcode', icon: QrCode },
        { name: 'Manajemen User', href: '/admin/users', icon: Users },
        { name: 'Laporan', href: '/admin/reports', icon: BarChart3 },
    ];

    // Chime sound on new transaction
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

    const handleDismissToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // Live Polling for transactions (Peminjaman & Pengembalian)
    useEffect(() => {
        let isMounted = true;

        const pollTransactions = async () => {
            try {
                const res = await fetch(
                    `/admin/notifications/check?since=${encodeURIComponent(lastCheckedTimeRef.current)}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    }
                );

                if (!res.ok) return;
                const data = await res.json();

                if (!isMounted) return;

                if (data.server_time) {
                    lastCheckedTimeRef.current = data.server_time;
                }

                if (data.notifications && data.notifications.length > 0) {
                    playNotificationSound();
                    setToasts((prev) => [...data.notifications, ...prev].slice(0, 5));
                    setNotificationHistory((prev) => [...data.notifications, ...prev].slice(0, 15));
                }
            } catch (err) {
                // Ignore transient network errors
            }
        };

        // Initial setup poll
        pollTransactions();

        // Interval poll every 4.5 seconds
        const intervalId = setInterval(pollTransactions, 4500);

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

    // Trigger test simulated notification
    const handleTriggerTest = async (type = 'borrow', kondisi = 'baik') => {
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
                    playNotificationSound();
                    setToasts((prev) => [data.notification, ...prev.filter((t) => t.id !== data.notification.id)].slice(0, 5));
                    setNotificationHistory((prev) => [data.notification, ...prev].slice(0, 15));
                    setIsTesting(false);
                    return;
                }
            }
        } catch (err) {
            console.error('Test notification fetch error:', err);
        }

        // Guaranteed instant fallback
        const isReturn = type === 'return';
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
        router.post('/admin/logout');
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
                        <div className="w-10 h-10 rounded-xl bg-[#D84040] flex items-center justify-center font-black text-white shadow-xs">
                            <span className="text-xl tracking-tighter">W</span>
                        </div>
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
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    active
                                        ? 'bg-[#D84040] text-white shadow-xs'
                                        : 'text-[#525866] hover:bg-[#EEEEEE] hover:text-[#1D1616]'
                                }`}
                            >
                                <Icon
                                    size={19}
                                    className={active ? 'text-white' : 'text-[#6B7280]'}
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
                        <h1 className="text-xl lg:text-2xl font-extrabold text-[#1D1616] tracking-tight">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 lg:gap-5" ref={dropdownRef}>
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
                                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                title="Notifikasi Transaksi Realtime"
                                className="w-10 h-10 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] hover:bg-[#E5E5E5] text-[#1D1616] flex items-center justify-center transition-colors relative cursor-pointer"
                            >
                                <Bell size={18} className={toasts.length > 0 ? 'text-[#D84040] animate-bounce' : 'text-[#525866]'} />
                                {toasts.length > 0 ? (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D84040] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                                        {toasts.length}
                                    </span>
                                ) : (
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500"></span>
                                )}
                            </button>

                            {/* Notification Dropdown Menu */}
                            {showNotifDropdown && (
                                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-[#E0E0E0] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <h4 className="font-bold text-sm text-[#1D1616]">
                                                Notifikasi Transaksi Live
                                            </h4>
                                        </div>
                                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                            Aktif Polling
                                        </span>
                                    </div>

                                    {/* Quick Simulation Buttons inside dropdown */}
                                    <div className="mt-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="text-[11px] font-semibold text-gray-500 mb-2">
                                            Uji Coba Tampilan Toast:
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleTriggerTest('borrow', 'baik');
                                                    setShowNotifDropdown(false);
                                                }}
                                                className="py-1.5 px-1.5 bg-white hover:bg-gray-100 text-[#1D1616] border border-gray-300 rounded-lg text-[10.5px] font-bold transition-colors shadow-2xs text-center"
                                                title="Peminjaman (Ikon Hitam)"
                                            >
                                                • Pinjam (Hitam)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleTriggerTest('return', 'baik');
                                                    setShowNotifDropdown(false);
                                                }}
                                                className="py-1.5 px-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-[10.5px] font-bold transition-colors shadow-2xs text-center"
                                                title="Pengembalian Baik (Ikon Hijau)"
                                            >
                                                ✓ Kembali (Baik)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleTriggerTest('return', 'rusak');
                                                    setShowNotifDropdown(false);
                                                }}
                                                className="py-1.5 px-1.5 bg-white hover:bg-red-50 text-[#D84040] border border-red-300 rounded-lg text-[10.5px] font-bold transition-colors shadow-2xs text-center"
                                                title="Pengembalian Rusak (Ikon Merah)"
                                            >
                                                ✕ Kembali (Rusak)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Recent Log History */}
                                    <div className="mt-3 max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
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
                                        {toasts.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setToasts([])}
                                                className="text-[11px] text-gray-400 hover:text-gray-600"
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

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-10">{children}</main>

                {/* Live Floating Notification Toast Container */}
                <NotificationToastContainer toasts={toasts} onDismiss={handleDismissToast} />
            </div>
        </div>
    );
}
