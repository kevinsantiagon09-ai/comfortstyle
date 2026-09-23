<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();

            $table->uuid('uuid')
                ->unique()
                ->default(DB::raw('gen_random_uuid()'));

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('role_id')
                ->constrained('roles')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->timestamp('assigned_at')
                ->useCurrent();

            $table->unique(
                ['user_id', 'role_id'],
                'user_roles_user_role_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
    }
};
