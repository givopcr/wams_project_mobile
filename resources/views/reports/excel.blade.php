<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Laporan Eksekutif WAMS - {{ $filters['period_label'] }}</title>
    <style>
        body {
            font-family: Calibri, 'Segoe UI', Arial, sans-serif;
            font-size: 11pt;
            color: #1E293B;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        .doc-banner {
            background-color: #1E293B;
            color: #FFFFFF;
            font-size: 14pt;
            font-weight: bold;
            padding: 10px 12px;
            border: 2pt solid #0F172A;
            text-align: left;
        }
        .doc-subbanner {
            background-color: #F8FAFC;
            color: #334155;
            font-size: 10pt;
            padding: 6px 12px;
            border: 1pt solid #94A3B8;
        }
        .section-header {
            background-color: #D84040;
            color: #FFFFFF;
            font-size: 11pt;
            font-weight: bold;
            padding: 8px 10px;
            border-top: 2pt solid #991B1B;
            border-left: 2pt solid #991B1B;
            border-right: 2pt solid #991B1B;
            border-bottom: 1.5pt solid #991B1B;
            text-transform: uppercase;
        }
        .th-cell {
            background-color: #E2E8F0;
            color: #0F172A;
            font-weight: bold;
            font-size: 10pt;
            padding: 7px 10px;
            border: 1pt solid #475569;
            text-align: center;
        }
        .th-left {
            background-color: #E2E8F0;
            color: #0F172A;
            font-weight: bold;
            font-size: 10pt;
            padding: 7px 10px;
            border: 1pt solid #475569;
            text-align: left;
        }
        .td-cell {
            padding: 6px 10px;
            border: 1pt solid #94A3B8;
            font-size: 10pt;
            color: #1E293B;
            vertical-align: middle;
        }
        .td-alt {
            background-color: #F8FAFC;
            padding: 6px 10px;
            border: 1pt solid #94A3B8;
            font-size: 10pt;
            color: #1E293B;
            vertical-align: middle;
        }
        .td-center {
            text-align: center;
        }
        .td-bold {
            font-weight: bold;
        }
        .section-bottom-row td {
            border-bottom: 2pt solid #1E293B;
        }
        .status-ok {
            background-color: #DCFCE7;
            color: #166534;
            font-weight: bold;
            text-align: center;
        }
        .status-warn {
            background-color: #FEF3C7;
            color: #92400E;
            font-weight: bold;
            text-align: center;
        }
        .status-err {
            background-color: #FEE2E2;
            color: #991B1B;
            font-weight: bold;
            text-align: center;
        }
    </style>
</head>
<body>
    <!-- HEADER UTAMA LAPORAN -->
    <table border="1">
        <tr>
            <td colspan="12" class="doc-banner">
                WORKSHOP ASSET MANAGEMENT SYSTEM (WAMS) &mdash; LAPORAN EKSEKUTIF &amp; STATISTIK
            </td>
        </tr>
        <tr>
            <td colspan="3" class="doc-subbanner"><strong>Periode Filter:</strong> {{ $filters['period_label'] }}</td>
            <td colspan="5" class="doc-subbanner"><strong>Waktu Unduh:</strong> {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i:s') }} WIB</td>
            <td colspan="4" class="doc-subbanner"><strong>Diunduh Oleh:</strong> {{ auth()->user()?->nama ?? 'Administrator WAMS' }}</td>
        </tr>
    </table>
    <br/>

    <!-- SECTION 1: RINGKASAN STATISTIK UTAMA -->
    <table border="1">
        <tr>
            <td colspan="6" class="section-header">SECTION 1 &mdash; RINGKASAN STATISTIK UTAMA WORKSHOP</td>
        </tr>
        <tr>
            <th class="th-cell" style="width: 50px;">No</th>
            <th colspan="2" class="th-left">Indikator Metrik</th>
            <th class="th-cell">Jumlah</th>
            <th colspan="2" class="th-left">Keterangan Operasional</th>
        </tr>
        <tr>
            <td class="td-cell td-center td-bold">1</td>
            <td colspan="2" class="td-cell td-bold">Total Peminjaman</td>
            <td class="td-cell td-center td-bold">{{ $summary['total_peminjaman'] }}</td>
            <td colspan="2" class="td-cell">Jumlah transaksi sirkulasi dalam periode laporan</td>
        </tr>
        <tr>
            <td class="td-alt td-center td-bold">2</td>
            <td colspan="2" class="td-alt td-bold">Total Pengembalian</td>
            <td class="td-alt td-center td-bold">{{ $summary['total_pengembalian'] }}</td>
            <td colspan="2" class="td-alt">Unit yang telah selesai dikembalikan ke workshop</td>
        </tr>
        <tr>
            <td class="td-cell td-center td-bold">3</td>
            <td colspan="2" class="td-cell td-bold">Total Keterlambatan</td>
            <td class="td-cell status-err">{{ $summary['total_keterlambatan'] }}</td>
            <td colspan="2" class="td-cell">Transaksi yang melewati batas waktu pengembalian</td>
        </tr>
        <tr>
            <td class="td-alt td-center td-bold">4</td>
            <td colspan="2" class="td-alt td-bold">Total Unit Fisik Terdaftar</td>
            <td class="td-alt td-center td-bold">{{ $summary['total_unit'] }}</td>
            <td colspan="2" class="td-alt">Seluruh unit peralatan aset yang terdaftar di workshop</td>
        </tr>
        <tr>
            <td class="td-cell td-center td-bold">5</td>
            <td colspan="2" class="td-cell td-bold">Unit Tersedia (Siap Pakai)</td>
            <td class="td-cell status-ok">{{ $summary['unit_tersedia'] }}</td>
            <td colspan="2" class="td-cell">Unit siap dipinjam oleh teknisi / pengguna</td>
        </tr>
        <tr>
            <td class="td-alt td-center td-bold">6</td>
            <td colspan="2" class="td-alt td-bold">Unit Sedang Dipinjam</td>
            <td class="td-alt status-warn">{{ $summary['unit_dipinjam'] }}</td>
            <td colspan="2" class="td-alt">Unit sedang aktif digunakan di lapangan</td>
        </tr>
        <tr class="section-bottom-row">
            <td class="td-cell td-center td-bold">7</td>
            <td colspan="2" class="td-cell td-bold">Unit Maintenance / Perbaikan</td>
            <td class="td-cell status-err">{{ $summary['unit_maintenance'] }}</td>
            <td colspan="2" class="td-cell">Unit sedang dalam pemeliharaan atau mengalami kerusakan</td>
        </tr>
    </table>
    <br/>

    <!-- SECTION 2: KONDISI FISIK ASET -->
    <table border="1">
        <tr>
            <td colspan="6" class="section-header">SECTION 2 &mdash; KONDISI FISIK ASET WORKSHOP</td>
        </tr>
        <tr>
            <th class="th-cell">No</th>
            <th colspan="2" class="th-left">Status Kondisi Fisik</th>
            <th class="th-cell">Jumlah Unit</th>
            <th colspan="2" class="th-cell">Persentase Terhadap Total Aset</th>
        </tr>
        <tr>
            <td class="td-cell td-center td-bold">1</td>
            <td colspan="2" class="td-cell td-bold">Layak Pakai / Kondisi Baik</td>
            <td class="td-cell status-ok">{{ $asset_conditions['baik']['count'] }}</td>
            <td colspan="2" class="td-cell td-center td-bold">{{ $asset_conditions['baik']['percentage'] }}%</td>
        </tr>
        <tr>
            <td class="td-alt td-center td-bold">2</td>
            <td colspan="2" class="td-alt td-bold">Kondisi Rusak</td>
            <td class="td-alt status-err">{{ $asset_conditions['rusak']['count'] }}</td>
            <td colspan="2" class="td-alt td-center td-bold">{{ $asset_conditions['rusak']['percentage'] }}%</td>
        </tr>
        <tr class="section-bottom-row">
            <td class="td-cell td-center td-bold">3</td>
            <td colspan="2" class="td-cell td-bold">Status Pemeliharaan (Maintenance)</td>
            <td class="td-cell status-warn">{{ $asset_conditions['maintenance']['count'] }}</td>
            <td colspan="2" class="td-cell td-center td-bold">{{ $asset_conditions['maintenance']['percentage'] }}%</td>
        </tr>
    </table>
    <br/>

    <!-- SECTION 3: STATISTIK PER KATEGORI BARANG -->
    <table border="1">
        <tr>
            <td colspan="8" class="section-header">SECTION 3 &mdash; STATISTIK PER KATEGORI BARANG</td>
        </tr>
        <tr>
            <th class="th-cell">No</th>
            <th class="th-left">Nama Kategori</th>
            <th class="th-cell">Total Model Barang</th>
            <th class="th-cell">Total Unit Fisik</th>
            <th class="th-cell">Unit Tersedia</th>
            <th class="th-cell">Unit Dipinjam</th>
            <th class="th-cell">Unit Maintenance</th>
            <th class="th-cell">Frekuensi &amp; Pangsa Pinjam</th>
        </tr>
        @forelse($category_stats as $idx => $cat)
        <tr class="{{ $loop->last ? 'section-bottom-row' : '' }}">
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center td-bold">{{ $idx + 1 }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-bold">{{ $cat['nama_kategori'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $cat['total_barang'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center td-bold">{{ $cat['total_unit'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $cat['unit_tersedia'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $cat['unit_dipinjam'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $cat['unit_maintenance'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center td-bold">{{ $cat['frekuensi_pinjam'] }} kali ({{ $cat['persentase_utilisasi'] }}%)</td>
        </tr>
        @empty
        <tr class="section-bottom-row">
            <td colspan="8" class="td-cell td-center">Belum ada data kategori barang</td>
        </tr>
        @endforelse
    </table>
    <br/>

    <!-- SECTION 4: UTILISASI ASET -->
    <table border="1">
        <tr>
            <td colspan="8" class="section-header">SECTION 4 &mdash; UTILISASI ASET (BARANG PALING SERING DIPINJAM)</td>
        </tr>
        <tr>
            <th class="th-cell">No</th>
            <th class="th-left">Nama Barang</th>
            <th class="th-cell">Kode Barang</th>
            <th class="th-left">Kategori</th>
            <th class="th-left">Lokasi Simpan</th>
            <th class="th-cell">Total Unit</th>
            <th class="th-cell">Unit Dipinjam</th>
            <th class="th-cell">Frekuensi Peminjaman</th>
        </tr>
        @forelse($asset_utilization as $idx => $asset)
        <tr class="{{ $loop->last ? 'section-bottom-row' : '' }}">
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center td-bold">{{ $idx + 1 }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-bold">{{ $asset['nama_barang'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $asset['kode_barang'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }}">{{ $asset['kategori'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }}">{{ $asset['lokasi'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $asset['total_unit'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $asset['active_borrowed'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center td-bold">{{ $asset['frekuensi_pinjam'] }} kali ({{ $asset['persentase_utilisasi'] }}%)</td>
        </tr>
        @empty
        <tr class="section-bottom-row">
            <td colspan="8" class="td-cell td-center">Belum ada data utilisasi barang</td>
        </tr>
        @endforelse
    </table>
    <br/>

    <!-- SECTION 5: REKAP LOGBOOK PEMINJAMAN & PENGEMBALIAN -->
    <table border="1">
        <tr>
            <td colspan="12" class="section-header">SECTION 5 &mdash; REKAP LOGBOOK PEMINJAMAN &amp; PENGEMBALIAN LENGKAP</td>
        </tr>
        <tr>
            <th class="th-cell">No</th>
            <th class="th-left">Peminjam / Teknisi</th>
            <th class="th-cell">NIP / Identitas</th>
            <th class="th-left">Nama Barang</th>
            <th class="th-cell">Kode Barang</th>
            <th class="th-cell">Kode Unit</th>
            <th class="th-left">Kategori</th>
            <th class="th-cell">Waktu Pinjam</th>
            <th class="th-cell">Waktu Kembali</th>
            <th class="th-cell">Durasi</th>
            <th class="th-cell">Status Transaksi</th>
            <th class="th-cell">Kondisi &amp; Ketepatan Waktu</th>
        </tr>
        @forelse($logbooks as $idx => $log)
        <tr class="{{ $loop->last ? 'section-bottom-row' : '' }}">
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center td-bold">{{ $idx + 1 }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-bold">{{ $log['user_nama'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $log['user_nip'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-bold">{{ $log['nama_barang'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $log['kode_barang'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center td-bold">{{ $log['kode_unit'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }}">{{ $log['kategori'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $log['tanggal_pinjam_formatted'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $log['tanggal_kembali_formatted'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $log['durasi'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} {{ $log['status_transaksi'] === 'dikembalikan' ? 'status-ok' : ($log['is_terlambat'] ? 'status-err' : 'status-warn') }}">
                {{ ucfirst(str_replace('_', ' ', $log['status_transaksi'])) }}
            </td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">
                Kondisi: {{ ucfirst($log['kondisi_kembali']) }} | {{ $log['is_terlambat'] ? 'Terlambat' : 'Tepat Waktu' }}
            </td>
        </tr>
        @empty
        <tr class="section-bottom-row">
            <td colspan="12" class="td-cell td-center">Tidak ada data transaksi pada periode ini</td>
        </tr>
        @endforelse
    </table>
    <br/>

    <!-- SECTION 6: LAPORAN PEMELIHARAAN & UNIT RUSAK -->
    <table border="1">
        <tr>
            <td colspan="9" class="section-header">SECTION 6 &mdash; LAPORAN PEMELIHARAAN &amp; UNIT KONDISI RUSAK</td>
        </tr>
        <tr>
            <th class="th-cell">No</th>
            <th class="th-cell">Kode Unit</th>
            <th class="th-left">Nama Barang</th>
            <th class="th-left">Kategori</th>
            <th class="th-cell">Status Unit</th>
            <th class="th-cell">Kondisi Fisik</th>
            <th class="th-cell">Terakhir Update</th>
            <th class="th-left">Pelapor / Pengguna Terakhir</th>
            <th class="th-left">Catatan Teknis</th>
        </tr>
        @forelse($maintenance_reports as $idx => $m)
        <tr class="{{ $loop->last ? 'section-bottom-row' : '' }}">
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center td-bold">{{ $idx + 1 }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center td-bold">{{ $m['kode_unit'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-bold">{{ $m['nama_barang'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }}">{{ $m['kategori'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} status-warn">{{ ucfirst($m['status']) }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} {{ $m['kondisi'] === 'baik' ? 'status-ok' : 'status-err' }}">{{ ucfirst($m['kondisi']) }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }} td-center">{{ $m['tanggal_update'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }}">{{ $m['pelapor_terakhir'] }}</td>
            <td class="{{ $idx % 2 === 0 ? 'td-cell' : 'td-alt' }}">{{ $m['catatan'] }}</td>
        </tr>
        @empty
        <tr class="section-bottom-row">
            <td colspan="9" class="td-cell status-ok">Seluruh unit fisik dalam kondisi baik dan siap digunakan.</td>
        </tr>
        @endforelse
    </table>
</body>
</html>
