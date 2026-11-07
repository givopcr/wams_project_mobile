import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Home,
    Box,
    QrCode,
    Clock,
    User,
    Shield,
    CheckCircle2,
    AlertCircle,
    X,
    Maximize2,
    Minimize2,
    ArrowLeft,
    Wrench
} from 'lucide-react';

export default function UserMobileLayout({
    title,
    subtitle = null,
    children,
    showBackButton = false,
    onBack = null,
    hideAppBar = false,
    darkAppBar = false,
    centerTitle = false,
    rightAction = null,
    noPadding = false,
    showBottomNav = true,
}) {
    const { auth, flash, url } = usePage().props;
    const user = auth?.user;
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '');

    const [isFullWidth, setIsFullWidth] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('wams_web_wide_mode') === '1';
        }
        return false;
    });
    const [toastMessage, setToastMessage] = useState(null);

    const toggleFullWidth = () => {
        setIsFullWidth((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('wams_web_wide_mode', next ? '1' : '0');
            }
            return next;
        });
    };

    // Listen to flash messages
    useEffect(() => {
        if (flash?.success) {
            setToastMessage({ type: 'success', text: flash.success });
            const timer = setTimeout(() => setToastMessage(null), 4000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setToastMessage({ type: 'error', text: flash.error });
            const timer = setTimeout(() => setToastMessage(null), 4500);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const navItems = [
        {
            name: 'Beranda',
            href: '/user/dashboard',
            icon: Home,
            active: currentUrl === '/user/dashboard' || currentUrl === '/user',
        },
        {
            name: 'Katalog',
            href: '/user/katalog',
            icon: Box,
            active: currentUrl.startsWith('/user/katalog') || currentUrl.startsWith('/user/barang'),
        },
        {
            name: 'Scan',
            href: '/user/scanner',
            icon: QrCode,
            isCenter: true,
            active: currentUrl.startsWith('/user/scanner'),
        },
        {
            name: 'Riwayat',
            href: '/user/riwayat',
            icon: Clock,
            hasBadge: true,
            active: currentUrl.startsWith('/user/riwayat') || currentUrl.startsWith('/user/peminjaman'),
        },
        {
            name: 'Profil',
            href: '/user/profile',
            icon: User,
            active: currentUrl.startsWith('/user/profile'),
        },
    ];

    const handleBackClick = () => {
        if (onBack) {
            onBack();
        } else if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        } else {
            router.visit('/user/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#E2E8F0] bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:20px_20px] text-[#0F172A] font-['Poppins','Inter',ui-sans-serif,system-ui,sans-serif] antialiased selection:bg-[#D84040] selection:text-white flex flex-col justify-between">
            {/* Main Web App Container */}
            <div
                className={`w-full mx-auto min-h-screen flex flex-col transition-all duration-300 relative ${darkAppBar ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-[#0F172A]'
                    } ${isFullWidth
                        ? 'max-w-[820px] shadow-[0_0_50px_rgba(15,23,42,0.12)] sm:border-x sm:border-[#CBD5E1]/80'
                        : 'max-w-[480px] shadow-[0_0_40px_rgba(15,23,42,0.12)] sm:border-x sm:border-[#CBD5E1]/80'
                    }`}
            >
                {/* Admin Preview Bar */}
                {user?.role === 'admin' && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs z-50">
                        <div className="flex items-center gap-2">
                            <Shield size={14} className="shrink-0" />
                            <span>Pratinjau WAMS Mobile Web (Admin)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={toggleFullWidth}
                                className="hidden sm:flex px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-[10px] items-center gap-1 transition-colors cursor-pointer"
                                title={isFullWidth ? 'Mode Mobile (480px)' : 'Mode Lebar Web (820px)'}
                            >
                                {isFullWidth ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                                <span>{isFullWidth ? '480px' : '820px'}</span>
                            </button>
                            <Link
                                href="/admin/dashboard"
                                className="bg-white text-amber-700 hover:bg-amber-50 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all shadow-2xs"
                            >
                                Ke Web Admin
                            </Link>
                        </div>
                    </div>
                )}

                {/* Sticky Glassmorphic Web Navbar */}
                {!hideAppBar && (
                    <header
                        className={`sticky top-0 z-40 px-4 py-3 flex items-center justify-between transition-colors border-b ${darkAppBar
                                ? 'bg-[#0F172A]/90 border-white/10 text-white backdrop-blur-xl'
                                : 'bg-white/85 border-[#E2E8F0] text-[#0F172A] backdrop-blur-xl shadow-[0_2px_12px_rgba(15,23,42,0.03)]'
                            }`}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            {showBackButton ? (
                                <button
                                    type="button"
                                    onClick={handleBackClick}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${darkAppBar
                                            ? 'bg-white/10 border-white/15 hover:bg-white/20 text-white'
                                            : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#D84040]/40 hover:bg-rose-50/40 text-[#0F172A]'
                                        }`}
                                    aria-label="Kembali"
                                >
                                    <ArrowLeft size={18} strokeWidth={2.3} />
                                </button>
                            ) : (
                                <Link
                                    href="/user/dashboard"
                                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D84040] to-[#991B1B] text-white flex items-center justify-center shadow-sm shadow-[#D84040]/25 shrink-0"
                                >
                                    <Wrench size={17} strokeWidth={2.4} />
                                </Link>
                            )}

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="font-extrabold tracking-tight truncate text-[16px] leading-snug">
                                        {title || 'WAMS Portal'}
                                    </h1>
                                    {!showBackButton && (
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shrink-0 ${darkAppBar
                                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                                                    : 'bg-rose-50 text-[#D84040] border border-rose-200/80'
                                                }`}
                                        >
                                            Web
                                        </span>
                                    )}
                                </div>
                                {subtitle && (
                                    <p
                                        className={`text-[11px] font-medium truncate ${darkAppBar ? 'text-slate-400' : 'text-[#64748B]'
                                            }`}
                                    >
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {rightAction}
                            {user?.role !== 'admin' && (
                                <button
                                    type="button"
                                    onClick={toggleFullWidth}
                                    className={`hidden sm:flex h-8 px-2.5 rounded-xl border text-[11px] font-bold items-center gap-1.5 transition-colors cursor-pointer ${darkAppBar
                                            ? 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/20'
                                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:border-slate-300'
                                        }`}
                                    title={isFullWidth ? 'Tampilan Mobile (480px)' : 'Perlebar ke Mode Web (820px)'}
                                >
                                    {isFullWidth ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                                    <span className="hidden md:inline">
                                        {isFullWidth ? 'Mobile' : 'Wide'}
                                    </span>
                                </button>
                            )}
                        </div>
                    </header>
                )}

                {/* Floating Toast Alert */}
                {toastMessage && (
                    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px] animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
                        <div
                            className={`p-3.5 rounded-2xl shadow-xl flex items-center gap-3 border pointer-events-auto backdrop-blur-md ${toastMessage.type === 'success'
                                    ? 'bg-[#059669]/95 border-emerald-400 text-white'
                                    : 'bg-[#DC2626]/95 border-rose-400 text-white'
                                }`}
                        >
                            {toastMessage.type === 'success' ? (
                                <CheckCircle2 size={19} className="text-white shrink-0" />
                            ) : (
                                <AlertCircle size={19} className="text-white shrink-0" />
                            )}
                            <p className="text-xs font-semibold leading-snug flex-1">
                                {toastMessage.text}
                            </p>
                            <button
                                type="button"
                                onClick={() => setToastMessage(null)}
                                className="text-white/80 hover:text-white p-1 cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Page Content Viewport */}
                <main
                    key={currentUrl}
                    className={`flex-1 animate-page-enter ${noPadding ? 'pb-28' : 'px-4 pt-3 pb-28'
                        }`}
                >
                    {children}
                </main>

                {/* Floating Pill Island Bottom Dock (Web-Distinctive Navigation) */}
                {showBottomNav && (
                    <nav className="fixed bottom-3 left-0 right-0 z-40 pointer-events-none px-3">
                        <div
                            className={`mx-auto w-full transition-all duration-300 pointer-events-auto ${isFullWidth ? 'max-w-[796px]' : 'max-w-[456px]'
                                }`}
                        >
                            <div className="bg-[#18181B]/95 backdrop-blur-xl border border-white/10 rounded-[22px] h-[64px] px-2 shadow-[0_14px_34px_rgba(15,23,42,0.32)] flex items-center justify-around">
                                {navItems.map((item) => {
                                    const Icon = item.icon;

                                    if (item.isCenter) {
                                        return (
                                            <div
                                                key={item.name}
                                                className="flex-1 flex items-center justify-center relative"
                                            >
                                                <Link
                                                    href={item.href}
                                                    title="Scan QR Code"
                                                    className={`-mt-7 w-[56px] h-[56px] rounded-[18px] bg-gradient-to-br from-[#EF4444] to-[#B91C1C] border-[4px] border-[#F8FAFC] flex items-center justify-center text-white transition-all duration-200 active:scale-95 shadow-[0_8px_22px_rgba(220,38,38,0.5)] ${item.active
                                                            ? 'ring-2 ring-[#EF4444] scale-105'
                                                            : 'hover:-translate-y-0.5 hover:brightness-110'
                                                        }`}
                                                >
                                                    <Icon size={25} strokeWidth={2.3} />
                                                </Link>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={item.name}
                                            className="flex-1 flex items-center justify-center"
                                        >
                                            <Link
                                                href={item.href}
                                                title={item.name}
                                                className={`relative group py-1.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${item.active
                                                        ? 'bg-white/12 text-white'
                                                        : 'text-slate-400 hover:text-slate-200'
                                                    }`}
                                            >
                                                <div className="relative flex items-center justify-center">
                                                    <Icon
                                                        size={19}
                                                        strokeWidth={item.active ? 2.5 : 2}
                                                        className={
                                                            item.active
                                                                ? 'text-[#FF6B6B]'
                                                                : 'text-current'
                                                        }
                                                    />
                                                    {item.hasBadge && (
                                                        <span className="absolute -top-0.5 -right-1.5 w-[6px] h-[6px] rounded-full bg-[#EF4444] ring-2 ring-[#18181B]" />
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-[10px] leading-none tracking-tight ${item.active
                                                            ? 'font-bold text-white'
                                                            : 'font-medium text-slate-400'
                                                        }`}
                                                >
                                                    {item.name}
                                                </span>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
}
