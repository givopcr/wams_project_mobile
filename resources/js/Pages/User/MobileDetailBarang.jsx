import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import {
    Wrench,
    CheckCircle2,
    Ban,
    Check,
    ShieldAlert,
    Calendar,
    Camera,
    X,
    ZoomIn,
    RefreshCw
} from 'lucide-react';
import axios from 'axios';

function formatIndoDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

export default function MobileDetailBarang({ barang }) {
    // Steps: 'detail' | 'pilih_unit' | 'form' | 'berhasil'
    const [step, setStep] = useState('detail');
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Step 2: Pilih Unit state
    const units = barang?.units || [];
    const availableUnits = units.filter((u) => u.status === 'tersedia');
    const [selectedUnitIds, setSelectedUnitIds] = useState([]);

    // Step 3: Form Peminjaman state
    const todayIso = new Date().toISOString().slice(0, 10);
    const defaultReturnIso = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const [tanggalPinjam, setTanggalPinjam] = useState(todayIso);
    const [tanggalKembali, setTanggalKembali] = useState(defaultReturnIso);
    const [keperluan, setKeperluan] = useState('');
    const [fotoPinjam, setFotoPinjam] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const handleFotoPinjamChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setFotoPinjam(ev.target.result);
            setFormError('');
        };
        reader.readAsDataURL(file);
    };

    if (!barang) {
        return (
            <UserMobileLayout title="Detail Barang" showBackButton onBack={() => router.visit('/user/katalog')}>
                <div className="p-8 text-center text-[#8C93A0]">Barang tidak ditemukan.</div>
            </UserMobileLayout>
        );
    }

    const MAX_BORROW_UNITS = 5;
    const isAvailable = (barang.stok_tersedia || 0) > 0;
    const maxSelectableCount = Math.min(availableUnits.length, MAX_BORROW_UNITS);
    const allSelected =
        maxSelectableCount > 0 && selectedUnitIds.length === maxSelectableCount;
    const selectedUnits = units.filter((u) => selectedUnitIds.includes(u.id));

    const toggleUnit = (unitId) => {
        setFormError('');
        setSelectedUnitIds((prev) => {
            if (prev.includes(unitId)) {
                return prev.filter((id) => id !== unitId);
            }
            if (prev.length >= MAX_BORROW_UNITS) {
                setFormError(`Maksimal peminjaman adalah ${MAX_BORROW_UNITS} unit barang.`);
                return prev;
            }
            return [...prev, unitId];
        });
    };

    const toggleSelectAll = () => {
        setFormError('');
        if (allSelected) {
            setSelectedUnitIds([]);
        } else {
            setSelectedUnitIds(availableUnits.slice(0, MAX_BORROW_UNITS).map((u) => u.id));
        }
    };

    const handleSubmitLoan = async (e) => {
        e.preventDefault();
        setFormError('');

        if (selectedUnitIds.length === 0) {
            setFormError('Pilih minimal 1 unit');
            return;
        }
        if (!fotoPinjam) {
            setFormError('Foto barang sebelum dipinjam wajib diunggah dan tidak boleh dilewati.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await axios.post(
                '/user/pinjam',
                {
                    barang_id: barang.id,
                    barang_unit_ids: selectedUnitIds,
                    tanggal_pinjam: tanggalPinjam,
                    batas_kembali: `${tanggalKembali} 17:00:00`,
                    keperluan: keperluan.trim() || null,
                    foto_pinjam: fotoPinjam,
                    from_detail_flow: true,
                },
                {
                    headers: { Accept: 'application/json' },
                }
            );

            if (res.data?.success) {
                setStep('berhasil');
            } else {
                setFormError(res.data?.message || 'Gagal mengajukan peminjaman.');
            }
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.errors?.foto_pinjam?.[0] ||
                err.response?.data?.errors?.keperluan?.[0] ||
                err.response?.data?.errors?.batas_kembali?.[0] ||
                'Gagal mengajukan peminjaman. Silakan coba lagi.';
            setFormError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================================
    // STEP 4: PEMINJAMAN BERHASIL SCREEN (peminjaman_berhasil_screen.dart)
    // =========================================================================
    if (step === 'berhasil') {
        return (
            <UserMobileLayout hideAppBar={true} noPadding={true}>
                <Head title="Peminjaman Berhasil - WAMS" />
                <div className="min-h-[calc(100vh-80px)] bg-[#FAFAFA] px-[28px] py-[36px] flex flex-col justify-center items-center text-center">
                    {/* Concentric Green Checkmark Circle */}
                    <div className="w-[100px] h-[100px] rounded-full bg-[#ECFDF5] flex items-center justify-center">
                        <div className="w-[72px] h-[72px] rounded-full bg-[#D1FAE5] flex items-center justify-center">
                            <CheckCircle2 size={44} className="text-[#059669]" />
                        </div>
                    </div>

                    <h1 className="mt-[28px] text-[22px] font-extrabold text-[#1D1616]">
                        Peminjaman Berhasil!
                    </h1>
                    <p className="mt-[8px] text-[13px] text-[#8C93A0] leading-[1.5] max-w-[320px]">
                        Permintaan peminjaman kamu sedang diproses. Silakan ambil barang di lokasi penyimpanan.
                    </p>

                    {/* Summary Card */}
                    <div className="w-full mt-[32px] p-[20px] bg-white rounded-[16px] border border-[#EEEEEE] text-left space-y-[10px]">
                        <SummaryRow label="Barang" value={barang.nama_barang} />
                        <SummaryRow label="Jumlah Unit" value={`${selectedUnits.length} Unit`} />
                        <SummaryRow
                            label="Kode Unit"
                            value={selectedUnits.map((u) => u.kode_unit).join(', ')}
                        />
                        <SummaryRow label="Tgl Pinjam" value={formatIndoDate(tanggalPinjam)} />
                        <SummaryRow label="Batas Kembali" value={formatIndoDate(tanggalKembali)} />
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full mt-[36px] space-y-[12px]">
                        <button
                            type="button"
                            onClick={() => router.visit('/user/riwayat')}
                            className="w-full py-[16px] bg-[#D84040] hover:bg-[#8E1616] text-white rounded-[12px] font-semibold text-[14px] transition-colors cursor-pointer"
                        >
                            Lihat Peminjaman Saya
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/user/dashboard')}
                            className="w-full py-[16px] bg-white hover:bg-[#F5F5F5] text-[#1D1616] border border-[#E0E0E0] rounded-[12px] font-semibold text-[14px] transition-colors cursor-pointer"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </UserMobileLayout>
        );
    }

    // =========================================================================
    // STEP 3: FORM PEMINJAMAN SCREEN (form_peminjaman_screen.dart)
    // =========================================================================
    if (step === 'form') {
        return (
            <UserMobileLayout
                title="Form Peminjaman"
                showBackButton={true}
                onBack={() => setStep('pilih_unit')}
                noPadding={true}
            >
                <Head title={`Form Peminjaman - ${barang.nama_barang}`} />
                <form onSubmit={handleSubmitLoan} className="p-[24px] pb-[40px]">
                    {/* Banner Perlu Persetujuan */}
                    {barang.perlu_persetujuan && (
                        <div className="p-[14px] mb-[16px] bg-[#FFFBEB] rounded-[12px] border border-[#FCD34D] flex items-center gap-[12px]">
                            <ShieldAlert size={22} className="text-[#D97706] shrink-0" />
                            <p className="text-[12px] font-medium text-[#92400E] leading-relaxed">
                                Barang ini memerlukan persetujuan Admin sebelum dapat dipinjam.
                            </p>
                        </div>
                    )}

                    {formError && (
                        <div className="p-[14px] mb-[16px] bg-[#FEF2F2] rounded-[12px] border border-[#FECACA] text-[12px] font-semibold text-[#DC2626]">
                            {formError}
                        </div>
                    )}

                    {/* Selected Units Summary Card */}
                    <div className="p-[16px] bg-white rounded-[16px] border border-[#EEEEEE]">
                        <div className="flex items-center gap-[16px]">
                            <div className="w-[48px] h-[48px] rounded-[12px] bg-[#FEF2F2] flex items-center justify-center shrink-0">
                                <Wrench size={24} className="text-[#D84040]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-[15px] font-bold text-[#1D1616] truncate">
                                    {barang.nama_barang}
                                </h3>
                                <p className="text-[12px] text-[#8C93A0] mt-[2px]">
                                    {selectedUnits.length} unit dipilih
                                </p>
                            </div>
                        </div>

                        <div className="h-[1px] bg-[#F0F0F0] my-[12px]" />

                        <div className="flex flex-wrap gap-[6px]">
                            {selectedUnits.map((u) => (
                                <span
                                    key={u.id}
                                    className="px-[10px] py-[5px] bg-[#EFF6FF] rounded-[8px] border border-[#BFDBFE] text-[12px] font-bold text-[#1D4ED8]"
                                >
                                    {u.kode_unit}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tanggal Pinjam */}
                    <div className="mt-[24px]">
                        <label className="block text-[13px] font-semibold text-[#1D1616] mb-[8px]">
                            Tanggal Pinjam
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={tanggalPinjam}
                                onChange={(e) => setTanggalPinjam(e.target.value)}
                                required
                                className="w-full p-[15px] bg-white rounded-[12px] border border-[#E0E0E0] text-[14px] font-semibold text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                            />
                        </div>
                    </div>

                    {/* Tanggal Kembali (Batas) */}
                    <div className="mt-[16px]">
                        <label className="block text-[13px] font-semibold text-[#1D1616] mb-[8px]">
                            Tanggal Kembali (Batas)
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={tanggalKembali}
                                min={tanggalPinjam}
                                onChange={(e) => setTanggalKembali(e.target.value)}
                                required
                                className="w-full p-[15px] bg-white rounded-[12px] border border-[#E0E0E0] text-[14px] font-semibold text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                            />
                        </div>
                    </div>

                    {/* Foto Barang Sebelum Dipinjam (Wajib) */}
                    <div className="mt-[16px]">
                        <label className="block text-[13px] font-semibold text-[#1D1616] mb-[8px]">
                            Foto Barang Sebelum Dipinjam <span className="text-[#D84040]">* (Wajib)</span>
                        </label>
                        <label
                            className={`w-full h-[150px] bg-white rounded-[12px] border flex flex-col items-center justify-center cursor-pointer overflow-hidden relative transition-colors ${
                                fotoPinjam
                                    ? 'border-[#059669]'
                                    : 'border-dashed border-[#D84040]/60 hover:border-[#D84040]'
                            }`}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFotoPinjamChange}
                                className="hidden"
                            />
                            {fotoPinjam ? (
                                <>
                                    <img
                                        src={fotoPinjam}
                                        alt="Foto Barang Sebelum Dipinjam"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFotoPinjam(null);
                                        }}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Camera size={32} className="text-[#D84040]" />
                                    <span className="mt-[8px] text-[13px] font-semibold text-[#1D1616]">
                                        Ketuk untuk ambil foto barang sebelum dipinjam
                                    </span>
                                    <span className="mt-[2px] text-[11px] text-[#8C93A0]">
                                        Wajib diisi dan tidak boleh dilewati
                                    </span>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Keperluan (Opsional) */}
                    <div className="mt-[16px]">
                        <label className="block text-[13px] font-semibold text-[#1D1616] mb-[8px]">
                            Keperluan / Alasan <span className="text-[#8C93A0] font-normal">(Opsional - Boleh Dikosongkan)</span>
                        </label>
                        <textarea
                            rows={3}
                            value={keperluan}
                            onChange={(e) => setKeperluan(e.target.value)}
                            placeholder="Jelaskan alasan peminjaman (boleh dikosongkan)..."
                            className="w-full p-[16px] bg-white rounded-[12px] border border-[#E0E0E0] text-[14px] text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="mt-[32px]">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-[16px] bg-[#D84040] hover:bg-[#8E1616] text-white rounded-[12px] font-semibold text-[14px] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <span>Ajukan Peminjaman ({selectedUnits.length} Unit)</span>
                            )}
                        </button>
                    </div>
                </form>
            </UserMobileLayout>
        );
    }

    // =========================================================================
    // STEP 2: PILIH UNIT SCREEN (pilih_unit_screen.dart)
    // =========================================================================
    if (step === 'pilih_unit') {
        return (
            <UserMobileLayout
                title="Pilih Unit"
                showBackButton={true}
                onBack={() => setStep('detail')}
                noPadding={true}
            >
                <Head title={`Pilih Unit - ${barang.nama_barang}`} />
                <div className="flex flex-col min-h-[calc(100vh-140px)]">
                    {/* Header Info Card */}
                    <div className="mx-[24px] mt-[24px] mb-[12px] p-[16px] bg-white rounded-[16px] border border-[#EEEEEE] flex items-center gap-[14px]">
                        <div className="w-[44px] h-[44px] rounded-[12px] bg-[#FEF2F2] flex items-center justify-center shrink-0">
                            <Wrench size={22} className="text-[#D84040]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-[15px] font-bold text-[#1D1616] truncate">
                                {barang.nama_barang}
                            </h3>
                            <p className="text-[12px] text-[#8C93A0] mt-[2px]">
                                {availableUnits.length} unit tersedia untuk dipinjam
                            </p>
                        </div>
                    </div>

                    {/* Action Bar: Pilih Semua */}
                    <div className="px-[24px] py-[4px] flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[#8C93A0]">
                            Pilih unit (Maks. {MAX_BORROW_UNITS} unit)
                        </span>
                        {availableUnits.length > 1 && (
                            <button
                                type="button"
                                onClick={toggleSelectAll}
                                className="px-[10px] py-[6px] text-[12px] font-bold text-[#D84040] hover:bg-[#FEF2F2] rounded-[8px] transition-colors cursor-pointer"
                            >
                                {allSelected
                                    ? 'Batal Semua'
                                    : `Pilih ${maxSelectableCount} Unit`}
                            </button>
                        )}
                    </div>

                    {formError && (
                        <div className="mx-[24px] mt-[8px] p-[12px] bg-[#FEF2F2] rounded-[12px] border border-[#FECACA] text-[12px] font-semibold text-[#DC2626]">
                            {formError}
                        </div>
                    )}

                    {/* Unit List */}
                    <div className="px-[24px] pt-[8px] pb-[110px] space-y-[10px] flex-1">
                        {units.map((unit) => {
                            const isUnitAvailable = unit.status === 'tersedia';
                            const isSelected = selectedUnitIds.includes(unit.id);

                            return (
                                <button
                                    key={unit.id}
                                    type="button"
                                    disabled={!isUnitAvailable}
                                    onClick={() => toggleUnit(unit.id)}
                                    className={`w-full p-[16px] rounded-[14px] flex items-center text-left transition-all duration-150 ${
                                        isSelected
                                            ? 'bg-[#FFF5F5] border-[1.5px] border-[#D84040] cursor-pointer'
                                            : isUnitAvailable
                                            ? 'bg-white border border-[#EEEEEE] hover:border-[#D84040]/50 cursor-pointer'
                                            : 'bg-[#FAFAFA] border border-[#EEEEEE] opacity-55 cursor-not-allowed'
                                    }`}
                                >
                                    {/* Custom Checkbox */}
                                    <div
                                        className={`w-[22px] h-[22px] rounded-[7px] flex items-center justify-center transition-colors shrink-0 ${
                                            isSelected
                                                ? 'bg-[#D84040] border-2 border-[#D84040]'
                                                : isUnitAvailable
                                                ? 'bg-white border-2 border-[#D4D4D4]'
                                                : 'bg-[#F0F0F0] border-2 border-[#E0E0E0]'
                                        }`}
                                    >
                                        {isSelected && <Check size={14} className="text-white stroke-[3]" />}
                                    </div>

                                    <div className="ml-[14px] flex-1 min-w-0">
                                        <p className="text-[15px] font-bold text-[#1D1616] truncate">
                                            {unit.kode_unit}
                                        </p>
                                        <div className="flex items-center gap-[8px] mt-[3px] text-[12px] text-[#8C93A0]">
                                            {unit.serial_number && (
                                                <>
                                                    <span className="truncate">SN: {unit.serial_number}</span>
                                                    <span>•</span>
                                                </>
                                            )}
                                            <span>Kondisi: {unit.kondisi_label || 'Baik'}</span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <span
                                        className={`px-[10px] py-[4px] rounded-[8px] text-[11px] font-semibold shrink-0 ml-2 ${
                                            isUnitAvailable
                                                ? 'bg-[#ECFDF5] text-[#059669]'
                                                : 'bg-[#F5F5F5] text-[#8C93A0]'
                                        }`}
                                    >
                                        {isUnitAvailable ? 'Tersedia' : 'Dipinjam'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Sticky Bottom Action Bar */}
                    <div className="sticky bottom-0 left-0 right-0 bg-white p-[24px] shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-20">
                        <button
                            type="button"
                            disabled={selectedUnitIds.length === 0}
                            onClick={() => setStep('form')}
                            className="w-full py-[16px] rounded-[12px] bg-[#D84040] hover:bg-[#8E1616] disabled:bg-[#E0E0E0] text-white font-semibold text-[14px] transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                            {selectedUnitIds.length === 0
                                ? 'Pilih Minimal 1 Unit'
                                : `Lanjutkan (${selectedUnitIds.length} Unit Dipilih)`}
                        </button>
                    </div>
                </div>
            </UserMobileLayout>
        );
    }

    // =========================================================================
    // STEP 1: DETAIL BARANG SCREEN (detail_barang_screen.dart)
    // =========================================================================
    return (
        <UserMobileLayout
            title="Detail Barang"
            showBackButton={true}
            onBack={() => router.visit('/user/katalog')}
            noPadding={true}
        >
            <Head title={`${barang.nama_barang} - WAMS`} />

            <div className="flex flex-col min-h-[calc(100vh-140px)]">
                <div className="p-[24px] pb-[100px] flex-1">
                    {/* 1. Showcase Card */}
                    <div className="w-full p-[24px] bg-white rounded-[16px] border border-[#EEEEEE] flex flex-col items-center text-center">
                        <button
                            type="button"
                            onClick={() => {
                                if (barang.foto_url && !imgError) setShowImagePreview(true);
                            }}
                            className={`w-[140px] h-[140px] rounded-[20px] bg-[#F8F9FA] overflow-hidden flex items-center justify-center relative ${
                                barang.foto_url && !imgError ? 'cursor-zoom-in group' : 'cursor-default'
                            }`}
                        >
                            {barang.foto_url && !imgError ? (
                                <>
                                    <img
                                        src={barang.foto_url}
                                        alt={barang.nama_barang}
                                        onError={() => setImgError(true)}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ZoomIn size={14} />
                                    </div>
                                </>
                            ) : (
                                <Wrench size={56} className="text-[#D84040]" />
                            )}
                        </button>

                        <h1 className="mt-[16px] text-[18px] font-extrabold text-[#1D1616] leading-snug">
                            {barang.nama_barang}
                        </h1>

                        <span
                            className={`mt-[8px] px-[14px] py-[6px] rounded-[20px] text-[12px] font-bold ${
                                isAvailable
                                    ? 'bg-[#ECFDF5] text-[#059669]'
                                    : 'bg-[#FEF2F2] text-[#DC2626]'
                            }`}
                        >
                            {isAvailable ? '• Tersedia' : '• Tidak Tersedia'}
                        </span>
                    </div>

                    {/* 2. Spesifikasi Barang Card */}
                    <div className="mt-[16px] p-[20px] bg-white rounded-[16px] border border-[#EEEEEE]">
                        <DetailRow label="Kategori" value={barang.kategori || '-'} />
                        <div className="h-[1px] bg-[#F5F5F5] my-[12px]" />
                        <DetailRow label="Kode Barang" value={barang.kode_barang || '-'} />
                        <div className="h-[1px] bg-[#F5F5F5] my-[12px]" />
                        <DetailRow label="Deskripsi" value={barang.deskripsi || '-'} />
                        <div className="h-[1px] bg-[#F5F5F5] my-[12px]" />
                        <DetailRow
                            label="Lokasi Rak"
                            value={barang.lokasi_penyimpanan || 'Gudang Utama'}
                        />
                    </div>

                    {/* 3. Unit Tersedia Section */}
                    <div className="mt-[24px] flex items-center justify-between">
                        <h2 className="text-[15px] font-bold text-[#1D1616]">Unit Tersedia</h2>
                        <span className="px-[10px] py-[4px] bg-[#FEF2F2] rounded-[12px] text-[12px] font-bold text-[#D84040]">
                            {barang.stok_tersedia || 0}/{units.length} Tersedia
                        </span>
                    </div>

                    <div className="mt-[12px] space-y-[12px]">
                        {units.length === 0 ? (
                            <div className="p-[24px] bg-white rounded-[16px] border border-[#EEEEEE] text-center text-[13px] text-[#8C93A0]">
                                Tidak ada data unit untuk barang ini
                            </div>
                        ) : (
                            units.map((unit) => {
                                const unitAvail = unit.status === 'tersedia';
                                return (
                                    <div
                                        key={unit.id}
                                        className="p-[16px] bg-white rounded-[12px] border border-[#EEEEEE] flex items-center"
                                    >
                                        <div
                                            className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0 ${
                                                unitAvail
                                                    ? 'bg-[#ECFDF5] text-[#059669]'
                                                    : 'bg-[#F5F5F5] text-[#8C93A0]'
                                            }`}
                                        >
                                            {unitAvail ? (
                                                <CheckCircle2 size={20} />
                                            ) : (
                                                <Ban size={20} />
                                            )}
                                        </div>

                                        <div className="ml-[16px] flex-1 min-w-0">
                                            <p className="text-[15px] font-bold text-[#1D1616] truncate">
                                                {unit.kode_unit}
                                            </p>
                                            <p className="text-[13px] text-[#8C93A0] mt-[2px]">
                                                Kondisi: {unit.kondisi_label || 'Baik'}
                                            </p>
                                        </div>

                                        <span
                                            className={`px-[10px] py-[4px] rounded-[8px] text-[12px] font-semibold shrink-0 ${
                                                unitAvail
                                                    ? 'bg-[#ECFDF5] text-[#059669]'
                                                    : 'bg-[#F5F5F5] text-[#8C93A0]'
                                            }`}
                                        >
                                            {unitAvail ? 'Tersedia' : 'Dipinjam'}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sticky Bottom Action Bar */}
                <div className="sticky bottom-0 left-0 right-0 bg-white p-[24px] shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-20">
                    <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setStep('pilih_unit')}
                        className="w-full py-[16px] rounded-[12px] bg-[#D84040] hover:bg-[#8E1616] disabled:bg-[#E0E0E0] text-white font-semibold text-[14px] transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isAvailable ? 'Pinjam Barang' : 'Stok Habis / Tidak Tersedia'}
                    </button>
                </div>
            </div>

            {/* Image Preview Modal (matching _showImagePreview in detail_barang_screen.dart) */}
            {showImagePreview && barang.foto_url && (
                <div
                    onClick={() => setShowImagePreview(false)}
                    className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6 animate-in fade-in duration-150"
                >
                    <button
                        type="button"
                        onClick={() => setShowImagePreview(false)}
                        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                    <img
                        src={barang.foto_url}
                        alt={barang.nama_barang}
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-full max-h-[82vh] rounded-[16px] object-contain shadow-2xl"
                    />
                </div>
            )}
        </UserMobileLayout>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-[13px] font-medium text-[#8C93A0] shrink-0">{label}</span>
            <span className="text-[14px] font-bold text-[#1D1616] text-right">{value}</span>
        </div>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <span className="text-[13px] font-medium text-[#8C93A0] shrink-0">{label}</span>
            <span className="text-[13px] font-bold text-[#1D1616] text-right">{value}</span>
        </div>
    );
}
