import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import {
    User,
    Mail,
    IdCard,
    LogOut,
    ChevronRight,
    Info,
    Camera,
    Image as ImageIcon,
    Trash2,
    ClipboardList,
    History,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    Code,
    RefreshCw,
    X,
    Shield
} from 'lucide-react';
import axios from 'axios';

export default function MobileProfile({ user = {}, stats = {} }) {
    // View state: 'profile' | 'edit'
    const [mode, setMode] = useState('profile');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showAvatarSheet, setShowAvatarSheet] = useState(false);

    // Custom local avatar (persisted in localStorage just like SharedPreferences in Flutter)
    const avatarStorageKey = `user_avatar_${user?.id || 'default'}`;
    const [customAvatar, setCustomAvatar] = useState(null);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    // Edit Profile state
    const [nama, setNama] = useState(user?.nama || '');
    const [nip, setNip] = useState(user?.nip || '');
    const [currentEmail, setCurrentEmail] = useState(user?.email || '');
    const [savingProfile, setSavingProfile] = useState(false);
    const [toastMsg, setToastMsg] = useState(null);

    // Bottom sheets in Edit Profile
    const [showPasswordSheet, setShowPasswordSheet] = useState(false);
    const [showEmailOtpSheet, setShowEmailOtpSheet] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(avatarStorageKey);
            if (saved) setCustomAvatar(saved);
        }
    }, [avatarStorageKey]);

    useEffect(() => {
        setNama(user?.nama || '');
        setNip(user?.nip || '');
        setCurrentEmail(user?.email || '');
    }, [user]);

    const showToast = (text, type = 'success') => {
        setToastMsg({ text, type });
        setTimeout(() => setToastMsg(null), 3500);
    };

    const handleAvatarFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            setCustomAvatar(dataUrl);
            if (typeof window !== 'undefined') {
                localStorage.setItem(avatarStorageKey, dataUrl);
            }
            setShowAvatarSheet(false);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setCustomAvatar(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(avatarStorageKey);
        }
        setShowAvatarSheet(false);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!nama.trim()) {
            showToast('Nama tidak boleh kosong', 'error');
            return;
        }
        setSavingProfile(true);
        try {
            const res = await axios.post(
                '/user/profile/update',
                {
                    nama: nama.trim(),
                    nip: nip.trim(),
                },
                { headers: { Accept: 'application/json' } }
            );
            if (res.data?.success) {
                showToast('Profil berhasil diperbarui!', 'success');
                router.reload({ only: ['user', 'auth'] });
                setMode('profile');
            }
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.errors?.nama?.[0] ||
                'Gagal memperbarui profil.';
            showToast(msg, 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    // =========================================================================
    // SUB-SCREEN 2: EDIT PROFILE SCREEN (edit_profile_screen.dart)
    // =========================================================================
    if (mode === 'edit') {
        return (
            <UserMobileLayout
                title="Edit Profil"
                centerTitle={true}
                showBackButton={true}
                onBack={() => setMode('profile')}
                noPadding={true}
            >
                <Head title="Edit Profil - WAMS" />

                {toastMsg && (
                    <div
                        className={`mx-[24px] mt-[16px] p-[12px] rounded-[12px] text-[13px] font-bold flex items-center gap-2 ${
                            toastMsg.type === 'error'
                                ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                                : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                        }`}
                    >
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{toastMsg.text}</span>
                    </div>
                )}

                <form onSubmit={handleSaveProfile} className="p-[24px] pb-[40px]">
                    {/* Informasi Akun Card */}
                    <div className="p-[20px] bg-white rounded-[16px] border border-[#EEEEEE]">
                        <div className="flex items-center gap-[10px] mb-[18px]">
                            <div className="w-[36px] h-[36px] rounded-[10px] bg-[#FEF2F2] flex items-center justify-center shrink-0">
                                <User size={20} className="text-[#D84040]" />
                            </div>
                            <h2 className="text-[16px] font-extrabold text-[#1D1616]">
                                Informasi Akun
                            </h2>
                        </div>

                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#8C93A0] mb-[6px]">
                                Nama Lengkap
                            </label>
                            <div className="relative flex items-center">
                                <User
                                    size={18}
                                    className="absolute left-[14px] text-[#8C93A0] pointer-events-none"
                                />
                                <input
                                    type="text"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    required
                                    className="w-full pl-[42px] pr-[16px] py-[14px] bg-[#FAFAFA] rounded-[12px] border border-[#E0E0E0] text-[14px] font-semibold text-[#1D1616] focus:outline-none focus:border-[#D84040] focus:border-[1.5px]"
                                />
                            </div>
                        </div>

                        {/* NIP */}
                        <div className="mt-[16px]">
                            <label className="block text-[11px] font-semibold text-[#8C93A0] mb-[6px]">
                                NIP (Nomor Induk Pegawai)
                            </label>
                            <div className="relative flex items-center">
                                <IdCard
                                    size={18}
                                    className="absolute left-[14px] text-[#8C93A0] pointer-events-none"
                                />
                                <input
                                    type="text"
                                    value={nip}
                                    onChange={(e) => setNip(e.target.value)}
                                    placeholder="Masukkan NIP"
                                    className="w-full pl-[42px] pr-[16px] py-[14px] bg-[#FAFAFA] rounded-[12px] border border-[#E0E0E0] text-[14px] font-semibold text-[#1D1616] focus:outline-none focus:border-[#D84040] focus:border-[1.5px]"
                                />
                            </div>
                        </div>

                        {/* Alamat Email Akun Box */}
                        <div className="mt-[16px] p-[14px] bg-[#FAFAFA] rounded-[12px] border border-[#E0E0E0] flex items-center justify-between gap-[12px]">
                            <div className="flex items-center gap-[12px] min-w-0 flex-1">
                                <Mail size={20} className="text-[#8C93A0] shrink-0" />
                                <div className="min-w-0">
                                    <span className="block text-[11px] font-semibold text-[#8C93A0]">
                                        Alamat Email Akun
                                    </span>
                                    <span className="block text-[14px] font-bold text-[#1D1616] truncate mt-[2px]">
                                        {currentEmail}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEmailOtpSheet(true)}
                                className="px-[12px] py-[8px] bg-[#FEF2F2] hover:bg-[#FEE2E2] rounded-[8px] border border-[#FECACA] text-[#D84040] text-[12px] font-bold shrink-0 cursor-pointer"
                            >
                                Ganti Email
                            </button>
                        </div>

                        {/* Password Akun Box */}
                        <div className="mt-[16px] p-[14px] bg-[#FAFAFA] rounded-[12px] border border-[#E0E0E0] flex items-center justify-between gap-[12px]">
                            <div className="flex items-center gap-[12px] min-w-0 flex-1">
                                <Lock size={20} className="text-[#8C93A0] shrink-0" />
                                <div className="min-w-0">
                                    <span className="block text-[11px] font-semibold text-[#8C93A0]">
                                        Password Akun
                                    </span>
                                    <span className="block text-[14px] font-bold text-[#1D1616] tracking-[2px] mt-[2px]">
                                        ••••••••
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPasswordSheet(true)}
                                className="px-[12px] py-[8px] bg-[#FEF2F2] hover:bg-[#FEE2E2] rounded-[8px] border border-[#FECACA] text-[#D84040] text-[12px] font-bold shrink-0 cursor-pointer"
                            >
                                Ganti Password
                            </button>
                        </div>
                    </div>

                    {/* Simpan Perubahan Button */}
                    <div className="mt-[28px]">
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="w-full h-[54px] rounded-[14px] bg-gradient-to-br from-[#D84040] to-[#A82020] shadow-[0_6px_14px_rgba(216,64,64,0.3)] text-white font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                            {savingProfile ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>Simpan Perubahan</span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Change Password Bottom Sheet */}
                {showPasswordSheet && (
                    <ChangePasswordSheet
                        nama={nama}
                        nip={nip}
                        onClose={() => setShowPasswordSheet(false)}
                        onSuccess={() => {
                            setShowPasswordSheet(false);
                            showToast('Password berhasil diperbarui!', 'success');
                        }}
                    />
                )}

                {/* Change Email OTP Bottom Sheet */}
                {showEmailOtpSheet && (
                    <ChangeEmailOtpSheet
                        currentEmail={currentEmail}
                        onClose={() => setShowEmailOtpSheet(false)}
                        onSuccess={(updatedEmail) => {
                            setCurrentEmail(updatedEmail);
                            setShowEmailOtpSheet(false);
                            showToast('Alamat email berhasil diperbarui!', 'success');
                            router.reload({ only: ['user', 'auth'] });
                        }}
                    />
                )}
            </UserMobileLayout>
        );
    }

    // =========================================================================
    // SUB-SCREEN 1: MAIN PROFILE SCREEN (profile_screen.dart)
    // =========================================================================
    return (
        <UserMobileLayout title="Profil Pengguna" noPadding={true}>
            <Head title="Profil Pengguna - WAMS" />

            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleAvatarFileChange}
                className="hidden"
            />
            <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
            />

            {toastMsg && (
                <div
                    className={`mx-[24px] mt-[16px] p-[12px] rounded-[12px] text-[13px] font-bold flex items-center gap-2 ${
                        toastMsg.type === 'error'
                            ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                            : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                    }`}
                >
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{toastMsg.text}</span>
                </div>
            )}

            <div className="p-[24px] pb-[36px]">
                {/* 1. Main Profile Card */}
                <div className="w-full p-[24px] bg-white rounded-[20px] border border-[#EEEEEE] shadow-[0_6px_16px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
                    {/* Avatar with Camera Badge */}
                    <button
                        type="button"
                        onClick={() => setShowAvatarSheet(true)}
                        className="relative group cursor-pointer"
                    >
                        <div className="w-[84px] h-[84px] rounded-full bg-[#FEF2F2] border-2 border-[#FEE2E2] p-[3px] flex items-center justify-center overflow-hidden">
                            {customAvatar ? (
                                <img
                                    src={customAvatar}
                                    alt={user?.nama}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-[#FEF2F2] flex items-center justify-center text-[32px] font-black text-[#D84040]">
                                    {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-[28px] h-[28px] rounded-full bg-[#D84040] border-2 border-white flex items-center justify-center text-white shadow-xs">
                            <Camera size={14} />
                        </div>
                    </button>

                    <h2 className="mt-[16px] text-[20px] font-extrabold text-[#1D1616]">
                        {user?.nama || 'User'}
                    </h2>
                    <p className="mt-[4px] text-[13px] font-medium text-[#8C93A0]">
                        {currentEmail || '-'}
                    </p>

                    <span className="mt-[12px] px-[12px] py-[5px] bg-[#FEF2F2] border border-[#FECACA] rounded-[20px] text-[10px] font-extrabold text-[#DC2626] tracking-[0.8px]">
                        {(user?.role || 'user').toUpperCase()}
                    </span>
                </div>

                {/* 2. INFORMASI AKUN Section */}
                <div className="mt-[28px]">
                    <h3 className="pl-[4px] mb-[10px] text-[12px] font-bold text-[#8C93A0] tracking-[0.8px]">
                        INFORMASI AKUN
                    </h3>
                    <div className="p-[16px] bg-white rounded-[16px] border border-[#EEEEEE] flex items-center gap-[14px]">
                        <div className="w-[42px] h-[42px] rounded-[10px] bg-[#F5F5F5] flex items-center justify-center shrink-0">
                            <IdCard size={20} className="text-[#1D1616]" />
                        </div>
                        <div>
                            <span className="block text-[11px] font-medium text-[#8C93A0]">
                                NIP Pegawai
                            </span>
                            <span className="block text-[14px] font-bold text-[#1D1616] mt-[2px]">
                                {user?.nip || '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Quick Stats Cards (Equal Height Row) */}
                <div className="mt-[14px] grid grid-cols-2 gap-[12px]">
                    <div className="p-[16px] bg-white rounded-[16px] border border-[#EEEEEE] flex flex-col justify-between">
                        <div className="w-[36px] h-[36px] rounded-[10px] bg-[#FEF2F2] flex items-center justify-center">
                            <ClipboardList size={18} className="text-[#D84040]" />
                        </div>
                        <div className="mt-[14px]">
                            <span className="block text-[12px] font-semibold text-[#8C93A0] leading-[1.2]">
                                Pinjaman Aktif
                            </span>
                            <span className="block mt-[4px] text-[18px] font-extrabold text-[#1D1616]">
                                {stats.aktif || 0} Unit
                            </span>
                        </div>
                    </div>

                    <div className="p-[16px] bg-white rounded-[16px] border border-[#EEEEEE] flex flex-col justify-between">
                        <div className="w-[36px] h-[36px] rounded-[10px] bg-[#ECFDF5] flex items-center justify-center">
                            <History size={18} className="text-[#059669]" />
                        </div>
                        <div className="mt-[14px]">
                            <span className="block text-[12px] font-semibold text-[#8C93A0] leading-[1.2]">
                                Riwayat Transaksi
                            </span>
                            <span className="block mt-[4px] text-[18px] font-extrabold text-[#1D1616]">
                                {stats.total_pinjam || 0}x
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. PENGATURAN Section */}
                <div className="mt-[28px]">
                    <h3 className="pl-[4px] mb-[10px] text-[12px] font-bold text-[#8C93A0] tracking-[0.8px]">
                        PENGATURAN
                    </h3>
                    <div className="bg-white rounded-[16px] border border-[#EEEEEE] overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setMode('edit')}
                            className="w-full px-[16px] py-[14px] hover:bg-[#FAFAFA] flex items-center justify-between transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-[14px]">
                                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#F5F5F5] flex items-center justify-center">
                                    <User size={20} className="text-[#1D1616]" />
                                </div>
                                <span className="text-[14px] font-semibold text-[#1D1616]">
                                    Edit Profil & Password
                                </span>
                            </div>
                            <ChevronRight size={20} className="text-[#8C93A0]" />
                        </button>

                        <div className="h-[1px] bg-[#F0F0F0] mx-[16px]" />

                        <div className="px-[16px] py-[14px] flex items-center justify-between">
                            <div className="flex items-center gap-[14px]">
                                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#F5F5F5] flex items-center justify-center">
                                    <Info size={20} className="text-[#1D1616]" />
                                </div>
                                <span className="text-[14px] font-semibold text-[#1D1616]">
                                    Versi Aplikasi
                                </span>
                            </div>
                            <span className="text-[12px] font-semibold text-[#8C93A0]">
                                v1.0.0 (WAMS)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Admin Web Portal Shortcut if user is Admin */}
                {user?.role === 'admin' && (
                    <div className="mt-[16px]">
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/dashboard')}
                            className="w-full h-[48px] bg-[#FFFBEB] border border-[#FCD34D] text-[#D97706] rounded-[14px] font-bold text-[13px] flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Shield size={16} />
                            <span>Buka Dashboard Admin Web</span>
                        </button>
                    </div>
                )}

                {/* 5. LOGOUT Button */}
                <div className="mt-[28px]">
                    <button
                        type="button"
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full h-[54px] bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] rounded-[16px] font-extrabold text-[14px] tracking-[1px] flex items-center justify-center gap-[8px] transition-colors cursor-pointer"
                    >
                        <LogOut size={20} />
                        <span>LOGOUT</span>
                    </button>
                </div>
            </div>

            {/* Avatar Picker Bottom Sheet (matching _pickAvatar in profile_screen.dart) */}
            {showAvatarSheet && (
                <div
                    onClick={() => setShowAvatarSheet(false)}
                    className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center animate-in fade-in duration-150"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[480px] bg-white rounded-t-[20px] p-[24px] shadow-2xl animate-in slide-in-from-bottom duration-200"
                    >
                        <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-[20px]" />
                        <h3 className="text-[16px] font-extrabold text-[#1D1616] mb-[16px]">
                            Ganti Foto Profil
                        </h3>

                        <div className="space-y-1">
                            <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                className="w-full p-[12px] rounded-[12px] hover:bg-[#F5F5F5] flex items-center gap-[14px] text-left transition-colors cursor-pointer"
                            >
                                <div className="w-[40px] h-[40px] rounded-[10px] bg-[#FEF2F2] flex items-center justify-center">
                                    <Camera size={20} className="text-[#D84040]" />
                                </div>
                                <span className="text-[14px] font-semibold text-[#1D1616]">
                                    Ambil dari Kamera
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => galleryInputRef.current?.click()}
                                className="w-full p-[12px] rounded-[12px] hover:bg-[#F5F5F5] flex items-center gap-[14px] text-left transition-colors cursor-pointer"
                            >
                                <div className="w-[40px] h-[40px] rounded-[10px] bg-[#EFF6FF] flex items-center justify-center">
                                    <ImageIcon size={20} className="text-[#2563EB]" />
                                </div>
                                <span className="text-[14px] font-semibold text-[#1D1616]">
                                    Pilih dari Galeri
                                </span>
                            </button>

                            {customAvatar && (
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    className="w-full p-[12px] rounded-[12px] hover:bg-[#FEF2F2] flex items-center gap-[14px] text-left transition-colors cursor-pointer"
                                >
                                    <div className="w-[40px] h-[40px] rounded-[10px] bg-[#FEE2E2] flex items-center justify-center">
                                        <Trash2 size={20} className="text-[#DC2626]" />
                                    </div>
                                    <span className="text-[14px] font-semibold text-[#DC2626]">
                                        Hapus Foto
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Konfirmasi Keluar Dialog (matching profile_screen.dart) */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5 animate-in fade-in duration-150">
                    <div className="w-full max-w-[360px] bg-white rounded-[20px] p-[24px] shadow-2xl">
                        <h3 className="text-[17px] font-extrabold text-[#1D1616]">
                            Konfirmasi Keluar
                        </h3>
                        <p className="mt-[8px] text-[14px] text-[#8C93A0] leading-relaxed">
                            Apakah Anda yakin ingin keluar dari aplikasi WAMS?
                        </p>
                        <div className="mt-[20px] flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="px-[16px] py-[10px] rounded-[10px] text-[13px] font-bold text-[#8C93A0] hover:bg-[#F5F5F5] cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="px-[16px] py-[10px] rounded-[10px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-bold cursor-pointer"
                            >
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UserMobileLayout>
    );
}

// =============================================================================
// CHANGE PASSWORD BOTTOM SHEET (matching _ChangePasswordSheet in edit_profile_screen.dart)
// =============================================================================
function ChangePasswordSheet({ nama, nip, onClose, onSuccess }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [obscureCurrent, setObscureCurrent] = useState(true);
    const [obscureNew, setObscureNew] = useState(true);
    const [obscureConfirm, setObscureConfirm] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!currentPassword) {
            setErrorMsg('Password lama wajib diisi');
            return;
        }
        if (newPassword.length < 6) {
            setErrorMsg('Password baru minimal 6 karakter');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg('Konfirmasi password baru tidak cocok');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(
                '/user/profile/update',
                {
                    nama,
                    nip,
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword,
                },
                { headers: { Accept: 'application/json' } }
            );
            if (res.data?.success) {
                onSuccess();
            } else {
                setErrorMsg(res.data?.message || 'Gagal mengganti password.');
            }
        } catch (err) {
            setErrorMsg(
                err.response?.data?.message ||
                    err.response?.data?.errors?.current_password?.[0] ||
                    err.response?.data?.errors?.new_password?.[0] ||
                    'Gagal mengganti password.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/55 flex items-end justify-center animate-in fade-in duration-150"
        >
            <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
                className="w-full max-w-[480px] bg-white rounded-t-[24px] p-[24px] shadow-2xl animate-in slide-in-from-bottom duration-200"
            >
                <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-[20px]" />

                <div className="flex items-center gap-[10px]">
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-[#FEF2F2] flex items-center justify-center">
                        <Lock size={20} className="text-[#D84040]" />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-extrabold text-[#1D1616]">
                            Ganti Password
                        </h3>
                        <p className="text-[12px] text-[#8C93A0]">
                            Masukkan password lama dan password baru Anda
                        </p>
                    </div>
                </div>

                {errorMsg && (
                    <div className="mt-[14px] p-[12px] bg-[#FEF2F2] rounded-[10px] border border-[#FECACA] text-[12px] font-semibold text-[#DC2626]">
                        {errorMsg}
                    </div>
                )}

                <div className="mt-[20px] space-y-[14px]">
                    <PasswordInput
                        label="Password Saat Ini"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        obscure={obscureCurrent}
                        onToggle={() => setObscureCurrent(!obscureCurrent)}
                    />
                    <PasswordInput
                        label="Password Baru"
                        value={newPassword}
                        onChange={setNewPassword}
                        obscure={obscureNew}
                        onToggle={() => setObscureNew(!obscureNew)}
                    />
                    <PasswordInput
                        label="Konfirmasi Password Baru"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        obscure={obscureConfirm}
                        onToggle={() => setObscureConfirm(!obscureConfirm)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[50px] mt-[24px] bg-[#D84040] hover:bg-[#8E1616] text-white rounded-[12px] font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                    {loading ? (
                        <RefreshCw size={18} className="animate-spin" />
                    ) : (
                        <span>Simpan Password Baru</span>
                    )}
                </button>
            </form>
        </div>
    );
}

// =============================================================================
// CHANGE EMAIL OTP BOTTOM SHEET (matching _ChangeEmailOtpSheet in edit_profile_screen.dart)
// =============================================================================
function ChangeEmailOtpSheet({ currentEmail, onClose, onSuccess }) {
    const [newEmail, setNewEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [obscurePass, setObscurePass] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [debugOtp, setDebugOtp] = useState(null);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((c) => (c <= 1 ? 0 : c - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        const emailTrim = newEmail.trim();
        if (!emailTrim || !emailTrim.includes('@')) {
            setErrorMsg('Masukkan alamat email baru yang valid');
            return;
        }
        if (emailTrim.toLowerCase() === currentEmail.toLowerCase()) {
            setErrorMsg('Email baru tidak boleh sama dengan email saat ini');
            return;
        }
        if (!password) {
            setErrorMsg('Masukkan password akun Anda untuk keamanan');
            return;
        }

        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await axios.post('/user/profile/email/send-otp', {
                new_email: emailTrim,
                current_password: password,
            });
            if (res.data?.success) {
                setOtpSent(true);
                setDebugOtp(res.data?.debug_otp ? String(res.data.debug_otp) : null);
                setCooldown(Number(res.data?.cooldown_seconds || 60));
            } else {
                setErrorMsg(res.data?.message || 'Gagal mengirim OTP.');
            }
        } catch (err) {
            setErrorMsg(
                err.response?.data?.message ||
                    err.response?.data?.errors?.new_email?.[0] ||
                    err.response?.data?.errors?.current_password?.[0] ||
                    'Gagal mengirim kode OTP.'
            );
            if (err.response?.data?.cooldown_seconds) {
                setCooldown(Number(err.response.data.cooldown_seconds));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.trim().length !== 6) {
            setErrorMsg('Masukkan 6 digit kode OTP');
            return;
        }

        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await axios.post('/user/profile/email/verify-otp', {
                new_email: newEmail.trim(),
                otp: otp.trim(),
            });
            if (res.data?.success) {
                onSuccess(newEmail.trim());
            } else {
                setErrorMsg(res.data?.message || 'Verifikasi OTP gagal.');
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Kode OTP tidak valid atau kadaluarsa.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/55 flex items-end justify-center animate-in fade-in duration-150"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[480px] bg-white rounded-t-[24px] p-[24px] shadow-2xl animate-in slide-in-from-bottom duration-200"
            >
                <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-[20px]" />

                <div className="flex items-center gap-[10px]">
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-[#FEF2F2] flex items-center justify-center">
                        <Mail size={20} className="text-[#D84040]" />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-extrabold text-[#1D1616]">
                            Ganti Alamat Email
                        </h3>
                        <p className="text-[12px] text-[#8C93A0]">
                            {otpSent
                                ? 'Masukkan 6 digit kode OTP yang dikirim ke email baru'
                                : 'Kami akan mengirimkan kode OTP ke email baru Anda'}
                        </p>
                    </div>
                </div>

                {errorMsg && (
                    <div className="mt-[14px] p-[12px] bg-[#FEF2F2] rounded-[10px] border border-[#FECACA] text-[12px] font-semibold text-[#DC2626]">
                        {errorMsg}
                    </div>
                )}

                {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="mt-[20px] space-y-[14px]">
                        <div>
                            <label className="block text-[11px] font-semibold text-[#8C93A0] mb-[6px]">
                                Alamat Email Baru
                            </label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                                placeholder="nama@email.com"
                                className="w-full px-[16px] py-[14px] bg-[#FAFAFA] rounded-[12px] border border-[#E0E0E0] text-[14px] font-semibold text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                            />
                        </div>

                        <PasswordInput
                            label="Password Akun Saat Ini"
                            value={password}
                            onChange={setPassword}
                            obscure={obscurePass}
                            onToggle={() => setObscurePass(!obscurePass)}
                        />

                        <button
                            type="submit"
                            disabled={loading || cooldown > 0}
                            className="w-full h-[50px] mt-[10px] bg-[#D84040] hover:bg-[#8E1616] text-white rounded-[12px] font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                            {loading ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : (
                                <span>
                                    {cooldown > 0
                                        ? `Tunggu ${cooldown} detik...`
                                        : 'Kirim Kode OTP'}
                                </span>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="mt-[20px] space-y-[14px]">
                        <div className="p-[12px] bg-[#ECFDF5] rounded-[10px] border border-[#A7F3D0] flex items-center gap-[8px]">
                            <CheckCircle2 size={18} className="text-[#059669] shrink-0" />
                            <span className="text-[12px] font-semibold text-[#065F46] flex-1 truncate">
                                Kode OTP dikirim ke {newEmail}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setOtpSent(false);
                                    setErrorMsg(null);
                                }}
                                className="text-[12px] font-bold text-[#059669] underline cursor-pointer"
                            >
                                Ubah
                            </button>
                        </div>

                        {debugOtp && (
                            <div className="p-[10px] bg-[#FFFBEB] rounded-[10px] border border-[#FDE68A] flex items-center gap-[8px]">
                                <Code size={16} className="text-[#D97706] shrink-0" />
                                <span className="text-[11px] font-bold text-[#92400E]">
                                    Mode Lokal — Kode OTP: {debugOtp}
                                </span>
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-semibold text-[#8C93A0] mb-[6px]">
                                6 Digit Kode OTP
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full px-[16px] py-[14px] bg-[#FAFAFA] rounded-[12px] border border-[#E0E0E0] text-center text-[20px] font-extrabold tracking-[8px] text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#8C93A0]">Belum menerima kode?</span>
                            <button
                                type="button"
                                disabled={loading || cooldown > 0}
                                onClick={handleSendOtp}
                                className="text-[12px] font-bold text-[#D84040] disabled:text-[#8C93A0] cursor-pointer"
                            >
                                {cooldown > 0
                                    ? `Kirim ulang (${cooldown}s)`
                                    : 'Kirim Ulang OTP'}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-[50px] bg-[#D84040] hover:bg-[#8E1616] text-white rounded-[12px] font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                            {loading ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : (
                                <span>Verifikasi & Simpan Email</span>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

function PasswordInput({ label, value, onChange, obscure, onToggle }) {
    return (
        <div>
            <label className="block text-[11px] font-semibold text-[#8C93A0] mb-[6px]">
                {label}
            </label>
            <div className="relative flex items-center">
                <Lock size={18} className="absolute left-[14px] text-[#8C93A0] pointer-events-none" />
                <input
                    type={obscure ? 'password' : 'text'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    className="w-full pl-[42px] pr-[42px] py-[14px] bg-[#FAFAFA] rounded-[12px] border border-[#E0E0E0] text-[14px] font-semibold text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-[12px] text-[#8C93A0] hover:text-[#1D1616] cursor-pointer"
                >
                    {obscure ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}
