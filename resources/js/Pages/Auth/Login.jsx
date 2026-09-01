import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

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
            <Head title="Masuk - WAMS" />
            <div className="min-h-screen w-full flex flex-col lg:flex-row font-['Helvetica_Neue',Helvetica,Arial,sans-serif] bg-white text-neutral-900 antialiased selection:bg-[#8E1616] selection:text-white">

                {/* Left Section - Hero Visual */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-950 overflow-hidden min-h-screen">
                    {/* Background Image */}
                    <img
                        src="/images/brin-building.jpg"
                        alt="Kawasan Sains & Teknologi BRIN"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                </div>

                {/* Right Section - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen px-6 py-12 sm:px-12 xl:px-20 bg-white">
                    <div className="w-full max-w-[390px] mx-auto">

                        {/* Heading */}
                        <div className="mb-8">
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950 mb-2">
                                Selamat Datang Kembali
                            </h2>
                            <p className="text-xs sm:text-sm text-neutral-500 font-normal">
                                Masukkan email dan kata sandi Anda untuk mengakses akun
                            </p>
                        </div>

                        {/* Error Alert */}
                        {errors.login && (
                            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5">
                                <ShieldAlert size={16} className="text-red-600 shrink-0" />
                                <span>{errors.login}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-900 mb-2">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="Masukkan email Anda"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#8E1616] focus:ring-1 focus:ring-[#8E1616] transition-all font-normal"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-neutral-900 mb-2">
                                    Kata Sandi
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan kata sandi Anda"
                                        required
                                        className="w-full pl-3.5 pr-11 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#8E1616] focus:ring-1 focus:ring-[#8E1616] transition-all font-normal"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-600 text-xs mt-1.5 font-medium">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded border-neutral-300 text-[#8E1616] focus:ring-[#8E1616] accent-[#8E1616]"
                                    />
                                    <span className="text-xs text-neutral-700 font-normal">Ingat saya</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 px-4 bg-[#8E1616] hover:bg-[#731212] active:bg-[#5c0e0e] text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 cursor-pointer mt-3 shadow-xs"
                            >
                                {processing ? 'Sedang Masuk...' : 'Masuk'}
                            </button>
                        </form>

                    </div>
                </div>

            </div>
        </>
    );
}
