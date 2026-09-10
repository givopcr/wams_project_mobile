import React, { useState, useRef, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import {
    Scan,
    Search,
    Wrench,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Camera,
    RefreshCw,
    X,
    RotateCcw,
    ShieldAlert,
    Package,
    FlipHorizontal,
    Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';

export default function MobileScanner({ categories = [], recentUnits = [] }) {
    const [scanInput, setScanInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [scannedUnit, setScannedUnit] = useState(null);
    const [scanError, setScanError] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [facingMode, setFacingMode] = useState('environment'); // 'environment' (belakang) | 'user' (depan)
    const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Form Pinjam Cepat dari Scanner
    const {
        data: borrowData,
        setData: setBorrowData,
        post: postBorrow,
        processing: borrowProcessing,
        reset: resetBorrow
    } = useForm({
        barang_id: '',
        barang_unit_id: '',
        keperluan: 'Pekerjaan / Praktikum Workshop',
        batas_kembali: new Date(Date.now() + 120 * 60 * 1000).toISOString().slice(0, 16),
    });

    // Form Kembali Cepat dari Scanner
    const {
        data: returnData,
        setData: setReturnData,
        post: postReturn,
        processing: returnProcessing
    } = useForm({
        kondisi_kembali: 'baik',
        catatan: '',
    });

    // Start Camera Stream with automatic fallbacks
    const startCamera = async (targetFacing = facingMode) => {
        setScanError(null);
        setIsSwitchingCamera(true);

        // Stop existing tracks first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setScanError('Browser ini tidak mendukung akses kamera langsung. Silakan masukkan kode unit di bawah.');
            setCameraActive(false);
            setIsSwitchingCamera(false);
            return;
        }

        let stream = null;

        // Try preferred facingMode first
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: targetFacing },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });
        } catch (err1) {
            console.warn(`Could not start camera with facingMode ${targetFacing}, attempting generic video fallback:`, err1);
            // Fallback for laptops/desktop PCs with single front webcam
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
            } catch (err2) {
                console.error('All camera attempts failed:', err2);
                setCameraActive(false);
                setIsSwitchingCamera(false);
                setScanError('Izin kamera ditolak atau perangkat webcam tidak ditemukan. Pastikan Anda telah mengizinkan akses kamera.');
                return;
            }
        }

        if (stream && videoRef.current) {
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            try {
                await videoRef.current.play();
                setCameraActive(true);
            } catch (playErr) {
                console.error('Video play error:', playErr);
                setCameraActive(true);
            }
        }

        setIsSwitchingCamera(false);
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    // Toggle Front / Back Camera
    const toggleCameraFacingMode = async () => {
        const nextMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(nextMode);
        await startCamera(nextMode);
    };

    // Auto-start camera when component mounts
    useEffect(() => {
        startCamera('environment');

        return () => {
            stopCamera();
        };
    }, []);

    // BarcodeDetector real-time scanner loop
    useEffect(() => {
        if (!cameraActive || !videoRef.current) return;

        let isSubscribed = true;
        let detector = null;

        if ('BarcodeDetector' in window) {
            try {
                detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39'] });
            } catch (e) {
                console.warn('BarcodeDetector error:', e);
            }
        }

        let animationFrameId = null;

        const scanFrame = async () => {
            if (!isSubscribed || !videoRef.current || !detector) return;

            if (videoRef.current.readyState >= 2 && !loading && !scannedUnit) {
                try {
                    const barcodes = await detector.detect(videoRef.current);
                    if (barcodes.length > 0 && isSubscribed) {
                        const raw = barcodes[0].rawValue;
                        if (raw) {
                            if (navigator.vibrate) navigator.vibrate(100);
                            handleLookup(raw);
                            return;
                        }
                    }
                } catch (err) {
                    // Frame drop or read failure
                }
            }

            if (isSubscribed) {
                animationFrameId = requestAnimationFrame(scanFrame);
            }
        };

        if (detector) {
            animationFrameId = requestAnimationFrame(scanFrame);
        }

        return () => {
            isSubscribed = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [cameraActive, loading, scannedUnit]);

    const handleLookup = async (codeToLookup) => {
        const code = (codeToLookup || scanInput).trim();
        if (!code) {
            setScanError('Silakan masukkan atau scan kode unit.');
            return;
        }

        setLoading(true);
        setScanError(null);
        setScannedUnit(null);

        try {
            const res = await axios.get(`/user/lookup-unit/${encodeURIComponent(code)}`);
            if (res.data.success) {
                const u = res.data.data;
                setScannedUnit(u);
                setBorrowData({
                    barang_id: u.barang.id,
                    barang_unit_id: u.id,
                    keperluan: 'Pekerjaan / Praktikum Workshop',
                    batas_kembali: new Date(Date.now() + 120 * 60 * 1000).toISOString().slice(0, 16),
                });
                stopCamera();
            }
        } catch (err) {
            setScanError(err.response?.data?.message || `Unit dengan kode '${code}' tidak ditemukan di sistem WAMS.`);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleLookup();
    };

    const handleConfirmBorrow = (e) => {
        e.preventDefault();
        postBorrow('/user/pinjam', {
            onSuccess: () => {
                setScannedUnit(null);
                resetBorrow();
            },
        });
    };

    const handleConfirmReturn = (e) => {
        e.preventDefault();
        if (!scannedUnit?.active_logbook_id) return;

        postReturn(`/user/kembali/${scannedUnit.active_logbook_id}`, {
            onSuccess: () => {
                setScannedUnit(null);
            },
        });
    };

    return (
        <UserMobileLayout title="Scanner QR Code" showBackButton onBack={() => router.visit('/user/dashboard')}>
            <Head title="Scanner QR - WAMS Mobile" />

            <div className="space-y-4">
                {/* Viewfinder Camera Box */}
                <div className="bg-white border border-[#E0E0E0] rounded-3xl p-4 shadow-2xs overflow-hidden">
                    <div className="relative aspect-square max-h-[300px] w-full mx-auto bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center text-white">
                        {/* The HTML5 Video Element - ALWAYS rendered in DOM so ref is never null */}
                        <video
                            ref={videoRef}
                            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                            playsInline
                            autoPlay
                            muted
                        />

                        {/* Inactive Camera Overlay */}
                        {!cameraActive && (
                            <div className="text-center p-5 z-10">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto mb-2.5">
                                    <Camera size={28} />
                                </div>
                                <h4 className="text-sm font-bold">Kamera Belum Aktif</h4>
                                <p className="text-[11px] text-white/70 max-w-[220px] mx-auto mt-0.5 mb-3">
                                    Arahkan kamera ke QR Code stiker alat workshop
                                </p>
                                <button
                                    type="button"
                                    onClick={() => startCamera(facingMode)}
                                    disabled={isSwitchingCamera}
                                    className="px-4 py-2 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    {isSwitchingCamera ? 'Memulai Kamera...' : 'Aktifkan Kamera'}
                                </button>
                            </div>
                        )}

                        {/* Active Camera Viewfinder Overlay & Controls */}
                        {cameraActive && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3.5">
                                {/* Top Control Bar: Camera Switch & Status */}
                                <div className="flex items-center justify-between w-full z-20 pointer-events-auto">
                                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/20 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>{facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}</span>
                                    </span>

                                    {/* Switch Camera Button (Front <-> Back) */}
                                    <button
                                        type="button"
                                        onClick={toggleCameraFacingMode}
                                        disabled={isSwitchingCamera}
                                        className="px-3 py-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/30 flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                                        title="Ganti Kamera Depan / Belakang"
                                    >
                                        <FlipHorizontal size={14} className={isSwitchingCamera ? 'animate-spin' : ''} />
                                        <span>Ganti Kamera</span>
                                    </button>
                                </div>

                                {/* Scanner Target Frame Reticle with pulsing laser */}
                                <div className="self-center my-auto">
                                    <div className="w-48 h-48 border-2 border-white/40 rounded-2xl relative flex items-center">
                                        {/* Corner Brackets */}
                                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#D84040] -mt-1 -ml-1 rounded-tl-xl" />
                                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#D84040] -mt-1 -mr-1 rounded-tr-xl" />
                                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#D84040] -mb-1 -ml-1 rounded-bl-xl" />
                                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#D84040] -mb-1 -mr-1 rounded-br-xl" />

                                        {/* Laser Scanning Animation */}
                                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#D84040] to-transparent shadow-[0_0_12px_#D84040] animate-pulse" />
                                    </div>
                                </div>

                                {/* Bottom Bar: Close Camera Button */}
                                <div className="flex justify-center w-full z-20 pointer-events-auto">
                                    <button
                                        type="button"
                                        onClick={stopCamera}
                                        className="px-4 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full text-[11px] font-bold text-white border border-white/20 transition-all cursor-pointer"
                                    >
                                        Matikan Kamera
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manual Code Input Form */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-2xs">
                    <h4 className="text-xs font-black uppercase text-[#6B7280] tracking-wider mb-2">
                        Atau Masukkan Kode Unit Manual
                    </h4>

                    <form onSubmit={handleFormSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            placeholder="Contoh: ELK-001-01 atau PRK-001-01"
                            className="flex-1 px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl text-xs font-mono text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Cek...' : 'Periksa'}
                        </button>
                    </form>

                    {/* Quick Simulator Preset Chips */}
                    {recentUnits.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#E0E0E0]">
                            <p className="text-[10px] font-bold text-[#8C93A0] mb-1.5">
                                Klik Kode Sampel Workshop untuk Uji Cepat:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {recentUnits.map((u) => (
                                    <button
                                        key={u.kode_unit}
                                        type="button"
                                        onClick={() => {
                                            setScanInput(u.kode_unit);
                                            handleLookup(u.kode_unit);
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-[#F8F9FA] border border-[#E0E0E0] hover:border-[#D84040] text-[11px] font-mono font-bold text-[#1D1616] transition-colors cursor-pointer"
                                    >
                                        {u.kode_unit}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Banner */}
                    {scanError && (
                        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                            <AlertCircle size={16} className="text-[#D84040] shrink-0" />
                            <span>{scanError}</span>
                        </div>
                    )}
                </div>

                {/* Scanned Unit Result Card */}
                {scannedUnit && (
                    <div className="bg-white border-2 border-[#D84040] rounded-2xl p-4 shadow-md animate-in fade-in slide-in-from-bottom-3 duration-200">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#EEEEEE] text-[#1D1616]">
                                    {scannedUnit.kode_unit}
                                </span>
                                <h3 className="text-base font-black text-[#1D1616] mt-1">
                                    {scannedUnit.barang.nama_barang}
                                </h3>
                                <p className="text-xs text-[#6B7280]">
                                    Kategori: {scannedUnit.barang.kategori}
                                </p>
                            </div>

                            <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                    scannedUnit.status === 'tersedia'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : scannedUnit.is_borrowed_by_me
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                            >
                                {scannedUnit.status === 'tersedia'
                                    ? 'Unit Tersedia'
                                    : scannedUnit.is_borrowed_by_me
                                    ? 'Sedang Anda Pinjam'
                                    : 'Sedang Dipinjam Orang Lain'}
                            </span>
                        </div>

                        {/* CASE 1: UNIT TERSEDIA -> BISA LANGSUNG DIPINJAM */}
                        {scannedUnit.status === 'tersedia' && (
                            <form onSubmit={handleConfirmBorrow} className="space-y-3 pt-2 border-t border-[#E0E0E0]">
                                {scannedUnit.barang.perlu_persetujuan && (
                                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                                        <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                                        <span>Perlu persetujuan Admin sebelum dapat diambil.</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                        Keperluan Peminjaman
                                    </label>
                                    <input
                                        type="text"
                                        value={borrowData.keperluan}
                                        onChange={(e) => setBorrowData('keperluan', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                        Batas Waktu Pengembalian
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={borrowData.batas_kembali}
                                        onChange={(e) => setBorrowData('batas_kembali', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={borrowProcessing}
                                    className="w-full py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                >
                                    {borrowProcessing ? 'Memproses...' : 'Pinjam Unit Ini Sekarang'}
                                </button>
                            </form>
                        )}

                        {/* CASE 2: UNIT SEDANG DIPINJAM OLEH USER INI -> BISA LANGSUNG KEMBALIKAN */}
                        {scannedUnit.is_borrowed_by_me && (
                            <form onSubmit={handleConfirmReturn} className="space-y-3 pt-2 border-t border-[#E0E0E0]">
                                <p className="text-xs text-[#6B7280]">
                                    Anda sedang meminjam unit ini. Ingin mengembalikannya sekarang?
                                </p>
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                        Kondisi Fisik Pengembalian
                                    </label>
                                    <select
                                        value={returnData.kondisi_kembali}
                                        onChange={(e) => setReturnData('kondisi_kembali', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                    >
                                        <option value="baik">Kondisi Baik / Normal</option>
                                        <option value="rusak_ringan">Rusak Ringan</option>
                                        <option value="rusak_berat">Rusak Berat</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={returnProcessing}
                                    className="w-full py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                >
                                    {returnProcessing ? 'Memproses...' : 'Kembalikan Unit Ini Sekarang'}
                                </button>
                            </form>
                        )}

                        {/* CASE 3: UNIT TIDAK TERSEDIA */}
                        {scannedUnit.status !== 'tersedia' && !scannedUnit.is_borrowed_by_me && (
                            <div className="pt-2 border-t border-[#E0E0E0]">
                                <p className="text-xs text-rose-700">
                                    Unit ini sedang tidak dapat dipinjam saat ini. Silakan cari unit lain di katalog.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </UserMobileLayout>
    );
}
