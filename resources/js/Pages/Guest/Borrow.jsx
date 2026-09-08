import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Wrench,
    User,
    Mail,
    Clock,
    ShieldAlert,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    RefreshCw,
    Sparkles,
    ChevronRight,
    Info,
    KeyRound
} from 'lucide-react';

export default function GuestBorrow({
    unit,
    barang,
    max_standard_duration_minutes = 240,
    preset_durations = [],
}) {
    // Form States
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [durasiMenit, setDurasiMenit] = useState(120); // Default 2 jam
    const [isCustomDuration, setIsCustomDuration] = useState(false);
    const [customJam, setCustomJam] = useState(5);

    // UI & Submission States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // OTP Modal States
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState(null);
    const [debugOtp, setDebugOtp] = useState(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    const otpInputRefs = useRef([]);

    // Check if current duration exceeds guest standard limit
    const requiresOtp = durasiMenit > max_standard_duration_minutes;

    // Countdown for OTP resend cooldown
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Handle Preset Duration Selection
    const handleSelectPreset = (minutes) => {
        setIsCustomDuration(false);
        setDurasiMenit(minutes);
    };

    // Handle Custom Duration Change
    const handleCustomChange = (hours) => {
        const val = Math.max(1, parseInt(hours) || 1);
        setCustomJam(val);
        setDurasiMenit(val * 60);
    };

    // Handle initial form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!nama.trim()) {
            setError('Nama lengkap wajib diisi.');
            return;
        }

        if (!email.trim() || !email.includes('@')) {
            setError('Email aktif wajib diisi dengan benar.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`/guest/pinjam/${unit.kode_unit}`, {
                nama: nama.trim(),
                email: email.trim(),
                durasi_menit: durasiMenit,
            });

            if (response.data.success) {
                if (response.data.requires_otp) {
                    // Open OTP Modal
                    setShowOtpModal(true);
                    setDebugOtp(response.data.debug_otp || null);
                    setResendCooldown(30);
                    // Focus first OTP input
                    setTimeout(() => {
                        otpInputRefs.current[0]?.focus();
                    }, 300);
                } else {
                    // Direct success without OTP
                    if (response.data.return_token) {
                        localStorage.setItem(`wams_guest_token_${unit.kode_unit}`, response.data.return_token);
                    }
                    window.location.href = response.data.redirect_url;
                }
            } else {
                setError(response.data.message || 'Terjadi kesalahan saat mengajukan peminjaman.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal terhubung ke server. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP Input Change
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1);
        setOtpDigits(newDigits);

        // Auto-advance
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    // Handle OTP Keydown (Backspace navigation)
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    // Handle OTP Paste (pasting 6-digit code)
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pasted)) {
            const digits = pasted.split('');
            setOtpDigits(digits);
            otpInputRefs.current[5]?.focus();
        }
    };

    // Submit OTP for verification
    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        const code = otpDigits.join('');
        if (code.length !== 6) {
            setOtpError('Masukkan 6 digit kode OTP lengkap.');
            return;
        }

        setOtpLoading(true);
        setOtpError(null);

        try {
            const response = await axios.post(`/guest/pinjam/${unit.kode_unit}/verify-otp`, {
                email: email.trim(),
                otp_code: code,
            });

            if (response.data.success) {
                if (response.data.return_token) {
                    localStorage.setItem(`wams_guest_token_${unit.kode_unit}`, response.data.return_token);
                }
                window.location.href = response.data.redirect_url;
            } else {
                setOtpError(response.data.message || 'Kode OTP tidak valid.');
            }
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Verifikasi gagal. Pastikan kode benar.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setOtpLoading(true);
        setOtpError(null);

        try {
            const response = await axios.post(`/guest/pinjam/${unit.kode_unit}/resend-otp`, {
                email: email.trim(),
            });

            if (response.data.success) {
                setResendCooldown(30);
                setDebugOtp(response.data.debug_otp || null);
                setOtpDigits(['', '', '', '', '', '']);
                otpInputRefs.current[0]?.focus();
            } else {
                setOtpError(response.data.message);
            }
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Gagal mengirim ulang OTP.');
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#EEEEEE] flex flex-col justify-between text-[#1D1616]">
            <Head title={`Pinjam ${unit.kode_unit} - WAMS Guest`} />

            {/* Top Navbar */}
            <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-30 px-4 py-3 shadow-2xs">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#D84040] flex items-center justify-center text-white font-black text-sm shadow-xs">
                            W
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-[#1D1616] leading-tight">WAMS Workshop</h1>
                            <p className="text-[10px] text-[#6B7280]">Peminjaman Tamu (Guest Mode)</p>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1D1616] text-white">
                        Scan QR
                    </span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
                {/* Unit / Item Overview Card */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-2xs">
                    <div className="flex items-start gap-3.5">
                        <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] border border-[#E0E0E0] shrink-0 flex items-center justify-center overflow-hidden">
                            {barang.gambar ? (
                                <img
                                    src={barang.gambar}
                                    alt={barang.nama_barang}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Wrench size={28} className="text-[#D84040]" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D84040]">
                                {barang.kategori || 'Peralatan'}
                            </span>
                            <h2 className="text-base font-bold text-[#1D1616] truncate">
                                {barang.nama_barang}
                            </h2>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#EEEEEE] text-[#1D1616]">
                                    Unit: {unit.kode_unit}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 size={11} /> Kondisi Baik
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Peminjaman Tamu */}
                <form onSubmit={handleSubmit} className="bg-white border border-[#E0E0E0] rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="border-b border-[#E0E0E0] pb-3">
                        <h3 className="text-sm font-bold text-[#1D1616]">Formulir Peminjaman Tamu</h3>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                            Isi data diri Anda sebelum menggunakan peralatan workshop.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                            <AlertCircle size={15} className="text-[#D84040] shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Input Nama Lengkap */}
                    <div>
                        <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                            Nama Lengkap <span className="text-[#D84040]">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                placeholder="Contoh: Budi Santoso"
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                            />
                            <User size={15} className="absolute left-3 top-3 text-[#6B7280]" />
                        </div>
                    </div>

                    {/* Input Email Aktif */}
                    <div>
                        <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                            Email Aktif <span className="text-[#D84040]">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                            />
                            <Mail size={15} className="absolute left-3 top-3 text-[#6B7280]" />
                        </div>
                        <p className="text-[11px] text-[#6B7280] mt-1">
                            Digunakan untuk bukti peminjaman dan verifikasi OTP jika durasi melebihi batas.
                        </p>
                    </div>

                    {/* Durasi Peminjaman */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-[#1D1616]">
                                Rencana Durasi Pinjam <span className="text-[#D84040]">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCustomDuration(!isCustomDuration);
                                    if (!isCustomDuration) {
                                        setDurasiMenit(customJam * 60);
                                    } else {
                                        setDurasiMenit(120);
                                    }
                                }}
                                className="text-[11px] font-bold text-[#D84040] hover:underline"
                            >
                                {isCustomDuration ? 'Pilih Durasi Cepat' : 'Custom Durasi'}
                            </button>
                        </div>

                        {!isCustomDuration ? (
                            <div className="grid grid-cols-3 gap-2">
                                {preset_durations.map((item) => {
                                    const isSelected = durasiMenit === item.minutes;
                                    return (
                                        <button
                                            key={item.minutes}
                                            type="button"
                                            onClick={() => handleSelectPreset(item.minutes)}
                                            className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#D84040] text-white border-[#D84040] shadow-xs'
                                                    : 'bg-white text-[#1D1616] border-[#E0E0E0] hover:border-[#D84040]/50'
                                            }`}
                                        >
                                            <div>{item.label.split(' (')[0]}</div>
                                            <div className={`text-[10px] font-normal ${isSelected ? 'text-white/80' : 'text-[#6B7280]'}`}>
                                                {item.requires_otp ? 'Perlu OTP' : 'Langsung'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-3 bg-[#EEEEEE]/50 border border-[#E0E0E0] rounded-xl space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="168"
                                        value={customJam}
                                        onChange={(e) => handleCustomChange(e.target.value)}
                                        className="w-24 px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg text-xs font-bold text-center focus:outline-none focus:border-[#D84040]"
                                    />
                                    <span className="text-xs font-semibold text-[#1D1616]">Jam</span>
                                    <span className="text-xs text-[#6B7280]">
                                        ({customJam * 60} Menit)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Verification Notification Banner */}
                    <div
                        className={`p-3.5 rounded-xl border transition-all ${
                            requiresOtp
                                ? 'bg-amber-50 border-amber-300 text-amber-900'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}
                    >
                        <div className="flex items-start gap-2.5">
                            {requiresOtp ? (
                                <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                            ) : (
                                <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                                <div className="text-xs font-bold">
                                    {requiresOtp
                                        ? 'Peminjaman Durasi Panjang (> 4 Jam)'
                                        : 'Peminjaman Standar (≤ 4 Jam)'}
                                </div>
                                <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                                    {requiresOtp
                                        ? 'Durasi ini melebihi batas tamu normal. Sistem akan mengirim kode OTP 6-digit ke email Anda untuk konfirmasi sebelum alat dapat digunakan.'
                                        : 'Durasi berada dalam batas standar tamu. Peminjaman langsung disetujui tanpa perlu verifikasi kode OTP.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <RefreshCw size={15} className="animate-spin" />
                                <span>Memproses...</span>
                            </>
                        ) : requiresOtp ? (
                            <>
                                <KeyRound size={15} />
                                <span>Kirim Kode OTP & Lanjutkan</span>
                            </>
                        ) : (
                            <>
                                <span>Ajukan Peminjaman Sekarang</span>
                                <ArrowRight size={15} />
                            </>
                        )}
                    </button>
                </form>
            </main>

            {/* OTP Verification Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-red-50 text-[#D84040] border border-red-200 rounded-2xl flex items-center justify-center mx-auto">
                                <KeyRound size={24} />
                            </div>
                            <h3 className="text-base font-bold text-[#1D1616]">Verifikasi Email Tamu</h3>
                            <p className="text-xs text-[#6B7280]">
                                Masukkan 6 digit kode verifikasi yang dikirim ke: <br />
                                <strong className="text-[#1D1616]">{email}</strong>
                            </p>
                        </div>

                        {/* Development Testing OTP helper */}
                        {debugOtp && (
                            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
                                <span className="text-[10px] text-amber-800 uppercase tracking-wider font-bold">
                                    Testing Mode (APP_DEBUG)
                                </span>
                                <div className="font-mono text-base font-black text-amber-900 tracking-widest mt-0.5">
                                    {debugOtp}
                                </div>
                            </div>
                        )}

                        {otpError && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0 text-[#D84040]" />
                                <span>{otpError}</span>
                            </div>
                        )}

                        {/* 6 Digit Input Boxes */}
                        <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                            {otpDigits.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (otpInputRefs.current[idx] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                    className={`w-11 h-12 text-center text-lg font-bold font-mono rounded-xl border focus:outline-none transition-all ${
                                        digit
                                            ? 'border-[#D84040] bg-red-50/30 text-[#8E1616]'
                                            : 'border-[#E0E0E0] bg-white text-[#1D1616] focus:border-[#D84040]'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="space-y-2.5 pt-1">
                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otpLoading || otpDigits.join('').length !== 6}
                                className="w-full py-3 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                {otpLoading ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        <span>Memverifikasi...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={15} />
                                        <span>Verifikasi & Selesaikan Peminjaman</span>
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowOtpModal(false)}
                                    className="text-[#6B7280] hover:text-[#1D1616]"
                                >
                                    Ubah Data
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendCooldown > 0 || otpLoading}
                                    className="font-bold text-[#D84040] hover:underline disabled:text-[#6B7280] disabled:no-underline"
                                >
                                    {resendCooldown > 0 ? `Kirim Ulang (${resendCooldown}s)` : 'Kirim Ulang Kode'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="py-4 text-center text-[11px] text-[#6B7280] border-t border-[#E0E0E0]/60 bg-white">
                WAMS • Workshop Asset Management System
            </footer>
        </div>
    );
}
