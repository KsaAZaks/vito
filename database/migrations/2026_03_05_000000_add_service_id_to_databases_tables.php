<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('databases', function (Blueprint $table): void {
            $table->unsignedBigInteger('service_id')->nullable()->after('server_id');
            $table->foreign('service_id')->references('id')->on('services')->nullOnDelete();
        });

        Schema::table('database_users', function (Blueprint $table): void {
            $table->unsignedBigInteger('service_id')->nullable()->after('server_id');
            $table->foreign('service_id')->references('id')->on('services')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('databases', function (Blueprint $table): void {
            $table->dropForeign(['service_id']);
            $table->dropColumn('service_id');
        });

        Schema::table('database_users', function (Blueprint $table): void {
            $table->dropForeign(['service_id']);
            $table->dropColumn('service_id');
        });
    }
};
