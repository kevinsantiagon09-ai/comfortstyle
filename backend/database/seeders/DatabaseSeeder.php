<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Sin WithoutModelEvents: los modelos generan su uuid en el evento creating.
     */
    public function run(): void
    {
        $this->call([
            LocationSeeder::class,
            RoleSeeder::class,
            EstadoSeeder::class,
            AmenitySeeder::class,
            AdminUserSeeder::class,
        ]);
    }
}
