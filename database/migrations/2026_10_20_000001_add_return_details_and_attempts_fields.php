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
        Schema::table('logbook', function (Blueprint $table) {
            if (!Schema::hasColumn('logbook', 'catatan_kembali')) {
                $table->text('catatan_kembali')->nullable()->after('kondisi_kembali');
            }
            if (!Schema::hasColumn('logbook', 'foto_kembali')) {
                $table->string('foto_kembali')->nullable()->after('catatan_kembali');
            }
        });

        Schema::table('guest_otps', function (Blueprint $table) {
            if (!Schema::hasColumn('guest_otps', 'attempts')) {
                $table->unsignedTinyInteger('attempts')->default(0)->after('is_used');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'plain_password')) {
                $table->string('plain_password')->nullable()->after('password');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logbook', function (Blueprint $table) {
            $cols = [];
            if (Schema::hasColumn('logbook', 'catatan_kembali')) {
                $cols[] = 'catatan_kembali';
            }
            if (Schema::hasColumn('logbook', 'foto_kembali')) {
                $cols[] = 'foto_kembali';
            }
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });

        Schema::table('guest_otps', function (Blueprint $table) {
            if (Schema::hasColumn('guest_otps', 'attempts')) {
                $table->dropColumn('attempts');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'plain_password')) {
                $table->dropColumn('plain_password');
            }
        });
    }
};
