<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Columna nueva, nullable por ahora porque las filas existentes aún no tienen valor.
        Schema::table('properties', function (Blueprint $table) {
            $table->foreignId('property_type_id')
                ->nullable()
                ->constrained('property_types')
                ->restrictOnDelete();
        });

        // 2) Pasa los textos existentes al catálogo y enlaza cada propiedad.
        DB::table('properties')
            ->distinct()
            ->pluck('property_type')
            ->each(function (string $name) {
                $typeId = DB::table('property_types')
                    ->whereRaw('lower(name) = ?', [mb_strtolower($name)])
                    ->value('id')
                    ?? DB::table('property_types')->insertGetId([
                        'uuid' => (string) Str::uuid(),
                        'name' => $name,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                DB::table('properties')
                    ->where('property_type', $name)
                    ->update(['property_type_id' => $typeId]);
            });

        // 3) Ya todas tienen tipo: se vuelve obligatoria y se elimina el texto viejo.
        Schema::table('properties', function (Blueprint $table) {
            $table->unsignedBigInteger('property_type_id')->nullable(false)->change();
            $table->dropColumn('property_type');
            $table->index('property_type_id');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->string('property_type', 50)->nullable();
        });

        DB::statement('
            UPDATE properties p
            SET property_type = t.name
            FROM property_types t
            WHERE t.id = p.property_type_id
        ');

        Schema::table('properties', function (Blueprint $table) {
            $table->dropConstrainedForeignId('property_type_id');
        });
    }
};

