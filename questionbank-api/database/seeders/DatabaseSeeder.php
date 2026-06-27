<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users (Admin and Test User)
        \App\Models\User::create([
            'name' => 'System Admin',
            'email' => 'admin@questionbank.com',
            'password' => bcrypt('Admin@123'),
            'role' => 'admin',
            'preferred_lang' => 'en',
        ]);

        \App\Models\User::create([
            'name' => 'Demo User',
            'email' => 'user@questionbank.com',
            'password' => bcrypt('User@123'),
            'role' => 'user',
            'preferred_lang' => 'en',
        ]);

        // 2. Seed Categories & Subcategories
        $categories = [
            [
                'name' => 'Interview Questions',
                'name_ml' => 'അഭിമുഖ ചോദ്യങ്ങൾ',
                'slug' => 'interview-questions',
                'type' => 'interview',
                'subcategories' => [
                    ['name' => 'Frontend Development', 'name_ml' => 'ഫ്രണ്ട് എൻഡ് ഡെവലപ്മെന്റ്', 'slug' => 'frontend-development'],
                    ['name' => 'Backend Development', 'name_ml' => 'ബാക്ക് എൻഡ് ഡെവലപ്മെന്റ്', 'slug' => 'backend-development'],
                    ['name' => 'Mobile Development', 'name_ml' => 'മൊബൈൽ ഡെവലപ്മെന്റ്', 'slug' => 'mobile-development'],
                    ['name' => 'DevOps & Cloud', 'name_ml' => 'ഡെവോപ്സ് & ക്ലൗഡ്', 'slug' => 'devops-cloud'],
                    ['name' => 'Data Science & AI', 'name_ml' => 'ഡാറ്റാ സയൻസ് & എഐ', 'slug' => 'data-science-ai'],
                ]
            ],
            [
                'name' => 'School Question Bank',
                'name_ml' => 'സ്കൂൾ ചോദ്യ ബാങ്ക്',
                'slug' => 'school-question-bank',
                'type' => 'school',
                'subcategories' => [
                    ['name' => 'Class 10 (SSLC)', 'name_ml' => 'പത്താം ക്ലാസ് (എസ്.എസ്.എൽ.സി)', 'slug' => 'class-10-sslc'],
                    ['name' => 'Class 12 (HSC)', 'name_ml' => 'പ്ലസ് ടു (എച്ച്.എസ്.സി)', 'slug' => 'class-12-hsc'],
                    ['name' => 'Class 9', 'name_ml' => 'ഒൻപതാം ക്ലാസ്', 'slug' => 'class-9'],
                    ['name' => 'Class 8', 'name_ml' => 'എട്ടാം ക്ലാസ്', 'slug' => 'class-8'],
                ]
            ],
            [
                'name' => 'College Question Bank',
                'name_ml' => 'കോളേജ് ചോദ്യ ബാങ്ക്',
                'slug' => 'college-question-bank',
                'type' => 'college',
                'subcategories' => [
                    ['name' => 'B.Tech (Computer Science)', 'name_ml' => 'ബി.ടെക് (കമ്പ്യൂട്ടർ സയൻസ്)', 'slug' => 'btech-cs'],
                    ['name' => 'BCA', 'name_ml' => 'ബി.സി.എ', 'slug' => 'bca'],
                    ['name' => 'B.Sc (Mathematics)', 'name_ml' => 'ബി.എസ്.സി (മാത്തമാറ്റിക്സ്)', 'slug' => 'bsc-maths'],
                    ['name' => 'MCA', 'name_ml' => 'എം.സി.എ', 'slug' => 'mca'],
                ]
            ],
            [
                'name' => 'Competitive Exams',
                'name_ml' => 'മത്സര പരീക്ഷകൾ',
                'slug' => 'competitive-exams',
                'type' => 'competitive',
                'subcategories' => [
                    ['name' => 'Kerala PSC', 'name_ml' => 'കേരള പി.എസ്.സി', 'slug' => 'kerala-psc'],
                    ['name' => 'UPSC (Civil Services)', 'name_ml' => 'യു.പി.എസ്.സി', 'slug' => 'upsc'],
                    ['name' => 'SSC (Staff Selection Commission)', 'name_ml' => 'എസ്.എസ്.സി', 'slug' => 'ssc'],
                    ['name' => 'Banking Exams', 'name_ml' => 'ബാങ്കിംഗ് പരീക്ഷകൾ', 'slug' => 'banking-exams'],
                ]
            ]
        ];

        foreach ($categories as $catData) {
            $subcategories = $catData['subcategories'];
            unset($catData['subcategories']);

            $category = \App\Models\Category::create($catData);

            foreach ($subcategories as $subData) {
                $category->subcategories()->create($subData);
            }
        }
    }
}
