<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan & Statistik - WAMS ({{ $filters['period_label'] }})</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1D1616;
            background: #FFFFFF;
            font-size: 11px;
            line-height: 1.4;
            padding: 24px;
        }
        .header {
            border-bottom: 2px solid #D84040;
            padding-bottom: 12px;
            margin-bottom: 18px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .title {
            font-size: 18px;
            font-weight: 800;
            color: #1D1616;
            letter-spacing: -0.5px;
        }
        .subtitle {
            font-size: 11px;
            color: #6B7280;
            margin-top: 2px;
        }
        .meta-box {
            text-align: right;
            font-size: 10px;
            color: #6B7280;
        }
        .badge-period {
            display: inline-block;
            background: #EEEEEE;
            color: #D84040;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 4px;
            margin-bottom: 4px;
            border: 1px solid #E0E0E0;
        }
        
        .section-title {
            font-size: 13px;
            font-weight: 800;
            color: #1D1616;
            margin-top: 16px;
            margin-bottom: 8px;
            padding-left: 8px;
            border-left: 3px solid #D84040;
        }

        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 10px;
            margin-bottom: 16px;
        }
        .kpi-card {
            border: 1px solid #E0E0E0;
            border-radius: 8px;
            padding: 10px;
            background: #FDFDFD;
        }
        .kpi-card .kpi-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #6B7280;
        }
        .kpi-card .kpi-value {
            font-size: 18px;
            font-weight: 900;
            color: #1D1616;
            margin-top: 3px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 10px;
        }
        th {
            background-color: #F3F4F6;
            color: #1D1616;
            font-weight: 700;
            text-align: left;
            padding: 6px 8px;
            border: 1px solid #E5E7EB;
        }
        td {
            padding: 6px 8px;
            border: 1px solid #E5E7EB;
            color: #374151;
        }
        tr:nth-child(even) td {
            background-color: #FAFAFA;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
        }
        .badge-success { background: #DCFCE7; color: #15803D; }
        .badge-danger { background: #FEE2E2; color: #B91C1C; }
        .badge-warning { background: #FEF3C7; color: #B45309; }
        .badge-info { background: #DBEAFE; color: #1D4ED8; }

        .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #E0E0E0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #9CA3AF;
        }
        .print-btn-bar {
            background: #1D1616;
            color: white;
            padding: 8px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: -24px -24px 20px -24px;
        }
        .btn-print {
            background: #D84040;
            color: white;
            border: none;
            padding: 6px 14px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
            font-size: 11px;
        }

        @media print {
            .print-btn-bar {
                display: none;
            }
            body {
                padding: 0;
            }
            @page {
                size: A4 landscape;
                margin: 12mm;
            }
        }
    </style>
</head>
<body>
    <div class="print-btn-bar">
        <span><strong>WAMS Report Export Preview</strong> &bull; Siap dicetak atau disimpan ke PDF</span>
        <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
    </div>

    <div class="header">
        <div>
            <div class="title">WORKSHOP ASSET MANAGEMENT SYSTEM (WAMS)</div>
            <div class="subtitle">Laporan Eksekutif Sirkulasi Transaksi, Utilisasi, dan Kondisi Unit Workshop</div>
        </div>
        <div class="meta-box">
            <div class="badge-period">Periode: {{ $filters['period_label'] }}</div>
            <div>Dicetak pada: {{ date('d F Y, H:i') }} WIB</div>
        </div>
    </div>

    <!-- Ringkasan KPI -->
    <div class="section-title">1. Ringkasan Statistik Utama</div>
    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="kpi-label">Total Peminjaman</div>
            <div class="kpi-value">{{ $summary['total_peminjaman'] }}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Total Pengembalian</div>
            <div class="kpi-value">{{ $summary['total_pengembalian'] }}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Keterlambatan</div>
            <div class="kpi-value" style="color: #D84040;">{{ $summary['total_keterlambatan'] }}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Total Unit Fisik</div>
            <div class="kpi-value">{{ $summary['total_unit'] }}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Unit Tersedia</div>
            <div class="kpi-value" style="color: #2563EB;">{{ $summary['unit_tersedia'] }}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Unit Maintenance</div>
            <div class="kpi-value" style="color: #D97706;">{{ $summary['unit_maintenance'] }}</div>
        </div>
    </div>

    <!-- Statistik Kategori & Utilisasi -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div>
            <div class="section-title">2. Statistik per Kategori Barang</div>
            <table>
                <thead>
                    <tr>
                        <th>Kategori</th>
                        <th style="text-align: center;">Model</th>
                        <th style="text-align: center;">Total Unit</th>
                        <th style="text-align: center;">Tersedia</th>
                        <th style="text-align: center;">Dipinjam</th>
                        <th style="text-align: center;">Pinjam (Frekuensi)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($category_stats as $cat)
                    <tr>
                        <td><strong>{{ $cat['nama_kategori'] }}</strong></td>
                        <td style="text-align: center;">{{ $cat['total_barang'] }}</td>
                        <td style="text-align: center;">{{ $cat['total_unit'] }}</td>
                        <td style="text-align: center; color: #2563EB;">{{ $cat['unit_tersedia'] }}</td>
                        <td style="text-align: center; color: #D97706;">{{ $cat['unit_dipinjam'] }}</td>
                        <td style="text-align: center;"><strong>{{ $cat['frekuensi_pinjam'] }}x</strong> ({{ $cat['persentase_utilisasi'] }}%)</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div>
            <div class="section-title">3. Kondisi & Utilisasi Aset Teratas</div>
            <table>
                <thead>
                    <tr>
                        <th>Nama Barang</th>
                        <th>Kode</th>
                        <th>Kategori</th>
                        <th style="text-align: center;">Total Unit</th>
                        <th style="text-align: center;">Frekuensi Dipinjam</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse(collect($asset_utilization)->take(5) as $item)
                    <tr>
                        <td><strong>{{ $item['nama_barang'] }}</strong></td>
                        <td>{{ $item['kode_barang'] }}</td>
                        <td>{{ $item['kategori'] }}</td>
                        <td style="text-align: center;">{{ $item['total_unit'] }}</td>
                        <td style="text-align: center;"><strong>{{ $item['frekuensi_pinjam'] }}x</strong></td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" style="text-align: center; color: #9CA3AF;">Belum ada aktivitas sirkulasi</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Rekap Logbook Transaksi -->
    <div class="section-title">4. Rekap Transaksi Logbook</div>
    <table>
        <thead>
            <tr>
                <th style="width: 25px; text-align: center;">No</th>
                <th>Teknisi / User</th>
                <th>Barang & Kode Unit</th>
                <th>Waktu Pinjam</th>
                <th>Waktu Kembali</th>
                <th>Durasi</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center;">Kondisi</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logbooks as $idx => $l)
            <tr>
                <td style="text-align: center;">{{ $idx + 1 }}</td>
                <td>
                    <strong>{{ $l['user_nama'] }}</strong>
                    <div style="font-size: 8.5px; color: #6B7280;">NIP: {{ $l['user_nip'] }}</div>
                </td>
                <td>
                    <strong>{{ $l['nama_barang'] }}</strong>
                    <div style="font-size: 8.5px; color: #6B7280;">Unit: {{ $l['kode_unit'] }} &bull; {{ $l['kategori'] }}</div>
                </td>
                <td>{{ $l['tanggal_pinjam_formatted'] }}</td>
                <td>{{ $l['tanggal_kembali_formatted'] }}</td>
                <td>{{ $l['durasi'] }}</td>
                <td style="text-align: center;">
                    @if($l['status_transaksi'] === 'dipinjam')
                        <span class="badge {{ $l['is_terlambat'] ? 'badge-danger' : 'badge-warning' }}">
                            {{ $l['is_terlambat'] ? 'Terlambat' : 'Dipinjam' }}
                        </span>
                    @else
                        <span class="badge badge-success">Dikembalikan</span>
                    @endif
                </td>
                <td style="text-align: center;">
                    @if($l['kondisi_kembali'] === 'baik')
                        <span class="badge badge-success">Baik</span>
                    @elseif($l['kondisi_kembali'] === 'rusak')
                        <span class="badge badge-danger">Rusak</span>
                    @else
                        <span style="color: #9CA3AF;">-</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="8" style="text-align: center; color: #9CA3AF; padding: 12px;">Tidak ada data logbook untuk periode ini</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Laporan Maintenance -->
    @if(count($maintenance_reports) > 0)
    <div class="section-title">5. Riwayat Unit dalam Status Maintenance / Rusak</div>
    <table>
        <thead>
            <tr>
                <th style="width: 25px; text-align: center;">No</th>
                <th>Kode Unit</th>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center;">Kondisi</th>
                <th>Terakhir Update</th>
                <th>Catatan / Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($maintenance_reports as $idx => $m)
            <tr>
                <td style="text-align: center;">{{ $idx + 1 }}</td>
                <td><strong>{{ $m['kode_unit'] }}</strong></td>
                <td>{{ $m['nama_barang'] }}</td>
                <td>{{ $m['kategori'] }}</td>
                <td style="text-align: center;"><span class="badge badge-warning">{{ ucfirst($m['status']) }}</span></td>
                <td style="text-align: center;"><span class="badge {{ $m['kondisi'] === 'baik' ? 'badge-success' : 'badge-danger' }}">{{ ucfirst($m['kondisi']) }}</span></td>
                <td>{{ $m['tanggal_update'] }}</td>
                <td>{{ $m['catatan'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">
        <div>WAMS &copy; {{ date('Y') }} &bull; Workshop Asset Management System</div>
        <div>Dokumen resmi dicetak secara otomatis oleh sistem WAMS</div>
    </div>
</body>
</html>
