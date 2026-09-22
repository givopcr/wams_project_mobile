<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->string('satuan', 50)->nullable()->after('nama_barang');
            $table->decimal('stok_saat_ini', 10, 2)->default(0)->after('satuan');
            $table->decimal('stok_minimum', 10, 2)->default(0)->after('stok_saat_ini');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn(['satuan', 'stok_saat_ini', 'stok_minimum']);
        });
    }
};
