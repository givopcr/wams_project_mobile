import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { QrCode, Printer, ExternalLink, Boxes } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QrCodeIndex({ categories }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout title="Generate & Cetak QR Code Kategori">
            <Head title="Generate QR Code" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 print:hidden">
                <p className="text-xs text-slate-400">
                    QR Code dibuat per kategori barang untuk ditempelkan di rak/lokasi workshop. Teknisi dapat memindai QR ini melalui aplikasi mobile.
                </p>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                >
                    <Printer size={16} />
                    <span>Cetak Semua QR Code</span>
                </button>
            </div>

            {/* Grid QR Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((kat) => (
                    <div
                        key={kat.id}
                        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden group hover:border-slate-700 transition-all print:border-black print:bg-white print:text-black"
                    >
                        <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-4 print:text-black">
                            <span className="font-bold flex items-center gap-1.5 text-blue-400 print:text-black">
                                <Boxes size={14} /> WAMS QR
                            </span>
                            <span className="font-mono">ID: #{kat.id}</span>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-md mb-4 border border-slate-200">
                            <QRCodeSVG
                                value={kat.qr_code}
                                size={140}
                                level="H"
                                includeMargin={false}
                            />
                        </div>

                        <h3 className="font-bold text-white text-sm mb-1 line-clamp-1 print:text-black">
                            {kat.nama_kategori}
                        </h3>
                        <p className="text-[11px] font-mono text-blue-400 mb-3 print:text-black font-semibold">
                            {kat.qr_code}
                        </p>

                        <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 print:text-black">
                            <span>{kat.total_barang} Barang</span>
                            <span className="font-bold text-slate-300 print:text-black">{kat.total_unit} Total Unit</span>
                        </div>
                    </div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
