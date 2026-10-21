import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import {
    Wrench,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Hourglass,
    Camera,
    X,
    RefreshCw,
    History
} from 'lucide-react';

// =============================================================================
// COUNTDOWN BADGE (matching wams_mobile/lib/widgets/countdown_badge.dart)
// =============================================================================
export function CountdownBadge({ batasKembaliIso }) {
    if (!batasKembaliIso) return null;

    const now = new Date();
    const deadline = new Date(batasKembaliIso);
    const diffMs = deadline.getTime() - now.getTime();
    const isOverdue = diffMs < 0;

    let bgColor = 'bg-[#EFF6FF]';
    let textColor = 'text-[#2563EB]';
    let borderColor = 'border-[#2563EB]/30';
    let label = '';
    let IconComp = Clock;

    if (isOverdue) {
        bgColor = 'bg-[#FEF2F2]';
        textColor = 'text-[#DC2626]';
        borderColor = 'border-[#DC2626]/30';
        IconComp = AlertTriangle;
        const overdueDays = Math.abs(Math.trunc(diffMs / (1000 * 60 * 60 * 24)));
        const overdueHours = Math.abs(Math.trunc(diffMs / (1000 * 60 * 60)));
        label =
            overdueDays === 0
                ? `Terlambat ${overdueHours} Jam`
                : `Terlambat ${overdueDays} Hari`;
    } else {
        const daysLeft = Math.trunc(diffMs / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.trunc(diffMs / (1000 * 60 * 60));

        if (daysLeft <= 1) {
            bgColor = 'bg-[#FFFBEB]';
            textColor = 'text-[#D97706]';
            borderColor = 'border-[#D97706]/30';
            label = hoursLeft <= 0 ? 'Hari Ini' : `Sisa ${hoursLeft} Jam`;
        } else {
            label = `Sisa ${daysLeft} Hari`;
        }
    }

    return (
        <span
            className={`inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-[8px] border text-[11px] font-bold ${bgColor} ${borderColor} ${textColor}`}
        >
            <IconComp size={12} className="shrink-0" />
            <span>{label}</span>
        </span>
    );
}

// =============================================================================
// TOOL THUMBNAIL (matching wams_mobile/lib/widgets/tool_thumbnail.dart)
// =============================================================================
function ToolThumbnail({ fotoUrl, size = 44 }) {
    const [err, setErr] = useState(false);

    if (fotoUrl && !err) {
        return (
            <div
                style={{ width: size, height: size }}
                className="rounded-[12px] bg-[#F5F5F5] overflow-hidden shrink-0"
            >
                <img
                    src={fotoUrl}
                    alt="Tool"
                    onError={() => setErr(true)}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    return (
        <div
            style={{ width: size, height: size }}
            className="rounded-[12px] bg-[#F5F5F5] flex items-center justify-center shrink-0"
        >
            <Wrench size={size * 0.45} className="text-[#8C93A0]" />
        </div>
    );
}

const TAB_CONFIG = [
    { index: 0, label: 'Semua', activeBg: '#FFFFFF', activeText: '#1D1616', isDark: false },
    { index: 1, label: 'Aktif', activeBg: '#DC2626', activeText: '#FFFFFF', isDark: true },
    { index: 2, label: 'Selesai', activeBg: '#16A34A', activeText: '#FFFFFF', isDark: true },
    { index: 3, label: 'Terlambat', activeBg: '#F59E0B', activeText: '#FFFFFF', isDark: true },
];

export default function MobileRiwayat({
    riwayat = { data: [] },
    riwayatList = [],
    filters = { status: '', q: '' },
    initialTab = 0,
    initialLogId = null,
}) {
    // Combine full list from controller (or fallback to paginated data)
    const allLogs = riwayatList && riwayatList.length > 0 ? riwayatList : riwayat?.data || [];

    const [selectedTab, setSelectedTab] = useState(() => {
        if (filters?.status === 'aktif') return 1;
        if (filters?.status === 'dikembalikan') return 2;
        if (filters?.status === 'terlambat') return 3;
        return initialTab;
    });

    // Sub-screen state: null (list) | 'detail' | 'return_form'
    const [activeLog, setActiveLog] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    // Return form state
    const [selectedKondisi, setSelectedKondisi] = useState('baik'); // 'baik' | 'rusak'
    const [catatanKembali, setCatatanKembali] = useState('');
    const [fotoPreview, setFotoPreview] = useState(null);
    const [returnError, setReturnError] = useState('');

    const { post: postAction, processing } = useForm({});

    // Open initialLogId automatically if passed via query or prop
    useEffect(() => {
        let logIdToOpen = initialLogId;
        if (!logIdToOpen && typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            logIdToOpen = params.get('detail_id');
            const tabParam = params.get('tab');
            if (tabParam === 'aktif') setSelectedTab(1);
            else if (tabParam === 'selesai') setSelectedTab(2);
            else if (tabParam === 'terlambat') setSelectedTab(3);
        }
        if (logIdToOpen && allLogs.length > 0) {
            const found = allLogs.find((item) => String(item.id) === String(logIdToOpen));
            if (found) {
                setActiveLog(found);
                setViewMode('detail');
            }
        }
    }, [initialLogId]);

    // Keep activeLog synced if allLogs updates
    useEffect(() => {
        if (activeLog) {
            const updated = allLogs.find((item) => item.id === activeLog.id);
            if (updated) setActiveLog(updated);
        }
    }, [allLogs]);

    // Filter items according to Flutter's _filterList in riwayat_screen.dart
    const filteredList = allLogs.filter((item) => {
        if (selectedTab === 1) {
            // Aktif
            return (
                item.status_transaksi === 'dipinjam' ||
                item.status_transaksi === 'menunggu_persetujuan'
            );
        }
        if (selectedTab === 2) {
            // Selesai
            return item.status_transaksi === 'dikembalikan';
        }
        if (selectedTab === 3) {
            // Terlambat
            if (item.status_transaksi !== 'dipinjam') return false;
            return Boolean(item.is_overdue);
        }
        return true; // Semua
    });

    const handleOpenDetail = (log) => {
        setActiveLog(log);
        setViewMode('detail');
    };

    const handleOpenReturnForm = () => {
        setSelectedKondisi('baik');
        setCatatanKembali('');
        setFotoPreview(null);
        setReturnError('');
        setViewMode('return_form');
    };

    const handleCancelLoan = () => {
        if (!activeLog) return;
        router.post(
            `/user/batalkan/${activeLog.id}`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowCancelDialog(false);
                    setViewMode('list');
                    setActiveLog(null);
                },
            }
        );
    };

    const handleSubmitReturn = (e) => {
        e.preventDefault();
        if (!activeLog) return;
        setReturnError('');

        if (!fotoPreview) {
            setReturnError('Foto barang saat dikembalikan wajib diunggah dan tidak boleh dilewati.');
            return;
        }

        router.post(
            `/user/kembali/${activeLog.id}`,
            {
                kondisi_kembali: selectedKondisi === 'rusak' ? 'rusak_ringan' : 'baik',
                catatan: catatanKembali,
                foto_kondisi: fotoPreview,
            },
            {
                preserveScroll: true,
                onError: (errs) => {
                    if (errs?.foto_kondisi) {
                        setReturnError(errs.foto_kondisi);
                    }
                },
                onSuccess: () => {
                    setViewMode('list');
                    setActiveLog(null);
                },
            }
        );
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setFotoPreview(ev.target.result);
            setReturnError('');
        };
        reader.readAsDataURL(file);
    };

    // =========================================================================
    // SUB-SCREEN 3: FORM PENGEMBALIAN (form_pengembalian_screen.dart)
    // =========================================================================
    if (viewMode === 'return_form' && activeLog) {
        return (
            <UserMobileLayout
                title="Form Pengembalian"
                showBackButton={true}
                onBack={() => setViewMode('detail')}
                noPadding={true}
            >
                <Head title={`Kembalikan ${activeLog.nama_barang} - WAMS`} />
                <form onSubmit={handleSubmitReturn} className="p-[24px] pb-[40px]">
                    {returnError && (
                        <div className="p-[14px] mb-[16px] bg-[#FEF2F2] rounded-[12px] border border-[#FECACA] text-[12px] font-semibold text-[#DC2626]">
                            {returnError}
                        </div>
                    )}

                    {/* Item Preview Card */}
                    <div className="p-[16px] bg-white rounded-[16px] border border-[#EEEEEE] flex items-center gap-[16px]">
                        <ToolThumbnail fotoUrl={activeLog.foto} size={48} />
                        <div className="min-w-0 flex-1">
                            <h3 className="text-[15px] font-bold text-[#1D1616] truncate">
                                {activeLog.nama_barang}
                            </h3>
                            <p className="text-[13px] text-[#8C93A0] mt-[2px]">
                                Kode Unit: {activeLog.kode_unit}
                            </p>
                        </div>
                    </div>

                    {/* Kondisi Saat Dikembalikan */}
                    <div className="mt-[24px]">
                        <h4 className="text-[15px] font-bold text-[#1D1616] mb-[12px]">
                            Kondisi Saat Dikembalikan
                        </h4>
                        <div className="grid grid-cols-2 gap-[12px]">
                            {/* Radio Card: Baik */}
                            <button
                                type="button"
                                onClick={() => setSelectedKondisi('baik')}
                                className={`py-[16px] rounded-[12px] flex flex-col items-center justify-center transition-all cursor-pointer ${
                                    selectedKondisi === 'baik'
                                        ? 'bg-[#ECFDF5] border-[1.5px] border-[#059669] text-[#059669]'
                                        : 'bg-white border border-[#E0E0E0] text-[#8C93A0]'
                                }`}
                            >
                                <CheckCircle2 size={28} />
                                <span
                                    className={`mt-[8px] text-[14px] font-bold ${
                                        selectedKondisi === 'baik'
                                            ? 'text-[#059669]'
                                            : 'text-[#1D1616]'
                                    }`}
                                >
                                    Baik
                                </span>
                            </button>

                            {/* Radio Card: Rusak */}
                            <button
                                type="button"
                                onClick={() => setSelectedKondisi('rusak')}
                                className={`py-[16px] rounded-[12px] flex flex-col items-center justify-center transition-all cursor-pointer ${
                                    selectedKondisi === 'rusak'
                                        ? 'bg-[#FEF2F2] border-[1.5px] border-[#DC2626] text-[#DC2626]'
                                        : 'bg-white border border-[#E0E0E0] text-[#8C93A0]'
                                }`}
                            >
                                <AlertTriangle size={28} />
                                <span
                                    className={`mt-[8px] text-[14px] font-bold ${
                                        selectedKondisi === 'rusak'
                                            ? 'text-[#DC2626]'
                                            : 'text-[#1D1616]'
                                    }`}
                                >
                                    Rusak
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Catatan (Opsional) */}
                    <div className="mt-[24px]">
                        <label className="block text-[13px] font-semibold text-[#1D1616] mb-[8px]">
                            Catatan (Opsional)
                        </label>
                        <textarea
                            rows={3}
                            value={catatanKembali}
                            onChange={(e) => setCatatanKembali(e.target.value)}
                            placeholder="Tambahkan catatan mengenai kondisi barang..."
                            className="w-full p-[16px] bg-white rounded-[12px] border border-[#E0E0E0] text-[14px] text-[#1D1616] placeholder-[#8C93A0] focus:outline-none focus:border-[#D84040]"
                        />
                    </div>

                    {/* Foto Barang Dikembalikan (Wajib) */}
                    <div className="mt-[24px]">
                        <label className="block text-[13px] font-semibold text-[#1D1616] mb-[8px]">
                            Foto Barang Dikembalikan <span className="text-[#D84040]">* (Wajib)</span>
                        </label>
                        <label
                            className={`w-full h-[150px] bg-white rounded-[12px] border flex flex-col items-center justify-center cursor-pointer overflow-hidden relative transition-colors ${
                                fotoPreview
                                    ? 'border-[#059669]'
                                    : 'border-dashed border-[#D84040]/60 hover:border-[#D84040]'
                            }`}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                            {fotoPreview ? (
                                <>
                                    <img
                                        src={fotoPreview}
                                        alt="Preview Kondisi"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFotoPreview(null);
                                        }}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Camera size={32} className="text-[#D84040]" />
                                    <span className="mt-[8px] text-[13px] font-semibold text-[#1D1616]">
                                        Ketuk untuk ambil foto barang dikembalikan
                                    </span>
                                    <span className="mt-[2px] text-[11px] text-[#8C93A0]">
                                        Wajib diisi dan tidak boleh dilewati
                                    </span>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-[32px]">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-[16px] bg-[#D84040] hover:bg-[#8E1616] text-white rounded-[12px] font-semibold text-[14px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                            {processing ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <span>Konfirmasi Pengembalian</span>
                            )}
                        </button>
                    </div>
                </form>
            </UserMobileLayout>
        );
    }

    // =========================================================================
    // SUB-SCREEN 2: DETAIL PEMINJAMAN (detail_peminjaman_screen.dart)
    // =========================================================================
    if (viewMode === 'detail' && activeLog) {
        const statusInfo = getDetailStatusStyle(activeLog.status_transaksi);

        return (
            <UserMobileLayout
                title="Detail Peminjaman"
                showBackButton={true}
                onBack={() => {
                    setViewMode('list');
                    setActiveLog(null);
                }}
                noPadding={true}
                rightAction={
                    <span
                        className="px-[10px] py-[5px] rounded-[12px] text-[11px] font-bold"
                        style={{
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.text,
                        }}
                    >
                        {statusInfo.label}
                    </span>
                }
            >
                <Head title={`Detail Peminjaman - ${activeLog.nama_barang}`} />

                <div className="p-[24px] pb-[40px]">
                    {/* Banner Menunggu Persetujuan */}
                    {activeLog.status_transaksi === 'menunggu_persetujuan' && (
                        <div className="p-[14px] mb-[16px] bg-[#FFFBEB] rounded-[12px] border border-[#FCD34D] flex items-center gap-[12px]">
                            <Hourglass size={22} className="text-[#D97706] shrink-0" />
                            <p className="text-[12px] font-semibold text-[#92400E] leading-relaxed">
                                Menunggu persetujuan Admin. Anda belum dapat mengambil barang ini.
                            </p>
                        </div>
                    )}

                    {/* Banner Ditolak */}
                    {activeLog.status_transaksi === 'ditolak' && (
                        <div className="p-[14px] mb-[16px] bg-[#FEF2F2] rounded-[12px] border border-[#FCA5A5]">
                            <div className="flex items-center gap-[8px]">
                                <XCircle size={20} className="text-[#DC2626] shrink-0" />
                                <span className="text-[13px] font-bold text-[#991B1B]">
                                    Peminjaman Ditolak
                                </span>
                            </div>
                            {activeLog.alasan_penolakan && (
                                <p className="mt-[6px] text-[12px] text-[#991B1B]">
                                    Alasan: {activeLog.alasan_penolakan}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Item Preview Card */}
                    <div className="p-[20px] bg-white rounded-[16px] border border-[#EEEEEE] flex items-center gap-[16px]">
                        <ToolThumbnail fotoUrl={activeLog.foto} size={80} />
                        <div className="min-w-0 flex-1">
                            <h3 className="text-[16px] font-extrabold text-[#1D1616] leading-snug">
                                {activeLog.nama_barang}
                            </h3>
                            <p className="mt-[4px] text-[13px] font-semibold text-[#8C93A0]">
                                Unit: {activeLog.kode_unit}
                            </p>
                            {activeLog.status_transaksi === 'dipinjam' && (
                                <div className="mt-[8px]">
                                    <CountdownBadge batasKembaliIso={activeLog.batas_kembali_iso} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Detail Table */}
                    <div className="mt-[16px] p-[20px] bg-white rounded-[16px] border border-[#EEEEEE]">
                        <DetailMetaRow label="Tanggal Pinjam" value={activeLog.tanggal_pinjam} />
                        <div className="h-[1px] bg-[#F5F5F5] my-[12px]" />
                        <DetailMetaRow label="Batas Kembali" value={activeLog.batas_kembali} />
                        <div className="h-[1px] bg-[#F5F5F5] my-[12px]" />
                        <DetailMetaRow
                            label="Tanggal Dikembalikan"
                            value={activeLog.tanggal_kembali || 'Belum dikembalikan'}
                        />
                        <div className="h-[1px] bg-[#F5F5F5] my-[12px]" />
                        <DetailMetaRow
                            label="Kondisi Awal"
                            value={activeLog.kondisi_pinjam_label || 'Baik'}
                        />
                        <div className="h-[1px] bg-[#F5F5F5] my-[12px]" />
                        <DetailMetaRow
                            label="Kondisi Akhir"
                            value={activeLog.kondisi_kembali_label || '-'}
                        />
                        <div className="h-[1px] bg-[#F5F5F5] my-[12px]" />
                        <DetailMetaRow label="Keperluan" value={activeLog.keperluan || '-'} />
                        {activeLog.approver_nama && (
                            <>
                                <div className="h-[1px] bg-[#F5F5F5] my-[12px]" />
                                <DetailMetaRow
                                    label="Diproses Oleh"
                                    value={activeLog.approver_nama}
                                />
                            </>
                        )}
                    </div>

                    {/* Bukti Foto Peminjaman & Pengembalian */}
                    {(activeLog.foto_pinjam_url || activeLog.foto_kembali_url) && (
                        <div className="mt-[16px] p-[20px] bg-white rounded-[16px] border border-[#EEEEEE] space-y-[14px]">
                            <h4 className="text-[14px] font-bold text-[#1D1616]">
                                Dokumentasi Foto Barang
                            </h4>
                            <div className="grid grid-cols-2 gap-[12px]">
                                {activeLog.foto_pinjam_url && (
                                    <div>
                                        <p className="text-[11px] font-semibold text-[#8C93A0] mb-[6px]">
                                            Sebelum Dipinjam
                                        </p>
                                        <a
                                            href={activeLog.foto_pinjam_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block h-[110px] rounded-[10px] overflow-hidden border border-[#E0E0E0]"
                                        >
                                            <img
                                                src={activeLog.foto_pinjam_url}
                                                alt="Foto Sebelum Dipinjam"
                                                className="w-full h-full object-cover"
                                            />
                                        </a>
                                    </div>
                                )}
                                {activeLog.foto_kembali_url && (
                                    <div>
                                        <p className="text-[11px] font-semibold text-[#8C93A0] mb-[6px]">
                                            Saat Dikembalikan
                                        </p>
                                        <a
                                            href={activeLog.foto_kembali_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block h-[110px] rounded-[10px] overflow-hidden border border-[#E0E0E0]"
                                        >
                                            <img
                                                src={activeLog.foto_kembali_url}
                                                alt="Foto Saat Dikembalikan"
                                                className="w-full h-full object-cover"
                                            />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Button for Menunggu Persetujuan */}
                    {activeLog.status_transaksi === 'menunggu_persetujuan' && (
                        <div className="mt-[32px]">
                            <button
                                type="button"
                                onClick={() => setShowCancelDialog(true)}
                                className="w-full py-[16px] rounded-[12px] border border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2] font-bold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <XCircle size={18} />
                                <span>Batalkan Pengajuan Peminjaman</span>
                            </button>
                        </div>
                    )}

                    {/* Action Button for Dipinjam */}
                    {activeLog.status_transaksi === 'dipinjam' && (
                        <div className="mt-[32px]">
                            <button
                                type="button"
                                onClick={handleOpenReturnForm}
                                className="w-full py-[16px] rounded-[12px] bg-[#FFEAEA] hover:bg-[#FECACA] border border-[#FCA5A5] text-[#D84040] font-bold text-[14px] transition-colors cursor-pointer"
                            >
                                Kembalikan Barang
                            </button>
                        </div>
                    )}
                </div>

                {/* Cancel Confirmation Dialog */}
                {showCancelDialog && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5 animate-in fade-in duration-150">
                        <div className="w-full max-w-[360px] bg-white rounded-[16px] p-[24px] shadow-2xl">
                            <h3 className="text-[16px] font-bold text-[#1D1616]">
                                Batalkan Peminjaman
                            </h3>
                            <p className="mt-[8px] text-[13px] text-[#8C93A0] leading-relaxed">
                                Apakah Anda yakin ingin membatalkan pengajuan peminjaman ini?
                            </p>
                            <div className="mt-[20px] flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelDialog(false)}
                                    className="px-[16px] py-[10px] rounded-[10px] text-[13px] font-semibold text-[#8C93A0] hover:bg-[#F5F5F5] cursor-pointer"
                                >
                                    Tidak
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelLoan}
                                    className="px-[16px] py-[10px] rounded-[10px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-bold cursor-pointer"
                                >
                                    Ya, Batalkan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </UserMobileLayout>
        );
    }

    // =========================================================================
    // SUB-SCREEN 1: RIWAYAT LIST (riwayat_screen.dart)
    // =========================================================================
    const currentTabObj = TAB_CONFIG[selectedTab] || TAB_CONFIG[0];

    return (
        <UserMobileLayout title="Riwayat Peminjaman" noPadding={true}>
            <Head title="Riwayat Peminjaman - WAMS" />

            <div className="flex flex-col min-h-[calc(100vh-140px)]">
                {/* 4-Tab Sliding Segmented Control (matching riwayat_screen.dart) */}
                <div className="mx-[20px] mt-[8px] mb-[16px] h-[48px] p-[4px] bg-[#EEEEEE] rounded-[14px] relative flex items-center">
                    {/* Sliding Colored Pill */}
                    <div
                        className="absolute top-[4px] bottom-[4px] rounded-[11px] transition-all duration-250 ease-out"
                        style={{
                            width: 'calc(25% - 4px)',
                            left: `calc(${selectedTab * 25}% + 2px)`,
                            backgroundColor: currentTabObj.activeBg,
                            boxShadow: currentTabObj.isDark
                                ? `0 3px 8px ${currentTabObj.activeBg}59`
                                : '0 2px 6px rgba(0,0,0,0.08)',
                        }}
                    />

                    {TAB_CONFIG.map((tab) => {
                        const isSelected = selectedTab === tab.index;
                        return (
                            <button
                                key={tab.index}
                                type="button"
                                onClick={() => setSelectedTab(tab.index)}
                                className="flex-1 h-full relative z-10 flex items-center justify-center rounded-[11px] transition-colors cursor-pointer"
                            >
                                <span
                                    className={`text-[12px] tracking-[0.2px] transition-all duration-200 ${
                                        isSelected ? 'font-bold' : 'font-medium text-[#8C93A0]'
                                    }`}
                                    style={isSelected ? { color: tab.activeText } : undefined}
                                >
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Transaction List */}
                <div className="px-[24px] py-[8px] pb-[28px] flex-1">
                    {filteredList.length === 0 ? (
                        <div className="py-[72px] flex flex-col items-center justify-center text-center">
                            <History
                                size={64}
                                className="text-[#8C93A0]/35 mb-[16px] stroke-[1.5]"
                            />
                            <p className="text-[14px] font-medium text-[#8C93A0]">
                                Tidak ada data transaksi
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-[12px]">
                            {filteredList.map((item) => {
                                const isActive = item.status_transaksi === 'dipinjam';
                                const pillStyle = getDetailStatusStyle(item.status_transaksi);

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleOpenDetail(item)}
                                        className="w-full p-[16px] bg-white rounded-[16px] border border-[#EEEEEE] hover:border-[#D84040]/40 flex items-center text-left transition-all cursor-pointer"
                                    >
                                        <ToolThumbnail fotoUrl={item.foto} size={44} />

                                        <div className="ml-[16px] flex-1 min-w-0">
                                            <h4 className="text-[15px] font-bold text-[#1D1616] truncate">
                                                {item.nama_barang}
                                            </h4>
                                            <p className="mt-[4px] text-[12px] text-[#8C93A0] truncate">
                                                {item.kode_unit} • {item.tanggal_pinjam}
                                            </p>
                                        </div>

                                        <div className="ml-[8px] shrink-0">
                                            {isActive ? (
                                                <CountdownBadge
                                                    batasKembaliIso={item.batas_kembali_iso}
                                                />
                                            ) : (
                                                <span
                                                    className="inline-flex items-center gap-[3px] px-[10px] py-[4px] rounded-[8px] text-[11px] font-bold"
                                                    style={{
                                                        backgroundColor: pillStyle.bg,
                                                        color: pillStyle.text,
                                                    }}
                                                >
                                                    <span>{pillStyle.label}</span>
                                                    {item.status_transaksi ===
                                                        'menunggu_persetujuan' && (
                                                        <ChevronRight size={13} />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </UserMobileLayout>
    );
}

function getDetailStatusStyle(status) {
    switch (status) {
        case 'menunggu_persetujuan':
            return { bg: '#FFFBEB', text: '#D97706', label: 'Menunggu Izin' };
        case 'dipinjam':
            return { bg: '#EFF6FF', text: '#2563EB', label: 'Dipinjam' };
        case 'ditolak':
            return { bg: '#FEF2F2', text: '#DC2626', label: 'Ditolak' };
        case 'dibatalkan':
            return { bg: '#F5F5F5', text: '#6B7280', label: 'Dibatalkan' };
        default:
            return { bg: '#ECFDF5', text: '#059669', label: 'Selesai' };
    }
}

function DetailMetaRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-[13px] font-medium text-[#8C93A0] shrink-0">{label}</span>
            <span className="text-[14px] font-bold text-[#1D1616] text-right">{value}</span>
        </div>
    );
}
