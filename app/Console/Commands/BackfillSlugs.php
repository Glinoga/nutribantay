<?php

namespace App\Console\Commands;

use App\Models\Announcement;
use App\Models\Child;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class BackfillSlugs extends Command
{
    protected $signature = 'slugs:backfill {--dry-run : Show what would be changed without updating}';

    protected $description = 'Generate slugs for existing children and announcements without one';

    public function handle(): int
    {
        $this->info('Backfilling slugs...');

        $childrenUpdated = $this->backfillChildren();
        $announcementsUpdated = $this->backfillAnnouncements();

        $this->newLine();
        $this->info("Done. Children: {$childrenUpdated} updated, Announcements: {$announcementsUpdated} updated.");

        return self::SUCCESS;
    }

    private function backfillChildren(): int
    {
        $count = 0;
        $dryRun = $this->option('dry-run');

        $children = Child::whereNull('slug')->get();

        foreach ($children as $child) {
            $base = Str::slug($child->first_name.' '.$child->last_name);
            $slug = $base;
            $counter = 1;

            while (Child::where('slug', $slug)->exists()) {
                $slug = $base.'-'.++$counter;
            }

            if ($dryRun) {
                $this->line("[DRY-RUN] Child #{$child->id} {$child->first_name} {$child->last_name} → {$slug}");
            } else {
                $child->updateQuietly(['slug' => $slug]);
                $this->line("Child #{$child->id} {$child->first_name} {$child->last_name} → {$slug}");
            }

            $count++;
        }

        return $count;
    }

    private function backfillAnnouncements(): int
    {
        $count = 0;
        $dryRun = $this->option('dry-run');

        $announcements = Announcement::whereNull('slug')->get();

        foreach ($announcements as $announcement) {
            $base = Str::slug($announcement->title);
            $slug = $base;
            $counter = 1;

            while (Announcement::where('slug', $slug)->exists()) {
                $slug = $base.'-'.++$counter;
            }

            if ($dryRun) {
                $this->line("[DRY-RUN] Announcement #{$announcement->id} {$announcement->title} → {$slug}");
            } else {
                $announcement->updateQuietly(['slug' => $slug]);
                $this->line("Announcement #{$announcement->id} {$announcement->title} → {$slug}");
            }

            $count++;
        }

        return $count;
    }
}
