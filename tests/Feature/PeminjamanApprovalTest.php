<?php

namespace Tests\Feature;

use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PeminjamanApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $admin;
    protected KategoriBarang $kategori;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'nama' => 'User Teknisi',
            'email' => 'user@wams.test',
            'role' => 'user',
            'password' => bcrypt('password'),
        ]);

        $this->admin = User::factory()->create([
            'nama' => 'Admin Workshop',
            'email' => 'admin@wams.test',
            'role' => 'admin',
            'password' => bcrypt('password'),
        ]);

        $this->kategori = KategoriBarang::create([
            'nama_kategori' => 'Peralatan Khusus',
        ]);
    }

    public function test_regular_item_borrow_is_immediately_approved(): void
    {
        $barang = Barang::create([
            'kategori_id' => $this->kategori->id,
            'nama_barang' => 'Obeng Set',
            'kode_barang' => 'OBG-001',
            'perlu_persetujuan' => false,
        ]);

        $unit = BarangUnit::create([
            'barang_id' => $barang->id,
            'kode_unit' => 'OBG-001-01',
            'status' => 'tersedia',
            'kondisi' => 'baik',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/peminjaman', [
            'barang_id' => $barang->id,
            'barang_unit_id' => $unit->id,
            'keperluan' => 'Perbaikan panel',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status_transaksi' => 'dipinjam',
                    'requires_approval' => false,
                ],
            ]);

        $this->assertDatabaseHas('logbook', [
            'user_id' => $this->user->id,
            'barang_unit_id' => $unit->id,
            'status_transaksi' => 'dipinjam',
            'keperluan' => 'Perbaikan panel',
        ]);

        $this->assertEquals('dipinjam', $unit->fresh()->status);
    }

    public function test_specific_item_borrow_requires_admin_approval_and_reserves_unit(): void
    {
        $barang = Barang::create([
            'kategori_id' => $this->kategori->id,
            'nama_barang' => 'Laser Cutter Industrial',
            'kode_barang' => 'LSR-001',
            'perlu_persetujuan' => true,
        ]);

        $unit = BarangUnit::create([
            'barang_id' => $barang->id,
            'kode_unit' => 'LSR-001-01',
            'status' => 'tersedia',
            'kondisi' => 'baik',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/peminjaman', [
            'barang_id' => $barang->id,
            'barang_unit_id' => $unit->id,
            'keperluan' => 'Pemotongan akrilik proyek tugas akhir',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status_transaksi' => 'menunggu_persetujuan',
                    'requires_approval' => true,
                ],
            ]);

        $this->assertDatabaseHas('logbook', [
            'user_id' => $this->user->id,
            'barang_unit_id' => $unit->id,
            'status_transaksi' => 'menunggu_persetujuan',
            'keperluan' => 'Pemotongan akrilik proyek tugas akhir',
        ]);

        // Unit fisik harus tereservasi sehingga tidak bisa dipinjam user lain
        $this->assertEquals('menunggu_persetujuan', $unit->fresh()->status);
    }

    public function test_admin_can_approve_pending_loan(): void
    {
        $barang = Barang::create([
            'kategori_id' => $this->kategori->id,
            'nama_barang' => 'Drone Survey DJI',
            'kode_barang' => 'DRN-001',
            'perlu_persetujuan' => true,
        ]);

        $unit = BarangUnit::create([
            'barang_id' => $barang->id,
            'kode_unit' => 'DRN-001-01',
            'status' => 'menunggu_persetujuan',
            'kondisi' => 'baik',
        ]);

        $logbook = Logbook::create([
            'user_id' => $this->user->id,
            'barang_unit_id' => $unit->id,
            'status_transaksi' => 'menunggu_persetujuan',
            'keperluan' => 'Pemetaan kontur tanah',
            'tanggal_pinjam' => now(),
        ]);

        $response = $this->actingAs($this->admin)->post("/admin/peminjaman/{$logbook->id}/approve");

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $logbook->refresh();
        $this->assertEquals('dipinjam', $logbook->status_transaksi);
        $this->assertEquals($this->admin->id, $logbook->disetujui_oleh);
        $this->assertNotNull($logbook->tanggal_approval);

        $this->assertEquals('dipinjam', $unit->fresh()->status);
    }

    public function test_admin_can_reject_pending_loan_with_reason(): void
    {
        $barang = Barang::create([
            'kategori_id' => $this->kategori->id,
            'nama_barang' => 'Drone Survey DJI',
            'kode_barang' => 'DRN-001',
            'perlu_persetujuan' => true,
        ]);

        $unit = BarangUnit::create([
            'barang_id' => $barang->id,
            'kode_unit' => 'DRN-001-01',
            'status' => 'menunggu_persetujuan',
            'kondisi' => 'baik',
        ]);

        $logbook = Logbook::create([
            'user_id' => $this->user->id,
            'barang_unit_id' => $unit->id,
            'status_transaksi' => 'menunggu_persetujuan',
            'keperluan' => 'Uji coba terbang',
            'tanggal_pinjam' => now(),
        ]);

        $response = $this->actingAs($this->admin)->post("/admin/peminjaman/{$logbook->id}/reject", [
            'alasan_penolakan' => 'Belum memiliki sertifikasi pilot drone.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $logbook->refresh();
        $this->assertEquals('ditolak', $logbook->status_transaksi);
        $this->assertEquals('Belum memiliki sertifikasi pilot drone.', $logbook->alasan_penolakan);
        $this->assertEquals($this->admin->id, $logbook->disetujui_oleh);

        // Unit fisik harus kembali 'tersedia'
        $this->assertEquals('tersedia', $unit->fresh()->status);
    }

    public function test_user_can_cancel_own_pending_loan(): void
    {
        $barang = Barang::create([
            'kategori_id' => $this->kategori->id,
            'nama_barang' => 'Laser Cutter Industrial',
            'kode_barang' => 'LSR-001',
            'perlu_persetujuan' => true,
        ]);

        $unit = BarangUnit::create([
            'barang_id' => $barang->id,
            'kode_unit' => 'LSR-001-01',
            'status' => 'menunggu_persetujuan',
            'kondisi' => 'baik',
        ]);

        $logbook = Logbook::create([
            'user_id' => $this->user->id,
            'barang_unit_id' => $unit->id,
            'status_transaksi' => 'menunggu_persetujuan',
            'keperluan' => 'Proyek dibatalkan',
            'tanggal_pinjam' => now(),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->postJson("/api/peminjaman/{$logbook->id}/batalkan");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $logbook->refresh();
        $this->assertEquals('dibatalkan', $logbook->status_transaksi);

        // Unit fisik kembali tersedia
        $this->assertEquals('tersedia', $unit->fresh()->status);
    }
}
