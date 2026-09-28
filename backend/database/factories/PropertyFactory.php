<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Property> */
class PropertyFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['user_id' => User::factory(), 'city_id' => City::factory(), 'name' => fake()->sentence(3), 'description' => fake()->paragraph(), 'property_type' => 'Casa', 'address' => fake()->streetAddress(), 'max_guests' => 2, 'price' => 150000, 'currency' => 'COP', 'is_active' => true];
    }
}
