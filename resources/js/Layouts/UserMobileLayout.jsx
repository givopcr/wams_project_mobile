import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Home,
    Package,
    QrCode,
    Clock,
    User,
    Shield,
    Bell,
    CheckCircle2,
    AlertCircle,
    X,
    Maximize2,
    Minimize2,
    Sparkles,
    ArrowLeft
} from 'lucide-react';

export default function UserMobileLayout({ title, children, showBackButton = false, onBack = null }) {
    const { auth, flash, url } = usePage().props;
    const user = auth?.user;
    const currentUrl = url || window.location.pathname;

    const [isFullWidth, setIsFullWidth] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Listen to flash messages
    useEffect(() => {
        if (flash?.success) {
            setToastMessage({ type: 'success', text: flash.success });
            const timer = setTimeout(() => setToastMessage(null), 4500);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setToastMessage({ type: 'error', text: flash.error });
            const timer = setTimeout(() => setToastMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Navigation items
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
            icon: Package,
            active: currentUrl.startsWith('/user/katalog'),
        },
        {
            name: 'Scan',
            href: '/user/scanner',
            icon: QrCode,
            isCenter: true,
            active: currentUrl === '/user/scanner',
        },
        {
            name: 'Pinjaman',
            href: '/user/peminjaman',
            icon: Clock,
            active: currentUrl === '/user/peminjaman',
        },
        {
            name: 'Profil',
            href: '/user/profile',
            icon: User,
            active: currentUrl === '/user/profile',
        },
    ];

    const handleBackClick = () => {
        if (onBack) {
            onBack();
        } else if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit('/user/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#E5E7EB] text-[#1D1616] font-['Inter',ui-sans-serif,system-ui,sans-serif] antialiased selection:bg-[#D84040] selection:text-white flex flex-col justify-between">
            {/* Main Mobile App Viewport Container */}
            <div
                className={`w-full mx-auto min-h-screen bg-[#EEEEEE] flex flex-col transition-all duration-200 relative ${
                    isFullWidth
                        ? 'max-w-3xl'
                        : 'max-w-[440px] shadow-2xl sm:border-x sm:border-[#E0E0E0]'
                }`}
            >
                {/* Admin Mode Banner (If Admin is previewing user mode) */}
                {user?.role === 'admin' && (
                    <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs z-50">
                        <div className="flex items-center gap-2">
                            <Shield size={14} className="shrink-0" />
                            <span>Mode Pratinjau User (Admin)</span>
                        </div>
                        <Link
                            href="/admin/dashboard"
                            className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all"
                        >
                            Kembali ke Admin
                        </Link>
                    </div>
                )}

                {/* Top App Bar Header (Matching WAMS Admin Design) */}
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E0E0E0] px-4 py-3 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                        {showBackButton ? (
                            <button
                                type="button"
                                onClick={handleBackClick}
                                className="w-9 h-9 rounded-xl bg-[#EEEEEE] hover:bg-[#E0E0E0] text-[#1D1616] flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Kembali"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        ) : (
                            <Link href="/user/dashboard" className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-[#D84040] flex items-center justify-center font-black text-white shadow-xs">
                                    <span className="text-base tracking-tighter">W</span>
                                </div>
                                <div>
                                    <span className="font-black text-lg tracking-tight text-[#1D1616] leading-none block">
                                        WAMS
                                    </span>
                                    <span className="text-[10px] text-[#6B7280] font-medium tracking-tight block">
                                        Workshop Mobile
                                    </span>
                                </div>
                            </Link>
                        )}

                        {title && showBackButton && (
                            <h1 className="text-sm font-extrabold text-[#1D1616] tracking-tight truncate max-w-[200px]">
                                {title}
                            </h1>
                        )}
                    </div>

                    {/* Right Header Actions */}
                    <div className="flex items-center gap-2">
                        {/* Viewport size switcher for desktop testers */}
                        <button
                            type="button"
                            onClick={() => setIsFullWidth(!isFullWidth)}
                            className="hidden sm:flex w-8 h-8 rounded-xl bg-[#EEEEEE] hover:bg-[#E0E0E0] text-[#6B7280] hover:text-[#1D1616] items-center justify-center transition-colors cursor-pointer"
                            title={isFullWidth ? 'Beralih ke tampilan HP (440px)' : 'Perlebar tampilan (768px)'}
                        >
                            {isFullWidth ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                        </button>

                        {/* User Status Pill */}
                        <Link
                            href="/user/profile"
                            className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-full bg-[#EEEEEE] border border-[#E0E0E0] hover:border-[#D84040] transition-colors"
                        >
                            <span className="text-xs font-bold text-[#1D1616] max-w-[100px] truncate">
                                {user?.nama?.split(' ')[0] || 'Teknisi'}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-[#D84040] text-white flex items-center justify-center text-[10px] font-black">
                                {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Floating Toast Alert */}
                {toastMessage && (
                    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[400px] animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
                        <div
                            className={`p-3.5 rounded-2xl shadow-xl flex items-center gap-3 border pointer-events-auto ${
                                toastMessage.type === 'success'
                                    ? 'bg-emerald-900/95 border-emerald-700 text-white'
                                    : 'bg-rose-900/95 border-rose-700 text-white'
                            }`}
                        >
                            {toastMessage.type === 'success' ? (
                                <CheckCircle2 size={20} className="text-emerald-300 shrink-0" />
                            ) : (
                                <AlertCircle size={20} className="text-rose-300 shrink-0" />
                            )}
                            <p className="text-xs font-semibold leading-snug flex-1">
                                {toastMessage.text}
                            </p>
                            <button
                                type="button"
                                onClick={() => setToastMessage(null)}
                                className="text-white/80 hover:text-white p-1"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Page Content Viewport with key={url} to trigger page transition animation */}
                <main key={url || window.location.pathname} className="flex-1 pb-24 px-4 pt-4 animate-page-enter">
                    {children}
                </main>

                {/* Bottom Navigation Dock (Fixed at bottom) */}
                <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
                    <div
                        className={`mx-auto w-full transition-all duration-200 pointer-events-auto ${
                            isFullWidth ? 'max-w-3xl' : 'max-w-[440px]'
                        }`}
                    >
                        <div className="bg-white/95 backdrop-blur-md border-t border-[#E0E0E0] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around sm:rounded-t-2xl">
                            {navItems.map((item) => {
                                const Icon = item.icon;

                                if (item.isCenter) {
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="relative -top-5 flex flex-col items-center group cursor-pointer"
                                        >
                                            <div
                                                className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg active:scale-95 ${
                                                    item.active
                                                        ? 'bg-gradient-to-tr from-[#8E1616] to-[#D84040] shadow-[#D84040]/40 ring-4 ring-white'
                                                        : 'bg-gradient-to-tr from-[#D84040] to-[#E55353] shadow-[#D84040]/35 ring-4 ring-white group-hover:scale-105'
                                                }`}
                                            >
                                                <Icon size={24} className="animate-pulse" />
                                            </div>
                                            <span
                                                className={`text-[10px] font-extrabold mt-1 tracking-tight ${
                                                    item.active ? 'text-[#D84040]' : 'text-[#6B7280]'
                                                }`}
                                            >
                                                {item.name}
                                            </span>
                                        </Link>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                                            item.active
                                                ? 'text-[#D84040]'
                                                : 'text-[#6B7280] hover:text-[#1D1616]'
                                        }`}
                                    >
                                        <div className="relative">
                                            <Icon
                                                size={20}
                                                className={item.active ? 'stroke-[2.5]' : 'stroke-[1.75]'}
                                            />
                                            {item.name === 'Pinjaman' && auth?.user && (
                                                <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#D84040] ring-2 ring-white" />
                                            )}
                                        </div>
                                        <span
                                            className={`text-[10px] tracking-tight mt-1 ${
                                                item.active ? 'font-black' : 'font-medium'
                                            }`}
                                        >
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
}
