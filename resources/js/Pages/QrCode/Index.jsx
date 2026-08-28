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
            <Head title="Generate QR Code - WAMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                    <p className="text-xs text-[#6B7280]">
                        QR Code dibuat per kategori barang (Perkakas, Elektronik, Komponen) untuk ditempelkan di rak/lokasi workshop. Teknisi dapat memindai QR ini melalui aplikasi mobile WAMS.
                    </p>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                        <Printer size={16} />
                        <span>Cetak Semua QR Code</span>
                    </button>
                </div>

                {/* Grid QR Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((kat) => (
                        <div
                            key={kat.id}
                            className="bg-white border border-[#E0E0E0] rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-colors shadow-2xs print:border-black print:bg-white print:text-black"
                        >
                            <div className="w-full flex items-center justify-between text-xs text-[#6B7280] mb-4 print:text-black">
                                <span className="font-bold flex items-center gap-1.5 text-[#D84040] print:text-black">
                                    <Boxes size={14} /> WAMS QR
                                </span>
                                <span className="font-mono bg-[#EEEEEE] px-2 py-0.5 rounded-md text-[11px] font-bold text-[#1D1616]">ID: #{kat.id}</span>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-none mb-4 border-2 border-[#E0E0E0]">
                                <QRCodeSVG
                                    value={kat.qr_code}
                                    size={150}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#1D1616"
                                />
                            </div>

                            <h3 className="font-extrabold text-[#1D1616] text-base mb-1 print:text-black">
                                {kat.nama_kategori}
                            </h3>
                            <p className="text-xs font-mono text-[#D84040] mb-4 print:text-black font-bold">
                                {kat.qr_code}
                            </p>

                            <div className="w-full pt-3 border-t border-[#E0E0E0] flex items-center justify-between text-xs text-[#6B7280] print:text-black">
                                <span>{kat.total_barang} Master Barang</span>
                                <span className="font-bold text-[#1D1616] print:text-black">{kat.total_unit} Total Unit</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
