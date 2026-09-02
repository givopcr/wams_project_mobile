import React, { useState } from 'react';
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
    Shield
} from 'lucide-react';

export default function AuthenticatedLayout({ title, children }) {
    const { auth, flash, url } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const user = auth?.user;

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
                        const active = currentUrl === item.href || (item.href !== '/admin/dashboard' && currentUrl.startsWith(item.href));
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

                    <div className="flex items-center gap-4 lg:gap-5">
                        {/* Setting Icon Button */}
                        <Link
                            href="/admin/users"
                            title="Pengaturan Akun"
                            className="w-10 h-10 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] hover:bg-[#E5E5E5] text-[#525866] hover:text-[#1D1616] flex items-center justify-center transition-colors"
                        >
                            <Settings size={18} />
                        </Link>

                        {/* Notification Icon Button */}
                        <Link
                            href="/admin/logbook"
                            title="Aktivitas Transaksi"
                            className="w-10 h-10 rounded-xl bg-[#EEEEEE] border border-[#E0E0E0] hover:bg-[#E5E5E5] text-[#D84040] flex items-center justify-center transition-colors relative"
                        >
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D84040]"></span>
                        </Link>

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
            </div>
        </div>
    );
}
