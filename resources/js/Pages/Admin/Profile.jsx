import React, { useState, useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    User,
    Mail,
    Shield,
    Key,
    Lock,
    Eye,
    EyeOff,
    Camera,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Calendar,
    CheckSquare,
    Save,
    Sparkles,
    IdCard,
} from 'lucide-react';

export default function Profile({ profile, stats }) {
    const { flash } = usePage().props;
    const fileInputRef = useRef(null);

    // Profile Info Form
    const {
        data: profileData,
        setData: setProfileData,
        post: postProfile,
        processing: profileProcessing,
        errors: profileErrors,
        recentlySuccessful: profileSuccess,
        reset: resetProfileForm,
    } = useForm({
        nama: profile.nama || '',
        email: profile.email || '',
        nip: profile.nip || '',
        avatar: null,
        remove_avatar: false,
    });

    // Password Form
    const {
        data: passData,
        setData: setPassData,
        put: putPassword,
        processing: passProcessing,
        errors: passErrors,
        recentlySuccessful: passSuccess,
        reset: resetPassForm,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Avatar preview state
    const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || null);
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // Handle Avatar selection
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData((prev) => ({
                ...prev,
                avatar: file,
                remove_avatar: false,
            }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Remove Avatar
    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setProfileData((prev) => ({
            ...prev,
            avatar: null,
            remove_avatar: true,
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Submit Profile
    const handleProfileSubmit = (e) => {
        e.preventDefault();
        postProfile('/admin/profile', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    // Submit Password
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        putPassword('/admin/profile/password', {
            preserveScroll: true,
            onSuccess: () => resetPassForm(),
        });
    };

    return (
        <AuthenticatedLayout title="Pengaturan Akun">
            <Head title="Pengaturan Akun Administrator - WAMS" />

            <div className="space-y-6 max-w-5xl mx-auto pb-12">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm animate-fade-in shadow-2xs">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <span className="font-semibold">{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm animate-fade-in shadow-2xs">
                        <AlertCircle size={18} className="text-rose-600 shrink-0" />
                        <span className="font-semibold">{flash.error}</span>
                    </div>
                )}

                {/* 1. HERO PROFILE SUMMARY CARD */}
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 lg:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar Wrapper with Upload overlay */}
                        <div className="relative group shrink-0">
                            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden bg-[#EEEEEE] border-2 border-[#E0E0E0] shadow-xs flex items-center justify-center text-3xl font-black text-[#D84040]">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt={profile.nama}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{profile.nama?.charAt(0)?.toUpperCase() || 'A'}</span>
                                )}
                            </div>

                            {/* Camera upload icon button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                title="Unggah foto profil"
                                className="absolute -bottom-2 -right-2 p-2 bg-[#D84040] hover:bg-[#8E1616] text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
                            >
                                <Camera size={16} />
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>

                        {/* Profile Info & Badges */}
                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                                <h2 className="text-xl lg:text-2xl font-black text-[#1D1616] tracking-tight">
                                    {profile.nama}
                                </h2>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-[#D84040] border border-rose-200">
                                    <Shield size={12} className="text-[#D84040]" />
                                    ADMINISTRATOR
                                </span>
                            </div>

                            <p className="text-sm text-[#6B7280] font-medium mb-4 flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                <span className="inline-flex items-center gap-1.5">
                                    <Mail size={14} className="text-[#8C93A0]" />
                                    {profile.email}
                                </span>
                                {profile.nip && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <IdCard size={14} className="text-[#8C93A0]" />
                                        NIP: {profile.nip}
                                    </span>
                                )}
                            </p>

                            {/* Badges & Actions */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                {profile.has_google ? (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                        <img src="/images/google_logo.png" alt="Google" className="w-3.5 h-3.5" />
                                        <span>Terhubung dengan Google</span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EEEEEE] text-[#6B7280]">
                                        <span>Login Lokal (Email/NIP)</span>
                                    </div>
                                )}

                                {avatarPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={13} />
                                        <span>Hapus Foto</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats Box */}
                        <div className="hidden lg:grid grid-cols-2 gap-3 w-64 bg-[#F8FAFC] border border-[#E0E0E0] p-3.5 rounded-xl">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-[#6B7280] block mb-0.5">
                                    Total Approval
                                </span>
                                <span className="text-base font-extrabold text-[#1D1616]">
                                    {stats?.total_approval ?? 0}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-[#6B7280] block mb-0.5">
                                    Total Users
                                </span>
                                <span className="text-base font-extrabold text-[#1D1616]">
                                    {stats?.total_users ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. GRID FORMS: PROFILE INFO & SECURITY */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    {/* FORM 1: INFORMASI PROFIL */}
                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 lg:p-7 shadow-xs flex flex-col">
                        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#E0E0E0]">
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#D84040] flex items-center justify-center">
                                <User size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-[#1D1616]">
                                    Informasi Profil
                                </h3>
                                <p className="text-xs text-[#6B7280]">
                                    Perbarui nama lengkap, email, dan NIP identitas.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="flex-1 flex flex-col justify-between">
                            <div className="space-y-4">
                                {/* Input Nama */}
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Nama Lengkap <span className="text-[#D84040]">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={profileData.nama}
                                            onChange={(e) => setProfileData('nama', e.target.value)}
                                            placeholder="Nama Lengkap Administrator"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-xs font-medium text-[#1D1616] focus:outline-none transition-all ${
                                                profileErrors.nama
                                                    ? 'border-rose-400 focus:border-rose-500'
                                                    : 'border-[#E0E0E0] focus:border-[#D84040]'
                                            }`}
                                            required
                                        />
                                        <User size={16} className="absolute left-3.5 top-3 text-[#8C93A0]" />
                                    </div>
                                    {profileErrors.nama && (
                                        <p className="mt-1 text-[11px] text-rose-500 font-semibold">{profileErrors.nama}</p>
                                    )}
                                </div>

                                {/* Input Email */}
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Alamat Email <span className="text-[#D84040]">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData('email', e.target.value)}
                                            placeholder="admin@example.com"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-xs font-medium text-[#1D1616] focus:outline-none transition-all ${
                                                profileErrors.email
                                                    ? 'border-rose-400 focus:border-rose-500'
                                                    : 'border-[#E0E0E0] focus:border-[#D84040]'
                                            }`}
                                            required
                                        />
                                        <Mail size={16} className="absolute left-3.5 top-3 text-[#8C93A0]" />
                                    </div>
                                    {profileErrors.email && (
                                        <p className="mt-1 text-[11px] text-rose-500 font-semibold">{profileErrors.email}</p>
                                    )}
                                </div>

                                {/* Input NIP */}
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Nomor Induk Pegawai (NIP)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={profileData.nip}
                                            onChange={(e) => setProfileData('nip', e.target.value)}
                                            placeholder="Contoh: 198501012010121001"
                                            className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-xs font-medium text-[#1D1616] focus:outline-none transition-all ${
                                                profileErrors.nip
                                                    ? 'border-rose-400 focus:border-rose-500'
                                                    : 'border-[#E0E0E0] focus:border-[#D84040]'
                                            }`}
                                        />
                                        <IdCard size={16} className="absolute left-3.5 top-3 text-[#8C93A0]" />
                                    </div>
                                    {profileErrors.nip && (
                                        <p className="mt-1 text-[11px] text-rose-500 font-semibold">{profileErrors.nip}</p>
                                    )}
                                </div>

                                <p className="text-[11px] text-[#6B7280]">
                                    Informasi profil ini digunakan untuk identitas pencatatan logbook dan persetujuan peminjaman.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6 mt-auto">
                                <button
                                    type="submit"
                                    disabled={profileProcessing}
                                    className="w-full h-11 flex items-center justify-center gap-2 px-5 bg-[#D84040] hover:bg-[#8E1616] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98"
                                >
                                    <Save size={15} />
                                    <span>{profileProcessing ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* FORM 2: KEAMANAN & PASSWORD */}
                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 lg:p-7 shadow-xs flex flex-col">
                        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#E0E0E0]">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Lock size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-[#1D1616]">
                                    Keamanan & Password
                                </h3>
                                <p className="text-xs text-[#6B7280]">
                                    Perbarui kata sandi akun untuk menjaga keamanan sistem.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="flex-1 flex flex-col justify-between">
                            <div className="space-y-4">
                                {/* Current Password (only if account has password) */}
                                {profile.has_password && (
                                    <div>
                                        <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                            Password Saat Ini <span className="text-[#D84040]">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPass ? 'text' : 'password'}
                                                value={passData.current_password}
                                                onChange={(e) => setPassData('current_password', e.target.value)}
                                                placeholder="Masukkan password saat ini"
                                                className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-xs font-medium text-[#1D1616] focus:outline-none transition-all ${
                                                    passErrors.current_password
                                                        ? 'border-rose-400 focus:border-rose-500'
                                                        : 'border-[#E0E0E0] focus:border-[#D84040]'
                                                }`}
                                                required
                                            />
                                            <Key size={16} className="absolute left-3.5 top-3 text-[#8C93A0]" />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPass(!showCurrentPass)}
                                                className="absolute right-3.5 top-3 text-[#8C93A0] hover:text-[#1D1616]"
                                            >
                                                {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {passErrors.current_password && (
                                            <p className="mt-1 text-[11px] text-rose-500 font-semibold">{passErrors.current_password}</p>
                                        )}
                                    </div>
                                )}

                                {/* Password Baru */}
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Password Baru <span className="text-[#D84040]">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPass ? 'text' : 'password'}
                                            value={passData.password}
                                            onChange={(e) => setPassData('password', e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                            className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-xs font-medium text-[#1D1616] focus:outline-none transition-all ${
                                                passErrors.password
                                                    ? 'border-rose-400 focus:border-rose-500'
                                                    : 'border-[#E0E0E0] focus:border-[#D84040]'
                                            }`}
                                            required
                                        />
                                        <Lock size={16} className="absolute left-3.5 top-3 text-[#8C93A0]" />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            className="absolute right-3.5 top-3 text-[#8C93A0] hover:text-[#1D1616]"
                                        >
                                            {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {passErrors.password && (
                                        <p className="mt-1 text-[11px] text-rose-500 font-semibold">{passErrors.password}</p>
                                    )}
                                </div>

                                {/* Konfirmasi Password Baru */}
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Konfirmasi Password Baru <span className="text-[#D84040]">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPass ? 'text' : 'password'}
                                            value={passData.password_confirmation}
                                            onChange={(e) => setPassData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi password baru"
                                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-[#1D1616] focus:outline-none focus:border-[#D84040] transition-all"
                                            required
                                        />
                                        <Lock size={16} className="absolute left-3.5 top-3 text-[#8C93A0]" />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                                            className="absolute right-3.5 top-3 text-[#8C93A0] hover:text-[#1D1616]"
                                        >
                                            {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-[11px] text-[#6B7280]">
                                    Tips: Gunakan minimal 8 karakter kombinasi huruf besar, angka, dan simbol untuk keamanan maksimal.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6 mt-auto">
                                <button
                                    type="submit"
                                    disabled={passProcessing}
                                    className="w-full h-11 flex items-center justify-center gap-2 px-5 bg-[#1D1616] hover:bg-black disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98"
                                >
                                    <Key size={15} />
                                    <span>{passProcessing ? 'Memperbarui...' : 'Perbarui Password'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
