import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
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
    CheckCircle2,
    AlertCircle,
    Scan
} from 'lucide-react';

export default function AuthenticatedLayout({ title, children }) {
    const { auth, flash, url } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const user = auth?.user;

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        {
            group: 'ASSET MANAGEMENT',
            items: [
                { name: 'Kategori', href: '/admin/kategori', icon: Boxes },
                { name: 'Master Barang', href: '/admin/barang', icon: Package },
                { name: 'Unit Barang', href: '/admin/unit', icon: Layers },
            ],
        },
        {
            group: 'TRANSAKSI',
            items: [
                { name: 'Logbook Transaksi', href: '/admin/logbook', icon: BookOpen },
                { name: 'Scanner', href: '/admin/scanner', icon: Scan },
            ],
        },
        {
            group: 'PENGATURAN',
            items: [
                { name: 'Manajemen User', href: '/admin/users', icon: Users },
                { name: 'Generate QR Code', href: '/admin/qrcode', icon: QrCode },
                { name: 'Laporan & Analytics', href: '/admin/reports', icon: BarChart3 },
            ],
        },
    ];

    const handleLogout = () => {
        router.post('/admin/logout');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                            W
                        </div>
                        <div>
                            <span className="font-bold text-lg tracking-tight text-white block leading-tight">WAMS</span>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">Workshop Asset</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
                    {navItems.map((section, idx) => {
                        if (section.group) {
                            return (
                                <div key={idx} className="space-y-1">
                                    <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        {section.group}
                                    </h3>
                                    <div className="space-y-1 pt-1">
                                        {section.items.map((item) => {
                                            const currentUrl = url || window.location.pathname;
                                            const active = currentUrl.startsWith(item.href);
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                        active
                                                            ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                                    }`}
                                                >
                                                    <Icon size={18} className={active ? 'text-blue-400' : 'text-slate-500'} />
                                                    <span>{item.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }

                        const Icon = section.icon;
                        const active = url === section.href;
                        return (
                            <Link
                                key={section.href}
                                href={section.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    active
                                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                            >
                                <Icon size={18} className={active ? 'text-blue-400' : 'text-slate-500'} />
                                <span>{section.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Profile info in Sidebar bottom */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
                                {user?.nama?.charAt(0) || 'A'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{user?.nama}</p>
                                <p className="text-[11px] text-slate-500 truncate capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                {/* Navbar */}
                <header className="h-16 sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800/60 lg:hidden"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            System Live
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mx-4 lg:mx-8 mt-4 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 shadow-lg">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-4 lg:mx-8 mt-4 p-4 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 shadow-lg">
                        <AlertCircle size={18} className="text-rose-400 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
