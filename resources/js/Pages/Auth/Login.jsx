import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { User, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
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

    return (
        <>
            <Head title="Login - WAMS" />
            <div className="min-h-screen w-full flex flex-col lg:flex-row font-['Inter',ui-sans-serif,system-ui,sans-serif] bg-white text-[#1D1616] antialiased selection:bg-[#D84040] selection:text-white">

                {/* Left Section - Clean Minimal Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen px-6 py-12 sm:px-12 xl:px-24 bg-white">
                    <div className="w-full max-w-[380px] mx-auto text-center">

                        {/* Title & Subtitle */}
                        <div className="mb-8 flex flex-col items-center">
                            <img
                                src="/images/wams_logo.png"
                                alt="WAMS Logo"
                                className="w-16 h-16 object-contain mb-3 drop-shadow-sm"
                            />
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1D1616] mb-2">
                                WAMS
                            </h1>
                            <p className="text-xs sm:text-sm text-[#6B7280] font-normal">
                                Masukkan Email atau NIP dan Password anda
                            </p>
                        </div>

                        {/* Error Alert */}
                        {errors.login && (
                            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#D84040] text-xs font-medium flex items-center gap-2.5 text-left">
                                <ShieldAlert size={16} className="text-[#D84040] shrink-0" />
                                <span>{errors.login}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-4 text-left">
                            {/* Username / Email Field */}
                            <div>
                                <div className="relative flex items-center bg-[#F1F3F9] rounded-2xl border border-transparent focus-within:border-[#D84040]/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D84040]/10 transition-all">
                                    <div className="pl-4.5 pr-2 text-[#6B7280]">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.login}
                                        onChange={(e) => setData('login', e.target.value)}
                                        placeholder="Email atau NIP"
                                        required
                                        className="w-full pr-4 py-3.5 bg-transparent border-0 text-sm text-[#1D1616] placeholder:text-[#8C93A0] focus:outline-none focus:ring-0 font-normal"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="relative flex items-center bg-[#F1F3F9] rounded-2xl border border-transparent focus-within:border-[#D84040]/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D84040]/10 transition-all">
                                    <div className="pl-4.5 pr-2 text-[#6B7280]">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Password"
                                        required
                                        className="w-full pr-11 py-3.5 bg-transparent border-0 text-sm text-[#1D1616] placeholder:text-[#8C93A0] focus:outline-none focus:ring-0 font-normal"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C93A0] hover:text-[#1D1616] transition-colors p-1 cursor-pointer"
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-rose-600 text-xs mt-1.5 font-medium pl-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember me */}
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
                            </div>

                            {/* Centered Pill Submit Button */}
                            <div className="pt-4 text-center">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#D84040] to-[#8E1616] hover:from-[#c93636] hover:to-[#771111] text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-[#D84040]/30 hover:shadow-xl hover:shadow-[#D84040]/40 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Memproses...' : 'Masuk ke Sistem'}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="relative my-4 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative bg-white px-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    atau masuk dengan
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

                            {/* Quick Demo Credentials */}
                            <div className="pt-5 border-t border-[#E5E7EB] mt-5">
                                <p className="text-[11px] font-semibold text-[#8C93A0] uppercase tracking-wider text-center mb-2.5">
                                    Akun Uji Coba Cepat
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData((prev) => ({
                                                ...prev,
                                                login: 'givo@gmail.com',
                                                password: 'password',
                                            }));
                                        }}
                                        className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E0E0E0] hover:border-[#D84040] hover:bg-rose-50/50 text-left transition-all cursor-pointer group"
                                    >
                                        <span className="block text-xs font-bold text-[#1D1616] group-hover:text-[#D84040]">
                                            👤 User / Teknisi
                                        </span>
                                        <span className="block text-[10px] text-[#6B7280]">givo@gmail.com</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData((prev) => ({
                                                ...prev,
                                                login: 'admin@wams.test',
                                                password: 'password',
                                            }));
                                        }}
                                        className="p-2 rounded-xl bg-[#F8F9FA] border border-[#E0E0E0] hover:border-[#D84040] hover:bg-rose-50/50 text-left transition-all cursor-pointer group"
                                    >
                                        <span className="block text-xs font-bold text-[#1D1616] group-hover:text-[#D84040]">
                                            🛡️ Admin
                                        </span>
                                        <span className="block text-[10px] text-[#6B7280]">admin@wams.test</span>
                                    </button>
                                </div>
                            </div>
                        </form>

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
        </>
    );
}
