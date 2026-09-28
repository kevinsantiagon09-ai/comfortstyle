<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        // DIVIPOLA: https://www.datos.gov.co/resource/gdxc-w37w.json (2026-09-28).
        $locations = json_decode(file_get_contents(database_path('seeders/data/colombia-locations.json')), true, flags: JSON_THROW_ON_ERROR);
        DB::transaction(function () use ($locations): void {
            $departments = [];
            foreach ($locations as $location) {
                $code = $location['cod_dpto'];
                if (! isset($departments[$code])) {
                    $departments[$code] = Department::updateOrCreate(['code' => $code], ['name' => $location['dpto']])->id;
                }
                City::updateOrCreate(['code' => $location['cod_mpio']], ['department_id' => $departments[$code], 'name' => $location['nom_mpio']]);
            }
        });
    }
}
