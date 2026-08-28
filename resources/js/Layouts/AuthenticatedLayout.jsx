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
    const [searchGlobal, setSearchGlobal] = useState('');

    const user = auth?.user;

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Barang', href: '/admin/barang', icon: Package },
        { name: 'Kategori Barang', href: '/admin/kategori', icon: Boxes },
        { name: 'Logbook', href: '/admin/logbook', icon: BookOpen },
        { name: 'Generate QR', href: '/admin/qrcode', icon: QrCode },
        { name: 'Manajemen User', href: '/admin/users', icon: Users },
        { name: 'Laporan', href: '/admin/reports', icon: BarChart3 },
    ];

    const handleLogout = () => {
        router.post('/admin/logout');
    };

    const handleGlobalSearch = (e) => {
        e.preventDefault();
        if (searchGlobal.trim()) {
            router.get('/admin/barang', { q: searchGlobal });
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFAF3] text-[#1E232A] flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-[#1E232A]/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Flat Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#FFF2DB] border-r border-[#F0DFC4] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header */}
                <div className="h-20 flex items-center justify-between px-7 border-b border-[#F0DFC4]">
                    <Link href="/admin/dashboard" className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#F62440] flex items-center justify-center font-black text-white">
                            <span className="text-xl tracking-tighter">W</span>
                        </div>
                        <div>
                            <span className="font-extrabold text-[22px] tracking-tight text-[#1E232A] block leading-none">
                                WAMS<span className="text-[#F62440]">.</span>
                            </span>
                            <span className="text-[10px] text-[#6B7280] font-semibold tracking-wider uppercase block mt-1">
                                Workshop Assets
                            </span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1E232A] hover:bg-[#FFE5BF] lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Flat Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                    {navItems.map((item) => {
                        const currentUrl = url || window.location.pathname;
                        const active = currentUrl === item.href || (item.href !== '/admin/dashboard' && currentUrl.startsWith(item.href));
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                                    active
                                        ? 'bg-[#F62440] text-white'
                                        : 'text-[#525866] hover:bg-[#FFE5BF] hover:text-[#1E232A]'
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
                <div className="p-4 mx-3 mb-4 rounded-xl bg-[#FFE5BF] border border-[#F0DFC4]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#F62440] flex items-center justify-center font-bold text-sm text-white shrink-0">
                                {user?.nama?.charAt(0) || 'A'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-[#1E232A] truncate">{user?.nama}</p>
                                <span className="inline-flex items-center gap-1 text-[10px] text-[#6B7280] font-medium">
                                    <Shield size={10} className="text-[#F62440]" />
                                    {user?.role?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="p-2 text-[#6B7280] hover:text-[#F62440] hover:bg-[#FFFAF3] rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                {/* Flat Navbar Header */}
                <header className="h-20 sticky top-0 z-30 bg-[#FFFAF3] border-b border-[#F0DFC4] px-6 lg:px-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-xl text-[#6B7280] hover:bg-[#FFF2DB] lg:hidden"
                        >
                            <Menu size={22} />
                        </button>
                        <h1 className="text-xl lg:text-2xl font-extrabold text-[#1E232A] tracking-tight">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-5">
                        {/* Flat Search Bar */}
                        <form onSubmit={handleGlobalSearch} className="hidden md:flex relative items-center">
                            <Search size={17} className="absolute left-3.5 text-[#6B7280] pointer-events-none" />
                            <input
                                type="text"
                                value={searchGlobal}
                                onChange={(e) => setSearchGlobal(e.target.value)}
                                placeholder="Cari barang, alat, unit..."
                                className="w-64 lg:w-72 pl-10 pr-4 py-2.5 bg-[#FFF2DB] border border-[#F0DFC4] rounded-xl text-xs font-medium text-[#1E232A] placeholder-[#8C93A0] focus:outline-none focus:border-[#F62440] transition-colors"
                            />
                        </form>

                        {/* Setting Icon Button */}
                        <Link
                            href="/admin/users"
                            title="Pengaturan Akun"
                            className="w-10 h-10 rounded-xl bg-[#FFF2DB] border border-[#F0DFC4] hover:bg-[#FFE5BF] text-[#525866] hover:text-[#1E232A] flex items-center justify-center transition-colors"
                        >
                            <Settings size={18} />
                        </Link>

                        {/* Notification Icon Button */}
                        <Link
                            href="/admin/logbook"
                            title="Aktivitas Transaksi"
                            className="w-10 h-10 rounded-xl bg-[#FFF2DB] border border-[#F0DFC4] hover:bg-[#FFE5BF] text-[#F62440] flex items-center justify-center transition-colors relative"
                        >
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F62440]"></span>
                        </Link>

                        {/* Flat User Avatar Badge */}
                        <div className="w-10 h-10 rounded-xl bg-[#F62440] text-white flex items-center justify-center font-bold text-sm cursor-pointer">
                            {user?.nama?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mx-6 lg:mx-10 mt-5 p-4 rounded-xl bg-[#FFF2DB] border-l-4 border-[#10B981] text-[#065F46] text-xs font-semibold flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-[#10B981] shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-6 lg:mx-10 mt-5 p-4 rounded-xl bg-[#FFF2DB] border-l-4 border-[#F62440] text-[#991B1B] text-xs font-semibold flex items-center gap-3">
                        <AlertCircle size={18} className="text-[#F62440] shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-10">{children}</main>
            </div>
        </div>
    );
}
