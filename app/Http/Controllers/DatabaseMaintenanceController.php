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
    public function backup()
    {
        try {
            // Run database backup only
            Artisan::call('backup:run', [
                '--only-db' => true,
                '--disable-notifications' => true,
            ]);
            
            $output = Artisan::output();
            
            // Check if backup was successful
            if (strpos($output, 'Backup completed') !== false || strpos($output, 'Backup successful') !== false) {
                return response()->json([
                    'success' => true,
                    'message' => '✅ Database backup created successfully!',
                    'timestamp' => now()->format('Y-m-d H:i:s'),
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => '⚠️ Backup command executed but status unclear. Please check storage.',
            ], 500);
            
        } catch (\Exception $e) {
            \Log::error('Database backup failed: ' . $e->getMessage());
            
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
    public function restore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|string',
            'confirmation' => 'required|string|in:RESTORE DATABASE',
        ]);
        
        try {
            $backupFile = $request->input('backup_file');
            
            // Verify backup file exists
            if (!Storage::disk('local')->exists($backupFile)) {
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
            $backupPath = Storage::disk('local')->path($backupFile);
            $extractPath = storage_path('app/restore-temp');
            
            // Create temp directory
            if (!file_exists($extractPath)) {
                mkdir($extractPath, 0755, true);
            }
            
            // Extract zip file
            $zip = new \ZipArchive;
            if ($zip->open($backupPath) === TRUE) {
                $zip->extractTo($extractPath);
                $zip->close();
            } else {
                throw new \Exception('Failed to extract backup archive.');
            }
            
            // Find the SQL file
            $sqlFile = null;
            $files = scandir($extractPath);
            foreach ($files as $file) {
                if (pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
                    $sqlFile = $extractPath . '/' . $file;
                    break;
                }
            }
            
            if (!$sqlFile || !file_exists($sqlFile)) {
                throw new \Exception('SQL file not found in backup archive.');
            }
            
            // Step 3: Restore database
            $this->restoreDatabase($sqlFile);
            
            // Step 4: Cleanup temp files
            array_map('unlink', glob("$extractPath/*"));
            rmdir($extractPath);
            
            \Log::info('Database restored successfully from: ' . $backupFile);
            
            return response()->json([
                'success' => true,
                'message' => '✅ Database restored successfully! A pre-restore backup was created automatically.',
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Database restore failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => '❌ Restore failed: ' . $e->getMessage(),
            ], 500);
        }
    }
    
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
    private function getBackupsList()
    {
        $backups = [];
        
        if (Storage::disk('local')->exists('Laravel')) {
            $files = Storage::disk('local')->files('Laravel');
            
            foreach ($files as $file) {
                $filename = basename($file);
                $size = Storage::disk('local')->size($file);
                $timestamp = Storage::disk('local')->lastModified($file);
                
                $backups[] = [
                    'filename' => $filename,
                    'path' => $file,
                    'size' => $this->formatBytes($size),
                    'size_bytes' => $size,
                    'date' => Carbon::createFromTimestamp($timestamp)->format('Y-m-d H:i:s'),
                    'timestamp' => $timestamp,
                ];
            }
            
            // Sort by timestamp descending (newest first)
            usort($backups, function($a, $b) {
                return $b['timestamp'] - $a['timestamp'];
            });
        }
        
        return $backups;
    }
    
    /**
     * Helper: Restore database from SQL file
     */
    private function restoreDatabase($sqlFile)
    {
        $database = config('database.connections.sqlite.database');
        
        // Read SQL file
        $sql = file_get_contents($sqlFile);
        
        if (empty($sql)) {
            throw new \Exception('SQL file is empty or unreadable.');
        }
        
        // For SQLite, we need to replace the database file
        // First, clear all tables
        DB::statement('PRAGMA foreign_keys = OFF');
        
        // Get all tables
        $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        
        foreach ($tables as $table) {
            DB::statement("DROP TABLE IF EXISTS `{$table->name}`");
        }
        
        // Execute the SQL dump
        DB::unprepared($sql);
        
        DB::statement('PRAGMA foreign_keys = ON');
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