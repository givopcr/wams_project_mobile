import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import {
    Zap,
    ZapOff,
    SwitchCamera,
    Camera,
    RefreshCw,
    X,
    CheckCircle2,
    AlertCircle,
    ShieldAlert,
    Image as ImageIcon,
    Keyboard,
    Boxes,
    Wrench,
    ChevronRight,
    ArrowRight,
    Layers
} from 'lucide-react';
import axios from 'axios';
import jsQR from 'jsqr';

export default function MobileScanner({
    categories = [],
    recentUnits = [],
    initialCode = '',
    targetName = '',
}) {
    const [scanMode, setScanMode] = useState('all'); // 'all' | 'category' | 'unit'
    const [scanInput, setScanInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [scannedUnit, setScannedUnit] = useState(null);
    const [scannedCategory, setScannedCategory] = useState(null);
    const [scanError, setScanError] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [facingMode, setFacingMode] = useState('environment');
    const [torchOn, setTorchOn] = useState(false);
    const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
    const [showManualSheet, setShowManualSheet] = useState(false);
    const [borrowDurationPreset, setBorrowDurationPreset] = useState(120);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);
    const isScanningRef = useRef(true);
    const fileInputRef = useRef(null);

    const calculateDeadline = (minutes) => {
        const d = new Date(Date.now() + minutes * 60 * 1000);
        return d.toISOString().slice(0, 16);
    };

    const {
        data: borrowData,
        setData: setBorrowData,
        post: postBorrow,
        processing: borrowProcessing,
        reset: resetBorrow,
    } = useForm({
        barang_id: '',
        barang_unit_id: '',
        keperluan: 'Pekerjaan / Praktikum Workshop',
        batas_kembali: calculateDeadline(120),
    });

    const {
        data: returnData,
        setData: setReturnData,
        post: postReturn,
        processing: returnProcessing,
    } = useForm({
        kondisi_kembali: 'baik',
        catatan: '',
    });

    const handleDurationPresetChange = (minutes) => {
        setBorrowDurationPreset(minutes);
        setBorrowData('batas_kembali', calculateDeadline(minutes));
    };

    const playBeep = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch {
            // Ignore audio context restriction
        }
    };

    const startCamera = async (targetFacing = facingMode) => {
        setScanError(null);
        setIsSwitchingCamera(true);
        setTorchOn(false);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setScanError('Browser tidak mendukung akses kamera langsung. Gunakan Input Manual / Galeri.');
            setCameraActive(false);
            setIsSwitchingCamera(false);
            return;
        }

        let stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: targetFacing },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });
        } catch {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
            } catch {
                setCameraActive(false);
                setIsSwitchingCamera(false);
                setScanError('Izin kamera ditolak atau tidak tersedia.');
                return;
            }
        }

        if (stream && videoRef.current) {
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute('playsinline', 'true');
            try {
                await videoRef.current.play();
                setCameraActive(true);
                isScanningRef.current = true;
            } catch {
                setCameraActive(true);
            }
        }

        setIsSwitchingCamera(false);
    };

    const stopCamera = () => {
        isScanningRef.current = false;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
        setTorchOn(false);
    };

    const toggleCameraFacingMode = async () => {
        const nextMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(nextMode);
        await startCamera(nextMode);
    };

    const toggleTorch = async () => {
        if (!streamRef.current) return;
        const track = streamRef.current.getVideoTracks()[0];
        if (!track) return;
        try {
            const nextTorch = !torchOn;
            await track.applyConstraints({
                advanced: [{ torch: nextTorch }],
            });
            setTorchOn(nextTorch);
        } catch {
            // Device/browser does not support hardware torch
            setTorchOn((prev) => !prev);
        }
    };

    useEffect(() => {
        let codeToRun = initialCode;
        if (!codeToRun && typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            codeToRun = params.get('code') || '';
        }
        if (codeToRun) {
            setScanInput(codeToRun);
            handleLookup(codeToRun);
        } else {
            startCamera('environment');
        }
        return () => stopCamera();
    }, [initialCode]);

    useEffect(() => {
        if (!cameraActive) return;

        let animationFrameId = null;
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const scan = () => {
            if (!isScanningRef.current) return;
            const video = videoRef.current;
            if (video && video.readyState === video.HAVE_ENOUGH_DATA && !loading && !scannedUnit && !scannedCategory) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                try {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'dontInvert',
                    });

                    if (code && code.data) {
                        const raw = code.data.trim();
                        if (raw) {
                            isScanningRef.current = false;
                            playBeep();
                            if (navigator.vibrate) navigator.vibrate(120);
                            handleLookup(raw);
                            return;
                        }
                    }
                } catch {
                    // Ignore frame error
                }
            }

            if (isScanningRef.current) {
                animationFrameId = requestAnimationFrame(scan);
            }
        };

        animationFrameId = requestAnimationFrame(scan);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [cameraActive, loading, scannedUnit, scannedCategory]);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'attemptBoth',
                });

                if (code && code.data) {
                    playBeep();
                    if (navigator.vibrate) navigator.vibrate(100);
                    setShowManualSheet(false);
                    handleLookup(code.data);
                } else {
                    setScanError('QR Code tidak ditemukan pada gambar yang dipilih.');
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleLookup = async (codeToLookup) => {
        let code = (codeToLookup || scanInput).trim();
        if (!code) {
            setScanError('Masukkan kode QR kategori atau kode unit.');
            return;
        }

        setLoading(true);
        setScanError(null);
        setScannedUnit(null);
        setScannedCategory(null);

        try {
            // Gunakan query param code agar kode unit dengan spasi/garis miring tidak terpotong oleh routing
            const res = await axios.get('/user/lookup-unit', {
                params: { code: code }
            });

            if (res.data.success) {
                // Tipe 1: QR Kategori (Rak Workshop)
                if (res.data.type === 'kategori') {
                    stopCamera();
                    setScannedCategory(res.data.data);
                    setShowManualSheet(false);
                    return;
                }

                // Tipe 2: QR Unit Fisik (Peralatan)
                const u = res.data.data;
                setScannedUnit(u);
                setShowManualSheet(false);
                setBorrowData({
                    barang_id: u.barang.id,
                    barang_unit_id: u.id,
                    keperluan: 'Pekerjaan / Praktikum Workshop',
                    batas_kembali: calculateDeadline(120),
                });
                stopCamera();
            }
        } catch (err) {
            setScanError(
                err.response?.data?.message ||
                    `QR Code "${code}" tidak dikenali di sistem WAMS.`
            );
            isScanningRef.current = true;
        } finally {
            setLoading(false);
        }
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

    const handleScanAgain = () => {
        setScannedUnit(null);
        setScannedCategory(null);
        setScanError(null);
        setScanInput('');
        startCamera(facingMode);
    };

    return (
        <UserMobileLayout
            title="Scan QR Code"
            centerTitle={true}
            darkAppBar={true}
            noPadding={true}
            rightAction={
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={toggleTorch}
                        className="w-9 h-9 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Flash / Senter"
                    >
                        {torchOn ? (
                            <Zap size={20} className="text-amber-400 fill-amber-400" />
                        ) : (
                            <ZapOff size={20} className="text-white" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={toggleCameraFacingMode}
                        disabled={isSwitchingCamera}
                        className="w-9 h-9 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Ganti Kamera"
                    >
                        <SwitchCamera size={20} />
                    </button>
                </div>
            }
        >
            <Head title="Scan QR Code - WAMS" />

            {/* Keyframes for red laser animation matching scan_screen.dart */}
            <style>{`
                @keyframes wamsLaserScan {
                    0% { top: 14px; }
                    50% { top: calc(100% - 16px); }
                    100% { top: 14px; }
                }
            `}</style>

            <div className="relative w-full h-[calc(100vh-122px)] min-h-[520px] bg-black overflow-hidden flex flex-col items-center justify-center select-none">
                <canvas ref={canvasRef} className="hidden" />

                {/* Live Camera Feed */}
                <video
                    ref={videoRef}
                    className={`absolute inset-0 w-full h-full object-cover ${
                        cameraActive ? 'block' : 'hidden'
                    }`}
                    playsInline
                    autoPlay
                    muted
                />

                {/* Fallback when camera is off */}
                {!cameraActive && !scannedUnit && !scannedCategory && (
                    <div className="relative z-20 flex flex-col items-center text-center px-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-3">
                            <Camera size={30} />
                        </div>
                        <p className="text-white font-bold text-sm">Kamera Belum Aktif</p>
                        <p className="text-white/60 text-xs mt-1 mb-4 max-w-[260px]">
                            Aktifkan kamera untuk memindai QR Kategori (Rak Workshop) atau QR Unit Fisik Peralatan
                        </p>
                        <button
                            type="button"
                            onClick={() => startCamera(facingMode)}
                            className="px-5 py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                            Aktifkan Kamera
                        </button>
                    </div>
                )}

                {/* Top Scan Mode Switcher (Semua | Per Kategori | Per Barang) */}
                {cameraActive && !scannedUnit && !scannedCategory && (
                    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-center">
                        <div className="flex items-center gap-1 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                            <button
                                type="button"
                                onClick={() => setScanMode('all')}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                    scanMode === 'all'
                                        ? 'bg-[#D84040] text-white shadow-xs'
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                Semua QR
                            </button>
                            <button
                                type="button"
                                onClick={() => setScanMode('category')}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    scanMode === 'category'
                                        ? 'bg-[#D84040] text-white shadow-xs'
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                <Boxes size={13} />
                                <span>Per Kategori</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setScanMode('unit')}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    scanMode === 'unit'
                                        ? 'bg-[#D84040] text-white shadow-xs'
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                <Wrench size={13} />
                                <span>Per Unit Alat</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Center Scan Area with 4 Red Corner Borders & Animated Laser (matching scan_screen.dart) */}
                {cameraActive && (
                    <div className="relative z-10 flex flex-col items-center">
                        <div
                            className="w-[260px] h-[260px] rounded-[24px] relative"
                            style={{
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
                            }}
                        >
                            {/* 4 Red Corner Brackets */}
                            <div className="absolute top-0 left-0 w-[40px] h-[40px] border-t-[4px] border-l-[4px] border-[#D84040] rounded-tl-[24px]" />
                            <div className="absolute top-0 right-0 w-[40px] h-[40px] border-t-[4px] border-r-[4px] border-[#D84040] rounded-tr-[24px]" />
                            <div className="absolute bottom-0 left-0 w-[40px] h-[40px] border-b-[4px] border-l-[4px] border-[#D84040] rounded-bl-[24px]" />
                            <div className="absolute bottom-0 right-0 w-[40px] h-[40px] border-b-[4px] border-r-[4px] border-[#D84040] rounded-br-[24px]" />

                            {/* Animated Red Laser Line */}
                            <div
                                className="absolute left-[16px] right-[16px] h-[2px] bg-[#D84040]"
                                style={{
                                    boxShadow: '0 0 8px 2px rgba(216, 64, 64, 0.55)',
                                    animation: 'wamsLaserScan 2s ease-in-out infinite',
                                }}
                            />
                        </div>

                        {/* Instruction Pill */}
                        <div className="mt-[28px] px-[16px] py-[8px] bg-black/70 backdrop-blur-md border border-white/10 rounded-full text-white text-[12px] font-medium text-center max-w-[320px]">
                            {scanMode === 'category'
                                ? 'Arahkan kamera ke stiker QR Kategori pada rak workshop'
                                : scanMode === 'unit'
                                ? 'Arahkan kamera ke stiker QR unit pada fisik alat'
                                : 'Arahkan kamera ke QR Kategori (Rak) atau QR Unit (Alat)'}
                        </div>

                        {/* Quick Category Chips under viewfinder */}
                        {categories.length > 0 && !scannedUnit && !scannedCategory && (
                            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto max-w-[340px] px-2 py-1 no-scrollbar">
                                {categories.map((kat) => (
                                    <button
                                        key={kat.id}
                                        type="button"
                                        onClick={() => handleLookup(kat.qr_code || `/scan/kategori/${kat.id}`)}
                                        className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                                    >
                                        <Boxes size={11} className="text-amber-300" />
                                        <span>{kat.nama_kategori}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Error Toast inside Scanner */}
                {scanError && !showManualSheet && (
                    <div className="absolute top-16 left-5 right-5 z-30 p-3.5 bg-[#DC2626] text-white rounded-[12px] shadow-lg flex items-center justify-between gap-2 text-xs font-semibold">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{scanError}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setScanError(null)}
                            className="p-1 hover:bg-white/10 rounded-full cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Bottom Controls: Input Manual / Galeri */}
                <div className="absolute bottom-5 left-0 right-0 z-20 px-6 flex items-center justify-center gap-2.5">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => setShowManualSheet(true)}
                        className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
                    >
                        <Keyboard size={15} />
                        <span>Kode Manual / Kategori</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
                    >
                        <ImageIcon size={15} />
                        <span>Galeri QR</span>
                    </button>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 z-40 bg-black/70 flex flex-col items-center justify-center text-white">
                        <RefreshCw size={32} className="animate-spin text-[#D84040] mb-3" />
                        <p className="text-sm font-bold">Memproses QR Code...</p>
                    </div>
                )}
            </div>

            {/* Manual Code & Category Selector Bottom Sheet */}
            {showManualSheet && (
                <div
                    onClick={() => setShowManualSheet(false)}
                    className="fixed inset-0 z-[9999] bg-black/60 flex items-end justify-center animate-in fade-in duration-150"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[480px] bg-white rounded-t-[24px] p-[24px] shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
                    >
                        <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-[16px]" />
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-[16px] font-extrabold text-[#1D1616]">
                                    Pilih Kategori atau Kode Unit
                                </h3>
                                <p className="text-[11px] text-[#6B7280]">
                                    Ketik manual atau pilih kategori rak workshop
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowManualSheet(false)}
                                className="w-8 h-8 rounded-full bg-[#F5F5F5] text-[#8C93A0] flex items-center justify-center cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleLookup();
                            }}
                            className="flex gap-2 mb-4"
                        >
                            <input
                                type="text"
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                placeholder="Contoh: /scan/kategori/1 atau BOR-101-01"
                                className="flex-1 px-4 py-3 bg-[#F8F9FA] border border-[#E0E0E0] rounded-[12px] text-xs font-mono text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-3 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-[12px] cursor-pointer"
                            >
                                Cek
                            </button>
                        </form>

                        {/* Section 1: Kategori Workshop (Rak) */}
                        {categories.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-[#1D1616] flex items-center gap-1.5">
                                        <Boxes size={13} className="text-[#D84040]" />
                                        <span>Kategori Workshop (Rak):</span>
                                    </span>
                                    <span className="text-[10px] text-[#6B7280]">
                                        Tap untuk buka katalog
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {categories.map((kat) => (
                                        <button
                                            key={kat.id}
                                            type="button"
                                            onClick={() => {
                                                setShowManualSheet(false);
                                                handleLookup(kat.qr_code || `/scan/kategori/${kat.id}`);
                                            }}
                                            className="p-3 rounded-xl border border-[#E0E0E0] bg-[#F8F9FA] hover:border-[#D84040] hover:bg-red-50/50 flex flex-col items-center text-center transition-all cursor-pointer group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-red-100 text-[#D84040] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                                                <Boxes size={18} />
                                            </div>
                                            <span className="text-xs font-bold text-[#1D1616] leading-tight line-clamp-1">
                                                {kat.nama_kategori}
                                            </span>
                                            <span className="text-[10px] text-[#6B7280] mt-0.5">
                                                {kat.total_barang ?? 0} Alat
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 2: Sampel Unit Fisik */}
                        {recentUnits.length > 0 && (
                            <div className="pt-3 border-t border-[#EEEEEE]">
                                <p className="text-[11px] font-bold text-[#1D1616] flex items-center gap-1.5 mb-2">
                                    <Wrench size={13} className="text-[#D84040]" />
                                    <span>Pilih Cepat Sampel Unit Alat:</span>
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
                                            className="px-2.5 py-1 rounded-[8px] bg-[#F8F9FA] border border-[#E0E0E0] hover:border-[#D84040] text-xs font-mono font-bold text-[#1D1616] cursor-pointer"
                                        >
                                            {u.kode_unit}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Scanned Category Result Bottom Sheet */}
            {scannedCategory && (
                <div
                    onClick={() => {
                        setScannedCategory(null);
                        handleScanAgain();
                    }}
                    className="fixed inset-0 z-[9999] bg-black/65 flex items-end justify-center animate-in fade-in duration-150"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom, 28px))' }}
                        className="w-full max-w-[480px] bg-white rounded-t-[24px] p-[24px] shadow-2xl animate-in slide-in-from-bottom duration-200 relative z-10"
                    >
                        <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-[16px]" />

                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] text-[11px] font-bold w-fit">
                                <CheckCircle2 size={14} />
                                <span>QR Kategori Workshop Terverifikasi</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setScannedCategory(null);
                                    handleScanAgain();
                                }}
                                className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#8C93A0] hover:text-[#1D1616] flex items-center justify-center cursor-pointer transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Interactive Clickable Category Info Card */}
                        <Link
                            href={`/user/katalog?kategori_id=${scannedCategory.id}&mode=category_list`}
                            className="w-full flex items-center gap-3.5 mb-4 p-3.5 rounded-2xl bg-[#F8F9FA] hover:bg-red-50/40 active:scale-[0.99] border border-[#E0E0E0] hover:border-[#D84040] transition-all cursor-pointer group touch-manipulation block text-left"
                        >
                            <div className="w-13 h-13 rounded-2xl bg-red-100 text-[#D84040] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Boxes size={28} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#1D1616] text-white">
                                        ID #{scannedCategory.id}
                                    </span>
                                    <span className="text-[11px] text-[#6B7280] font-mono truncate">
                                        {scannedCategory.qr_code}
                                    </span>
                                </div>
                                <h3 className="text-[18px] font-extrabold text-[#1D1616] truncate mt-1 group-hover:text-[#D84040] transition-colors">
                                    {scannedCategory.nama_kategori}
                                </h3>
                                <p className="text-[12px] text-[#6B7280] mt-0.5">
                                    {scannedCategory.total_barang ?? 0} Jenis Peralatan • {scannedCategory.tersedia ?? scannedCategory.total_unit ?? 0} Unit Tersedia
                                </p>
                            </div>
                            <ChevronRight size={18} className="text-[#9CA3AF] group-hover:text-[#D84040] shrink-0" />
                        </Link>

                        <div className="space-y-2 pt-1">
                            {/* Primary Navigation Link Button */}
                            <Link
                                href={`/user/katalog?kategori_id=${scannedCategory.id}&mode=category_list`}
                                className="w-full py-3.5 bg-[#D84040] hover:bg-[#8E1616] active:bg-[#701010] active:scale-[0.98] text-white text-xs font-bold rounded-[12px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-500/20 touch-manipulation select-none"
                            >
                                <span>Lihat Daftar Alat ({scannedCategory.total_barang ?? 0} Barang)</span>
                                <ChevronRight size={16} />
                            </Link>

                            <button
                                type="button"
                                onClick={() => {
                                    setScannedCategory(null);
                                    handleScanAgain();
                                }}
                                className="w-full py-3 rounded-[12px] bg-[#F5F5F5] hover:bg-[#EEEEEE] active:bg-[#E5E5E5] text-[#1D1616] text-xs font-bold transition-all cursor-pointer touch-manipulation select-none"
                            >
                                Pindai QR Lainnya
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scanned Unit Result Bottom Sheet */}
            {scannedUnit && (
                <div
                    onClick={() => {
                        setScannedUnit(null);
                        handleScanAgain();
                    }}
                    className="fixed inset-0 z-[9999] bg-black/65 flex items-end justify-center animate-in fade-in duration-150"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom, 28px))' }}
                        className="w-full max-w-[480px] bg-white rounded-t-[24px] p-[24px] shadow-2xl max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 relative z-10"
                    >
                        <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-[16px]" />

                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#059669] text-[11px] font-bold w-fit mb-3">
                            <CheckCircle2 size={14} />
                            <span>QR Code Unit Terverifikasi</span>
                        </div>

                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-[6px] bg-[#1D1616] text-white">
                                    {scannedUnit.kode_unit}
                                </span>
                                <h3 className="text-[17px] font-extrabold text-[#1D1616] mt-1.5">
                                    {scannedUnit.barang.nama_barang}
                                </h3>
                                <p className="text-[12px] text-[#8C93A0] mt-0.5">
                                    Kategori: {scannedUnit.barang.kategori}
                                </p>
                            </div>
                            <span
                                className={`px-[10px] py-[4px] rounded-[8px] text-[11px] font-bold shrink-0 ${
                                    scannedUnit.status === 'tersedia'
                                        ? 'bg-[#ECFDF5] text-[#059669]'
                                        : scannedUnit.is_borrowed_by_me
                                        ? 'bg-[#EFF6FF] text-[#2563EB]'
                                        : 'bg-[#FEF2F2] text-[#DC2626]'
                                }`}
                            >
                                {scannedUnit.status === 'tersedia'
                                    ? 'Tersedia'
                                    : scannedUnit.is_borrowed_by_me
                                    ? 'Dipinjam Anda'
                                    : 'Dipinjam'}
                            </span>
                        </div>

                        {scannedUnit.status === 'tersedia' && (
                            <form
                                onSubmit={handleConfirmBorrow}
                                className="space-y-3 pt-3 border-t border-[#EEEEEE]"
                            >
                                {scannedUnit.barang.perlu_persetujuan && (
                                    <div className="p-3 rounded-[12px] bg-[#FFFBEB] border border-[#FCD34D] text-[#92400E] text-xs flex items-center gap-2">
                                        <ShieldAlert size={16} className="text-[#D97706] shrink-0" />
                                        <span>Memerlukan persetujuan Admin sebelum diambil.</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1.5">
                                        Durasi Peminjaman
                                    </label>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {[
                                            { label: '2 Jam', min: 120 },
                                            { label: '4 Jam', min: 240 },
                                            { label: '1 Hari', min: 1440 },
                                            { label: '3 Hari', min: 4320 },
                                        ].map((preset) => (
                                            <button
                                                key={preset.min}
                                                type="button"
                                                onClick={() =>
                                                    handleDurationPresetChange(preset.min)
                                                }
                                                className={`py-2 rounded-[10px] text-xs font-bold border transition-all cursor-pointer ${
                                                    borrowDurationPreset === preset.min
                                                        ? 'bg-[#D84040] text-white border-[#D84040]'
                                                        : 'bg-[#F8F9FA] text-[#1D1616] border-[#E0E0E0]'
                                                }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                        Keperluan
                                    </label>
                                    <input
                                        type="text"
                                        value={borrowData.keperluan}
                                        onChange={(e) => setBorrowData('keperluan', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E0E0E0] rounded-[12px] text-xs text-[#1D1616]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={borrowProcessing}
                                    className="w-full py-3.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-[12px] transition-colors cursor-pointer"
                                >
                                    {borrowProcessing
                                        ? 'Memproses...'
                                        : `Pinjam Unit ${scannedUnit.kode_unit}`}
                                </button>
                            </form>
                        )}

                        {scannedUnit.is_borrowed_by_me && (
                            <form
                                onSubmit={handleConfirmReturn}
                                className="space-y-3 pt-3 border-t border-[#EEEEEE]"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                        Kondisi Saat Dikembalikan
                                    </label>
                                    <select
                                        value={returnData.kondisi_kembali}
                                        onChange={(e) =>
                                            setReturnData('kondisi_kembali', e.target.value)
                                        }
                                        className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E0E0E0] rounded-[12px] text-xs text-[#1D1616]"
                                    >
                                        <option value="baik">Baik</option>
                                        <option value="rusak_ringan">Rusak</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={returnProcessing}
                                    className="w-full py-3.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-[12px] cursor-pointer"
                                >
                                    {returnProcessing
                                        ? 'Memproses...'
                                        : 'Konfirmasi Pengembalian Unit'}
                                </button>
                            </form>
                        )}

                        <button
                            type="button"
                            onClick={handleScanAgain}
                            className="w-full mt-3 py-3 rounded-[12px] bg-[#F5F5F5] hover:bg-[#EEEEEE] text-[#1D1616] text-xs font-bold transition-colors cursor-pointer"
                        >
                            Scan QR Lainnya
                        </button>
                    </div>
                </div>
            )}
        </UserMobileLayout>
    );
}
