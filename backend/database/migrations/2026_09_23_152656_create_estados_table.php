<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estados', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('codigo', 50);
            $table->string('nombre', 100);
            $table->string('modulo', 50);
            $table->string('descripcion', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(
                ['codigo', 'modulo'],
                'estados_codigo_modulo_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estados');
    }
};