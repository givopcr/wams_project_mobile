import React, { useState, useEffect } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { User, Lock, Eye, EyeOff, ShieldAlert, KeyRound, Mail, X, CheckCircle2, RefreshCw, IdCard, UserPlus } from 'lucide-react';

export default function Login({ status, initialTab = 'login' }) {
    const [activeTab, setActiveTab] = useState(initialTab || 'login');
    const [showPassword, setShowPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegPasswordConfirm, setShowRegPasswordConfirm] = useState(false);
    const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);

    // Sync tab with URL query parameter (?tab=register or ?tab=login)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab === 'register') {
            setActiveTab('register');
        } else if (tab === 'login') {
            setActiveTab('login');
        }
    }, []);

    // Registration Form
    const {
        data: regData,
        setData: setRegData,
        post: postRegister,
        processing: regProcessing,
        errors: regErrors,
        reset: resetRegForm,
        clearErrors: clearRegErrors,
    } = useForm({
        nama: '',
        email: '',
        nip: '',
        password: '',
        password_confirmation: '',
    });

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        postRegister('/register', {
            onSuccess: () => {
                resetRegForm();
            },
        });
    };

    // Forgot Password Modal State
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [resetToken, setResetToken] = useState(null);
    const [debugOtp, setDebugOtp] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [modalSuccessMsg, setModalSuccessMsg] = useState(null);
    const [resendCountdown, setResendCountdown] = useState(60);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    const handleGoogleLogin = () => {
        setIsGoogleRedirecting(true);
        window.location.href = '/auth/google';
    };

    // Countdown Timer for Resend OTP
    useEffect(() => {
        let timer;
        if (isForgotModalOpen && forgotStep === 2 && resendCountdown > 0) {
            timer = setInterval(() => {
                setResendCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isForgotModalOpen, forgotStep, resendCountdown]);

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (!forgotEmail || !forgotEmail.includes('@')) {
            setModalError('Masukkan alamat email yang valid.');
            return;
        }

        setModalLoading(true);
        setModalError(null);

        try {
            const res = await fetch('/api/auth/forgot-password/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ email: forgotEmail }),
            });
            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || 'Gagal mengirim kode OTP.');
            }

            setForgotStep(2);
            setDebugOtp(result.debug_otp || null);
            setResendCountdown(result.cooldown_seconds || 60);
            setModalSuccessMsg(result.message);
        } catch (err) {
            setModalError(err.message);
        } finally {
            setModalLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        if (forgotOtp.trim().length !== 6) {
            setModalError('Masukkan lengkap 6 digit kode OTP.');
            return;
        }

        setModalLoading(true);
        setModalError(null);

        try {
            const res = await fetch('/api/auth/forgot-password/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp_code: forgotOtp.trim() }),
            });
            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || 'Kode OTP salah atau kedaluwarsa.');
            }

            setResetToken(result.reset_token);
            setForgotStep(3);
            setModalSuccessMsg('Kode OTP valid! Silakan tentukan kata sandi baru Anda.');
        } catch (err) {
            setModalError(err.message);
        } finally {
            setModalLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        if (e) e.preventDefault();
        if (newPassword.length < 8) {
            setModalError('Kata sandi baru minimal 8 karakter.');
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            setModalError('Konfirmasi kata sandi tidak cocok.');
            return;
        }

        setModalLoading(true);
        setModalError(null);

        try {
            const res = await fetch('/api/auth/forgot-password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    email: forgotEmail,
                    reset_token: resetToken,
                    password: newPassword,
                    password_confirmation: newPasswordConfirm,
                }),
            });
            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || 'Gagal mereset kata sandi.');
            }

            // Sukses: Isi email di form login & tutup modal
            setData('login', forgotEmail);
            setData('password', '');
            setIsForgotModalOpen(false);
            alert(result.message || 'Kata sandi berhasil direset! Silakan masuk dengan kata sandi baru Anda.');
        } catch (err) {
            setModalError(err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const resetModalState = () => {
        setIsForgotModalOpen(false);
        setForgotStep(1);
        setForgotOtp('');
        setNewPassword('');
        setNewPasswordConfirm('');
        setModalError(null);
        setModalSuccessMsg(null);
    };

    return (
        <>
            <Head title={activeTab === 'login' ? 'Masuk - WAMS Workshop' : 'Daftar Akun - WAMS Workshop'} />

            <div className="min-h-screen flex bg-[#FAF9F6]">
                {/* Left Section - Form Area */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16">
                    <div className="w-full max-w-md">

                        {/* Logo & Header */}
                        <div className="mb-6 flex flex-col items-center text-center">
                            <div className="w-20 h-20 mb-3 flex items-center justify-center">
                                <img
                                    src="/images/wams_logo.png"
                                    alt="WAMS Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#1D1616]">
                                {activeTab === 'login' ? 'Masuk ke WAMS' : 'Daftar Akun Baru'}
                            </h1>
                            <p className="text-xs text-[#6B7280] mt-1 font-medium">
                                {activeTab === 'login'
                                    ? 'Workshop Asset Management System'
                                    : 'Lengkapi formulir untuk membuat akun pengguna WAMS'}
                            </p>
                        </div>

                        {/* Flash Status Message */}
                        {status && (
                            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
                                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* Tab Switcher: Masuk / Daftar */}
                        <div className="flex p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200/80">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('login');
                                    clearRegErrors();
                                }}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                    activeTab === 'login'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <User size={14} />
                                Masuk
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('register');
                                    clearErrors();
                                }}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                    activeTab === 'register'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <UserPlus size={14} />
                                Daftar Akun
                            </button>
                        </div>

                        {/* Login View */}
                        {activeTab === 'login' ? (
                            <>
                                {/* Error Alert */}
                                {errors.login && (
                                    <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                                        <ShieldAlert size={16} className="shrink-0 text-rose-600" />
                                        <span>{errors.login}</span>
                                    </div>
                                )}

                                {/* Main Form */}
                                <form onSubmit={submit} className="space-y-4">
                                    {/* Input Email / NIP */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1D1616] mb-1.5 uppercase tracking-wider">
                                            Email atau NIP
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C93A0]">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={data.login}
                                                onChange={(e) => setData('login', e.target.value)}
                                                placeholder="nama@instansi.com atau NIP"
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-[#E0E0E0] rounded-xl text-sm focus:outline-none focus:border-[#D84040] focus:ring-1 focus:ring-[#D84040] transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Input Password */}
                                    <div>
                                        <label className="block text-xs font-semibold text-[#1D1616] mb-1.5 uppercase tracking-wider">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C93A0]">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="w-full pl-10 pr-11 py-3 bg-white border border-[#E0E0E0] rounded-xl text-sm focus:outline-none focus:border-[#D84040] focus:ring-1 focus:ring-[#D84040] transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C93A0] hover:text-[#1D1616] transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-rose-600 text-xs mt-1.5 font-medium pl-1">{errors.password}</p>
                                        )}
                                    </div>

                                    {/* Remember me & Lupa Password */}
                                    <div className="flex items-center justify-between pt-1 px-1">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#D84040] focus:ring-[#D84040] accent-[#D84040]"
                                            />
                                            <span className="text-xs text-[#6B7280] font-medium">Ingat saya</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForgotEmail(data.login.includes('@') ? data.login : '');
                                                setIsForgotModalOpen(true);
                                            }}
                                            className="text-xs font-semibold text-[#D84040] hover:text-[#8E1616] transition-colors cursor-pointer"
                                        >
                                            Lupa kata sandi?
                                        </button>
                                    </div>

                                    {/* Centered Pill Submit Button */}
                                    <div className="pt-4 text-center">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full py-3.5 bg-gradient-to-r from-[#D84040] to-[#8E1616] hover:from-[#c93636] hover:to-[#771111] text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-[#D84040]/30 hover:shadow-xl hover:shadow-[#D84040]/40 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                        >
                                            {processing ? 'Memproses...' : 'Masuk'}
                                        </button>
                                    </div>

                                    {/* Divider */}
                                    <div className="relative my-4 flex items-center justify-center">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200" />
                                        </div>
                                        <div className="relative bg-[#FAF9F6] px-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                            atau dengan
                                        </div>
                                    </div>

                                    {/* Google Sign-In Button */}
                                    <div>
                                        <button
                                            type="button"
                                            onClick={handleGoogleLogin}
                                            disabled={isGoogleRedirecting || processing}
                                            className="w-full h-12 px-4 bg-white hover:bg-slate-50/80 border border-slate-300 hover:border-slate-400 active:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-2xl transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
                                        >
                                            {isGoogleRedirecting ? (
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-4 h-4 border-2 border-[#D84040] border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-slate-600 text-xs font-semibold">Mengarahkan ke Google...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <img
                                                        src="/images/google_logo.png"
                                                        alt="Google"
                                                        className="w-5 h-5 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
                                                    />
                                                    <span className="font-semibold text-[14px] text-slate-800 tracking-tight">
                                                        Masuk dengan Google
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            /* Register View */
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                {/* Error Alert jika ada general errors */}
                                {Object.keys(regErrors).length > 0 && !regErrors.nama && !regErrors.email && !regErrors.nip && !regErrors.password && !regErrors.password_confirmation && (
                                    <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                                        <ShieldAlert size={16} className="shrink-0 text-rose-600" />
                                        <span>Terjadi kesalahan saat pendaftaran. Silakan periksa formulir.</span>
                                    </div>
                                )}

                                {/* Input Nama Lengkap */}
                                <div>
                                    <label className="block text-xs font-semibold text-[#1D1616] mb-1.5 uppercase tracking-wider">
                                        Nama Lengkap <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C93A0]">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={regData.nama}
                                            onChange={(e) => setRegData('nama', e.target.value)}
                                            placeholder="Contoh: Budi Santoso"
                                            required
                                            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                regErrors.nama
                                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                                                    : 'border-[#E0E0E0] focus:border-[#D84040] focus:ring-[#D84040]'
                                            }`}
                                        />
                                    </div>
                                    {regErrors.nama && (
                                        <p className="text-rose-600 text-xs mt-1.5 font-medium pl-1">{regErrors.nama}</p>
                                    )}
                                </div>

                                {/* Input Email */}
                                <div>
                                    <label className="block text-xs font-semibold text-[#1D1616] mb-1.5 uppercase tracking-wider">
                                        Alamat Email <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C93A0]">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={regData.email}
                                            onChange={(e) => setRegData('email', e.target.value)}
                                            placeholder="nama@instansi.com"
                                            required
                                            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                regErrors.email
                                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                                                    : 'border-[#E0E0E0] focus:border-[#D84040] focus:ring-[#D84040]'
                                            }`}
                                        />
                                    </div>
                                    {regErrors.email && (
                                        <p className="text-rose-600 text-xs mt-1.5 font-medium pl-1">{regErrors.email}</p>
                                    )}
                                </div>

                                {/* Input NIP */}
                                <div>
                                    <label className="block text-xs font-semibold text-[#1D1616] mb-1.5 uppercase tracking-wider">
                                        NIP <span className="text-slate-400 font-normal lowercase">(opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C93A0]">
                                            <IdCard size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={regData.nip}
                                            onChange={(e) => setRegData('nip', e.target.value)}
                                            placeholder="1985xxxx (jika ada)"
                                            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                regErrors.nip
                                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                                                    : 'border-[#E0E0E0] focus:border-[#D84040] focus:ring-[#D84040]'
                                            }`}
                                        />
                                    </div>
                                    {regErrors.nip && (
                                        <p className="text-rose-600 text-xs mt-1.5 font-medium pl-1">{regErrors.nip}</p>
                                    )}
                                </div>

                                {/* Input Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-[#1D1616] mb-1.5 uppercase tracking-wider">
                                        Password <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C93A0]">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showRegPassword ? 'text' : 'password'}
                                            value={regData.password}
                                            onChange={(e) => setRegData('password', e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            required
                                            className={`w-full pl-10 pr-11 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                regErrors.password
                                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                                                    : 'border-[#E0E0E0] focus:border-[#D84040] focus:ring-[#D84040]'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRegPassword(!showRegPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C93A0] hover:text-[#1D1616] transition-colors"
                                        >
                                            {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {regErrors.password && (
                                        <p className="text-rose-600 text-xs mt-1.5 font-medium pl-1">{regErrors.password}</p>
                                    )}
                                </div>

                                {/* Input Konfirmasi Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-[#1D1616] mb-1.5 uppercase tracking-wider">
                                        Konfirmasi Password <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C93A0]">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showRegPasswordConfirm ? 'text' : 'password'}
                                            value={regData.password_confirmation}
                                            onChange={(e) => setRegData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi kata sandi"
                                            required
                                            className={`w-full pl-10 pr-11 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-1 transition-colors ${
                                                regErrors.password_confirmation
                                                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                                                    : 'border-[#E0E0E0] focus:border-[#D84040] focus:ring-[#D84040]'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowRegPasswordConfirm(!showRegPasswordConfirm)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C93A0] hover:text-[#1D1616] transition-colors"
                                        >
                                            {showRegPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {regErrors.password_confirmation && (
                                        <p className="text-rose-600 text-xs mt-1.5 font-medium pl-1">{regErrors.password_confirmation}</p>
                                    )}
                                </div>

                                {/* Tombol Submit Register */}
                                <div className="pt-3 text-center">
                                    <button
                                        type="submit"
                                        disabled={regProcessing}
                                        className="w-full py-3.5 bg-gradient-to-r from-[#D84040] to-[#8E1616] hover:from-[#c93636] hover:to-[#771111] text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-[#D84040]/30 hover:shadow-xl hover:shadow-[#D84040]/40 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {regProcessing ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Mendaftarkan Akun...</span>
                                            </>
                                        ) : (
                                            <span>Daftar Akun</span>
                                        )}
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative my-4 flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200" />
                                    </div>
                                    <div className="relative bg-[#FAF9F6] px-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        atau dengan
                                    </div>
                                </div>

                                {/* Google Sign-In Button */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        disabled={isGoogleRedirecting || regProcessing}
                                        className="w-full h-12 px-4 bg-white hover:bg-slate-50/80 border border-slate-300 hover:border-slate-400 active:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-2xl transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
                                    >
                                        {isGoogleRedirecting ? (
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-4 h-4 border-2 border-[#D84040] border-t-transparent rounded-full animate-spin" />
                                                <span className="text-slate-600 text-xs font-semibold">Mengarahkan ke Google...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <img
                                                    src="/images/google_logo.png"
                                                    alt="Google"
                                                    className="w-5 h-5 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
                                                />
                                                <span className="font-semibold text-[14px] text-slate-800 tracking-tight">
                                                    Daftar dengan Google
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                    </div>
                </div>

                {/* Right Section - Decorative Theme Panel with Background Image */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden min-h-screen bg-[#781212] items-center justify-center">
                    <img
                        src="/images/login_bg.png"
                        alt="Background"
                        className="w-full h-full object-cover object-center pointer-events-none select-none"
                    />
                </div>
            </div>

            {/* Modal Lupa Kata Sandi (Multi-Step OTP) */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={resetModalState}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Modal Header */}
                        <div className="mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#D84040] flex items-center justify-center mb-3">
                                {forgotStep === 1 && <Mail size={24} />}
                                {forgotStep === 2 && <KeyRound size={24} />}
                                {forgotStep === 3 && <Lock size={24} />}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {forgotStep === 1 && 'Lupa Kata Sandi'}
                                {forgotStep === 2 && 'Verifikasi Kode OTP'}
                                {forgotStep === 3 && 'Atur Kata Sandi Baru'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {forgotStep === 1 && 'Masukkan email akun WAMS untuk menerima 6 digit kode pemulihan.'}
                                {forgotStep === 2 && `Kode OTP telah dikirimkan ke ${forgotEmail}.`}
                                {forgotStep === 3 && 'Buat kata sandi baru minimal 8 karakter.'}
                            </p>
                        </div>

                        {/* Error Banner */}
                        {modalError && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                                <ShieldAlert size={16} className="shrink-0 text-rose-600" />
                                <span>{modalError}</span>
                            </div>
                        )}

                        {/* Step 1: Input Email */}
                        {forgotStep === 1 && (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Alamat Email
                                    </label>
                                    <input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="nama@instansi.com"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D84040] focus:ring-1 focus:ring-[#D84040]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="w-full py-3 bg-[#D84040] hover:bg-[#8E1616] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-rose-200 disabled:opacity-50 cursor-pointer"
                                >
                                    {modalLoading ? 'Mengirim...' : 'Kirim Kode OTP'}
                                </button>
                            </form>
                        )}

                        {/* Step 2: Input OTP */}
                        {forgotStep === 2 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                {debugOtp && (
                                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                                        <span>Mode Testing: Kode OTP <strong>{debugOtp}</strong></span>
                                        <button
                                            type="button"
                                            onClick={() => setForgotOtp(debugOtp)}
                                            className="text-amber-900 font-bold underline text-[11px]"
                                        >
                                            Isi Cepat
                                        </button>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        6 Digit Kode OTP
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={forgotOtp}
                                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000000"
                                        required
                                        className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#D84040] focus:ring-1 focus:ring-[#D84040]"
                                    />
                                </div>
                                <div className="text-center text-xs text-slate-500">
                                    {resendCountdown > 0 ? (
                                        <span>Kirim ulang kode dalam 00:{String(resendCountdown).padStart(2, '0')}</span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            className="text-[#D84040] font-bold hover:underline inline-flex items-center gap-1"
                                        >
                                            <RefreshCw size={12} /> Kirim Ulang Kode
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="w-full py-3 bg-[#D84040] hover:bg-[#8E1616] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-rose-200 disabled:opacity-50 cursor-pointer"
                                >
                                    {modalLoading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                                </button>
                            </form>
                        )}

                        {/* Step 3: Input New Password */}
                        {forgotStep === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Kata Sandi Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D84040] focus:ring-1 focus:ring-[#D84040]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Konfirmasi Kata Sandi Baru
                                    </label>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPasswordConfirm}
                                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                        placeholder="Ulangi kata sandi baru"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D84040] focus:ring-1 focus:ring-[#D84040]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="w-full py-3 bg-[#D84040] hover:bg-[#8E1616] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-rose-200 disabled:opacity-50 cursor-pointer"
                                >
                                    {modalLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
