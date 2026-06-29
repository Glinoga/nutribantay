<?php

namespace App\Console\Commands;

use App\Models\ChildVitamin;
use App\Models\ChildVitaminDose;
use App\Models\HealthLog;
use App\Models\Vitamin;
use Illuminate\Console\Command;

class BackfillVitaminADoses extends Command
{
    protected $signature = 'backfill:vitamin-a-doses {--dry-run : Show what would be changed without updating}';

    protected $description = 'Create ChildVitaminDose records for old health logs that had vitamin_a = true';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $vitaminA = Vitamin::where('name', 'Vitamin A')->first();

        if (! $vitaminA) {
            $this->error('Vitamin A not found in vitamins table. Seed it first.');

            return self::FAILURE;
        }

        $this->info("Found Vitamin A (ID: {$vitaminA->id}). Scanning health logs...");

        $healthLogs = HealthLog::where('vitamin_a', true)
            ->whereDoesntHave('vitaminDoses', function ($q) use ($vitaminA) {
                $q->whereHas('childVitamin', fn ($q) => $q->where('vitamin_id', $vitaminA->id));
            })
            ->get();

        if ($healthLogs->isEmpty()) {
            $this->info('No health logs need backfilling.');

            return self::SUCCESS;
        }

        $this->info("Found {$healthLogs->count()} health log(s) to backfill.");

        $created = 0;

        foreach ($healthLogs as $log) {
            $childVitamin = ChildVitamin::firstOrCreate([
                'child_id' => $log->child_id,
                'vitamin_id' => $vitaminA->id,
            ]);

            $nextDose = ($childVitamin->doses()->max('dose_number') ?? 0) + 1;

            if ($dryRun) {
                $this->line("[DRY-RUN] HealthLog #{$log->id} (child #{$log->child_id}) → ChildVitamin #{$childVitamin->id}, dose #{$nextDose}");
            } else {
                ChildVitaminDose::create([
                    'child_vitamin_id' => $childVitamin->id,
                    'healthlog_id' => $log->id,
                    'dose_number' => $nextDose,
                    'date_given' => $log->created_at?->toDateString(),
                    'remarks' => 'Backfilled from legacy vitamin_a column',
                ]);
                $this->line("HealthLog #{$log->id} → dose #{$nextDose} created.");
            }

            $created++;
        }

        $this->newLine();
        $this->info("Done. {$created} dose(s) ".($dryRun ? 'would be created.' : 'created.'));

        return self::SUCCESS;
    }
}
