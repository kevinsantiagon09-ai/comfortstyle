<?php

namespace Database\Seeders;

use App\Models\Estado;
use Illuminate\Database\Seeder;

class EstadoSeeder extends Seeder
{
    private const ESTADOS = [Estado::ACTIVO, 'INACTIVO'];

    public function run(): void
    {
        foreach (self::ESTADOS as $descripcion) {
            $estado = Estado::withTrashed()->firstOrNew(['descripcion' => $descripcion]);
            $estado->is_active = true;
            $estado->deleted_at = null;
            $estado->save();
        }
    }
}
