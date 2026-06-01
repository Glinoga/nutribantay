<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckScheduler extends Command
{
    protected $signature = 'app:check-scheduler';

    protected $description = 'Diagnose scheduler and backup setup';

    public function handle(): int
    {
        $this->info('=== Scheduler Diagnostics ===');
        $this->newLine();

        // 1. Check if this is being run from cron
        $this->line('1. Running environment:');
        $this->line('   - PID: '.getmypid());
        $this->line('   - User: '.trim(shell_exec('whoami') ?? 'unknown'));
        $this->line('   - PHP binary: '.PHP_BINARY);
        $this->newLine();

        // 2. Check crontab
        $this->line('2. Crontab entries:');
        $crontab = shell_exec('crontab -l 2>&1') ?? '(none — no crontab or permission denied)';
        foreach (explode("\n", trim($crontab)) as $line) {
            $this->line("   {$line}");
        }
        $this->newLine();

        // 3. Check mysqldump
        $this->line('3. mysqldump (required by spatie backup):');
        $mysqldump = shell_exec('command -v mysqldump 2>&1') ?? '';
        if ($mysqldump) {
            $version = shell_exec('mysqldump --version 2>&1');
            $this->line("   Found: {$mysqldump}");
            $this->line('   Version: '.trim(explode("\n", $version ?? '')[0]));
        } else {
            $this->warn('   NOT FOUND — spatie daily backup will fail! Install mysqldump.');
        }
        $this->newLine();

        // 4. Check queue worker
        $this->line('4. Queue worker (supervisor):');
        $supervisor = shell_exec('supervisorctl status 2>&1') ?? '(unavailable)';
        foreach (explode("\n", trim($supervisor)) as $line) {
            $this->line("   {$line}");
        }
        $this->newLine();

        // 5. Show next scheduled tasks
        $this->line('5. Upcoming scheduled tasks (schedule:list):');
        $list = shell_exec(PHP_BINARY.' artisan schedule:list --no-interaction 2>&1') ?? '(failed to list)';
        foreach (explode("\n", trim($list)) as $line) {
            $this->line("   {$line}");
        }
        $this->newLine();

        // 6. Check storage write permissions
        $this->line('6. Storage write check:');
        $paths = [
            storage_path('logs'),
            storage_path('app/backup-temp'),
            storage_path('app/NutriBantay'),
        ];
        foreach ($paths as $path) {
            if (is_dir($path) && is_writable($path)) {
                $this->line("   [OK] {$path}");
            } else {
                $this->warn("   [FAIL] {$path} — not writable or missing");
            }
        }
        $this->newLine();

        // 7. Check scheduler log
        $schedLog = storage_path('logs/scheduler.log');
        $this->line('7. Scheduler log:');
        if (file_exists($schedLog)) {
            $lines = file($schedLog);
            $last = array_slice($lines, -10);
            foreach ($last as $line) {
                $this->line("   {$line}");
            }
        } else {
            $this->warn('   logs/scheduler.log not found — cron may not have run yet.');
        }
        $this->newLine();

        $this->info('=== Done ===');

        return Command::SUCCESS;
    }
}
