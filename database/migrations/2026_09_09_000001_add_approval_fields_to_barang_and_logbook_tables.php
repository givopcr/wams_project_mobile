<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambah kolom 'perlu_persetujuan' di tabel barang
        Schema::table('barang', function (Blueprint $table) {
            $table->boolean('perlu_persetujuan')->default(false)->after('gambar');
        });

        // 2. Tambah enum status 'menunggu_persetujuan' di tabel barang_unit jika di MySQL
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE barang_unit MODIFY COLUMN status ENUM('tersedia', 'menunggu_persetujuan', 'dipinjam', 'maintenance') NOT NULL DEFAULT 'tersedia'");
            DB::statement("ALTER TABLE logbook MODIFY COLUMN status_transaksi ENUM('menunggu_persetujuan', 'dipinjam', 'dikembalikan', 'ditolak', 'dibatalkan') NOT NULL DEFAULT 'dipinjam'");
        }

        // 3. Tambah field keperluan & approval di tabel logbook
        Schema::table('logbook', function (Blueprint $table) {
            $table->text('keperluan')->nullable()->after('return_token');
            $table->foreignId('disetujui_oleh')->nullable()->after('keperluan')->constrained('users')->nullOnDelete();
            $table->timestamp('tanggal_approval')->nullable()->after('disetujui_oleh');
            $table->text('alasan_penolakan')->nullable()->after('tanggal_approval');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logbook', function (Blueprint $table) {
            $table->dropForeign(['disetujui_oleh']);
            $table->dropColumn([
                'keperluan',
                'disetujui_oleh',
                'tanggal_approval',
                'alasan_penolakan',
            ]);
        });

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE logbook MODIFY COLUMN status_transaksi ENUM('dipinjam', 'dikembalikan') NOT NULL DEFAULT 'dipinjam'");
            DB::statement("ALTER TABLE barang_unit MODIFY COLUMN status ENUM('tersedia', 'dipinjam', 'maintenance') NOT NULL DEFAULT 'tersedia'");
        }

        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn('perlu_persetujuan');
        });
    }
};
