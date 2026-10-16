<?php

namespace Database\Seeders;

use App\Models\PropertyType;
use Illuminate\Database\Seeder;

class PropertyTypeSeeder extends Seeder
{
    /**
     * Tipos iniciales. Solo se crean si no existen: después los administra
     * el SYSTEM_ADMIN desde el panel, y volver a sembrar no pisa sus cambios.
     *
     * [nombre, icono de lucide.dev]
     */
    private const TYPES = [
        ['Casa', 'house'],
        ['Apartamento', 'building'],
        ['Cabaña', 'tent-tree'],
        ['Habitación', 'bed'],
        ['Finca', 'tractor'],
        ['Casa Quinta', 'trees'],
    ];

    public function run(): void
    {
        foreach (self::TYPES as [$name, $icon]) {
            $exists = PropertyType::withTrashed()
                ->whereRaw('lower(name) = ?', [mb_strtolower($name)])
                ->exists();

            if (! $exists) {
                PropertyType::create(['name' => $name, 'icon' => $icon]);
            }
        }
    }
}
