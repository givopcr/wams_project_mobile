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
            $table->foreignId('user_id')->nullable()->change();
            $table->enum('tipe_peminjam', ['user', 'guest'])->default('user')->after('user_id');
            $table->string('guest_nama')->nullable()->after('tipe_peminjam');
            $table->string('guest_email')->nullable()->after('guest_nama');
            $table->boolean('requires_verification')->default(false)->after('guest_email');
            $table->string('return_token', 64)->nullable()->unique()->after('requires_verification');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('logbook', function (Blueprint $table) {
            $table->dropUnique(['return_token']);
            $table->dropColumn([
                'tipe_peminjam',
                'guest_nama',
                'guest_email',
                'requires_verification',
                'return_token',
            ]);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
