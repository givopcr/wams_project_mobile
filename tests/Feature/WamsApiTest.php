<?php

namespace Tests\Feature;

use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WamsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_user_can_login_with_email_or_nip(): void
    {
        // Login by email
        $responseEmail = $this->postJson('/api/login', [
            'login' => 'teknisi1@wams.test',
            'password' => 'password',
        ]);

        $responseEmail->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['user' => ['id', 'nama', 'email', 'role'], 'token'],
            ]);

        // Login by NIP
        $responseNip = $this->postJson('/api/login', [
            'login' => '199503152020011002',
            'password' => 'password',
        ]);

        $responseNip->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_public_can_get_kategori_and_barang(): void
    {
        $responseKat = $this->getJson('/api/kategori');
        $responseKat->assertStatus(200)->assertJson(['success' => true]);

        $kategori = KategoriBarang::first();
        $responseBarang = $this->getJson("/api/kategori/{$kategori->id}/barang");
        $responseBarang->assertStatus(200)->assertJson(['success' => true]);
    }

    public function test_user_can_borrow_available_unit(): void
    {
        $user = User::where('email', 'teknisi1@wams.test')->first();
        $barang = Barang::first();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/peminjaman', [
                'barang_id' => $barang->id,
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('logbook', [
            'user_id' => $user->id,
            'status_transaksi' => 'dipinjam',
        ]);
    }

    public function test_user_can_return_borrowed_unit_as_damaged_and_triggers_maintenance(): void
    {
        $user = User::where('email', 'teknisi1@wams.test')->first();
        $logbook = Logbook::where('user_id', $user->id)->where('status_transaksi', 'dipinjam')->first();
        $unitId = $logbook->barang_unit_id;

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/pengembalian', [
                'logbook_id' => $logbook->id,
                'kondisi_kembali' => 'rusak',
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verifikasi unit berubah menjadi maintenance dan rusak
        $this->assertDatabaseHas('barang_unit', [
            'id' => $unitId,
            'status' => 'maintenance',
            'kondisi' => 'rusak',
        ]);

        // Verifikasi logbook dikembalikan
        $this->assertDatabaseHas('logbook', [
            'id' => $logbook->id,
            'status_transaksi' => 'dikembalikan',
            'kondisi_kembali' => 'rusak',
        ]);
    }

    public function test_regular_user_cannot_access_admin_api(): void
    {
        $user = User::where('email', 'teknisi1@wams.test')->first();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/stats');

        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_stats(): void
    {
        $admin = User::where('email', 'admin@wams.test')->first();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_kategori',
                    'total_barang',
                    'total_unit',
                    'unit_tersedia',
                    'unit_dipinjam',
                    'unit_maintenance',
                ],
            ]);
    }
}
