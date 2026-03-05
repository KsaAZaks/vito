<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('console_commands', function (Blueprint $table): void {
            $table->id();
            $table->unsignedInteger('site_id');
            $table->unsignedInteger('server_id');
            $table->unsignedBigInteger('user_id');
            $table->text('command');
            $table->unsignedBigInteger('server_log_id')->nullable();
            $table->string('status');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('console_commands');
    }
};
