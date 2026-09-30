<?php

namespace App\Services\Properties;

use App\Models\Property;
use App\Models\PropertyPanorama;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class PropertyPanoramaService
{
    /** Límite de espacios por recorrido; cada foto 360° pesa varios MB. */
    public const MAX_PANORAMAS = 10;

    public function getByProperty(Property $property): Collection
    {
        return $property->panoramas()->get();
    }

    /**
     * Guarda la foto y su vista previa y las agrega al final del recorrido.
     * Si el registro falla, los archivos subidos se eliminan.
     */
    public function create(array $data): PropertyPanorama
    {
        $folder = "properties/{$data['property_id']}/panoramas";
        $paths = [
            $path = $data['image']->store($folder, 'public'),
            $previewPath = $data['preview']->store($folder, 'public'),
        ];

        try {
            return DB::transaction(function () use ($data, $path, $previewPath): PropertyPanorama {
                $property = Property::whereKey($data['property_id'])->lockForUpdate()->firstOrFail();
                $count = $property->panoramas()->count();

                if ($count >= self::MAX_PANORAMAS) {
                    throw ValidationException::withMessages([
                        'image' => 'El recorrido admite máximo '.self::MAX_PANORAMAS.' espacios.',
                    ]);
                }

                return $property->panoramas()->create([
                    'title' => $data['title'],
                    'image_path' => $path,
                    'preview_path' => $previewPath,
                    'display_order' => ($property->panoramas()->max('display_order') ?? -1) + 1,
                ]);
            });
        } catch (Throwable $exception) {
            Storage::disk('public')->delete($paths);

            throw $exception;
        }
    }

    public function delete(PropertyPanorama $panorama): void
    {
        $paths = [$panorama->image_path, $panorama->preview_path];
        $panorama->delete();
        Storage::disk('public')->delete($paths);
    }
}
