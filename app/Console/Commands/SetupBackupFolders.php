<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SetupBackupFolders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:setup-backup-folders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
{
    $folders = [
        storage_path('app/Laravel'),
        storage_path('app/backup-temp'),
        storage_path('app/restore-temp'),
    ];

    foreach ($folders as $folder) {
        if (!file_exists($folder)) {
            mkdir($folder, 0755, true);
            $this->info("Created folder: {$folder}");
        } else {
            $this->info("Folder already exists: {$folder}");
        }
    }

    $this->info('✅ Backup folders setup complete!');
}

}
