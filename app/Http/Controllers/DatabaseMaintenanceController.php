<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
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
     * Create a manual database backup
     */
    public function backup()
    {
        try {
            \Log::info('=== Starting manual backup from web interface ===');

            // Use spatie backup package
            \Artisan::call('backup:run', [
                '--only-db' => true,
            ]);

            $output = \Artisan::output();
            \Log::info('Backup command output: '.$output);

            // Get the latest backup file (spatie stores in storage/app/private/{APP_NAME}/)
            $backupPath = storage_path('app/private/NutriBantay');
            $latestBackup = null;
            $latestTime = 0;

            if (is_dir($backupPath)) {
                foreach (glob($backupPath.'/*.zip') as $file) {
                    $mtime = filemtime($file);
                    if ($mtime > $latestTime) {
                        $latestTime = $mtime;
                        $latestBackup = $file;
                    }
                }
            }

            if ($latestBackup && $latestTime > time() - 300) { // Created within last 5 minutes
                $filename = basename($latestBackup);
                $size = filesize($latestBackup);

                // Log the backup creation in audit log
                AuditLog::logAction([
                    'action' => 'backup_created',
                    'model_type' => 'System',
                    'description' => "Database backup created: {$filename}",
                    'new_values' => [
                        'filename' => $filename,
                        'size' => $this->formatBytes($size),
                        'timestamp' => date('Y-m-d H:i:s', $latestTime),
                    ],
                ]);

                return back()->with('success', "✅ Database backup created successfully! Backup: {$filename}");
            }

            // If we got here, check if the command output indicates success
            if (strpos($output, 'Backup completed') !== false || strpos($output, 'successfully') !== false) {
                return back()->with('success', '✅ Database backup created successfully!');
            }

            return back()->with('warning', 'Backup command executed but status unclear. Please check storage/app/private/NutriBantay/ folder.');

        } catch (\Exception $e) {
            \Log::error('Database backup failed: '.$e->getMessage());
            \Log::error('Stack trace: '.$e->getTraceAsString());

            // Log the failed backup attempt
            AuditLog::logAction([
                'action' => 'backup_failed',
                'model_type' => 'System',
                'description' => "Database backup failed: {$e->getMessage()}",
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
     * Restore database from backup file
     */
    public function restore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|string',
            'confirmation' => 'required|string|in:RESTORE DATABASE',
        ]);

        try {
            $backupFile = $request->input('backup_file');

            // Build the full path - backups are stored in {APP_NAME} folder (NutriBantay)
            $fullPath = 'NutriBantay/'.basename($backupFile);

            // Verify backup file exists
            if (! Storage::disk('local')->exists($fullPath)) {
                \Log::error("Backup file not found at: {$fullPath}");

                return back()->with('error', '❌ Backup file not found.');
            }

            // Step 1: Create pre-restore backup
            \Log::info('Creating pre-restore backup...');
            Artisan::call('backup:run', [
                '--only-db' => true,
                '--disable-notifications' => true,
            ]);

            // Step 2: Extract and restore the backup
            $backupPath = Storage::disk('local')->path($fullPath);
            $extractPath = storage_path('app/restore-temp');

            \Log::info("Extracting from: {$backupPath}");
            \Log::info("Extracting to: {$extractPath}");

            // Create temp directory
            if (! file_exists($extractPath)) {
                mkdir($extractPath, 0755, true);
            }

            // Clear any existing files in temp directory
            $this->recursiveDelete($extractPath);
            mkdir($extractPath, 0755, true);

            // Extract zip file
            $zip = new \ZipArchive;
            if ($zip->open($backupPath) === true) {
                $zip->extractTo($extractPath);

                // Log extracted files for debugging
                $extractedFiles = [];
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $extractedFiles[] = $zip->getNameIndex($i);
                }
                \Log::info('Extracted files: '.json_encode($extractedFiles));

                $zip->close();
            } else {
                throw new \Exception('Failed to extract backup archive.');
            }

            // Step 3: Find the SQL file (recursively search all subdirectories)
            $sqlFile = $this->findSqlFile($extractPath);

            if (! $sqlFile) {
                // List all files for debugging
                $allFiles = $this->listAllFiles($extractPath);
                \Log::error('SQL file not found. All extracted files: '.json_encode($allFiles));

                throw new \Exception('SQL file not found in backup archive. Please check if the backup is valid.');
            }

            \Log::info("Found SQL file at: {$sqlFile}");

            // Step 4: Restore database
            $this->restoreDatabase($sqlFile);

            // Step 5: Cleanup temp files
            $this->recursiveDelete($extractPath);

            \Log::info('Database restored successfully from: '.$backupFile);

            // Log the successful restore
            AuditLog::logAction([
                'action' => 'backup_restored',
                'model_type' => 'System',
                'description' => 'Database restored from backup: '.basename($backupFile),
                'new_values' => [
                    'backup_file' => basename($backupFile),
                    'restored_at' => now()->toDateTimeString(),
                ],
            ]);

            return back()->with('success', '✅ Database restored successfully! A pre-restore backup was created automatically.');

        } catch (\Exception $e) {
            \Log::error('Database restore failed: '.$e->getMessage());
            \Log::error('Stack trace: '.$e->getTraceAsString());

            // Log the failed restore
            AuditLog::logAction([
                'action' => 'backup_restore_failed',
                'model_type' => 'System',
                'description' => "Database restore failed: {$e->getMessage()}",
                'old_values' => [
                    'backup_file' => $request->input('backup_file'),
                ],
            ]);

            // Cleanup temp directory on error
            if (isset($extractPath) && file_exists($extractPath)) {
                $this->recursiveDelete($extractPath);
            }

            return back()->with('error', '❌ Restore failed: '.$e->getMessage());
        }
    }

    /**
     * Recursively find SQL file in directory
     */
    private function findSqlFile($directory)
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
     * Download a backup file
     */
    public function download($filename)
    {
        $path = 'NutriBantay/'.$filename;

        if (! Storage::disk('local')->exists($path)) {
            abort(404, 'Backup file not found.');
        }

        return Storage::disk('local')->download($path);
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
            $backupFile = $request->input('backup_file');

            if (! Storage::disk('local')->exists($backupFile)) {
                return back()->with('error', '❌ Backup file not found.');
            }

            $filename = basename($backupFile);

            Storage::disk('local')->delete($backupFile);

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

        // Backups are stored in the {APP_NAME} folder (NutriBantay)
        $backupPath = 'NutriBantay';

        if (Storage::disk('local')->exists($backupPath)) {
            $files = Storage::disk('local')->files($backupPath);

            foreach ($files as $file) {
                // Only process .zip files
                if (pathinfo($file, PATHINFO_EXTENSION) !== 'zip') {
                    continue;
                }

                $filename = basename($file);
                $size = Storage::disk('local')->size($file);
                $timestamp = Storage::disk('local')->lastModified($file);

                $backups[] = [
                    'filename' => $filename,
                    'path' => $backupPath.'/'.$filename,  // This will be 'NutriBantay/filename.zip'
                    'size' => $this->formatBytes($size),
                    'size_bytes' => $size,
                    'date' => Carbon::createFromTimestamp($timestamp)->format('Y-m-d H:i:s'),
                    'timestamp' => $timestamp,
                ];
            }
        }

        // Sort by timestamp descending (newest first)
        usort($backups, function ($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });

        return $backups;
    }

    /**
     * Helper: Restore database from SQL file
     */
    private function restoreDatabase($sqlFile)
    {
        // Read SQL file
        $sql = file_get_contents($sqlFile);

        if (empty($sql)) {
            throw new \Exception('SQL file is empty or unreadable.');
        }

        // CRITICAL CHECK: Reject SQLite dumps
        if (stripos($sql, 'PRAGMA foreign_keys') !== false ||
            stripos($sql, 'BEGIN TRANSACTION') !== false ||
            stripos($sql, 'AUTOINCREMENT') !== false) {

            throw new \Exception(
                'This backup contains SQLite data, but your database is MySQL. '.
                'This backup is incompatible. Please delete old backups and create new ones.'
            );
        }

        // Verify it looks like a MySQL dump
        if (stripos($sql, 'MySQL dump') === false &&
            stripos($sql, 'SET @OLD_CHARACTER_SET_CLIENT') === false &&
            stripos($sql, 'ENGINE=InnoDB') === false) {

            throw new \Exception(
                'This does not appear to be a valid MySQL backup file. '.
                'Please ensure DB_CONNECTION=mysql in your .env file and create new backups.'
            );
        }

        \Log::info('SQL file validated as MySQL dump. Proceeding with restore...');

        try {
            // Disable foreign key checks during restore
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            // Execute the SQL dump
            DB::unprepared($sql);

            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            \Log::info('Database restored successfully using MySQL');

        } catch (\Exception $e) {
            // Re-enable foreign key checks on error
            try {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            } catch (\Exception $cleanupError) {
                // Ignore cleanup errors
            }

            \Log::error('MySQL restore via DB::unprepared failed: '.$e->getMessage());

            // Try alternative method using mysql command line
            $this->restoreDatabaseViaCommandLine($sqlFile);
        }
    }

    /**
     * Alternative restore method using mysql command line
     */
    private function restoreDatabaseViaCommandLine($sqlFile)
    {
        $database = config('database.connections.mysql.database');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');
        $port = config('database.connections.mysql.port');

        // Auto-detect mysql executable
        $mysqlPath = $this->detectMysqlPath();

        // Build mysql command
        $passwordArg = $password ? '--password='.escapeshellarg($password) : '';

        $command = sprintf(
            '"%s" --host=%s --port=%s --user=%s %s %s < "%s" 2>&1',
            $mysqlPath,
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            $passwordArg,
            escapeshellarg($database),
            $sqlFile
        );

        \Log::info('Executing mysql restore command with path: '.$mysqlPath);

        // Execute command
        $output = [];
        $returnVar = 0;
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            throw new \Exception(
                'MySQL restore via command line failed. '.
                'Return code: '.$returnVar.'. '.
                'Output: '.implode("\n", $output).
                ' (Using MySQL path: '.$mysqlPath.')'
            );
        }

        \Log::info('Database restored successfully using mysql command line ('.$mysqlPath.')');
    }

    /**
     * Auto-detect MySQL executable path
     */
    private function detectMysqlPath()
    {
        // First try: use 'mysql' and rely on system PATH
        $output = [];
        $returnVar = 0;
        exec('which mysql 2>/dev/null', $output, $returnVar);
        if ($returnVar === 0 && ! empty($output[0]) && file_exists($output[0])) {
            \Log::info('Detected mysql via which: '.$output[0]);

            return $output[0];
        }

        // Second try: common paths for different OS
        $possiblePaths = [
            // Linux/macOS
            '/usr/bin/mysql',
            '/usr/local/bin/mysql',
            '/usr/local/mysql/bin/mysql',
            // Windows
            'C:\xampp\mysql\bin\mysql.exe',
            'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe',
            'C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe',
            'C:\wamp\bin\mysql\mysql8.0.21\bin\mysql.exe',
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                \Log::info('Found mysql at common path: '.$path);

                return $path;
            }
        }

        // Fallback: just use 'mysql' and hope it's in PATH
        \Log::warning('Could not detect mysql path, falling back to "mysql" in PATH');

        return 'mysql';
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
