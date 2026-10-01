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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->string('name', 150);
            $table->text('description');
            $table->string('property_type', 50); // Tipo de propiedades tabla  pibote
            $table->string('address', 255);
            $table->foreignId('city_id')->constrained()->restrictOnDelete();
            $table->unsignedSmallInteger('max_guests');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedSmallInteger('bathrooms')->default(1);
            $table->unsignedSmallInteger('bedrooms')->default(1);
            $table->unsignedSmallInteger('beds')->default(1);
            $table->decimal('price', 12, 2);
            $table->string('currency', 3)->default('COP');
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['city_id', 'is_active']);
            $table->index('user_id');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
