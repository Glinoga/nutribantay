<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

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
    /**
 * Create a manual database backup
 */
public function backup()
{
    try {
        \Log::info('=== Starting manual backup from web interface ===');
        
        // Method 1: Try using Artisan::call with output capture
        $exitCode = Artisan::call('backup:run', [
            '--only-db' => true,
            '--disable-notifications' => true,
        ]);
        
        $output = Artisan::output();
        
        \Log::info('Artisan exitCode: ' . $exitCode);
        \Log::info('Artisan output: ' . $output);
        
        // Check if backup was actually created by looking for new files
        $backupPath = 'Laravel';
        $beforeBackup = collect(Storage::disk('local')->files($backupPath))
            ->filter(fn($file) => pathinfo($file, PATHINFO_EXTENSION) === 'zip')
            ->sortByDesc(fn($file) => Storage::disk('local')->lastModified($file))
            ->first();
        
        \Log::info('Most recent backup before: ' . ($beforeBackup ?? 'none'));
        
        // Wait a moment for file to be written
        sleep(2);
        
        $afterBackup = collect(Storage::disk('local')->files($backupPath))
            ->filter(fn($file) => pathinfo($file, PATHINFO_EXTENSION) === 'zip')
            ->sortByDesc(fn($file) => Storage::disk('local')->lastModified($file))
            ->first();
        
        \Log::info('Most recent backup after: ' . ($afterBackup ?? 'none'));
        
        // Check for success indicators
        $successIndicators = [
            stripos($output, 'Backup completed') !== false,
            stripos($output, 'successfully') !== false,
            $exitCode === 0,
            $afterBackup !== $beforeBackup, // New file was created
        ];
        
        $successCount = count(array_filter($successIndicators));
        
        \Log::info('Success indicators: ' . $successCount . ' of ' . count($successIndicators));
        
        if ($successCount >= 2) {
            // Get the new backup details
            $newBackupSize = Storage::disk('local')->size($afterBackup);
            $newBackupDate = Storage::disk('local')->lastModified($afterBackup);
            
            return response()->json([
                'success' => true,
                'message' => '✅ Database backup created successfully!',
                'timestamp' => date('Y-m-d H:i:s', $newBackupDate),
                'size' => $this->formatBytes($newBackupSize),
                'filename' => basename($afterBackup),
            ]);
        }
        
        // If we got here, something might be wrong
        // Try alternative method: exec() with full path
        return $this->backupViaExec();
        
    } catch (\Exception $e) {
        \Log::error('Database backup failed (Exception): ' . $e->getMessage());
        \Log::error('Stack trace: ' . $e->getTraceAsString());

        \App\Models\AuditLog::logAction([
        'action' => 'backup_created',
        'model_type' => 'System',
        'description' => "Database backup created: {$filename}",
        'new_values' => [
            'filename' => basename($afterBackup),
            'size' => $this->formatBytes($newBackupSize),
            'timestamp' => date('Y-m-d H:i:s', $newBackupDate),
        ],
    ]);
        
        return response()->json([
            'success' => false,
            'message' => '❌ Backup failed: ' . $e->getMessage(),
        ], 500);
    }
}

/**
 * Alternative backup method using exec()
 */
private function backupViaExec()
{
    \Log::info('Trying backup via exec() method...');
    
    try {
        // Get the PHP and artisan paths
        $phpPath = PHP_BINARY; // Full path to current PHP executable
        $artisanPath = base_path('artisan');
        
        // Build command
        $command = sprintf(
            '"%s" "%s" backup:run --only-db --disable-notifications 2>&1',
            $phpPath,
            $artisanPath
        );
        
        \Log::info('Executing command: ' . $command);
        
        // Execute command
        $output = [];
        $returnVar = 0;
        exec($command, $output, $returnVar);
        
        $outputString = implode("\n", $output);
        
        \Log::info('Exec return code: ' . $returnVar);
        \Log::info('Exec output: ' . $outputString);
        
        // Check if successful
        if ($returnVar === 0 || 
            stripos($outputString, 'Backup completed') !== false ||
            stripos($outputString, 'successfully') !== false) {
            
            // Get latest backup file
            $backupPath = 'Laravel';
            $latestBackup = collect(Storage::disk('local')->files($backupPath))
                ->filter(fn($file) => pathinfo($file, PATHINFO_EXTENSION) === 'zip')
                ->sortByDesc(fn($file) => Storage::disk('local')->lastModified($file))
                ->first();
            
            if ($latestBackup) {
                $backupSize = Storage::disk('local')->size($latestBackup);
                $backupDate = Storage::disk('local')->lastModified($latestBackup);
                
                return response()->json([
                    'success' => true,
                    'message' => '✅ Database backup created successfully!',
                    'timestamp' => date('Y-m-d H:i:s', $backupDate),
                    'size' => $this->formatBytes($backupSize),
                    'filename' => basename($latestBackup),
                    'method' => 'exec',
                ]);
            }
        }
        
        return response()->json([
            'success' => false,
            'message' => '⚠️ Backup command executed but status unclear. Please check storage.',
            'output' => $outputString,
        ], 500);
        
    } catch (\Exception $e) {
        \Log::error('Backup via exec failed: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => '❌ Backup failed: ' . $e->getMessage(),
        ], 500);
    }
}
    
    /**
     * Get list of available backups
     */
    public function list()
    {
        $backups = $this->getBackupsList();
        
        return response()->json([
            'success' => true,
            'backups' => $backups,
        ]);
    }
    
    /**
     * Restore database from backup file
     */
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
        
        // Build the full path - backups are in Laravel folder
        $fullPath = 'Laravel/' . basename($backupFile);
        
        // Verify backup file exists
        if (!Storage::disk('local')->exists($fullPath)) {
            \Log::error("Backup file not found at: {$fullPath}");
            
            return response()->json([
                'success' => false,
                'message' => '❌ Backup file not found.',
            ], 404);
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
        if (!file_exists($extractPath)) {
            mkdir($extractPath, 0755, true);
        }
        
        // Clear any existing files in temp directory
        $this->recursiveDelete($extractPath);
        mkdir($extractPath, 0755, true);
        
        // Extract zip file
        $zip = new \ZipArchive;
        if ($zip->open($backupPath) === TRUE) {
            $zip->extractTo($extractPath);
            
            // Log extracted files for debugging
            $extractedFiles = [];
            for($i = 0; $i < $zip->numFiles; $i++) {
                $extractedFiles[] = $zip->getNameIndex($i);
            }
            \Log::info("Extracted files: " . json_encode($extractedFiles));
            
            $zip->close();
        } else {
            throw new \Exception('Failed to extract backup archive.');
        }
        
        // Step 3: Find the SQL file (recursively search all subdirectories)
        $sqlFile = $this->findSqlFile($extractPath);
        
        if (!$sqlFile) {
            // List all files for debugging
            $allFiles = $this->listAllFiles($extractPath);
            \Log::error("SQL file not found. All extracted files: " . json_encode($allFiles));
            
            throw new \Exception('SQL file not found in backup archive. Please check if the backup is valid.');
        }
        
        \Log::info("Found SQL file at: {$sqlFile}");
        
        // Step 4: Restore database
        $this->restoreDatabase($sqlFile);
        
        // Step 5: Cleanup temp files
        $this->recursiveDelete($extractPath);
        
        \Log::info('Database restored successfully from: ' . $backupFile);
        
        return response()->json([
            'success' => true,
            'message' => '✅ Database restored successfully! A pre-restore backup was created automatically.',
        ]);
        
    } catch (\Exception $e) {
        \Log::error('Database restore failed: ' . $e->getMessage());
        \Log::error('Stack trace: ' . $e->getTraceAsString());
        
        // Cleanup temp directory on error
        if (isset($extractPath) && file_exists($extractPath)) {
            $this->recursiveDelete($extractPath);
        }
        
        return response()->json([
            'success' => false,
            'message' => '❌ Restore failed: ' . $e->getMessage(),
        ], 500);
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
    if (!file_exists($directory)) {
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
    /**
 * Download a backup file
 */
public function download($filename)
{
    $path = 'Laravel/' . $filename;
    
    if (!Storage::disk('local')->exists($path)) {
        abort(404, 'Backup file not found.');
    }
    
    return Storage::disk('local')->download($path);
}
    
    
    /**
     * Delete a backup file
     */
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
        
        if (!Storage::disk('local')->exists($backupFile)) {
            return response()->json([
                'success' => false,
                'message' => '❌ Backup file not found.',
            ], 404);
        }
        
        Storage::disk('local')->delete($backupFile);
        
        return response()->json([
            'success' => true,
            'message' => '✅ Backup deleted successfully.',
        ]);
        
    } catch (\Exception $e) {
        \Log::error('Backup deletion failed: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => '❌ Delete failed: ' . $e->getMessage(),
        ], 500);
    }
}
    
    /**
     * Helper: Get list of backup files
     */
    /**
 * Helper: Get list of backup files
 */
private function getBackupsList()
{
    $backups = [];
    
    // Backups are stored in the Laravel folder
    $backupPath = 'Laravel';
    
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
                'path' => $file,  // This will be 'Laravel/filename.zip'
                'size' => $this->formatBytes($size),
                'size_bytes' => $size,
                'date' => Carbon::createFromTimestamp($timestamp)->format('Y-m-d H:i:s'),
                'timestamp' => $timestamp,
            ];
        }
    }
    
    // Sort by timestamp descending (newest first)
    usort($backups, function($a, $b) {
        return $b['timestamp'] - $a['timestamp'];
    });
    
    return $backups;
}
    
    /**
     * Helper: Restore database from SQL file
     */
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
            'This backup contains SQLite data, but your database is MySQL. ' .
            'This backup is incompatible. Please delete old backups and create new ones.'
        );
    }
    
    // Verify it looks like a MySQL dump
    if (stripos($sql, 'MySQL dump') === false && 
        stripos($sql, 'SET @OLD_CHARACTER_SET_CLIENT') === false &&
        stripos($sql, 'ENGINE=InnoDB') === false) {
        
        throw new \Exception(
            'This does not appear to be a valid MySQL backup file. ' .
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
        
        \Log::error('MySQL restore via DB::unprepared failed: ' . $e->getMessage());
        
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
    
    // Find mysql executable
    $mysqlPath = 'mysql'; // Default to PATH
    
    // Common Windows MySQL paths
    $possiblePaths = [
        'C:/xampp/mysql/bin/mysql.exe',
        'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe',
        'C:/Program Files/MySQL/MySQL Server 5.7/bin/mysql.exe',
    ];
    
    foreach ($possiblePaths as $path) {
        if (file_exists($path)) {
            $mysqlPath = $path;
            break;
        }
    }
    
    // Build mysql command
    $passwordArg = $password ? '--password=' . escapeshellarg($password) : '';
    
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
    
    \Log::info('Executing mysql restore command...');
    
    // Execute command
    $output = [];
    $returnVar = 0;
    exec($command, $output, $returnVar);
    
    if ($returnVar !== 0) {
        throw new \Exception(
            'MySQL restore via command line failed. ' .
            'Return code: ' . $returnVar . '. ' .
            'Output: ' . implode("\n", $output)
        );
    }
    
    \Log::info('Database restored successfully using mysql command line');
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