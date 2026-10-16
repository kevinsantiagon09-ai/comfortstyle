<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * user_id nulo = tipo global del administrador; con valor = tipo privado de ese anfitrión.
     */
    public function up(): void
    {
        Schema::table('property_types', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();
            $table->dropUnique(['name']);
            $table->unique(['user_id', 'name']);
        });

        // En el unique compuesto un user_id nulo no se compara, así que los globales necesitan su propio índice.
        DB::statement('CREATE UNIQUE INDEX property_types_global_name_unique ON property_types (name) WHERE user_id IS NULL');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX property_types_global_name_unique');

        Schema::table('property_types', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'name']);
            $table->dropConstrainedForeignId('user_id');
            $table->unique('name');
        });
    }
};
