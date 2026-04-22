<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanOldBackups extends Command
{
    protected $signature = 'clean:old-backups';

    protected $description = 'Delete database backups older than the configured retention period';

    public function handle(): int
    {
        $retentionDays = Setting::get('backup_retention_days', 14);

        $this->info("Starting backup cleanup (retention: {$retentionDays} days)...");

        $backupPath = 'Laravel';

        if (! Storage::disk('local')->exists($backupPath)) {
            $this->info('No backup directory found. Exiting.');

            return Command::SUCCESS;
        }

        $files = Storage::disk('local')->files($backupPath);
        $cutoffDate = now()->subDays($retentionDays);
        $deletedCount = 0;
        $deletedFiles = [];

        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) !== 'zip') {
                continue;
            }

            $lastModified = Storage::disk('local')->lastModified($file);
            $fileDate = \Carbon\Carbon::createFromTimestamp($lastModified);

            if ($fileDate->isBefore($cutoffDate)) {
                $filename = basename($file);
                Storage::disk('local')->delete($file);
                $deletedCount++;
                $deletedFiles[] = $filename;
                $this->line("Deleted: {$filename}");
            }
        }

        // Log the cleanup action
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

        $this->info("Cleanup complete. Deleted {$deletedCount} file(s).");

        return Command::SUCCESS;
    }
}
