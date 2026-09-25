<?php

use Faker\Core\Uuid;
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
        Schema::create('property_images', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->string('image_path');
            $table->string('caption')->nullable();

            $table->boolean('is_cover')->default(false);
            $table->unsignedSmallInteger('display_order')->default(0);
            $table->boolean('is_active')  ->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['property_id','is_active',]);
            $table->index(['property_id', 'display_order', ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_images');
    }
};
