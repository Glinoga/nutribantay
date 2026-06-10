<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanOldBackups extends Command
{
    protected $signature = 'clean:old-backups';

    protected $description = 'Delete database backups older than the configured retention period';

    public function handle(): int
    {
        $retentionDays = Setting::get('backup_retention_days', 30);

        $this->info("Starting backup cleanup (retention: {$retentionDays} days)...");

        $locations = [
            storage_path('app/NutriBantay'),
            storage_path('app/private/NutriBantay'),
        ];

        $cutoffDate = now()->subDays($retentionDays);
        $deletedCount = 0;
        $deletedFiles = [];

        foreach ($locations as $path) {
            if (! is_dir($path)) {
                continue;
            }

            $files = glob($path.'/*.zip');

            foreach ($files as $file) {
                if (! is_file($file)) {
                    continue;
                }

                $lastModified = filemtime($file);
                $fileDate = Carbon::createFromTimestamp($lastModified);

                if ($fileDate->isBefore($cutoffDate)) {
                    $filename = basename($file);
                    unlink($file);
                    $deletedCount++;
                    $deletedFiles[] = $filename;
                    $this->line("Deleted: {$filename}");
                }
            }
        }

        if ($deletedCount > 0) {
            AuditLog::logAction([
                'action' => 'backups_cleaned',
                'model_type' => 'System',
                'description' => "Cleaned {$deletedCount} old backup(s) older than {$retentionDays} days",
                'new_values' => [
                    'deleted_count' => $deletedCount,
                    'deleted_files' => $deletedFiles,
                    'retention_days' => $retentionDays,
                ],
            ]);
        }

        $this->info("Cleanup complete. Deleted {$deletedCount} file(s).");

        return Command::SUCCESS;
    }
}
