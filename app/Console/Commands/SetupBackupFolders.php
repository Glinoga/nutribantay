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
            storage_path('app/NutriBantay'),
            storage_path('app/private/NutriBantay'),
        ];

        foreach ($folders as $folder) {
            if (! file_exists($folder)) {
                mkdir($folder, 0775, true);
                $this->info("Created folder: {$folder}");
            } else {
                @chmod($folder, 0775);
                $this->info("Folder already exists: {$folder}");
            }
        }

        $this->info('✅ Backup folders setup complete!');
    }
}
