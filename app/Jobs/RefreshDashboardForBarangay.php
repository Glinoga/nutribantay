<?php

namespace App\Jobs;

use App\Console\Commands\RefreshDashboardCache;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RefreshDashboardForBarangay implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $barangay
    ) {
        $this->queue = 'dashboard';
    }

    public function handle(RefreshDashboardCache $command): void
    {
        $command->refreshBarangay($this->barangay);
    }
}
