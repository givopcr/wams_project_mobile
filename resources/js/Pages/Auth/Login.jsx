import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { User, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <>
            <Head title="Login - WAMS" />
            <div className="min-h-screen w-full flex flex-col lg:flex-row font-['Inter',ui-sans-serif,system-ui,sans-serif] bg-white text-[#1D1616] antialiased selection:bg-[#D84040] selection:text-white">

                {/* Left Section - Clean Minimal Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen px-6 py-12 sm:px-12 xl:px-24 bg-white">
                    <div className="w-full max-w-[380px] mx-auto text-center">

                        {/* Title & Subtitle */}
                        <div className="mb-8">
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1D1616] mb-2">
                                WAMS
                            </h1>
                            <p className="text-xs sm:text-sm text-[#6B7280] font-normal">
                                Masukkan Email dan Password anda
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
                                        placeholder="Username"
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
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C93A0] hover:text-[#1D1616] transition-colors p-1"
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

                            {/* Centered Pill Submit Button matching reference image */}
                            <div className="pt-4 text-center">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-10 py-3 bg-gradient-to-r from-[#D84040] to-[#8E1616] hover:from-[#c93636] hover:to-[#771111] text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-[#D84040]/30 hover:shadow-xl hover:shadow-[#D84040]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Memproses...' : 'Login'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>

                {/* Right Section - Decorative Theme Panel with Wave / Contour Lines */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#8E1616] via-[#B82424] to-[#D84040] overflow-hidden min-h-screen items-center justify-center">
                    {/* Subtle Wave / Contour SVG Overlay matching reference image */}
                    <svg
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-20"
                        viewBox="0 0 800 800"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M -100,200 C 150,100 250,400 500,300 C 750,200 850,500 1000,450"
                            stroke="white"
                            strokeWidth="35"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <path
                            d="M -100,350 C 180,250 280,550 550,450 C 800,350 880,650 1050,600"
                            stroke="white"
                            strokeWidth="45"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <path
                            d="M -100,500 C 200,400 300,700 600,600 C 850,500 900,800 1100,750"
                            stroke="white"
                            strokeWidth="55"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <path
                            d="M -50,50 C 200,0 350,250 600,150 C 850,50 950,300 1100,250"
                            stroke="white"
                            strokeWidth="30"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <path
                            d="M 100,700 C 350,600 450,900 700,800 C 950,700 1050,950 1200,900"
                            stroke="white"
                            strokeWidth="40"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </svg>

                    {/* Subtle Glow & Ambient Lighting */}
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-black/20 rounded-full blur-3xl pointer-events-none" />
                </div>

            </div>
        </>
    );
}
