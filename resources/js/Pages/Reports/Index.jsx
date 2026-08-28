import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BarChart3, Clock, Sparkles, FileText, Download, TrendingUp } from 'lucide-react';

export default function ReportsIndex() {
    return (
        <AuthenticatedLayout title="Laporan">
            <Head title="Laporan - WAMS" />

            <div className="max-w-2xl mx-auto mt-8 bg-[#FFF2DB] border border-[#F0DFC4] rounded-2xl p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-[#F62440] flex items-center justify-center mx-auto text-white">
                    <BarChart3 size={32} />
                </div>

                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFE5BF] text-[#F62440] text-xs font-bold mb-3 border border-[#F0DFC4]">
                        <Clock size={13} />
                        <span>Ekspor & Rekap Laporan</span>
                    </div>

                    <h2 className="text-xl font-extrabold text-[#1E232A]">
                        Laporan Transaksi & Utilisasi Aset
                    </h2>

                    <p className="text-xs text-[#6B7280] leading-relaxed max-w-md mx-auto mt-2">
                        Modul pelaporan otomatis untuk rekap data logbook, statistik peminjaman barang, dan riwayat pemeliharaan berkala unit fisik workshop.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="p-4 rounded-xl bg-[#FFFAF3] border border-[#F0DFC4] flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#FFE5BF] text-[#F62440] shrink-0">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-xs text-[#1E232A]">Rekap Logbook Harian</h4>
                            <p className="text-[11px] text-[#6B7280] mt-0.5">Daftar keluar masuk alat oleh teknisi</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FFFAF3] border border-[#F0DFC4] flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#FFE5BF] text-[#F62440] shrink-0">
                            <TrendingUp size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-xs text-[#1E232A]">Statistik Kategori</h4>
                            <p className="text-[11px] text-[#6B7280] mt-0.5">Perkakas, Elektronik, Komponen</p>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F62440] hover:bg-[#D91A33] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                        <span>Kembali ke Dashboard</span>
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
