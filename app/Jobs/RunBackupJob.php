<?php

namespace App\Jobs;

use App\Models\AuditLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class RunBackupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('=== Starting background backup job ===');

        try {
            // Run the backup command
            Artisan::call('backup:run', [
                '--only-db' => true,
            ]);

            $output = Artisan::output();
            Log::info('Background backup command output: ' . $output);

            // Get the backup name from config
            $backupName = config('backup.backup.name') ?: env('APP_NAME', 'laravel-backup');
            $backupPath = storage_path('app/' . $backupName);

            $latestBackup = null;
            $latestTime = 0;

            if (is_dir($backupPath)) {
                $files = glob($backupPath . '/*.zip');
                foreach ($files as $file) {
                    $mtime = filemtime($file);
                    if ($mtime > $latestTime) {
                        $latestTime = $mtime;
                        $latestBackup = $file;
                    }
                }
            }

            if ($latestBackup && $latestTime > time() - 600) {
                $filename = basename($latestBackup);
                $size = filesize($latestBackup);

                AuditLog::logAction([
                    'action' => 'backup_created',
                    'model_type' => 'System',
                    'description' => "Database backup created successfully in background: {$filename}",
                    'new_values' => [
                        'filename' => $filename,
                        'size' => $this->formatBytes($size),
                    ],
                ]);
                
                Log::info("Background backup successful: {$filename}");
            } else {
                Log::warning('Backup job finished but no recent backup file was found.');
            }

        } catch (\Exception $e) {
            Log::error('Background backup job failed: ' . $e->getMessage());
            
            AuditLog::logAction([
                'action' => 'backup_failed',
                'model_type' => 'System',
                'description' => "Background database backup failed: {$e->getMessage()}",
            ]);
        }
    }

    /**
     * Helper: Format bytes to human readable
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
