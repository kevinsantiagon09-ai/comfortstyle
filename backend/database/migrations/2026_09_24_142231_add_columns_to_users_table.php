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
        Schema::table('users', function (Blueprint $table) {

            $table->uuid('uuid')
    ->nullable()
    ->unique()
    ->after('id');

            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->foreignId('status_id')
                ->nullable()
                ->constrained('estados')
                ->nullOnDelete();
            $table->softDeletes();

            // Usuario activo/inactivo + soft delete
            $table->index(
                ['status_id', 'deleted_at'],
                'users_status_deleted_index'
            );

            // Búsqueda/ordenamiento por apellido y nombre
            $table->index(
                ['last_name', 'first_name'],
                'users_name_index'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            // Primero eliminamos los índices
            $table->dropIndex('users_status_deleted_index');
            $table->dropIndex('users_name_index');

            // Luego la relación
            $table->dropForeign(['status_id']);

            // Finalmente las columnas
            $table->dropColumn([
                'uuid',
                'first_name',
                'last_name',
                'phone_number',
                'address',
                'city',
                'status_id',
                'deleted_at',
            ]);
        });
    }
};