<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('barang', 'tipe')) {
            Schema::table('barang', function (Blueprint $table) {
                $table->enum('tipe', ['aset', 'habis_pakai'])->default('aset')->after('kategori_id');
            });

            // Sinkronkan tipe barang yang sudah ada berdasarkan tipe kategorinya
            if (Schema::hasColumn('kategori_barang', 'tipe')) {
                DB::statement("
                    UPDATE barang b
                    INNER JOIN kategori_barang k ON b.kategori_id = k.id
                    SET b.tipe = k.tipe
                    WHERE k.tipe IN ('aset', 'habis_pakai')
                ");
            }
        }

        if (!Schema::hasColumn('logbook', 'foto_pinjam')) {
            Schema::table('logbook', function (Blueprint $table) {
                $table->string('foto_pinjam')->nullable()->after('keperluan');
            });
        }

        if (Schema::hasTable('guest_otps') && !Schema::hasColumn('guest_otps', 'foto_pinjam')) {
            Schema::table('guest_otps', function (Blueprint $table) {
                $table->string('foto_pinjam')->nullable()->after('durasi_menit');
                $table->text('keperluan')->nullable()->after('foto_pinjam');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('barang', 'tipe')) {
            Schema::table('barang', function (Blueprint $table) {
                $table->dropColumn('tipe');
            });
        }

        if (Schema::hasColumn('logbook', 'foto_pinjam')) {
            Schema::table('logbook', function (Blueprint $table) {
                $table->dropColumn('foto_pinjam');
            });
        }

        if (Schema::hasTable('guest_otps') && Schema::hasColumn('guest_otps', 'foto_pinjam')) {
            Schema::table('guest_otps', function (Blueprint $table) {
                $table->dropColumn(['foto_pinjam', 'keperluan']);
            });
        }
    }
};
