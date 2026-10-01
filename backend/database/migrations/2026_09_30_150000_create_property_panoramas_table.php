<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fotos 360° (equirectangulares, proporción 2:1) del recorrido virtual.
 * Cada panorama es un espacio del alojamiento; el de menor display_order abre el recorrido.
 * preview_path es una copia liviana (1024×512) que genera el navegador del anfitrión para las vistas previas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_panoramas', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->string('title', 100);
            $table->string('image_path');
            $table->string('preview_path');
            $table->unsignedSmallInteger('display_order')->default(0);
            $table->timestamps();

            $table->index(['property_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_panoramas');
    }
};
