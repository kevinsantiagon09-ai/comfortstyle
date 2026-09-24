<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'uuid' => \Illuminate\Support\Str::uuid(),
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone_number' => '123-456-7890',
                'address' => '123 Main St',
                'city' => 'Anytown',
                'status_id' => 1,
            ],
        ]);
    }
}
