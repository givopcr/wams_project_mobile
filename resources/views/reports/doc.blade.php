<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Laporan Eksekutif WAMS - {{ $filters['period_label'] }}</title>
    <!--[if gte mso 9]>
    <xml>
     <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
     </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        @page Section1 {
            size: 841.9pt 595.3pt;
            mso-page-orientation: landscape;
            margin: 28.3pt 28.3pt 28.3pt 28.3pt;
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
        }
        div.Section1 {
            page: Section1;
        }
        body {
            font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
            font-size: 9.5pt;
            color: #1E293B;
            background-color: #FFFFFF;
            margin: 0;
            padding: 0;
        }
        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        .header-box {
            width: 100%;
            border: 1.5pt solid #1E293B;
            border-top: 4pt solid #D84040;
            margin-bottom: 12pt;
            background-color: #FFFFFF;
        }
        .header-box td {
            padding: 8pt 10pt;
            vertical-align: middle;
        }
        .doc-title {
            font-size: 13pt;
            font-weight: bold;
            color: #0F172A;
            text-transform: uppercase;
        }
        .doc-subtitle {
            font-size: 8.5pt;
            color: #475569;
            margin-top: 2pt;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
        }
        .meta-table td {
            padding: 2pt 5pt;
            border: 0.75pt solid #CBD5E1;
        }
        .meta-table td.meta-lbl {
            background-color: #F1F5F9;
            font-weight: bold;
            color: #334155;
            width: 40%;
        }
        .meta-table td.meta-val {
            font-weight: bold;
            color: #0F172A;
            width: 60%;
        }

        .sec-title {
            background-color: #1E293B;
            color: #FFFFFF;
            font-size: 9.5pt;
            font-weight: bold;
            padding: 5pt 8pt;
            border-bottom: 2pt solid #D84040;
            text-transform: uppercase;
            margin-top: 10pt;
        }
        .table-data {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-bottom: 10pt;
        }
        .table-data th {
            background-color: #F1F5F9;
            color: #0F172A;
            font-weight: bold;
            border: 0.75pt solid #94A3B8;
            padding: 4.5pt 5pt;
            font-size: 8pt;
            text-align: left;
            text-transform: uppercase;
        }
        .table-data td {
            border: 0.75pt solid #CBD5E1;
            padding: 4pt 5pt;
            vertical-align: middle;
        }
        .kpi-table {
            width: 100%;
            border-collapse: separate;
            margin-top: 5pt;
            margin-bottom: 6pt;
        }
        .kpi-cell {
            border: 0.75pt solid #CBD5E1;
            border-top: 2.5pt solid #1E293B;
            background-color: #F8FAFC;
            padding: 5pt 3pt;
            text-align: center;
            width: 14.28%;
        }
        .kpi-cell.blue { border-top-color: #2563EB; background-color: #EFF6FF; }
        .kpi-cell.emerald { border-top-color: #059669; background-color: #ECFDF5; }
        .kpi-cell.red { border-top-color: #D84040; background-color: #FEF2F2; }
        .kpi-cell.amber { border-top-color: #D97706; background-color: #FFFBEB; }

        .kpi-lbl {
            font-size: 7.5pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #475569;
        }
        .kpi-val {
            font-size: 13pt;
            font-weight: bold;
            color: #0F172A;
            margin-top: 2pt;
        }

        .badge-tag {
            font-weight: bold;
            font-size: 7.5pt;
            padding: 1pt 4pt;
        }

        .footer-box {
            width: 100%;
            border: 1pt solid #94A3B8;
            background-color: #F8FAFC;
            margin-top: 12pt;
        }
        .footer-box td {
            padding: 8pt 10pt;
            vertical-align: middle;
        }
    </style>
</head>
<body>
<div class="Section1">
    <!-- HEADER -->
    <table class="header-box">
        <tr>
            <td style="width: 65%;">
                <div class="doc-title">WORKSHOP ASSET MANAGEMENT SYSTEM (WAMS)</div>
                <div class="doc-subtitle">Laporan Resmi Sirkulasi Peminjaman, Pengembalian, Utilisasi & Kondisi Aset Workshop</div>
            </td>
            <td style="width: 35%;">
                <table class="meta-table">
                    <tr>
                        <td class="meta-lbl">Periode</td>
                        <td class="meta-val" style="color: #D84040;">{{ $filters['period_label'] }}</td>
                    </tr>
                    <tr>
                        <td class="meta-lbl">Tgl Ekspor</td>
                        <td class="meta-val">{{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i') }} WIB</td>
                    </tr>
                    <tr>
                        <td class="meta-lbl">Pencetak</td>
                        <td class="meta-val">{{ auth()->user()?->nama ?? 'Administrator WAMS' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- SECTION 1: RINGKASAN STATISTIK UTAMA -->
    <div class="sec-title">Section 1 &mdash; Ringkasan Statistik Utama & Kondisi Fisik Aset</div>
    <table class="kpi-table">
        <tr>
            <td class="kpi-cell blue">
                <div class="kpi-lbl">Peminjaman</div>
                <div class="kpi-val">{{ $summary['total_peminjaman'] }}</div>
            </td>
            <td class="kpi-cell emerald">
                <div class="kpi-lbl">Pengembalian</div>
                <div class="kpi-val" style="color: #059669;">{{ $summary['total_pengembalian'] }}</div>
            </td>
            <td class="kpi-cell red">
                <div class="kpi-lbl">Terlambat</div>
                <div class="kpi-val" style="color: #D84040;">{{ $summary['total_keterlambatan'] }}</div>
            </td>
            <td class="kpi-cell">
                <div class="kpi-lbl">Total Unit</div>
                <div class="kpi-val">{{ $summary['total_unit'] }}</div>
            </td>
            <td class="kpi-cell blue">
                <div class="kpi-lbl">Unit Tersedia</div>
                <div class="kpi-val" style="color: #2563EB;">{{ $summary['unit_tersedia'] }}</div>
            </td>
            <td class="kpi-cell amber">
                <div class="kpi-lbl">Dipinjam</div>
                <div class="kpi-val" style="color: #D97706;">{{ $summary['unit_dipinjam'] }}</div>
            </td>
            <td class="kpi-cell red">
                <div class="kpi-lbl">Maintenance</div>
                <div class="kpi-val" style="color: #B91C1C;">{{ $summary['unit_maintenance'] }}</div>
            </td>
        </tr>
    </table>

    <!-- KONDISI FISIK -->
    <table style="width: 100%; border: 0.75pt solid #CBD5E1; margin-bottom: 10pt; font-size: 8.5pt;">
        <tr style="background-color: #F8FAFC;">
            <td style="padding: 4pt 8pt; width: 33.33%;">
                <strong>Kondisi Baik / Siap Pakai:</strong> <span style="color: #059669; font-weight: bold;">{{ $asset_conditions['baik']['count'] }} Unit ({{ $asset_conditions['baik']['percentage'] }}%)</span>
            </td>
            <td style="padding: 4pt 8pt; width: 33.33%;">
                <strong>Kondisi Rusak:</strong> <span style="color: #B91C1C; font-weight: bold;">{{ $asset_conditions['rusak']['count'] }} Unit ({{ $asset_conditions['rusak']['percentage'] }}%)</span>
            </td>
            <td style="padding: 4pt 8pt; width: 33.33%;">
                <strong>Dalam Maintenance:</strong> <span style="color: #D97706; font-weight: bold;">{{ $asset_conditions['maintenance']['count'] }} Unit ({{ $asset_conditions['maintenance']['percentage'] }}%)</span>
            </td>
        </tr>
    </table>

    <!-- SECTION 2 & 3: STATISTIK KATEGORI & UTILISASI ASET -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10pt;">
        <tr>
            <!-- SECTION 2 -->
            <td style="width: 50%; vertical-align: top; padding-right: 6pt;">
                <div class="sec-title" style="margin-top: 0;">Section 2 &mdash; Statistik per Kategori Barang</div>
                <table class="table-data" style="margin-bottom: 0;">
                    <thead>
                        <tr>
                            <th style="width: 20pt; text-align: center;">No</th>
                            <th>Kategori</th>
                            <th style="text-align: center; width: 30pt;">Model</th>
                            <th style="text-align: center; width: 30pt;">Unit</th>
                            <th style="text-align: center; width: 30pt;">Siap</th>
                            <th style="text-align: center; width: 35pt;">Pinjam</th>
                            <th style="text-align: center; width: 55pt;">Frekuensi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($category_stats as $idx => $cat)
                        <tr style="background-color: {{ $idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF' }};">
                            <td style="text-align: center; font-weight: bold;">{{ $idx + 1 }}</td>
                            <td><strong>{{ $cat['nama_kategori'] }}</strong></td>
                            <td style="text-align: center;">{{ $cat['total_barang'] }}</td>
                            <td style="text-align: center; font-weight: bold;">{{ $cat['total_unit'] }}</td>
                            <td style="text-align: center; color: #059669; font-weight: bold;">{{ $cat['unit_tersedia'] }}</td>
                            <td style="text-align: center; color: #D97706; font-weight: bold;">{{ $cat['unit_dipinjam'] }}</td>
                            <td style="text-align: center;"><strong>{{ $cat['frekuensi_pinjam'] }}x</strong> ({{ $cat['persentase_utilisasi'] }}%)</td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" style="text-align: center; color: #64748B; padding: 8pt;">Belum ada data kategori</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </td>

            <!-- SECTION 3 -->
            <td style="width: 50%; vertical-align: top; padding-left: 6pt;">
                <div class="sec-title" style="margin-top: 0;">Section 3 &mdash; Utilisasi Aset Teratas</div>
                <table class="table-data" style="margin-bottom: 0;">
                    <thead>
                        <tr>
                            <th style="width: 20pt; text-align: center;">No</th>
                            <th>Nama Barang</th>
                            <th style="width: 55pt;">Kode</th>
                            <th style="width: 55pt;">Kategori</th>
                            <th style="text-align: center; width: 35pt;">Unit</th>
                            <th style="text-align: center; width: 60pt;">Frekuensi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse(collect($asset_utilization)->take(8) as $idx => $item)
                        <tr style="background-color: {{ $idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF' }};">
                            <td style="text-align: center; font-weight: bold;">{{ $idx + 1 }}</td>
                            <td><strong>{{ $item['nama_barang'] }}</strong></td>
                            <td style="font-family: Consolas, monospace; font-weight: bold;">{{ $item['kode_barang'] }}</td>
                            <td>{{ $item['kategori'] }}</td>
                            <td style="text-align: center;">{{ $item['total_unit'] }}</td>
                            <td style="text-align: center;"><strong>{{ $item['frekuensi_pinjam'] }}x</strong> ({{ $item['persentase_utilisasi'] }}%)</td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" style="text-align: center; color: #64748B; padding: 8pt;">Belum ada data utilisasi</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
        </tr>
    </table>

    <!-- SECTION 4: REKAP LOGBOOK PEMINJAMAN & PENGEMBALIAN -->
    <div class="sec-title">Section 4 &mdash; Rekap Logbook Peminjaman & Pengembalian ({{ count($logbooks) }} Transaksi)</div>
    <table class="table-data">
        <thead>
            <tr>
                <th style="width: 18pt; text-align: center;">No</th>
                <th>Peminjam / Teknisi</th>
                <th style="width: 60pt;">NIP / ID</th>
                <th>Nama Barang</th>
                <th style="width: 65pt;">Kode Unit</th>
                <th style="width: 55pt;">Kategori</th>
                <th style="width: 75pt;">Waktu Pinjam</th>
                <th style="width: 75pt;">Waktu Kembali</th>
                <th style="text-align: center; width: 45pt;">Durasi</th>
                <th style="text-align: center; width: 55pt;">Status</th>
                <th style="text-align: center; width: 45pt;">Kondisi</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logbooks as $idx => $l)
            <tr style="background-color: {{ $idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF' }};">
                <td style="text-align: center; font-weight: bold;">{{ $idx + 1 }}</td>
                <td><strong>{{ $l['user_nama'] }}</strong></td>
                <td style="font-family: Consolas, monospace;">{{ $l['user_nip'] }}</td>
                <td><strong>{{ $l['nama_barang'] }}</strong></td>
                <td style="font-family: Consolas, monospace; font-weight: bold;">{{ $l['kode_unit'] }}</td>
                <td>{{ $l['kategori'] }}</td>
                <td>{{ $l['tanggal_pinjam_formatted'] }}</td>
                <td>{{ $l['tanggal_kembali_formatted'] }}</td>
                <td style="text-align: center;">{{ $l['durasi'] }}</td>
                <td style="text-align: center;">
                    @if($l['status_transaksi'] === 'dipinjam')
                        <span class="badge-tag" style="color: {{ $l['is_terlambat'] ? '#991B1B' : '#92400E' }};">
                            {{ $l['is_terlambat'] ? 'Terlambat' : 'Dipinjam' }}
                        </span>
                    @elseif($l['status_transaksi'] === 'dikembalikan')
                        <span class="badge-tag" style="color: #166534;">Kembali</span>
                    @else
                        <span class="badge-tag" style="color: #1E40AF;">{{ ucfirst(str_replace('_', ' ', $l['status_transaksi'])) }}</span>
                    @endif
                </td>
                <td style="text-align: center;">
                    @if($l['kondisi_kembali'] === 'baik')
                        <span class="badge-tag" style="color: #166534;">Baik</span>
                    @elseif($l['kondisi_kembali'] === 'rusak')
                        <span class="badge-tag" style="color: #991B1B;">Rusak</span>
                    @else
                        <span style="color: #94A3B8;">-</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="11" style="text-align: center; color: #64748B; padding: 10pt;">Tidak ada data transaksi pada periode ini</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- SECTION 5: LAPORAN PEMELIHARAAN & UNIT RUSAK -->
    <div class="sec-title">Section 5 &mdash; Laporan Pemeliharaan & Unit Rusak ({{ count($maintenance_reports) }} Unit)</div>
    <table class="table-data">
        <thead>
            <tr>
                <th style="width: 18pt; text-align: center;">No</th>
                <th style="width: 70pt;">Kode Unit</th>
                <th>Nama Barang</th>
                <th style="width: 60pt;">Kategori</th>
                <th style="text-align: center; width: 55pt;">Status</th>
                <th style="text-align: center; width: 50pt;">Kondisi</th>
                <th style="width: 80pt;">Update Terakhir</th>
                <th>Pelapor Terakhir</th>
                <th>Catatan Teknis</th>
            </tr>
        </thead>
        <tbody>
            @forelse($maintenance_reports as $idx => $m)
            <tr style="background-color: {{ $idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF' }};">
                <td style="text-align: center; font-weight: bold;">{{ $idx + 1 }}</td>
                <td style="font-family: Consolas, monospace; font-weight: bold;">{{ $m['kode_unit'] }}</td>
                <td><strong>{{ $m['nama_barang'] }}</strong></td>
                <td>{{ $m['kategori'] }}</td>
                <td style="text-align: center;">{{ ucfirst($m['status']) }}</td>
                <td style="text-align: center; color: {{ $m['kondisi'] === 'baik' ? '#166534' : '#991B1B' }}; font-weight: bold;">
                    {{ ucfirst($m['kondisi']) }}
                </td>
                <td>{{ $m['tanggal_update'] }}</td>
                <td>{{ $m['pelapor_terakhir'] }}</td>
                <td>{{ $m['catatan'] }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="9" style="text-align: center; color: #059669; font-weight: bold; padding: 8pt;">
                    Seluruh unit fisik dalam kondisi baik dan tidak ada antrian maintenance.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- FOOTER & PENGESAHAN -->
    <table class="footer-box">
        <tr>
            <td style="width: 70%;">
                <div style="font-size: 7.5pt; color: #475569; line-height: 1.4;">
                    <strong>WORKSHOP ASSET MANAGEMENT SYSTEM (WAMS)</strong><br>
                    Dokumen laporan resmi ini digenerate secara otomatis dari database sistem WAMS pada {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i:s') }} WIB.<br>
                    Seluruh statistik dan riwayat sirkulasi mengacu pada transaksi aktual pada periode: <strong>{{ $filters['period_label'] }}</strong>.
                </div>
            </td>
            <td style="width: 30%; text-align: center; border-left: 1pt dashed #CBD5E1; padding-left: 12pt;">
                <div style="font-size: 7.5pt; font-weight: bold; color: #334155; margin-bottom: 24pt;">Mengetahui, Administrator Workshop</div>
                <div style="border-top: 1pt solid #334155; font-size: 8pt; font-weight: bold; color: #0F172A; padding-top: 2pt;">
                    {{ auth()->user()?->nama ?? 'Administrator WAMS' }}
                </div>
            </td>
        </tr>
    </table>
</div>
</body>
</html>

