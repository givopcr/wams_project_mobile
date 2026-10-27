<?php

namespace Tests\Feature;

use App\Models\Barang;
use App\Models\BarangUnit;
use App\Models\KategoriBarang;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RouteAndSecurityAuditTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $user;
    protected KategoriBarang $kategori;
    protected Barang $barang;
    protected BarangUnit $unit;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'nama' => 'Administrator Utama',
            'email' => 'admin@wams.test',
            'nip' => '19900101',
            'role' => 'admin',
            'password' => bcrypt('password123'),
        ]);

        $this->user = User::factory()->create([
            'nama' => 'Teknisi Workshop',
            'email' => 'teknisi@wams.test',
            'nip' => '20000202',
            'role' => 'user',
            'password' => bcrypt('password123'),
        ]);

        $this->kategori = KategoriBarang::create([
            'nama_kategori' => 'Perkakas',
            'tipe' => 'aset',
        ]);

        $this->barang = Barang::create([
            'kategori_id' => $this->kategori->id,
            'tipe' => 'aset',
            'nama_barang' => 'Mesin Bor',
            'kode_barang' => 'BOR-01',
            'perlu_persetujuan' => false,
        ]);

        $this->unit = BarangUnit::create([
            'barang_id' => $this->barang->id,
            'kode_unit' => 'BOR-01-01',
            'status' => 'tersedia',
            'kondisi' => 'baik',
        ]);
    }

    public function test_role_isolation_between_admin_and_user_portals(): void
    {
        // User biasa mencoba akses halaman Admin -> diarahkan ke dashboard user
        $this->actingAs($this->user)
            ->get('/admin/dashboard')
            ->assertRedirect(route('user.dashboard'));

        // Admin mencoba akses portal Mobile User -> diarahkan ke dashboard admin
        $this->actingAs($this->admin)
            ->get('/user/dashboard')
            ->assertRedirect(route('admin.dashboard'));
    }

    public function test_authenticated_users_cannot_access_login_or_register_routes(): void
    {
        $this->actingAs($this->admin)
            ->get('/login')
            ->assertRedirect('/admin/dashboard');

        $this->actingAs($this->user)
            ->get('/login')
            ->assertRedirect('/user/dashboard');

        $this->actingAs($this->admin)
            ->post('/register', [
                'nama' => 'User Baru',
                'email' => 'baru@wams.test',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertRedirect('/admin/dashboard');
    }

    public function test_admin_scanning_qr_unit_is_redirected_to_admin_barang_instead_of_guest(): void
    {
        $this->actingAs($this->admin)
            ->get('/scan/' . $this->unit->kode_unit)
            ->assertRedirect(route('admin.barang', ['q' => $this->unit->kode_unit]));

        $this->actingAs($this->user)
            ->get('/scan/' . $this->unit->kode_unit)
            ->assertRedirect(route('user.scanner', ['code' => $this->unit->kode_unit]));
    }

    public function test_user_spoofing_nama_as_admin_email_cannot_lock_out_admin_login(): void
    {
        // Buat user dengan ID lebih kecil yang mengubah namanya menjadi email admin
        $spoofUser = User::factory()->create([
            'nama' => 'admin@wams.test',
            'email' => 'spoof@wams.test',
            'role' => 'user',
            'password' => bcrypt('wrongpass'),
        ]);

        $response = $this->postJson('/api/login', [
            'login' => 'admin@wams.test',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.id', $this->admin->id)
            ->assertJsonPath('data.user.role', 'admin');
    }

    public function test_guest_cannot_return_registered_user_loan_or_bypass_token(): void
    {
        $this->unit->update(['status' => 'dipinjam']);
        $logbook = Logbook::create([
            'user_id' => $this->user->id,
            'barang_unit_id' => $this->unit->id,
            'tipe_peminjam' => 'user',
            'tanggal_pinjam' => now(),
            'batas_kembali' => now()->addDays(1),
            'status_transaksi' => 'dipinjam',
            'return_token' => null,
        ]);

        $response = $this->postJson('/guest/return/' . $this->unit->kode_unit, [
            'kondisi' => 'rusak',
            'catatan' => 'Rusak',
            'foto_kondisi' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        ]);

        $response->assertStatus(403);
        $this->assertEquals('dipinjam', $logbook->fresh()->status_transaksi);
        $this->assertEquals('dipinjam', $this->unit->fresh()->status);
    }

    public function test_admin_manual_unit_status_update_closes_active_logbook(): void
    {
        $this->unit->update(['status' => 'dipinjam']);
        $logbook = Logbook::create([
            'user_id' => $this->user->id,
            'barang_unit_id' => $this->unit->id,
            'tipe_peminjam' => 'user',
            'tanggal_pinjam' => now(),
            'batas_kembali' => now()->addDays(1),
            'status_transaksi' => 'dipinjam',
        ]);

        $this->actingAs($this->admin)
            ->put("/admin/unit/{$this->unit->id}", [
                'kode_unit' => $this->unit->kode_unit,
                'status' => 'tersedia',
                'kondisi' => 'baik',
            ])
            ->assertRedirect();

        $this->assertEquals('tersedia', $this->unit->fresh()->status);
        $this->assertEquals('dikembalikan', $logbook->fresh()->status_transaksi);
        $this->assertNotNull($logbook->fresh()->tanggal_kembali);
    }

    public function test_deleting_user_preserves_historical_logbooks_and_releases_active_units(): void
    {
        $this->unit->update(['status' => 'dipinjam']);
        $logbook = Logbook::create([
            'user_id' => $this->user->id,
            'barang_unit_id' => $this->unit->id,
            'tipe_peminjam' => 'user',
            'tanggal_pinjam' => now(),
            'status_transaksi' => 'dipinjam',
        ]);

        $this->actingAs($this->admin)
            ->delete("/admin/users/{$this->user->id}")
            ->assertRedirect(route('admin.users'));

        $this->assertDatabaseMissing('users', ['id' => $this->user->id]);
        $this->assertEquals('tersedia', $this->unit->fresh()->status);

        $logbook->refresh();
        $this->assertEquals('dikembalikan', $logbook->status_transaksi);
        $this->assertEquals('Teknisi Workshop', $logbook->peminjam_nama);
    }

    public function test_future_calendar_schedule_does_not_lock_unit_today(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/calendar/peminjaman', [
                'user_id' => $this->user->id,
                'barang_unit_id' => $this->unit->id,
                'tanggal_pinjam' => now()->addDays(5)->toDateString(),
                'batas_kembali' => now()->addDays(7)->toDateString(),
            ])
            ->assertRedirect();

        // Unit fisik hari ini masih tersedia karena jadwal pinjam baru 5 hari lagi
        $this->assertEquals('tersedia', $this->unit->fresh()->status);
        $this->assertDatabaseHas('logbook', [
            'user_id' => $this->user->id,
            'barang_unit_id' => $this->unit->id,
            'status_transaksi' => 'dipinjam',
        ]);
    }
}
