<?php

namespace App\Http\Controllers;

use App\Helpers\MysqlDumper;
use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DatabaseMaintenanceController extends Controller
{
    /**
     * Show the database maintenance page
     */
    public function index()
    {
        $backups = $this->getBackupsList();

        return Inertia::render('Admin/DatabaseMaintenance', [
            'backups' => $backups,
        ]);
    }

    /**
     * Create a manual database backup.
     *
     * Uses a pure-PHP PDO-based dumper instead of spawning mysqldump as a subprocess.
     * This avoids Windows Winsock error 10106 (WSAEPROVIDERFAILEDINIT) that occurs
     * when the web server process tries to launch mysqldump via Symfony Process.
     */
    public function backup()
    {
        try {
            \Log::info('=== Starting synchronous web-triggered backup (PHP-native dumper) ===');

            // ── 1. Determine destination paths ───────────────────────────────
            $appName = 'NutriBantay';
            $timestamp = now()->format('Y-m-d-H-i-s');
            $sqlFile = storage_path("app/backup-temp/{$timestamp}-db.sql");
            $zipName = "{$timestamp}.zip";
            // We want to store in storage/app/NutriBantay to keep it accessible
            $zipDestDir = storage_path("app/{$appName}");
            $zipDest = $zipDestDir.'/'.$zipName;

            // Ensure destination directories exist
            if (! file_exists(dirname($sqlFile))) {
                @mkdir(dirname($sqlFile), 0755, true);
            }
            if (! file_exists($zipDestDir)) {
                @mkdir($zipDestDir, 0755, true);
            }

            // ── 2. Dump via pure PHP/PDO (no subprocess, no Winsock) ─────────
            $connection = config('database.default', 'mysql');
            MysqlDumper::dump($sqlFile, $connection);

            // ── 3. Zip the SQL file ───────────────────────────────────────────
            $zip = new \ZipArchive;
            if ($zip->open($zipDest, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
                throw new \RuntimeException("Cannot create zip archive at: {$zipDest}");
            }
            $zip->addFile($sqlFile, "{$timestamp}-db.sql");

            // AES-256 encrypt the zip contents at rest
            $encPassword = config('app.backup_encryption_password');
            if ($encPassword) {
                $zip->setPassword($encPassword);
                $zip->setEncryptionName("{$timestamp}-db.sql", \ZipArchive::EM_AES_256);
            }

            $zip->close();

            // ── 4. Clean up the raw SQL temp file ───────────────────────────
            @unlink($sqlFile);

            // ── 5. Verify the zip was written ────────────────────────────────
            if (! file_exists($zipDest) || filesize($zipDest) < 100) {
                throw new \RuntimeException('Backup zip was not created or is suspiciously small.');
            }

            $sizeFormatted = $this->formatBytes(filesize($zipDest));
            \Log::info("Backup created: {$zipName} ({$sizeFormatted})");

            // ── 6. Audit log ─────────────────────────────────────────────────
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

        } catch (\Exception $e) {
            \Log::error('Backup failed: '.$e->getMessage()."\n".$e->getTraceAsString());

            AuditLog::logAction([
                'action' => 'backup_failed',
                'model_type' => 'System',
                'description' => 'Database backup failed: '.$e->getMessage(),
            ]);

            return back()->with('error', '❌ Backup failed: '.$e->getMessage());
        }
    }

    /**
     * Get list of available backups
     */
    public function list()
    {
        $backups = $this->getBackupsList();

        return Inertia::render('Admin/DatabaseMaintenance', [
            'backups' => $backups,
        ]);
    }

    /**
     * Restore database from a MySQL backup zip (produced by the PHP-native dumper).
     *
     * The zip must contain a single .sql file with a valid MySQL dump.
     */
    public function restore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|string',
            'confirmation' => 'required|string|in:RESTORE DATABASE',
        ]);

        $extractPath = storage_path('app/restore-temp');

        try {
            $backupFileRel = $request->input('backup_file');
            $backupFileRel = basename($backupFileRel);
            $fullPath = storage_path('app/'.$backupFileRel);

            // Verify backup file exists
            if (! file_exists($fullPath)) {
                \Log::error("Backup file not found at: {$fullPath}");

                return back()->with('error', '❌ Backup file not found.');
            }

            // ── 1. Extract zip ────────────────────────────────────────────────
            if (file_exists($extractPath)) {
                $this->recursiveDelete($extractPath);
            }
            mkdir($extractPath, 0755, true);

            $zip = new \ZipArchive;
            if ($zip->open($fullPath) !== true) {
                throw new \RuntimeException('Failed to extract backup archive.');
            }

            // Decrypt the zip using the encryption password
            $encPassword = config('app.backup_encryption_password');
            if ($encPassword) {
                $zip->setPassword($encPassword);
            }

            $zip->extractTo($extractPath);
            $zip->close();

            // ── 2. Find the .sql file ─────────────────────────────────────────
            $sqlFile = $this->findSqlFile($extractPath);

            if (! $sqlFile) {
                $allFiles = $this->listAllFiles($extractPath);
                \Log::error('SQL file not found in backup. Files: '.json_encode($allFiles));
                throw new \RuntimeException('MySQL SQL dump file (.sql) not found in backup archive.');
            }

            \Log::info("Found SQL dump at: {$sqlFile}");

            // ── 3. Execute the SQL dump ───────────────────────────────────────
            $sql = file_get_contents($sqlFile);

            if (empty($sql)) {
                throw new \RuntimeException('SQL dump file is empty or unreadable.');
            }

            // Safety: reject old SQLite dumps
            if (
                stripos($sql, 'PRAGMA foreign_keys') !== false ||
                stripos($sql, 'AUTOINCREMENT') !== false
            ) {
                throw new \RuntimeException(
                    'This backup contains SQLite data which is incompatible with MySQL. '.
                    'Please delete old backups and create a new one.'
                );
            }

            \Log::info('Executing MySQL restore via DB::unprepared …');

            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            DB::unprepared($sql);
            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            \Log::info('MySQL restore completed successfully.');

            // ── 4. Clean up ───────────────────────────────────────────────────
            $this->recursiveDelete($extractPath);

            // ── 5. Audit log ──────────────────────────────────────────────────
            AuditLog::logAction([
                'action' => 'database_restored',
                'model_type' => 'System',
                'description' => 'Database restored from MySQL backup',
                'new_values' => [
                    'backup_file' => basename($backupFileRel),
                ],
            ]);

            return back()->with('success', '✅ Database restored successfully from MySQL backup.');

        } catch (\Exception $e) {
            \Log::error('Database restore failed: '.$e->getMessage()."\n".$e->getTraceAsString());

            // Clean up temp files even on failure
            if (file_exists($extractPath)) {
                $this->recursiveDelete($extractPath);
            }

            return back()->with('error', '❌ Database restore failed: '.$e->getMessage());
        }
    }

    /**
     * Recursively find SQLite database file in directory
     */
    private function findSqliteFile($directory)
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $ext = strtolower($file->getExtension());
                // Look for .sqlite, .db, or no extension files
                if ($ext === 'sqlite' || $ext === 'db' || $ext === '') {
                    // Check if it looks like a SQLite database
                    if ($this->isSqliteFile($file->getPathname())) {
                        return $file->getPathname();
                    }
                }
            }
        }

        // Fallback: look for any file that might be SQLite
        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getSize() > 1000) {
                if ($this->isSqliteFile($file->getPathname())) {
                    return $file->getPathname();
                }
            }
        }

        return null;
    }

    /**
     * Find a MySQL .sql dump file in the given directory (recursive).
     */
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

    /**
     * Check if file is a valid SQLite database
     */
    private function isSqliteFile($path)
    {
        if (! file_exists($path)) {
            return false;
        }

        // Check for SQLite magic header
        $handle = fopen($path, 'rb');
        if (! $handle) {
            return false;
        }

        $header = fread($handle, 16);
        fclose($handle);

        // SQLite files start with "SQLite format 3\0" or "SQLite database"
        return strpos($header, 'SQLite') !== false || strpos($header, "\x53\x51\x4c\x69") !== false;
    }

    /**
     * List all files in directory recursively (for debugging)
     */
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

    /**
     * Recursively delete directory and contents
     */
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

        rmdir($directory);
    }

    /**
     * Delete a backup file
     */
    public function delete(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|string',
        ]);

        try {
            $backupFileRel = $request->input('backup_file');
            $backupFileRel = basename($backupFileRel);
            $fullPath = storage_path('app/'.$backupFileRel);

            if (! file_exists($fullPath)) {
                return back()->with('error', '❌ Backup file not found.');
            }

            $filename = basename($fullPath);

            @unlink($fullPath);

            // Log the deletion
            AuditLog::logAction([
                'action' => 'backup_deleted',
                'model_type' => 'System',
                'description' => "Database backup deleted: {$filename}",
                'old_values' => [
                    'filename' => $filename,
                ],
            ]);

            return back()->with('success', '✅ Backup deleted successfully.');

        } catch (\Exception $e) {
            \Log::error('Backup deletion failed: '.$e->getMessage());

            return back()->with('error', '❌ Delete failed: '.$e->getMessage());
        }
    }

    /**
     * Helper: Get list of backup files
     */
    private function getBackupsList()
    {
        $backups = [];

        // We check two locations:
        // 1. storage/app/NutriBantay (Primary for new backups)
        // 2. storage/app/private/NutriBantay (Legacy location)

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

        // Sort by timestamp descending (newest first)
        usort($backups, function ($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });

        return $backups;
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

        return round($bytes, $precision).' '.$units[$i];
    }
}
