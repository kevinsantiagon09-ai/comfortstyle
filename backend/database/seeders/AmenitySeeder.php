<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;

class AmenitySeeder extends Seeder
{
    /** [nombre, categoría, icono de lucide.dev] */
    private const AMENITIES = [
        ['WiFi', 'Básicos', 'wifi'],
        ['Agua caliente', 'Básicos', 'shower-head'],
        ['Toallas y ropa de cama', 'Básicos', 'bed-double'],
        ['Aire acondicionado', 'Básicos', 'snowflake'],
        ['Ventilador', 'Básicos', 'fan'],
        ['Cocina', 'Cocina', 'cooking-pot'],
        ['Nevera', 'Cocina', 'refrigerator'],
        ['Microondas', 'Cocina', 'microwave'],
        ['Cafetera', 'Cocina', 'coffee'],
        ['Lavadora', 'Hogar', 'washing-machine'],
        ['Plancha', 'Hogar', 'shirt'],
        ['Zona de trabajo', 'Hogar', 'laptop'],
        ['Televisor', 'Entretenimiento', 'tv'],
        ['Piscina', 'Exteriores', 'waves'],
        ['Jacuzzi', 'Exteriores', 'bath'],
        ['Zona BBQ', 'Exteriores', 'flame'],
        ['Jardín o patio', 'Exteriores', 'trees'],
        ['Balcón', 'Exteriores', 'sunset'],
        ['Parqueadero gratuito', 'Estacionamiento', 'car'],
        ['Se admiten mascotas', 'Políticas', 'paw-print'],
        ['Detector de humo', 'Seguridad', 'alarm-smoke'],
        ['Botiquín', 'Seguridad', 'briefcase-medical'],
        ['Extintor', 'Seguridad', 'fire-extinguisher'],
        ['Cámaras de seguridad exteriores', 'Seguridad', 'cctv'],
    ];

    public function run(): void
    {
        foreach (self::AMENITIES as [$name, $category, $icon]) {
            $amenity = Amenity::withTrashed()->firstOrNew(['name' => $name]);
            $amenity->fill(['category' => $category, 'icon' => $icon, 'is_active' => true]);
            $amenity->deleted_at = null;
            $amenity->save();
        }
    }
}
