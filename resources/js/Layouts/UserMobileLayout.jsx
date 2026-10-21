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
    ChevronLeft
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

    const [isFullWidth, setIsFullWidth] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

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

    // Navigation items matching Flutter MainNavigation.dart
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
        <div className="min-h-screen bg-[#E2E8F0] text-[#0F172A] font-['Poppins','Inter',ui-sans-serif,system-ui,sans-serif] antialiased selection:bg-[#D84040] selection:text-white flex flex-col justify-between">
            {/* Main Mobile App Viewport Container */}
            <div
                className={`w-full mx-auto min-h-screen flex flex-col transition-all duration-200 relative ${
                    darkAppBar ? 'bg-black text-white' : 'bg-[#F8F9FA] text-[#0F172A]'
                } ${
                    isFullWidth
                        ? 'max-w-3xl shadow-2xl'
                        : 'max-w-[440px] shadow-2xl sm:border-x sm:border-[#CBD5E1]'
                }`}
            >
                {/* Admin Mode Banner (If Admin is previewing user mode) */}
                {user?.role === 'admin' && (
                    <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs z-50">
                        <div className="flex items-center gap-2">
                            <Shield size={14} className="shrink-0" />
                            <span>Mode Pratinjau Mobile (Admin)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setIsFullWidth(!isFullWidth)}
                                className="hidden sm:flex w-6 h-6 rounded-md bg-white/20 hover:bg-white/30 text-white items-center justify-center transition-colors cursor-pointer"
                                title={isFullWidth ? 'Tampilan HP (440px)' : 'Perlebar (768px)'}
                            >
                                {isFullWidth ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                            </button>
                            <Link
                                href="/admin/dashboard"
                                className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all"
                            >
                                Ke Web Admin
                            </Link>
                        </div>
                    </div>
                )}

                {/* Top App Bar (Matching Flutter AppBarTheme when not hidden) */}
                {!hideAppBar && (
                    <header
                        className={`sticky top-0 z-40 px-4 py-3.5 flex items-center justify-between transition-colors ${
                            darkAppBar
                                ? 'bg-black text-white'
                                : 'bg-[#F8F9FA]/95 backdrop-blur-md text-[#0F172A]'
                        }`}
                    >
                        {centerTitle ? (
                            <div className="relative w-full flex items-center justify-center min-h-[34px]">
                                {showBackButton && (
                                    <button
                                        type="button"
                                        onClick={handleBackClick}
                                        className={`absolute left-0 w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors cursor-pointer ${
                                            darkAppBar
                                                ? 'bg-white/10 text-white hover:bg-white/20'
                                                : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50'
                                        }`}
                                        aria-label="Kembali"
                                    >
                                        <ChevronLeft size={18} strokeWidth={2.5} />
                                    </button>
                                )}
                                <div className="text-center px-10">
                                    <h1 className="text-[20px] font-black tracking-[-0.4px] leading-tight">
                                        {title}
                                    </h1>
                                    {subtitle && (
                                        <p className="text-[11px] text-[#64748B] font-normal mt-0.5">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                {rightAction && (
                                    <div className="absolute right-0 flex items-center gap-1.5">
                                        {rightAction}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 min-w-0">
                                    {showBackButton && (
                                        <button
                                            type="button"
                                            onClick={handleBackClick}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                                darkAppBar
                                                    ? 'hover:bg-white/10 text-white'
                                                    : 'hover:bg-slate-200/60 text-[#0F172A]'
                                            }`}
                                            aria-label="Kembali"
                                        >
                                            <ArrowLeft size={20} strokeWidth={2.2} />
                                        </button>
                                    )}
                                    <div className="min-w-0">
                                        <h1
                                            className={`font-bold tracking-tight truncate ${
                                                showBackButton ? 'text-[16px]' : 'text-[18px]'
                                            }`}
                                        >
                                            {title}
                                        </h1>
                                        {subtitle && (
                                            <p className="text-[11px] text-[#64748B] font-normal truncate">
                                                {subtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {rightAction}
                                    {!darkAppBar && user?.role !== 'admin' && (
                                        <button
                                            type="button"
                                            onClick={() => setIsFullWidth(!isFullWidth)}
                                            className="hidden sm:flex w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] items-center justify-center transition-colors cursor-pointer"
                                            title={isFullWidth ? 'Tampilan HP (440px)' : 'Perlebar tampilan (768px)'}
                                        >
                                            {isFullWidth ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </header>
                )}

                {/* Floating Toast Alert (Matching Flutter Floating SnackBar) */}
                {toastMessage && (
                    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[400px] animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
                        <div
                            className={`p-3.5 rounded-xl shadow-xl flex items-center gap-3 border pointer-events-auto ${
                                toastMessage.type === 'success'
                                    ? 'bg-[#059669] border-emerald-500 text-white'
                                    : 'bg-[#DC2626] border-rose-500 text-white'
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
                    className={`flex-1 animate-page-enter ${
                        noPadding ? 'pb-20' : 'px-[18px] pt-1 pb-24'
                    }`}
                >
                    {children}
                </main>

                {/* Bottom Navigation Bar (Matching Flutter MainNavigation.dart 1:1) */}
                {showBottomNav && (
                    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
                        <div
                            className={`mx-auto w-full transition-all duration-200 pointer-events-auto ${
                                isFullWidth ? 'max-w-3xl' : 'max-w-[440px]'
                            }`}
                        >
                            <div className="bg-white border-t-[1.2px] border-[#CBD5E1] h-[66px] px-2.5 shadow-[0_-3px_12px_rgba(15,23,42,0.06)] flex items-center justify-around">
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
                                                    title={item.name}
                                                    className={`-mt-6 w-[56px] h-[56px] rounded-[18px] bg-gradient-to-br from-[#EF4444] to-[#DC2626] border-[4px] border-white flex items-center justify-center text-white transition-all duration-200 active:scale-95 shadow-[0_8px_20px_rgba(220,38,38,0.45)] ${
                                                        item.active
                                                            ? 'ring-2 ring-[#DC2626]/35 scale-105'
                                                            : 'hover:-translate-y-0.5 hover:brightness-105'
                                                    }`}
                                                >
                                                    <Icon size={26} strokeWidth={2.3} />
                                                </Link>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={item.name} className="flex-1 flex items-center justify-center">
                                            <Link
                                                href={item.href}
                                                title={item.name}
                                                className="relative group flex items-center justify-center"
                                            >
                                                <div
                                                    className={`w-[44px] h-[44px] rounded-[13px] flex items-center justify-center transition-all duration-200 ${
                                                        item.active
                                                            ? 'bg-[#FEE2E2] text-[#DC2626]'
                                                            : 'bg-transparent text-[#64748B] hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <Icon
                                                        size={23}
                                                        strokeWidth={item.active ? 2.4 : 2}
                                                    />
                                                </div>
                                                {item.hasBadge && (
                                                    <span className="absolute top-[8px] right-[8px] w-[7px] h-[7px] rounded-full bg-[#DC2626]" />
                                                )}
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
