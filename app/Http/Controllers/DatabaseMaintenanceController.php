<?php

namespace App\Http\Controllers;

use App\Helpers\MysqlDumper;
use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DatabaseMaintenanceController extends Controller
{
    public function index()
    {
        $backups = $this->getBackupsList();

        return Inertia::render('Admin/DatabaseMaintenance', [
            'backups' => $backups,
        ]);
    }

    public function backup()
    {
        try {
            set_time_limit(0);

            if (! class_exists(\ZipArchive::class)) {
                throw new \RuntimeException('ZipArchive class not found — PHP zip extension is not installed.');
            }

            \Log::info('=== Starting synchronous web-triggered backup (PHP-native dumper) ===');

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
            \Log::info("Backup created: {$zipName} ({$sizeFormatted})");

            AuditLog::logAction([
                'action' => 'backup_created',
                'model_type' => 'System',
                'description' => "Database backup created successfully: {$zipName}",
                'new_values' => [
                    'filename' => $zipName,
                    'size' => $sizeFormatted,
                ],
            ]);

            return back()->with('success', "✅ Backup created successfully: {$zipName} ({$sizeFormatted})");

        } catch (\Throwable $e) {
            \Log::error('Backup failed: '.$e->getMessage()."\n".$e->getTraceAsString());

            AuditLog::logAction([
                'action' => 'backup_failed',
                'model_type' => 'System',
                'description' => 'Database backup failed: '.$e->getMessage(),
            ]);

            return back()->with('error', '❌ Backup failed: '.$e->getMessage());
        }
    }

    public function list()
    {
        $backups = $this->getBackupsList();

        return Inertia::render('Admin/DatabaseMaintenance', [
            'backups' => $backups,
        ]);
    }

    public function restore(Request $request)
    {
        set_time_limit(0);

        $request->validate([
            'backup_file' => 'required|string',
            'confirmation' => 'required|string|in:RESTORE DATABASE',
        ]);

        $extractPath = storage_path('app/restore-temp');

        try {
            if (! class_exists(\ZipArchive::class)) {
                throw new \RuntimeException('ZipArchive class not found — PHP zip extension is not installed.');
            }

            if (config('database.default') !== 'mysql') {
                throw new \RuntimeException('Restore is only supported for MySQL connections.');
            }

            $backupFileRel = $request->input('backup_file');
            if (! str_starts_with($backupFileRel, 'NutriBantay/') && ! str_starts_with($backupFileRel, 'private/NutriBantay/')) {
                return back()->with('error', 'Invalid backup file path.');
            }

            $storageAppPath = realpath(storage_path('app'));
            $fullPath = realpath(storage_path('app/'.$backupFileRel));

            if (! $storageAppPath || ! $fullPath || ! str_starts_with($fullPath, $storageAppPath.DIRECTORY_SEPARATOR)) {
                return back()->with('error', 'Invalid backup file path.');
            }

            if (! is_file($fullPath)) {
                \Log::error("Backup file not found at: {$fullPath}");

                return back()->with('error', 'Backup file not found.');
            }

            try {
                if (file_exists($extractPath)) {
                    $this->recursiveDelete($extractPath);
                }
            } catch (\Throwable) {
                // Best-effort cleanup — ignore permission failures on parent dir
            }
            @mkdir($extractPath, 0775, true);

            $zip = new \ZipArchive;
            if ($zip->open($fullPath) !== true) {
                throw new \RuntimeException('Failed to extract backup archive.');
            }

            $encPassword = config('app.backup_encryption_password');
            if ($encPassword) {
                $zip->setPassword($encPassword);
            }

            if ($zip->extractTo($extractPath) !== true) {
                $zip->close();
                throw new \RuntimeException('Failed to extract backup archive. Check the backup password and archive integrity.');
            }
            $zip->close();

            $sqlFile = $this->findSqlFile($extractPath);

            if (! $sqlFile) {
                $allFiles = $this->listAllFiles($extractPath);
                \Log::error('SQL file not found in backup. Files: '.json_encode($allFiles));
                throw new \RuntimeException('MySQL SQL dump file (.sql) not found in backup archive.');
            }

            \Log::info("Found SQL dump at: {$sqlFile}");

            $sqlHeader = file_get_contents($sqlFile, false, null, 0, 8192);

            if ($sqlHeader === false || trim($sqlHeader) === '') {
                throw new \RuntimeException('SQL dump file is empty or unreadable.');
            }

            if (
                stripos($sqlHeader, 'PRAGMA foreign_keys') !== false ||
                stripos($sqlHeader, 'AUTOINCREMENT') !== false
            ) {
                throw new \RuntimeException(
                    'This backup contains SQLite data which is incompatible with MySQL. '.
                    'Please delete old backups and create a new one.'
                );
            }

            \Log::info('Executing MySQL restore via DB::unprepared …');

            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            try {
                $this->executeSqlFile($sqlFile);
            } finally {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }

            \Log::info('MySQL restore completed successfully.');

            $this->recursiveDelete($extractPath);

            try {
                AuditLog::logAction([
                    'action' => 'database_restored',
                    'model_type' => 'System',
                    'description' => 'Database restored from MySQL backup',
                    'new_values' => [
                        'backup_file' => basename($backupFileRel),
                    ],
                ]);
            } catch (\Throwable $e) {
                \Log::warning('Database restore audit log failed: '.$e->getMessage());
            }

            return back()->with('success', '✅ Database restored successfully from MySQL backup.');

        } catch (\Throwable $e) {
            \Log::error('Database restore failed: '.$e->getMessage()."\n".$e->getTraceAsString());

            try {
                if (file_exists($extractPath)) {
                    $this->recursiveDelete($extractPath);
                }
            } catch (\Throwable) {
            }

            return back()->with('error', '❌ Database restore failed: '.$e->getMessage());
        }
    }

    private function executeSqlFile(string $sqlFile): void
    {
        $handle = fopen($sqlFile, 'r');

        if ($handle === false) {
            throw new \RuntimeException("Cannot open SQL dump for reading: {$sqlFile}");
        }

        $statement = '';
        $quote = null;
        $escaped = false;

        try {
            while (($line = fgets($handle)) !== false) {
                if ($statement === '' && (trim($line) === '' || str_starts_with(ltrim($line), '--'))) {
                    continue;
                }

                $statement .= $line;
                $length = strlen($line);

                for ($i = 0; $i < $length; $i++) {
                    $char = $line[$i];

                    if ($escaped) {
                        $escaped = false;

                        continue;
                    }

                    if ($char === '\\') {
                        $escaped = true;

                        continue;
                    }

                    if ($quote !== null) {
                        if ($char === $quote) {
                            $quote = null;
                        }

                        continue;
                    }

                    if ($char === "'" || $char === '"' || $char === '`') {
                        $quote = $char;
                    }
                }

                if ($quote === null && str_ends_with(rtrim($line), ';')) {
                    $sql = trim($statement);

                    if ($sql !== '') {
                        DB::unprepared($sql);
                    }

                    $statement = '';
                    $escaped = false;
                }
            }

            $sql = trim($statement);

            if ($sql !== '') {
                DB::unprepared($sql);
            }
        } finally {
            fclose($handle);
        }
    }

    private function findSqlFile(string $directory): ?string
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && strtolower($file->getExtension()) === 'sql') {
                return $file->getPathname();
            }
        }

        return null;
    }

    private function listAllFiles($directory)
    {
        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            $files[] = str_replace($directory, '', $file->getPathname());
        }

        return $files;
    }

    private function recursiveDelete($directory)
    {
        if (! file_exists($directory)) {
            return;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($iterator as $file) {
            if ($file->isDir()) {
                rmdir($file->getPathname());
            } else {
                unlink($file->getPathname());
            }
        }

        try {
            rmdir($directory);
        } catch (\Throwable) {
            // Best-effort cleanup — ignore permission failures
        }
    }

    public function delete(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|string',
        ]);

        try {
            $backupFileRel = $request->input('backup_file');
            if (! str_starts_with($backupFileRel, 'NutriBantay/') && ! str_starts_with($backupFileRel, 'private/NutriBantay/')) {
                return back()->with('error', 'Invalid backup file path.');
            }
            $fullPath = storage_path('app/'.$backupFileRel);

            if (! file_exists($fullPath)) {
                return back()->with('error', 'Backup file not found.');
            }

            $filename = basename($fullPath);

            @unlink($fullPath);

            AuditLog::logAction([
                'action' => 'backup_deleted',
                'model_type' => 'System',
                'description' => "Database backup deleted: {$filename}",
                'old_values' => [
                    'filename' => $filename,
                ],
            ]);

            return back()->with('success', '✅ Backup deleted successfully.');

        } catch (\Throwable $e) {
            \Log::error('Backup deletion failed: '.$e->getMessage());

            return back()->with('error', '❌ Delete failed: '.$e->getMessage());
        }
    }

    private function getBackupsList()
    {
        $backups = [];

        $locations = [
            'storage' => storage_path('app/NutriBantay'),
            'private' => storage_path('app/private/NutriBantay'),
        ];

        foreach ($locations as $source => $path) {
            if (is_dir($path)) {
                $files = glob($path.'/*.zip');

                foreach ($files as $file) {
                    $filename = basename($file);
                    $size = filesize($file);
                    $timestamp = filemtime($file);

                    $backups[] = [
                        'filename' => $filename,
                        'path' => ($source === 'private' ? 'private/NutriBantay/' : 'NutriBantay/').$filename,
                        'full_path' => $file,
                        'size' => $this->formatBytes($size),
                        'size_bytes' => $size,
                        'date' => Carbon::createFromTimestamp($timestamp, config('app.timezone'))->format('Y-m-d H:i:s'),
                        'timestamp' => $timestamp,
                        'source' => $source,
                    ];
                }
            }
        }

        usort($backups, function ($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });

        return $backups;
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision).' '.$units[$i];
    }
}
