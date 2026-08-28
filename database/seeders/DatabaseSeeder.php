<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admins
        $admin = User::firstOrCreate(
            ['email' => 'admin@wams.test'],
            [
                'nama' => 'Administrator Workshop',
                'nip' => '198501012010011001',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // 2. Create Regular Users
        $user1 = User::firstOrCreate(
            ['email' => 'teknisi1@wams.test'],
            [
                'nama' => 'Budi Pratama',
                'nip' => '199503152020011002',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );

        $user2 = User::firstOrCreate(
            ['email' => 'teknisi2@wams.test'],
            [
                'nama' => 'Siti Nurhaliza',
                'nip' => '199607202021022003',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );

        // 3. Create 3 Kategori Barang: Perkakas, Elektronik, Komponen
        $kategori1 = KategoriBarang::create([
            'nama_kategori' => 'Perkakas',
            'qr_code' => '/scan/kategori/1',
        ]);

        $kategori2 = KategoriBarang::create([
            'nama_kategori' => 'Elektronik',
            'qr_code' => '/scan/kategori/2',
        ]);

        $kategori3 = KategoriBarang::create([
            'nama_kategori' => 'Komponen',
            'qr_code' => '/scan/kategori/3',
        ]);

        // 4. Create Master Barang
        // Kategori 1: Perkakas
        $barang1 = Barang::create([
            'kategori_id' => $kategori1->id,
            'nama_barang' => 'Obeng Plus & Minus Set',
            'kode_barang' => 'OBG-001',
            'detail_spesifikasi' => 'Set obeng presisi chrome vanadium magnetic tip 6 pcs',
            'lokasi' => 'Rak A-01',
            'gambar' => null,
        ]);

        $barang2 = Barang::create([
            'kategori_id' => $kategori1->id,
            'nama_barang' => 'Kunci Pas Ring Set (8-24mm)',
            'kode_barang' => 'KPR-002',
            'detail_spesifikasi' => 'Combination wrench set 14 pcs finishing satin drop forged',
            'lokasi' => 'Rak A-02',
            'gambar' => null,
        ]);

        $barang3 = Barang::create([
            'kategori_id' => $kategori1->id,
            'nama_barang' => 'Mesin Bor Cordless 18V',
            'kode_barang' => 'BOR-101',
            'detail_spesifikasi' => 'Brushless cordless drill driver max torque 50Nm + 2 baterai',
            'lokasi' => 'Lemari B-01',
            'gambar' => null,
        ]);

        // Kategori 2: Elektronik
        $barang4 = Barang::create([
            'kategori_id' => $kategori2->id,
            'nama_barang' => 'Digital Multimeter Auto-range',
            'kode_barang' => 'DMM-201',
            'detail_spesifikasi' => 'True RMS 6000 counts AC/DC voltage current resistance tester',
            'lokasi' => 'Lemari C-01',
            'gambar' => null,
        ]);

        $barang5 = Barang::create([
            'kategori_id' => $kategori2->id,
            'nama_barang' => 'Solder Station Temperature Control 60W',
            'kode_barang' => 'SLD-202',
            'detail_spesifikasi' => 'Adjustable temperature 200-480C with ceramic heating core',
            'lokasi' => 'Meja Kerja E-01',
            'gambar' => null,
        ]);

        $barang6 = Barang::create([
            'kategori_id' => $kategori2->id,
            'nama_barang' => 'Digital Storage Oscilloscope 100MHz',
            'kode_barang' => 'OSC-203',
            'detail_spesifikasi' => 'Dual channel 1GSa/s real time sample rate with 7 inch TFT LCD',
            'lokasi' => 'Laboratorium E-02',
            'gambar' => null,
        ]);

        // Kategori 3: Komponen
        $barang7 = Barang::create([
            'kategori_id' => $kategori3->id,
            'nama_barang' => 'Arduino Uno R3 Development Board',
            'kode_barang' => 'ARD-301',
            'detail_spesifikasi' => 'Microcontroller ATmega328P 5V operating voltage 14 digital I/O pins',
            'lokasi' => 'Laci Komponen D-01',
            'gambar' => null,
        ]);

        $barang8 = Barang::create([
            'kategori_id' => $kategori3->id,
            'nama_barang' => 'ESP32 Wi-Fi + Bluetooth IoT Module',
            'kode_barang' => 'ESP-302',
            'detail_spesifikasi' => 'Dual core 240MHz 4MB Flash memory with antenna module',
            'lokasi' => 'Laci Komponen D-02',
            'gambar' => null,
        ]);

        // 5. Create Unit Fisik (barang_unit)
        // Unit Obeng (4 unit: 2 tersedia, 1 dipinjam, 1 maintenance)
        $unit1 = BarangUnit::create(['barang_id' => $barang1->id, 'kode_unit' => 'OBG-001-01', 'status' => 'tersedia', 'kondisi' => 'baik']);
        $unit2 = BarangUnit::create(['barang_id' => $barang1->id, 'kode_unit' => 'OBG-001-02', 'status' => 'dipinjam', 'kondisi' => 'baik']);
        $unit3 = BarangUnit::create(['barang_id' => $barang1->id, 'kode_unit' => 'OBG-001-03', 'status' => 'tersedia', 'kondisi' => 'baik']);
        $unit4 = BarangUnit::create(['barang_id' => $barang1->id, 'kode_unit' => 'OBG-001-04', 'status' => 'maintenance', 'kondisi' => 'rusak']);

        // Unit Kunci Pas Ring (3 unit: 2 tersedia, 1 dipinjam)
        $unit5 = BarangUnit::create(['barang_id' => $barang2->id, 'kode_unit' => 'KPR-002-01', 'status' => 'tersedia', 'kondisi' => 'baik']);
        $unit6 = BarangUnit::create(['barang_id' => $barang2->id, 'kode_unit' => 'KPR-002-02', 'status' => 'dipinjam', 'kondisi' => 'baik']);
        $unit7 = BarangUnit::create(['barang_id' => $barang2->id, 'kode_unit' => 'KPR-002-03', 'status' => 'tersedia', 'kondisi' => 'baik']);

        // Unit Bor Cordless (3 unit: 2 tersedia, 1 dipinjam)
        $unit8 = BarangUnit::create(['barang_id' => $barang3->id, 'kode_unit' => 'BOR-101-01', 'status' => 'tersedia', 'kondisi' => 'baik']);
        $unit9 = BarangUnit::create(['barang_id' => $barang3->id, 'kode_unit' => 'BOR-101-02', 'status' => 'dipinjam', 'kondisi' => 'baik']);
        $unit10 = BarangUnit::create(['barang_id' => $barang3->id, 'kode_unit' => 'BOR-101-03', 'status' => 'tersedia', 'kondisi' => 'baik']);

        // Unit Multimeter (2 unit: 2 tersedia)
        $unit11 = BarangUnit::create(['barang_id' => $barang4->id, 'kode_unit' => 'DMM-201-01', 'status' => 'tersedia', 'kondisi' => 'baik']);
        $unit12 = BarangUnit::create(['barang_id' => $barang4->id, 'kode_unit' => 'DMM-201-02', 'status' => 'tersedia', 'kondisi' => 'baik']);

        // Unit Solder Station (2 unit: 1 tersedia, 1 maintenance)
        $unit13 = BarangUnit::create(['barang_id' => $barang5->id, 'kode_unit' => 'SLD-202-01', 'status' => 'tersedia', 'kondisi' => 'baik']);
        $unit14 = BarangUnit::create(['barang_id' => $barang5->id, 'kode_unit' => 'SLD-202-02', 'status' => 'maintenance', 'kondisi' => 'rusak']);

        // Unit Osiloskop (2 unit: 2 tersedia)
        $unit15 = BarangUnit::create(['barang_id' => $barang6->id, 'kode_unit' => 'OSC-203-01', 'status' => 'tersedia', 'kondisi' => 'baik']);
        $unit16 = BarangUnit::create(['barang_id' => $barang6->id, 'kode_unit' => 'OSC-203-02', 'status' => 'tersedia', 'kondisi' => 'baik']);

        // Unit Arduino Uno (4 unit: 3 tersedia, 1 dipinjam)
        $unit17 = BarangUnit::create(['barang_id' => $barang7->id, 'kode_unit' => 'ARD-301-01', 'status' => 'tersedia', 'kondisi' => 'baik']);
        $unit18 = BarangUnit::create(['barang_id' => $barang7->id, 'kode_unit' => 'ARD-301-02', 'status' => 'dipinjam', 'kondisi' => 'baik']);
        $unit19 = BarangUnit::create(['barang_id' => $barang7->id, 'kode_unit' => 'ARD-301-03', 'status' => 'tersedia', 'kondisi' => 'baik']);
        $unit20 = BarangUnit::create(['barang_id' => $barang7->id, 'kode_unit' => 'ARD-301-04', 'status' => 'tersedia', 'kondisi' => 'baik']);

        // Unit ESP32 (3 unit: 3 tersedia)
        $unit21 = BarangUnit::create(['barang_id' => $barang8->id, 'kode_unit' => 'ESP-302-01', 'status' => 'tersedia', 'kondisi' => 'baik']);
        $unit22 = BarangUnit::create(['barang_id' => $barang8->id, 'kode_unit' => 'ESP-302-02', 'status' => 'tersedia', 'kondisi' => 'baik']);
        $unit23 = BarangUnit::create(['barang_id' => $barang8->id, 'kode_unit' => 'ESP-302-03', 'status' => 'tersedia', 'kondisi' => 'baik']);

        // 6. Create Logbook Transaksi
        Logbook::create([
            'user_id' => $user1->id,
            'barang_unit_id' => $unit2->id,
            'tanggal_pinjam' => now()->subHours(4),
            'tanggal_kembali' => null,
            'kondisi_kembali' => null,
            'status_transaksi' => 'dipinjam',
        ]);

        Logbook::create([
            'user_id' => $user2->id,
            'barang_unit_id' => $unit6->id,
            'tanggal_pinjam' => now()->subHours(2),
            'tanggal_kembali' => null,
            'kondisi_kembali' => null,
            'status_transaksi' => 'dipinjam',
        ]);

        Logbook::create([
            'user_id' => $user1->id,
            'barang_unit_id' => $unit9->id,
            'tanggal_pinjam' => now()->subDay(),
            'tanggal_kembali' => null,
            'kondisi_kembali' => null,
            'status_transaksi' => 'dipinjam',
        ]);

        Logbook::create([
            'user_id' => $user2->id,
            'barang_unit_id' => $unit18->id,
            'tanggal_pinjam' => now()->subHours(5),
            'tanggal_kembali' => null,
            'kondisi_kembali' => null,
            'status_transaksi' => 'dipinjam',
        ]);

        Logbook::create([
            'user_id' => $user1->id,
            'barang_unit_id' => $unit1->id,
            'tanggal_pinjam' => now()->subDays(3),
            'tanggal_kembali' => now()->subDays(2),
            'kondisi_kembali' => 'baik',
            'status_transaksi' => 'dikembalikan',
        ]);

        Logbook::create([
            'user_id' => $user2->id,
            'barang_unit_id' => $unit4->id,
            'tanggal_pinjam' => now()->subDays(5),
            'tanggal_kembali' => now()->subDays(4),
            'kondisi_kembali' => 'rusak',
            'status_transaksi' => 'dikembalikan',
        ]);
    }
}
