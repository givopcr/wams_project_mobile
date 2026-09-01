import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { QrCode, Download, Boxes, Check, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QrCodeIndex({ categories }) {
    const [downloadingId, setDownloadingId] = useState(null);
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);

    const downloadSingleQR = (kat) => {
        setDownloadingId(kat.id);
        const svg = document.getElementById(`qr-svg-${kat.id}`);
        if (!svg) {
            setDownloadingId(null);
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            // Set canvas to high quality dimensions (700 x 850 for label card)
            const width = 700;
            const height = 850;
            canvas.width = width;
            canvas.height = height;

            // Background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);

            // Outer Border
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 4;
            ctx.strokeRect(20, 20, width - 40, height - 40);

            // Header Banner
            ctx.fillStyle = '#D84040';
            ctx.fillRect(20, 20, width - 40, 70);

            // Header Text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('WAMS WORKSHOP QR', width / 2, 65);

            // Category ID Badge
            ctx.fillStyle = '#EEEEEE';
            ctx.beginPath();
            ctx.roundRect(width / 2 - 60, 110, 120, 34, 8);
            ctx.fill();
            ctx.fillStyle = '#1D1616';
            ctx.font = 'bold 18px monospace';
            ctx.fillText(`ID: #${kat.id}`, width / 2, 134);

            // Draw QR Code Image (centered)
            const qrSize = 420;
            const qrX = (width - qrSize) / 2;
            const qrY = 165;
            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

            // Category Name
            ctx.fillStyle = '#1D1616';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(kat.nama_kategori, width / 2, 630);

            // QR Code Payload
            ctx.fillStyle = '#D84040';
            ctx.font = 'bold 22px monospace';
            ctx.fillText(kat.qr_code, width / 2, 670);

            // Subtitle / Info
            ctx.fillStyle = '#6B7280';
            ctx.font = '18px sans-serif';
            ctx.fillText(`${kat.total_barang} Master Barang • ${kat.total_unit} Total Unit`, width / 2, 715);

            // Footer note
            ctx.fillStyle = '#9CA3AF';
            ctx.font = '14px sans-serif';
            ctx.fillText('Pindai dengan Aplikasi WAMS Mobile', width / 2, 790);

            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `WAMS_QR_${kat.nama_kategori.replace(/[^a-zA-Z0-9]/g, '_')}_ID${kat.id}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
            URL.revokeObjectURL(url);
            setDownloadingId(null);
        };

        img.src = url;
    };

    const downloadAllQR = async () => {
        setIsDownloadingAll(true);
        for (let i = 0; i < categories.length; i++) {
            downloadSingleQR(categories[i]);
            // small delay to prevent browser throttling downloads
            await new Promise((resolve) => setTimeout(resolve, 350));
        }
        setIsDownloadingAll(false);
    };

    return (
        <AuthenticatedLayout title="Generate & Unduh QR Code Kategori">
            <Head title="Generate QR Code - WAMS" />

            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-xs text-[#6B7280] max-w-2xl">
                        QR Code dibuat per kategori barang (Perkakas, Elektronik, Komponen) untuk ditempelkan di rak/lokasi workshop. Anda dapat mengunduh label QR dalam format PNG resolusi tinggi siap cetak.
                    </p>
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            onClick={downloadAllQR}
                            disabled={isDownloadingAll}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#D84040] hover:bg-[#8E1616] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                            <Download size={15} />
                            <span>{isDownloadingAll ? 'Mengunduh Semua...' : 'Unduh Semua QR Code'}</span>
                        </button>
                    </div>
                </div>

                {/* Grid QR Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((kat) => (
                        <div
                            key={kat.id}
                            className="bg-white border border-[#E0E0E0] rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-all hover:shadow-md shadow-2xs print:border-black print:bg-white print:text-black group"
                        >
                            <div className="w-full flex items-center justify-between text-xs text-[#6B7280] mb-4 print:text-black">
                                <span className="font-bold flex items-center gap-1.5 text-[#D84040] print:text-black">
                                    <Boxes size={14} /> WAMS QR
                                </span>
                                <span className="font-mono bg-[#EEEEEE] px-2 py-0.5 rounded-md text-[11px] font-bold text-[#1D1616]">ID: #{kat.id}</span>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-none mb-4 border-2 border-[#E0E0E0] relative">
                                <QRCodeSVG
                                    id={`qr-svg-${kat.id}`}
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

                            {/* Tombol Unduh Per Card */}
                            <div className="w-full mb-4 print:hidden">
                                <button
                                    onClick={() => downloadSingleQR(kat)}
                                    disabled={downloadingId === kat.id}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#EEEEEE] hover:bg-[#D84040] hover:text-white text-[#1D1616] text-xs font-bold rounded-xl transition-all cursor-pointer border border-[#E0E0E0]"
                                >
                                    <Download size={14} />
                                    <span>{downloadingId === kat.id ? 'Memproses...' : 'Unduh QR Label (PNG)'}</span>
                                </button>
                            </div>

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
