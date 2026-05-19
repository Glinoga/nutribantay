<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Category;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::pluck('id', 'name');

        $announcements = [
            // ─── Active Announcements ─────────────────────────────────────
            [
                'title' => '2026 Nutrition Month Celebration',
                'category_id' => $categories['Events'],
                'date' => '2026-07-01',
                'end_date' => '2026-08-15',
                'summary' => 'Join us as we celebrate Nutrition Month with a month-long series of activities promoting healthy eating and active living.',
                'content' => "The Barangay Nutrition Committee is excited to announce the 2026 Nutrition Month Celebration with the theme \"Sustansya Para sa Lahat, Kalusugan ay Yaman.\"\n\nThis year's celebration will feature a Zumba fitness challenge, a healthy recipe cooking contest, nutrition trivia nights, and a community garden exhibit. All residents are encouraged to participate and learn more about proper nutrition and healthy lifestyle practices.\n\nRegistration forms are available at the Barangay Health Center. For inquiries, please contact your nearest health worker.",
            ],
            [
                'title' => 'Quarterly Supplementary Feeding Program',
                'category_id' => $categories['Programs'],
                'date' => '2026-05-10',
                'end_date' => null,
                'summary' => 'The quarterly feeding program for undernourished children is now ongoing. Beneficiaries receive nutritious meals every school day.',
                'content' => "The Supplementary Feeding Program (SFP) for the second quarter of 2026 is now in full swing. The program targets children aged 2 to 5 years old who are identified as underweight or severely underweight based on the latest nutritional assessment.\n\nBeneficiaries receive a balanced meal every day, consisting of rice, protein-rich viands, and fresh vegetables sourced from the local community garden. The program also includes nutrition education sessions for parents and guardians.\n\nParents of enrolled children are required to attend monthly nutrition classes held every last Friday of the month at the Barangay Health Center.",
            ],
            [
                'title' => 'Free Childhood Vaccination Drive',
                'category_id' => $categories['Programs'],
                'date' => '2026-06-15',
                'end_date' => '2026-09-30',
                'summary' => 'Free vaccination for children 0-5 years old is available at the health center. Complete your child\'s immunization schedule.',
                'content' => "The Barangay Health Center, in partnership with the Local Government Unit, is conducting a free vaccination drive for all children aged 0 to 5 years old. Vaccines available include BCG, DPT, OPV, Measles, MMR, and Hepatitis B.\n\nWalk-in patients are accepted every Monday and Thursday from 8:00 AM to 12:00 PM. Parents are reminded to bring their child's immunization card for proper documentation.\n\nLet us protect our children from preventable diseases. Vaccination is safe, effective, and free!",
            ],
            [
                'title' => 'Parent Nutrition Seminar Series',
                'category_id' => $categories['Workshop'],
                'date' => '2026-06-20',
                'end_date' => null,
                'summary' => 'A weekly seminar series for parents covering meal planning, infant care, and child nutrition basics.',
                'content' => "The Barangay Nutrition Office is launching a weekly Parent Nutrition Seminar Series every Saturday at the Barangay Covered Court. Topics include meal planning on a budget, introducing complementary foods for infants, and recognizing signs of malnutrition.\n\nEach session runs from 9:00 AM to 11:00 AM and includes a cooking demonstration. The first 30 registered participants will receive a free meal planner booklet and a set of measuring cups.\n\nInterested parents may register at the Barangay Health Center or through your barangay health worker.",
            ],
            [
                'title' => 'Updated Barangay Health Center Hours',
                'category_id' => $categories['Updates'],
                'date' => '2026-07-01',
                'end_date' => null,
                'summary' => 'The health center has extended its operating hours to accommodate more patients. New schedule now in effect.',
                'content' => "Effective July 1, 2026, the Barangay Health Center will operate under an extended schedule to better serve the community.\n\nNew Operating Hours:\n- Monday to Friday: 7:00 AM to 7:00 PM\n- Saturday: 8:00 AM to 5:00 PM\n- Sunday: Closed (except for emergency cases)\n\nThe extended evening hours aim to accommodate working parents who cannot visit during regular office hours. All services including consultations, vaccinations, and nutrition counseling are available during these hours.",
            ],
            [
                'title' => 'Newborn Screening Awareness Campaign',
                'category_id' => $categories['Education'],
                'date' => '2026-06-01',
                'end_date' => '2026-12-31',
                'summary' => 'Learn why newborn screening is crucial for your baby\'s health. Free screening available at the health center.',
                'content' => "The Barangay Health Center is intensifying its Newborn Screening (NBS) Awareness Campaign to ensure that every newborn in the barangay receives this essential health service.\n\nNewborn screening is a simple procedure that detects potentially life-threatening conditions that may not be apparent at birth. Early detection and treatment can prevent mental retardation, serious health problems, and even death.\n\nAll newborns delivered at home or in a facility are encouraged to undergo screening within 48 hours to 7 days after birth. The service is absolutely free at the Barangay Health Center.",
            ],
            [
                'title' => 'Community Garden Harvest Festival',
                'category_id' => $categories['Events'],
                'date' => '2026-07-25',
                'end_date' => '2026-07-26',
                'summary' => 'Celebrate the bountiful harvest from our community garden! Free vegetable giveaways and gardening workshops.',
                'content' => "The Barangay Agriculture and Nutrition Offices invite everyone to the Community Garden Harvest Festival on July 25-26, 2026 at the Barangay Community Garden located behind the Health Center.\n\nThe two-day event will feature:\n- Free vegetable giveaways (first come, first served)\n- Organic gardening workshop\n- Seedling distribution\n- Composting demonstration\n- Healthy vegetable cooking demo\n\nResidents who have their own home gardens are encouraged to bring their harvests and join the community exhibit.",
            ],
            [
                'title' => 'Mental Health Awareness Week',
                'category_id' => $categories['Workshop'],
                'date' => '2026-07-10',
                'end_date' => '2026-07-17',
                'summary' => 'A week-long event focused on mental wellness. Free counseling sessions and stress management workshops available.',
                'content' => "In line with the National Mental Health Act, the Barangay Health Center is organizing a Mental Health Awareness Week from July 10 to 17, 2026.\n\nActivities include free one-on-one counseling sessions with a licensed psychologist, group therapy sessions, stress management workshops, and a mental health awareness walk on July 14.\n\nAll services are free and confidential. Walk-ins are welcome at the Barangay Health Center's Mental Health Hub. Let us break the stigma and prioritize our mental well-being.",
            ],

            // ─── Expired Announcements ────────────────────────────────────
            [
                'title' => 'School-Based Feeding Program 2025',
                'category_id' => $categories['Programs'],
                'date' => '2025-09-01',
                'end_date' => '2026-03-31',
                'summary' => 'The school-year-long feeding program for elementary students has concluded. Thank you to all participants.',
                'content' => "The School-Based Feeding Program (SBFP) for School Year 2025-2026 has successfully concluded. The program provided nutritious meals to 150 elementary students identified as wasted or severely wasted during the start of the school year.\n\nThroughout the program, beneficiaries showed significant improvement in their nutritional status, with 85% of participants moving up to the normal weight classification by the end of the program.\n\nThe Barangay Nutrition Committee extends its gratitude to the teachers, parents, and health workers who made this program a success. The next cycle will begin in June 2026.",
            ],
            [
                'title' => '2025 Nutrition Month Kick-Off',
                'category_id' => $categories['Events'],
                'date' => '2025-07-01',
                'end_date' => '2025-07-31',
                'summary' => 'A recap of last year\'s successful Nutrition Month activities and accomplishments.',
                'content' => "The 2025 Nutrition Month celebration was a resounding success, with over 500 residents participating in various activities throughout July. The theme \"Healthy Diet, Gawing Habit - Para sa Healthy Lifestyle!\" resonated strongly with the community.\n\nHighlights included the Grand Zumba Event with 200 participants, the Healthy Recipe Competition with 30 entries, and the successful distribution of vegetable seedlings to 100 households.\n\nWe thank everyone who made this event possible. Stay tuned for this year's Nutrition Month activities!",
            ],
            [
                'title' => 'Christmas Hamper Distribution 2025',
                'category_id' => $categories['Programs'],
                'date' => '2025-12-15',
                'end_date' => '2025-12-24',
                'summary' => 'The annual Christmas hamper distribution for registered families has been completed.',
                'content' => "The Barangay Nutrition Committee successfully distributed Christmas hampers to 200 registered families on December 20, 2025. Each hamper contained rice, canned goods, cooking oil, fresh vegetables, and a small treat for the children.\n\nThe distribution was made possible through the generous donations of local businesses and the coordinated efforts of barangay volunteers. Priority was given to families with pregnant women, lactating mothers, and children under 5 years old.\n\nWe extend our heartfelt thanks to all donors and volunteers who shared the spirit of giving this holiday season.",
            ],
            [
                'title' => 'First Quarter Nutrition Report',
                'category_id' => $categories['Updates'],
                'date' => '2026-01-15',
                'end_date' => '2026-04-30',
                'summary' => 'The first quarter 2026 nutrition report is now available for public viewing at the health center.',
                'content' => "The Barangay Nutrition Office has released its First Quarter 2026 Nutrition Report. The report covers the nutritional assessment of children 0-5 years old, pregnant women, and lactating mothers in the barangay.\n\nKey findings:\n- Prevalence of underweight among children: 8.5% (a decrease from 10.2% in Q4 2025)\n- Prevalence of stunting: 12.3%\n- Percentage of pregnant women attending prenatal checkups: 95%\n- Exclusive breastfeeding rate: 78%\n\nThe full report is available for viewing at the Barangay Health Center. Copies have also been submitted to the City Nutrition Office.",
            ],
            [
                'title' => 'COVID-19 Booster Shot Schedule (2025)',
                'category_id' => $categories['News'],
                'date' => '2025-03-01',
                'end_date' => '2025-12-31',
                'summary' => 'The COVID-19 vaccination and booster program schedule valid for the year 2025 has ended.',
                'content' => "The Barangay Health Center's COVID-19 vaccination program has concluded for 2025. Booster shots and primary series vaccinations were administered throughout the year at the health center and during scheduled community outreach programs.\n\nFor updated information on COVID-19 vaccinations and booster shots for 2026, please visit the Barangay Health Center or check the official Barangay Facebook page.\n\nThe health center continues to remind residents to practice good hygiene and stay home when feeling unwell.",
            ],

            // ─── Upcoming Announcements ──────────────────────────────────
            [
                'title' => 'Summer Health Camp for Kids 2026',
                'category_id' => $categories['Events'],
                'date' => '2026-08-01',
                'end_date' => '2026-08-10',
                'summary' => 'A week-long summer health camp for children aged 6-12. Fun activities promoting health, nutrition, and wellness.',
                'content' => "The Barangay Nutrition Committee is organizing a Summer Health Camp for Kids from August 1 to 10, 2026 at the Barangay Covered Court. The camp is open to children aged 6 to 12 years old.\n\nActivities include daily Zumba sessions, healthy cooking classes, vegetable gardening workshops, nutrition games, and first aid training. Participants will also receive a free health checkup and a summer camp kit.\n\nSlots are limited to 100 children on a first-come, first-served basis. Registration is free and can be done at the Barangay Health Center starting July 15. Parents are required to attend a brief orientation on July 30.",
            ],
            [
                'title' => 'Breastfeeding Awareness and Support Workshop',
                'category_id' => $categories['Workshop'],
                'date' => '2026-08-15',
                'end_date' => null,
                'summary' => 'A hands-on workshop for new and expecting mothers on proper breastfeeding techniques and nutrition.',
                'content' => "The Barangay Nutrition Office invites all pregnant women and new mothers to a Breastfeeding Awareness and Support Workshop on August 15, 2026 at the Barangay Health Center.\n\nThe workshop will cover proper latching techniques, breast milk storage, common breastfeeding challenges, and maternal nutrition during lactation. A certified lactation counselor will facilitate the session and answer your questions.\n\nFree breast milk storage bags and informational materials will be provided to all attendees. Light refreshments will be served.",
            ],
            [
                'title' => 'Purok-Level Clean-Up Drive & Nutrition Fair',
                'category_id' => $categories['Events'],
                'date' => '2026-09-05',
                'end_date' => null,
                'summary' => 'A community-wide clean-up drive combined with a nutrition fair. Free health consultations and food demos.',
                'content' => "Join us for the Purok-Level Clean-Up Drive and Nutrition Fair on September 5, 2026. The event will start at 6:00 AM with a community clean-up followed by a Nutrition Fair at 9:00 AM at the Barangay Plaza.\n\nThe Nutrition Fair will feature free health consultations, blood pressure and blood sugar screening, healthy food cooking demonstrations, and a mini-grocery raffle. Residents are encouraged to bring their own eco-bags for the free vegetable seedling distribution.\n\nLet us work together to keep our community clean and healthy!",
            ],
            [
                'title' => 'Cooking Contest: Lusog-Sarap Healthy Recipes',
                'category_id' => $categories['Workshop'],
                'date' => '2026-09-20',
                'end_date' => null,
                'summary' => 'Show off your healthy cooking skills! Prizes await the most nutritious and delicious dish.',
                'content' => "The Barangay Nutrition Office is calling all home cooks to join the \"Lusog-Sarap Healthy Recipe Contest\" on September 20, 2026 at the Barangay Covered Court.\n\nContestants must prepare a dish using locally available ingredients that is both nutritious and delicious. Categories include:\n- Best Vegetable Dish\n- Best Fish/Seafood Dish\n- Best Brown Rice/Alternative Grain Dish\n\nRegistration is free and open to all barangay residents. Prizes include kitchen appliances, grocery packages, and cash awards. Deadline for registration is September 15, 2026 at the Barangay Health Center.",
            ],
            [
                'title' => 'New Nutrition Assessment Schedule',
                'category_id' => $categories['News'],
                'date' => '2026-08-01',
                'end_date' => null,
                'summary' => 'The updated schedule for the annual nutrition assessment of children and pregnant women is now available.',
                'content' => "The annual Operation Timbang (OPT) Plus will commence on August 1, 2026. This year's nutrition assessment will cover all children 0-59 months old, pregnant women, and lactating mothers in the barangay.\n\nSchedule by Purok:\n- Purok 1-2: August 1-5\n- Purok 3-4: August 8-12\n- Purok 5-6: August 15-19\n- Purok 7-8: August 22-26\n\nHealth workers will conduct house-to-house visits for weighing and height measurement. Parents are requested to have their child's health record ready during the visit.",
            ],
            [
                'title' => 'Barangay Health Workers Training: Infant and Young Child Feeding',
                'category_id' => $categories['Education'],
                'date' => '2026-10-01',
                'end_date' => null,
                'summary' => 'A training program for barangay health workers on proper infant and young child feeding practices.',
                'content' => "The City Nutrition Office, in coordination with the Barangay Nutrition Committee, will conduct a training on Infant and Young Child Feeding (IYCF) for all barangay health workers on October 1-2, 2026.\n\nThe training will cover recommended breastfeeding practices, appropriate complementary feeding, management of acute malnutrition, and counseling skills for mothers. This is a mandatory training for all active health workers.\n\nCertificates of participation will be provided. Health workers are advised to coordinate with their respective purok leaders for schedule adjustments.",
            ],
        ];

        foreach ($announcements as $announcement) {
            Announcement::create([
                'title' => $announcement['title'],
                'category_id' => $announcement['category_id'],
                'author' => 'NutriBantay',
                'date' => $announcement['date'],
                'end_date' => $announcement['end_date'],
                'summary' => $announcement['summary'],
                'content' => $announcement['content'],
                'image' => null,
            ]);
        }
    }
}
