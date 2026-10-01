<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Reservas de huéspedes. Las fechas son [check_in, check_out): el día de salida queda libre.
 * El precio por noche se copia del alojamiento al reservar para que cambios posteriores no alteren la reserva.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('property_id')->constrained('properties')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete(); // huésped
            $table->date('check_in');
            $table->date('check_out');
            $table->unsignedSmallInteger('guests');
            $table->unsignedSmallInteger('nights');
            $table->decimal('price_per_night', 12, 2);
            $table->decimal('total_price', 14, 2);
            $table->string('currency', 3);
            $table->string('status', 20)->default('CONFIRMADA');
            $table->timestamps();

            $table->index(['property_id', 'check_in', 'check_out']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
