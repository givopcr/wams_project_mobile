import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

export default function Login() {
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
            <Head title="Admin Login - WAMS" />
            <div className="min-h-screen bg-[#FFFAF3] flex flex-col justify-center items-center px-4 font-sans">
                <div className="max-w-md w-full">
                    {/* Brand Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F62440] mb-4">
                            <span className="text-2xl font-black text-white">W</span>
                        </div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-[#1E232A]">WAMS Admin Portal</h2>
                        <p className="text-xs text-[#6B7280] font-medium mt-1">Workshop Asset Management System</p>
                    </div>

                    {/* Flat Form Container */}
                    <div className="bg-[#FFF2DB] border border-[#F0DFC4] p-8 rounded-2xl">
                        {errors.login && (
                            <div className="mb-6 p-3 rounded-xl bg-[#F62440]/10 border border-[#F62440]/30 text-[#991B1B] text-xs font-bold flex items-center gap-2">
                                <ShieldAlert size={16} className="text-[#F62440] shrink-0" />
                                <span>{errors.login}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-[#1E232A] uppercase tracking-wider mb-2">
                                    Email atau NIP
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.login}
                                        onChange={(e) => setData('login', e.target.value)}
                                        placeholder="admin@wams.test atau NIP"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#FFFAF3] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] placeholder-[#8C93A0] focus:outline-none focus:border-[#F62440] font-medium transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1E232A] uppercase tracking-wider mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#FFFAF3] border border-[#F0DFC4] rounded-xl text-xs text-[#1E232A] placeholder-[#8C93A0] focus:outline-none focus:border-[#F62440] font-medium transition-colors"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-[#F62440] text-xs font-bold mt-1.5">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded bg-[#FFFAF3] border-[#F0DFC4] text-[#F62440] focus:ring-[#F62440]"
                                    />
                                    <span className="text-xs text-[#6B7280] font-medium select-none">Ingat saya</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#F62440] hover:bg-[#D91A33] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <span>{processing ? 'Memproses...' : 'Masuk ke Panel Admin'}</span>
                                <ArrowRight size={16} />
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-[#F0DFC4] text-center">
                            <p className="text-xs text-[#6B7280]">
                                Default Admin: <span className="text-[#1E232A] font-mono font-bold">admin@wams.test</span> / <span className="text-[#1E232A] font-mono font-bold">password</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
