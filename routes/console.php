<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Monthly database backup (runs on the first day of each month at 02:00)
Schedule::command('app:backup-database')->monthly()->at('02:00');
