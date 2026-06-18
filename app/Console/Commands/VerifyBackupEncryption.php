<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class VerifyBackupEncryption extends Command
{
    protected $signature = 'app:verify-backup-encryption';

    protected $description = 'Verify that the backup encryption password is configured and works with AES-256';

    public function handle(): int
    {
        $password = config('app.backup_encryption_password');

        if (! $password) {
            $this->error('BACKUP_ENCRYPTION_PASSWORD is not set in config/app.php or the .env file.');
            $this->line('Expected key: BACKUP_ENCRYPTION_PASSWORD in your .env');

            return Command::FAILURE;
        }

        $this->info('Backup encryption password is configured.');

        $tmpDir = storage_path('app/backup-test');
        $sqlFile = $tmpDir.'/test.sql';
        $zipPath = $tmpDir.'/test.zip';

        try {
            if (! is_dir($tmpDir)) {
                mkdir($tmpDir, 0755, true);
            }

            file_put_contents($sqlFile, '-- NutriBantay backup encryption verification test');

            $zip = new \ZipArchive;
            if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
                $this->error('Failed to create test zip archive.');

                return Command::FAILURE;
            }

            $zip->addFile($sqlFile, 'test-db.sql');
            $zip->setPassword($password);
            $zip->setEncryptionName('test-db.sql', \ZipArchive::EM_AES_256);
            $zip->close();

            $verify = new \ZipArchive;
            if ($verify->open($zipPath) !== true) {
                $this->error('Failed to open test zip for verification.');

                return Command::FAILURE;
            }

            $stat = $verify->statIndex(0);
            $verify->close();

            $encMethod = $stat['encryption_method'] ?? 0;

            if ($encMethod === 0) {
                $this->error('Test file is NOT encrypted. ZipArchive::EM_AES_256 may not be supported.');
                $this->line('PHP ZipArchive encryption support: '.(\ZipArchive::EM_AES_256 === 1 ? 'AES-256 available' : 'AES-256 constant: '.\ZipArchive::EM_AES_256));

                return Command::FAILURE;
            }

            $this->info('✓ Encryption method confirmed: AES-256 (method code: '.$encMethod.')');

            $extract = new \ZipArchive;
            if ($extract->open($zipPath) !== true) {
                $this->error('Failed to open test zip for extraction test.');

                return Command::FAILURE;
            }

            $extract->setPassword($password);
            $extracted = $extract->extractTo($tmpDir, ['test-db.sql']);
            $extract->close();

            if (! $extracted || ! file_exists($tmpDir.'/test-db.sql')) {
                $this->error('Failed to extract test file with the configured password.');
                $this->line('The password in config("app.backup_encryption_password") may not match the .env value.');

                return Command::FAILURE;
            }

            $this->info('✓ Successfully decrypted test file with the configured password.');
            $this->info('');
            $this->info('Backup encryption is fully operational.');
            $this->info('Password mask: '.substr($password, 0, 2).str_repeat('*', max(0, strlen($password) - 4)).substr($password, -2));

            return Command::SUCCESS;

        } catch (\Throwable $e) {
            $this->error('Verification failed with exception: '.$e->getMessage());

            return Command::FAILURE;
        } finally {
            if (file_exists($tmpDir.'/test-db.sql')) {
                @unlink($tmpDir.'/test-db.sql');
            }
            if (file_exists($zipPath)) {
                @unlink($zipPath);
            }
            if (file_exists($sqlFile)) {
                @unlink($sqlFile);
            }
            if (is_dir($tmpDir)) {
                @rmdir($tmpDir);
            }
        }
    }
}
