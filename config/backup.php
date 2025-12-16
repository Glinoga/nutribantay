<?php

return [
    'backup' => [
        'name' => env('APP_NAME', 'laravel-backup'),
        
        'source' => [
            'files' => [
                'include' => [],
                'exclude' => [],
                'follow_links' => false,
                'ignore_unreadable_directories' => false,
                'relative_path' => null,
            ],
            
            'databases' => [
                'sqlite',
            ],
        ],
        
        'database_dump_compressor' => null,
        
        'destination' => [
            'filename_prefix' => 'nutribantay-',
            'disks' => [
                'local',
            ],
        ],
        
        'temporary_directory' => storage_path('app/backup-temp'),
        
        'password' => env('BACKUP_ARCHIVE_PASSWORD'),
        
        'encryption' => 'default',
    ],
    
    'notifications' => [
        'notifications' => [],
        'notifiable' => \Spatie\Backup\Notifications\Notifiable::class,
        'mail' => [
            'to' => 'admin@example.com',
            'from' => [
                'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
                'name' => env('MAIL_FROM_NAME', 'Example'),
            ],
        ],
        'slack' => [
            'webhook_url' => '',
            'channel' => null,
            'username' => null,
            'icon' => null,
        ],
        'discord' => [
            'webhook_url' => '',
            'username' => '',
            'avatar_url' => '',
        ],
    ],
    
    'monitor_backups' => [],
    
    'cleanup' => [
        'strategy' => \Spatie\Backup\Tasks\Cleanup\Strategies\DefaultStrategy::class,
        'default_strategy' => [
            'keep_all_backups_for_days' => 7,
            'keep_daily_backups_for_days' => 16,
            'keep_weekly_backups_for_weeks' => 8,
            'keep_monthly_backups_for_months' => 4,
            'keep_yearly_backups_for_years' => 2,
            'delete_oldest_backups_when_using_more_megabytes_than' => 5000,
        ],
    ],
];