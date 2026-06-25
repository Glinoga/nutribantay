<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $contents = [
            // ========== HOMEPAGE ==========
            ['page' => 'home', 'section' => 'branding', 'key' => 'logo_url', 'label' => 'Site Logo', 'description' => 'The logo displayed on all public pages. Upload a new image to replace it.', 'value' => '/NutriBantayLogo.svg', 'type' => 'image'],
            ['page' => 'home', 'section' => 'hero', 'key' => 'hero_title', 'label' => 'Homepage Main Heading', 'description' => 'This text appears at the top of the homepage as the main headline.', 'value' => 'Every Child Deserves a Healthy Start', 'type' => 'text'],
            ['page' => 'home', 'section' => 'hero', 'key' => 'hero_description', 'label' => 'Homepage Description', 'description' => 'This paragraph appears below the main heading on the homepage.', 'value' => 'NutriBantay monitors nutrition, vaccines, and growth for children under 5 in your barangay. We help families build a healthier future.', 'type' => 'textarea'],
            ['page' => 'home', 'section' => 'hero', 'key' => 'cta_primary_label', 'label' => 'Primary Button Text', 'description' => 'The text for the main call-to-action button on the homepage.', 'value' => 'View Announcements', 'type' => 'text'],
            ['page' => 'home', 'section' => 'hero', 'key' => 'cta_secondary_label', 'label' => 'Secondary Button Text', 'description' => 'The text for the secondary call-to-action button on the homepage.', 'value' => 'Contact the Health Center', 'type' => 'text'],

            ['page' => 'home', 'section' => 'stats', 'key' => 'stat_1_value', 'label' => 'Statistic 1 — Number', 'description' => 'The number shown in the first statistic card.', 'value' => '500+', 'type' => 'text'],
            ['page' => 'home', 'section' => 'stats', 'key' => 'stat_1_label', 'label' => 'Statistic 1 — Label', 'description' => 'The label below the first statistic number.', 'value' => 'Children Monitored', 'type' => 'text'],
            ['page' => 'home', 'section' => 'stats', 'key' => 'stat_1_subtitle', 'label' => 'Statistic 1 — Subtitle', 'description' => 'The subtitle below the first statistic label.', 'value' => 'Since 2022', 'type' => 'text'],
            ['page' => 'home', 'section' => 'stats', 'key' => 'stat_2_value', 'label' => 'Statistic 2 — Number', 'description' => 'The number shown in the second statistic card.', 'value' => '50+', 'type' => 'text'],
            ['page' => 'home', 'section' => 'stats', 'key' => 'stat_2_label', 'label' => 'Statistic 2 — Label', 'description' => 'The label below the second statistic number.', 'value' => 'Health Programs', 'type' => 'text'],
            ['page' => 'home', 'section' => 'stats', 'key' => 'stat_2_subtitle', 'label' => 'Statistic 2 — Subtitle', 'description' => 'The subtitle below the second statistic label.', 'value' => 'As of June 2026', 'type' => 'text'],
            ['page' => 'home', 'section' => 'stats', 'key' => 'stat_3_value', 'label' => 'Statistic 3 — Number', 'description' => 'The number shown in the third statistic card.', 'value' => '200+', 'type' => 'text'],
            ['page' => 'home', 'section' => 'stats', 'key' => 'stat_3_label', 'label' => 'Statistic 3 — Label', 'description' => 'The label below the third statistic number.', 'value' => 'Families Assisted', 'type' => 'text'],
            ['page' => 'home', 'section' => 'stats', 'key' => 'stat_3_subtitle', 'label' => 'Statistic 3 — Subtitle', 'description' => 'The subtitle below the third statistic label.', 'value' => 'Since 2022', 'type' => 'text'],

            ['page' => 'home', 'section' => 'cta', 'key' => 'cta_heading', 'label' => 'CTA Section Heading', 'description' => 'The heading for the call-to-action section at the bottom of the homepage.', 'value' => "Have questions about your child's nutrition?", 'type' => 'text'],
            ['page' => 'home', 'section' => 'cta', 'key' => 'cta_text', 'label' => 'CTA Section Description', 'description' => 'The paragraph text in the call-to-action section.', 'value' => 'Our team at the barangay health center is ready to help. Reach out to learn about our monitoring program, vaccine schedules, and how we can support your family.', 'type' => 'textarea'],
            ['page' => 'home', 'section' => 'cta', 'key' => 'cta_button_label', 'label' => 'CTA Button Text', 'description' => 'The text for the button in the call-to-action section.', 'value' => 'Contact the Health Center', 'type' => 'text'],

            // ========== WELCOME / SPLASH ==========
            ['page' => 'welcome', 'section' => 'hero', 'key' => 'hero_description', 'label' => 'Welcome Description', 'description' => 'The description text on the welcome/splash page.', 'value' => 'Barangay 176B is a vibrant community located in Caloocan City. This nutrition tracking system, NutriBantay, aims to help residents monitor and improve their nutritional health. Explore the highlights of our barangay below!', 'type' => 'textarea'],

            // ========== CONTACT ==========
            ['page' => 'contact', 'section' => 'info', 'key' => 'phone', 'label' => 'Phone Number', 'description' => 'The main contact phone number displayed on the Contact page and footer.', 'value' => '0966 822 1878', 'type' => 'tel'],
            ['page' => 'contact', 'section' => 'info', 'key' => 'email', 'label' => 'Email Address', 'description' => 'The main contact email address displayed on the Contact page.', 'value' => 'barangay176b@gmail.com', 'type' => 'email'],
            ['page' => 'contact', 'section' => 'info', 'key' => 'address', 'label' => 'Address (Short)', 'description' => 'The short address line shown on contact cards.', 'value' => 'Q29X+VJC, Caloocan, Metro Manila', 'type' => 'text'],
            ['page' => 'contact', 'section' => 'info', 'key' => 'location_name', 'label' => 'Location Name', 'description' => 'The name of the health center or location.', 'value' => 'Bagong Silang Phase 3 Health Center', 'type' => 'text'],
            ['page' => 'contact', 'section' => 'hours', 'key' => 'office_hours', 'label' => 'Office Hours', 'description' => 'The office hours displayed on contact cards and map popup.', 'value' => 'Mon-Fri: 8AM - 5PM', 'type' => 'text'],
            ['page' => 'contact', 'section' => 'hours', 'key' => 'hours_subtext', 'label' => 'Office Hours Subtext', 'description' => 'A shorter version of office hours for the contact card.', 'value' => 'Mon-Fri, 8am-5pm', 'type' => 'text'],
            ['page' => 'contact', 'section' => 'map', 'key' => 'latitude', 'label' => 'Map Latitude', 'description' => 'Latitude coordinate for the location map marker.', 'value' => '14.7695106', 'type' => 'text'],
            ['page' => 'contact', 'section' => 'map', 'key' => 'longitude', 'label' => 'Map Longitude', 'description' => 'Longitude coordinate for the location map marker.', 'value' => '121.0489927', 'type' => 'text'],

            // ========== FAQ ==========
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_1_question', 'label' => 'FAQ #1 — Question', 'description' => 'The first frequently asked question.', 'value' => 'What services does NutriBantay offer?', 'type' => 'text'],
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_1_answer', 'label' => 'FAQ #1 — Answer', 'description' => 'The answer to the first FAQ.', 'value' => 'NutriBantay offers nutrition monitoring for children, health education programs, community wellness initiatives, and regular health assessments for families in our barangay. Our services are designed to improve the overall health and well-being of our community members, with a special focus on children\'s nutrition.', 'type' => 'textarea'],
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_2_question', 'label' => 'FAQ #2 — Question', 'description' => 'The second frequently asked question.', 'value' => 'How can I register my child for nutrition monitoring?', 'type' => 'text'],
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_2_answer', 'label' => 'FAQ #2 — Answer', 'description' => 'The answer to the second FAQ.', 'value' => 'You can visit the Barangay Health Center during office hours with your child\'s birth certificate and proof of residence to register for our nutrition monitoring program. Our staff will guide you through the registration process and schedule your child\'s first assessment.', 'type' => 'textarea'],
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_3_question', 'label' => 'FAQ #3 — Question', 'description' => 'The third frequently asked question.', 'value' => 'Are the services free?', 'type' => 'text'],
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_3_answer', 'label' => 'FAQ #3 — Answer', 'description' => 'The answer to the third FAQ.', 'value' => 'Yes, most of our basic services are provided free of charge to residents of our barangay through government funding and community partnerships. Some specialized services or programs may have minimal fees, but we always ensure that cost is not a barrier to accessing essential nutrition and health services.', 'type' => 'textarea'],
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_4_question', 'label' => 'FAQ #4 — Question', 'description' => 'The fourth frequently asked question.', 'value' => 'How often should my child be monitored?', 'type' => 'text'],
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_4_answer', 'label' => 'FAQ #4 — Answer', 'description' => 'The answer to the fourth FAQ.', 'value' => 'We recommend monthly monitoring for children under 2 years old and quarterly monitoring for children aged 2-5 years. However, this may vary based on your child\'s specific health needs. Our healthcare professionals will provide personalized recommendations for your child\'s monitoring schedule.', 'type' => 'textarea'],
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_5_question', 'label' => 'FAQ #5 — Question', 'description' => 'The fifth frequently asked question.', 'value' => 'What age group does NutriBantay monitor?', 'type' => 'text'],
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_5_answer', 'label' => 'FAQ #5 — Answer', 'description' => 'The answer to the fifth FAQ.', 'value' => 'NutriBantay primarily monitors children from birth to 5 years old (under 5). This is the critical window for growth and development where proper nutrition has the greatest lifelong impact. We also provide guidance to parents and caregivers on nutrition for older children and family members.', 'type' => 'textarea'],
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_6_question', 'label' => 'FAQ #6 — Question', 'description' => 'The sixth frequently asked question.', 'value' => 'How do I enroll my child?', 'type' => 'text'],
            ['page' => 'contact', 'section' => 'faq', 'key' => 'faq_6_answer', 'label' => 'FAQ #6 — Answer', 'description' => 'The answer to the sixth FAQ.', 'value' => 'To enroll your child, visit the Bagong Silang Phase 3 Health Center during office hours with your child\'s birth certificate and proof of residency. Our staff will register your child, explain the monitoring process, and schedule the first health assessment. There is no cost for enrollment.', 'type' => 'textarea'],

            // ========== FOOTER ==========
            ['page' => 'footer', 'section' => 'about', 'key' => 'tagline', 'label' => 'Footer Tagline', 'description' => 'The tagline text displayed in the footer beside the logo.', 'value' => 'Empowering our community with nutrition monitoring and health services.', 'type' => 'textarea'],
            ['page' => 'footer', 'section' => 'about', 'key' => 'address', 'label' => 'Footer Address', 'description' => 'The address displayed in the footer contact info.', 'value' => 'Bagong Silang Phase 3 Health Center, Caloocan City, Philippines', 'type' => 'text'],
            ['page' => 'footer', 'section' => 'about', 'key' => 'phone', 'label' => 'Footer Phone Number', 'description' => 'The phone number displayed in the footer.', 'value' => '0966 822 1878', 'type' => 'tel'],
            ['page' => 'footer', 'section' => 'about', 'key' => 'email', 'label' => 'Footer Email Address', 'description' => 'The email address displayed in the footer.', 'value' => 'nutribantay@gmail.com', 'type' => 'email'],
            ['page' => 'footer', 'section' => 'social', 'key' => 'facebook_url', 'label' => 'Facebook Page URL', 'description' => 'The URL for the NutriBantay Facebook page.', 'value' => 'https://web.facebook.com/profile.php?id=61572504453595', 'type' => 'url'],
            ['page' => 'footer', 'section' => 'legal', 'key' => 'copyright_text', 'label' => 'Copyright Text', 'description' => 'The copyright text in the footer (year is added automatically).', 'value' => 'NutriBantay. All rights reserved.', 'type' => 'text'],
        ];

        foreach ($contents as $content) {
            SiteContent::create($content);
        }
    }
}
