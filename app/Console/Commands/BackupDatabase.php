<?php

namespace App\Console\Commands;

use App\Helpers\MysqlDumper;
use App\Models\AuditLog;
use Illuminate\Console\Command;

class BackupDatabase extends Command
{
    protected $signature = 'app:backup-database';

    protected $description = 'Create a scheduled database backup (encrypted zip)';

    public function handle(): int
    {
        $this->info('Starting scheduled database backup...');

        try {
            $appName = 'NutriBantay';
            $timestamp = now()->format('Y-m-d-H-i-s');
            $sqlFile = storage_path("app/backup-temp/{$timestamp}-db.sql");
            $zipName = "{$timestamp}.zip";
            $zipDestDir = storage_path("app/{$appName}");
            $zipDest = $zipDestDir.'/'.$zipName;

            if (! file_exists(dirname($sqlFile))) {
                @mkdir(dirname($sqlFile), 0755, true);
            }
            if (! file_exists($zipDestDir)) {
                @mkdir($zipDestDir, 0755, true);
            }

            $connection = config('database.default', 'mysql');
            MysqlDumper::dump($sqlFile, $connection);

            $zip = new \ZipArchive;
            if ($zip->open($zipDest, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
                throw new \RuntimeException("Cannot create zip archive at: {$zipDest}");
            }
            $zip->addFile($sqlFile, "{$timestamp}-db.sql");

            $encPassword = config('app.backup_encryption_password');
            if ($encPassword) {
                $zip->setPassword($encPassword);
                $zip->setEncryptionName("{$timestamp}-db.sql", \ZipArchive::EM_AES_256);
            }

            $zip->close();
            @unlink($sqlFile);

            if (! file_exists($zipDest) || filesize($zipDest) < 100) {
                throw new \RuntimeException('Backup zip was not created or is suspiciously small.');
            }

            $sizeFormatted = $this->formatBytes(filesize($zipDest));
            $this->info("Backup created: {$zipName} ({$sizeFormatted})");

            AuditLog::logAction([
                'action' => 'backup_created',
                'model_type' => 'System',
                'description' => "Scheduled database backup created: {$zipName}",
                'new_values' => [
                    'filename' => $zipName,
                    'size' => $sizeFormatted,
                ],
            ]);

            $this->info('Scheduled database backup completed successfully.');

            return Command::SUCCESS;

        } catch (\Throwable $e) {
            $this->error('Backup failed: '.$e->getMessage());

            AuditLog::logAction([
                'action' => 'backup_failed',
                'model_type' => 'System',
                'description' => 'Scheduled database backup failed: '.$e->getMessage(),
            ]);

            return Command::FAILURE;
        }
    }

    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision).' '.$units[$i];
    }
}
