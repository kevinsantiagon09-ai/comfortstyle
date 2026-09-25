<?php

namespace App\Services\Properties;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PropertyImageService
{
    public function getByProperty(
        Property $property,
        bool $onlyActive = false
    ): Collection {
        return PropertyImage::query()
            ->where('property_id', $property->id)
            ->when($onlyActive, function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy('display_order')
            ->get();
    }

    public function create(array $data): PropertyImage
    {
        $image = $data['image'];

        unset($data['image']);

        $path = $image->store(
            "properties/{$data['property_id']}",
            'public'
        );

        try {
            return DB::transaction(
                function () use ($data, $path): PropertyImage {
                    $propertyId = $data['property_id'];

                    $hasCover = PropertyImage::query()
                        ->where('property_id', $propertyId)
                        ->where('is_cover', true)
                        ->exists();

                    $shouldBeCover =
                        ($data['is_cover'] ?? false)
                        || !$hasCover;

                    if ($shouldBeCover) {
                        PropertyImage::query()
                            ->where('property_id', $propertyId)
                            ->update([
                                'is_cover' => false,
                            ]);
                    }

                    if (!array_key_exists(
                        'display_order',
                        $data
                    )) {
                        $data['display_order'] =
                            PropertyImage::query()
                                ->where(
                                    'property_id',
                                    $propertyId
                                )
                                ->max('display_order') + 1;
                    }

                    $data['image_path'] = $path;
                    $data['is_cover'] = $shouldBeCover;

                    return PropertyImage::create($data)
                        ->load('property');
                }
            );
        } catch (Throwable $exception) {
            Storage::disk('public')->delete($path);

            throw $exception;
        }
    }

    public function find(
        PropertyImage $propertyImage
    ): PropertyImage {
        return $propertyImage->load('property');
    }

    public function update(
        PropertyImage $propertyImage,
        array $data
    ): PropertyImage {
        $oldPath = $propertyImage->image_path;
        $newPath = null;

        if (array_key_exists('image', $data)) {
            $newImage = $data['image'];

            unset($data['image']);

            $propertyId = $data['property_id']
                ?? $propertyImage->property_id;

            $newPath = $newImage->store(
                "properties/{$propertyId}",
                'public'
            );

            $data['image_path'] = $newPath;
        }

        try {
            $updatedImage = DB::transaction(
                function () use (
                    $propertyImage,
                    $data
                ): PropertyImage {
                    $propertyId = $data['property_id']
                        ?? $propertyImage->property_id;

                    if (($data['is_cover'] ?? false) === true) {
                        PropertyImage::query()
                            ->where('property_id', $propertyId)
                            ->whereKeyNot($propertyImage->id)
                            ->update([
                                'is_cover' => false,
                            ]);
                    }

                    $propertyImage->update($data);

                    return $propertyImage
                        ->fresh()
                        ->load('property');
                }
            );

            if (
                $newPath !== null
                && $oldPath !== null
            ) {
                Storage::disk('public')->delete($oldPath);
            }

            return $updatedImage;
        } catch (Throwable $exception) {
            if ($newPath !== null) {
                Storage::disk('public')->delete($newPath);
            }

            throw $exception;
        }
    }

    public function activate(
        PropertyImage $propertyImage
    ): PropertyImage {
        $propertyImage->update([
            'is_active' => true,
        ]);

        return $propertyImage
            ->fresh()
            ->load('property');
    }

    public function deactivate(
        PropertyImage $propertyImage
    ): PropertyImage {
        $propertyImage->update([
            'is_active' => false,
        ]);

        return $propertyImage
            ->fresh()
            ->load('property');
    }
}