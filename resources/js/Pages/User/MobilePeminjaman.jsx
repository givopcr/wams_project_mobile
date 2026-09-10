import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import UserMobileLayout from '@/Layouts/UserMobileLayout';
import {
    Clock,
    Wrench,
    CheckCircle2,
    AlertCircle,
    Calendar,
    ArrowRight,
    RotateCcw,
    X,
    ShieldAlert,
    AlertTriangle,
    Package,
    Check
} from 'lucide-react';

export default function MobilePeminjaman({ loans = [] }) {
    const [selectedTab, setSelectedTab] = useState('semua'); // 'semua' | 'dipinjam' | 'menunggu'
    const [returningLoan, setReturningLoan] = useState(null);
    const [cancellingLoan, setCancellingLoan] = useState(null);

    // Form Pengembalian
    const {
        data: returnData,
        setData: setReturnData,
        post: postReturn,
        processing: returnProcessing,
        reset: resetReturn,
    } = useForm({
        kondisi_kembali: 'baik',
        catatan: '',
    });

    // Form Pembatalan
    const { post: postCancel, processing: cancelProcessing } = useForm({});

    const filteredLoans = loans.filter((loan) => {
        if (selectedTab === 'dipinjam') return loan.status_transaksi === 'dipinjam';
        if (selectedTab === 'menunggu') return loan.status_transaksi === 'menunggu_persetujuan';
        return true;
    });

    const handleOpenReturnModal = (loan) => {
        setReturningLoan(loan);
        setReturnData({
            kondisi_kembali: 'baik',
            catatan: '',
        });
    };

    const handleConfirmReturn = (e) => {
        e.preventDefault();
        if (!returningLoan) return;

        postReturn(`/user/kembali/${returningLoan.id}`, {
            onSuccess: () => {
                setReturningLoan(null);
                resetReturn();
            },
        });
    };

    const handleConfirmCancel = () => {
        if (!cancellingLoan) return;

        postCancel(`/user/batalkan/${cancellingLoan.id}`, {
            onSuccess: () => {
                setCancellingLoan(null);
            },
        });
    };

    return (
        <UserMobileLayout title="Pinjaman Aktif" showBackButton onBack={() => router.visit('/user/dashboard')}>
            <Head title="Peminjaman Aktif - WAMS Mobile" />

            <div className="space-y-4">
                {/* Filter Status Tabs */}
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-1.5 shadow-2xs flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setSelectedTab('semua')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedTab === 'semua'
                                ? 'bg-[#D84040] text-white shadow-xs'
                                : 'text-[#6B7280] hover:text-[#1D1616]'
                        }`}
                    >
                        Semua ({loans.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('dipinjam')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedTab === 'dipinjam'
                                ? 'bg-[#D84040] text-white shadow-xs'
                                : 'text-[#6B7280] hover:text-[#1D1616]'
                        }`}
                    >
                        Dipinjam ({loans.filter((l) => l.status_transaksi === 'dipinjam').length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedTab('menunggu')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedTab === 'menunggu'
                                ? 'bg-[#D84040] text-white shadow-xs'
                                : 'text-[#6B7280] hover:text-[#1D1616]'
                        }`}
                    >
                        Menunggu ({loans.filter((l) => l.status_transaksi === 'menunggu_persetujuan').length})
                    </button>
                </div>

                {/* Loan Cards List */}
                {filteredLoans.length > 0 ? (
                    <div className="space-y-3">
                        {filteredLoans.map((loan) => {
                            const isBorrowed = loan.status_transaksi === 'dipinjam';
                            return (
                                <div
                                    key={loan.id}
                                    className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-2xs space-y-3"
                                >
                                    {/* Header Item & Status */}
                                    <div className="flex items-start justify-between gap-2.5">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-[#EEEEEE] text-[#1D1616]">
                                                    {loan.kode_unit}
                                                </span>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                        isBorrowed
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}
                                                >
                                                    {isBorrowed ? 'Sedang Dipinjam' : 'Menunggu Approval'}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-black text-[#1D1616] leading-snug">
                                                {loan.nama_barang}
                                            </h3>
                                        </div>

                                        <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] border border-[#E0E0E0] flex items-center justify-center text-[#D84040] shrink-0">
                                            <Wrench size={20} />
                                        </div>
                                    </div>

                                    {/* Loan Details Grid */}
                                    <div className="bg-[#F8F9FA] rounded-xl p-3 border border-[#E0E0E0] space-y-1.5 text-xs">
                                        <div className="flex items-center justify-between text-[#6B7280]">
                                            <span>Tanggal Pinjam:</span>
                                            <span className="font-bold text-[#1D1616]">{loan.tanggal_pinjam}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[#6B7280]">
                                            <span>Batas Waktu:</span>
                                            <span className="font-bold text-[#1D1616]">{loan.batas_kembali}</span>
                                        </div>
                                        {loan.keperluan && (
                                            <div className="pt-1 border-t border-[#E0E0E0]/60 flex items-start justify-between text-[#6B7280]">
                                                <span>Keperluan:</span>
                                                <span className="font-medium text-[#1D1616] text-right max-w-[65%] truncate">
                                                    {loan.keperluan}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Countdown or Warning Tag */}
                                    {isBorrowed && (
                                        <div
                                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                                                loan.is_overdue
                                                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={15} />
                                                <span>{loan.is_overdue ? 'Peringatan Terlambat' : 'Sisa Waktu'}</span>
                                            </div>
                                            <span>{loan.remaining_text}</span>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {isBorrowed ? (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenReturnModal(loan)}
                                            className="w-full py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <RotateCcw size={14} />
                                            <span>Kembalikan Alat Ini</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setCancellingLoan(loan)}
                                            className="w-full py-2.5 bg-[#EEEEEE] hover:bg-rose-50 hover:text-rose-700 text-[#6B7280] text-xs font-bold rounded-xl transition-colors border border-[#E0E0E0] cursor-pointer"
                                        >
                                            Batalkan Pengajuan
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl p-8 text-center shadow-2xs">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                            <CheckCircle2 size={24} />
                        </div>
                        <h4 className="font-bold text-sm text-[#1D1616]">
                            Tidak Ada Transaksi Aktif
                        </h4>
                        <p className="text-xs text-[#6B7280] mt-1 mb-4">
                            {selectedTab === 'dipinjam'
                                ? 'Tidak ada barang yang sedang Anda pinjam saat ini.'
                                : selectedTab === 'menunggu'
                                ? 'Tidak ada pengajuan yang menunggu persetujuan admin.'
                                : 'Semua peminjaman Anda telah selesai dikembalikan.'}
                        </p>
                        <Link
                            href="/user/katalog"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                        >
                            <Package size={14} />
                            <span>Buka Katalog Alat</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* Modal Pengembalian Alat */}
            {returningLoan && (
                <div className="fixed inset-0 z-50 bg-[#1D1616]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E0E0E0] animate-in slide-in-from-bottom-5 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0] mb-4">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D84040]">
                                    Pengembalian Alat
                                </span>
                                <h3 className="text-base font-black text-[#1D1616]">
                                    {returningLoan.nama_barang}
                                </h3>
                                <p className="text-xs font-mono text-[#6B7280]">
                                    Kode Unit: {returningLoan.kode_unit}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReturningLoan(null)}
                                className="w-8 h-8 rounded-full bg-[#EEEEEE] hover:bg-[#E0E0E0] text-[#6B7280] flex items-center justify-center cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmReturn} className="space-y-4">
                            {/* Kondisi Pengembalian */}
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-2">
                                    Pilih Kondisi Fisik Alat Saat Ini:
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { val: 'baik', label: 'Baik / Normal', color: 'emerald' },
                                        { val: 'rusak_ringan', label: 'Rusak Ringan', color: 'amber' },
                                        { val: 'rusak_berat', label: 'Rusak Berat', color: 'rose' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => setReturnData('kondisi_kembali', opt.val)}
                                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                                returnData.kondisi_kembali === opt.val
                                                    ? 'bg-[#D84040] text-white border-[#D84040] shadow-xs'
                                                    : 'bg-[#F8F9FA] text-[#1D1616] border-[#E0E0E0] hover:border-[#D84040]'
                                            }`}
                                        >
                                            <span className="block text-[11px] font-bold">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Catatan Pengembalian */}
                            <div>
                                <label className="block text-xs font-bold text-[#1D1616] mb-1">
                                    Catatan / Kendala Tambahan (Opsional)
                                </label>
                                <textarea
                                    value={returnData.catatan}
                                    onChange={(e) => setReturnData('catatan', e.target.value)}
                                    placeholder="Contoh: Mata bor cadangan sudah disimpan kembali di kotaknya..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E0E0E0] rounded-xl text-xs text-[#1D1616] focus:outline-none focus:border-[#D84040]"
                                />
                            </div>

                            {/* Submit Return */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={returnProcessing}
                                    className="w-full py-3 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#D84040]/30 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                >
                                    {returnProcessing ? 'Memproses Pengembalian...' : 'Konfirmasi Pengembalian'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Batalkan Pengajuan */}
            {cancellingLoan && (
                <div className="fixed inset-0 z-50 bg-[#1D1616]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-[380px] bg-white rounded-3xl p-5 shadow-2xl border border-[#E0E0E0] text-center animate-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#D84040] mx-auto flex items-center justify-center mb-3">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-base font-black text-[#1D1616] mb-1">
                            Batalkan Pengajuan?
                        </h3>
                        <p className="text-xs text-[#6B7280] mb-4">
                            Pengajuan peminjaman untuk <strong>{cancellingLoan.nama_barang}</strong> ({cancellingLoan.kode_unit}) akan dibatalkan dan status unit dikembalikan ke workshop.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setCancellingLoan(null)}
                                className="py-2.5 rounded-xl bg-[#EEEEEE] text-[#1D1616] font-bold text-xs hover:bg-[#E0E0E0] transition-colors cursor-pointer"
                            >
                                Kembali
                            </button>
                            <button
                                type="button"
                                disabled={cancelProcessing}
                                onClick={handleConfirmCancel}
                                className="py-2.5 rounded-xl bg-[#D84040] hover:bg-[#8E1616] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                {cancelProcessing ? 'Membatalkan...' : 'Ya, Batalkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UserMobileLayout>
    );
}
