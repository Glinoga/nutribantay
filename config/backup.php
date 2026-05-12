<?php

use Spatie\Backup\Notifications\Notifiable;
use Spatie\Backup\Notifications\Notifications\BackupHasFailedNotification;
use Spatie\Backup\Notifications\Notifications\BackupWasSuccessfulNotification;
use Spatie\Backup\Notifications\Notifications\CleanupHasFailedNotification;
use Spatie\Backup\Notifications\Notifications\CleanupWasSuccessfulNotification;
use Spatie\Backup\Notifications\Notifications\HealthyBackupWasFoundNotification;
use Spatie\Backup\Notifications\Notifications\UnhealthyBackupWasFoundNotification;
use Spatie\Backup\Tasks\Cleanup\Strategies\DefaultStrategy;
use Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumAgeInDays;
use Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumStorageInMegabytes;

return [

    'backup' => [

        /*
         * The name of this application. You can use this name to monitor
         * the backups.
         */
        'name' => env('APP_NAME', 'laravel-backup'),

        'source' => [

            'files' => [

                /*
                 * The list of directories and files that will be included in the backup.
                 */
                'include' => [
                    // base_path(), // Uncomment to backup entire project
                ],

                /*
                 * These directories and files will be excluded from the backup.
                 */
                'exclude' => [
                    base_path('vendor'),
                    base_path('node_modules'),
                ],

                /*
                 * Determines if symlinks should be followed.
                 */
                'follow_links' => false,

                /*
                 * Determines if it should avoid unreadable folders.
                 */
                'ignore_unreadable_directories' => false,

                /*
                 * The relative path to the folder which contains the backups.
                 */
                'relative_path' => null,
            ],

            /*
             * The names of the connections to the databases that should be backed up.
             */
            'databases' => [
                'mysql',
            ],
        ],

        /*
         * The database dump can be compressed to decrease diskspace usage.
         */
        'database_dump_compressor' => 'gzip',

        /*
         * If specified, the backup zip file will be encrypted with the given password.
         */
        'password' => env('BACKUP_ARCHIVE_PASSWORD'),

        /*
         * The encryption algorithm to use for the backup zip file.
         */
        'encryption' => 'default',

        'destination' => [

            /*
             * The filename prefix used for the backup zip file.
             */
            'filename_prefix' => '',

            /*
             * The disk names on which the backups will be stored.
             */
            'disks' => [
                'local',
            ],
        ],

        /*
         * The directory where the temporary files will be stored.
         */
        'temporary_directory' => storage_path('app/backup-temp'),

        /*
         * The password to be used for archive encryption.
         * Set to `null` to disable encryption.
         */
        'tries' => 1,

        /*
         * The amount of seconds to wait before trying again.
         */
        'retry_delay' => 0,
    ],

    /*
     * You can get notified when specific events occur. Out of the box you can use 'mail' and 'slack'.
     * For Slack you need to install laravel/slack-notification-channel.
     */
    'notifications' => [

        'notifications' => [
            BackupHasFailedNotification::class => ['mail'],
            UnhealthyBackupWasFoundNotification::class => ['mail'],
            CleanupHasFailedNotification::class => ['mail'],
            BackupWasSuccessfulNotification::class => ['mail'],
            HealthyBackupWasFoundNotification::class => ['mail'],
            CleanupWasSuccessfulNotification::class => ['mail'],
        ],

        /*
         * Here you can specify the notifiable to which the notifications should be sent.
         */
        'notifiable' => Notifiable::class,

        'mail' => [
            'to' => env('BACKUP_MAIL_TO', 'your-email@example.com'),

            'from' => [
                'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
                'name' => env('MAIL_FROM_NAME', 'Example'),
            ],
        ],

        'slack' => [
            'webhook_url' => '',

            /*
             * If this is set to null the default channel of the webhook will be used.
             */
            'channel' => null,

            'username' => null,

            'icon' => null,

        ],

        'discord' => [
            'webhook_url' => '',

            /*
             * If this is an empty string, the name field on the webhook will be used.
             */
            'username' => '',

            'avatar_url' => '',
        ],
    ],

    /*
     * Here you can specify which backups should be monitored.
     */
    'monitor_backups' => [
        [
            'name' => env('APP_NAME', 'laravel-backup'),
            'disks' => ['local'],
            'health_checks' => [
                MaximumAgeInDays::class => 1,
                MaximumStorageInMegabytes::class => 20000,
            ],
        ],
    ],

    'cleanup' => [
        'strategy' => DefaultStrategy::class,

        'default_strategy' => [

            'keep_all_backups_for_days' => 7,

            'keep_daily_backups_for_days' => 7,

            'keep_weekly_backups_for_weeks' => 4,

            'keep_monthly_backups_for_months' => 3,

            'keep_yearly_backups_for_years' => 1,

            'delete_oldest_backups_when_using_more_megabytes_than' => 20000,
        ],
    ],

];
