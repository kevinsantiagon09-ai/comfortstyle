<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Las comodidades pasan a ser un catálogo compartido: un alojamiento tiene muchas
 * comodidades y cada comodidad puede estar en muchos alojamientos.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('amenities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('property_id');
        });

        Schema::create('amenity_property', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->foreignId('amenity_id')->constrained('amenities')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['property_id', 'amenity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('amenity_property');

        Schema::table('amenities', function (Blueprint $table) {
            $table->foreignId('property_id')->nullable()->constrained('properties')->cascadeOnDelete();
        });
    }
};
