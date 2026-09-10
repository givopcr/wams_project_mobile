import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import {
    User,
    Mail,
    IdCard,
    Shield,
    LogOut,
    CheckCircle2,
    Clock,
    BookOpen,
    HelpCircle,
    ChevronRight,
    AlertTriangle,
    X,
    Sparkles
} from 'lucide-react';

export default function MobileProfile({ user = {}, stats = {} }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        router.post('/admin/logout');
    };

    return (
        <UserMobileLayout title="Profil Pengguna" showBackButton onBack={() => router.visit('/user/dashboard')}>
            <Head title="Profil Pengguna - WAMS Mobile" />

            <div className="space-y-4">
                {/* Profile Header Card */}
                <div className="bg-white border border-[#E0E0E0] rounded-3xl p-5 shadow-2xs text-center relative overflow-hidden">
                    {/* Background accent */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#8E1616] via-[#B82424] to-[#D84040]" />

                    {/* Avatar Circle */}
                    <div className="relative pt-6 mb-3">
                        <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md mx-auto">
                            <div className="w-full h-full rounded-full bg-[#D84040] text-white flex items-center justify-center font-black text-2xl">
                                {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </div>
                    </div>

                    <h2 className="text-lg font-black text-[#1D1616] tracking-tight">
                        {user?.nama || 'Pengguna Workshop'}
                    </h2>
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-[#D84040] border border-rose-200 mt-1 mb-3">
                        {user?.role === 'admin' ? 'Administrator WAMS' : 'Teknisi / Mahasiswa'}
                    </span>

                    {/* User Details */}
                    <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-[#E0E0E0] space-y-2 text-xs text-left">
                        <div className="flex items-center gap-2.5 text-[#6B7280]">
                            <Mail size={15} className="shrink-0 text-[#D84040]" />
                            <span className="text-[#1D1616] font-medium truncate">{user?.email || '-'}</span>
                        </div>
                        {user?.nip && (
                            <div className="flex items-center gap-2.5 text-[#6B7280]">
                                <IdCard size={15} className="shrink-0 text-[#D84040]" />
                                <span className="text-[#1D1616] font-medium font-mono">NIP: {user.nip}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2.5 text-[#6B7280]">
                            <Clock size={15} className="shrink-0 text-[#D84040]" />
                            <span className="text-[#1D1616] font-medium">Terdaftar: {user?.joined_at || 'Anggota Aktif'}</span>
                        </div>
                    </div>
                </div>

                {/* Activity Stats Cards */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-2xs">
                    <h3 className="text-xs font-black uppercase text-[#6B7280] tracking-wider mb-3">
                        Statistik Transaksi
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E0E0E0]">
                            <span className="text-[10px] text-[#6B7280] font-bold block">Total Pinjam</span>
                            <span className="text-lg font-black text-[#1D1616]">{stats.total_pinjam || 0}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                            <span className="text-[10px] text-emerald-700 font-bold block">Selesai Kembali</span>
                            <span className="text-lg font-black text-emerald-800">{stats.selesai || 0}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                            <span className="text-[10px] text-amber-700 font-bold block">Sedang Dipinjam</span>
                            <span className="text-lg font-black text-amber-800">{stats.aktif || 0}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200">
                            <span className="text-[10px] text-blue-700 font-bold block">Menunggu Approval</span>
                            <span className="text-lg font-black text-blue-800">{stats.menunggu || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Workshop Quick Rules / Guidelines */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-2xs space-y-2.5 text-xs">
                    <h3 className="text-xs font-black uppercase text-[#6B7280] tracking-wider mb-2 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-[#D84040]" />
                        <span>Tata Tertib Peminjaman Alat</span>
                    </h3>
                    <div className="space-y-2 text-[#6B7280] text-[11px]">
                        <p className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-rose-50 text-[#D84040] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                            <span>Periksa kondisi fisik dan kelengkapan unit sebelum meninggalkan workshop.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-rose-50 text-[#D84040] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                            <span>Kembalikan alat tepat waktu sesuai batas durasi yang diajukan.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-rose-50 text-[#D84040] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                            <span>Laporkan jika terdapat kerusakan atau malfungsi unit saat proses pengembalian.</span>
                        </p>
                    </div>
                </div>

                {/* Switch to Admin if user is Admin */}
                {user?.role === 'admin' && (
                    <Link
                        href="/admin/dashboard"
                        className="w-full p-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl transition-colors shadow-xs flex items-center justify-center gap-2"
                    >
                        <Shield size={16} />
                        <span>Beralih ke Dashboard Web Admin</span>
                    </Link>
                )}

                {/* Logout Button */}
                <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full py-3 bg-white hover:bg-rose-50 border border-[#E0E0E0] hover:border-rose-200 text-[#D84040] font-bold text-xs rounded-2xl transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                    <LogOut size={16} />
                    <span>Keluar dari Akun</span>
                </button>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 bg-[#1D1616]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-[360px] bg-white rounded-3xl p-5 shadow-2xl border border-[#E0E0E0] text-center animate-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#D84040] mx-auto flex items-center justify-center mb-3">
                            <LogOut size={22} />
                        </div>
                        <h3 className="text-base font-black text-[#1D1616] mb-1">
                            Keluar dari Aplikasi?
                        </h3>
                        <p className="text-xs text-[#6B7280] mb-4">
                            Sesi Anda akan diakhiri dan dialihkan kembali ke halaman login.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="py-2.5 rounded-xl bg-[#EEEEEE] text-[#1D1616] font-bold text-xs hover:bg-[#E0E0E0] transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="py-2.5 rounded-xl bg-[#D84040] hover:bg-[#8E1616] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UserMobileLayout>
    );
}
