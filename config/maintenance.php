<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode Configuration
    |--------------------------------------------------------------------------
    |
    | Routes listed in the whitelist will remain accessible even when
    | maintenance mode is active. This ensures guests can still access
    | authentication pages and public content while the system is
    | undergoing maintenance.
    |
    | To add more routes, simply append them to the array below.
    | Wildcards (*) are supported — e.g. 'reset-password/*' matches
    | /reset-password/<any-token>.
    |
    */
    'whitelist' => [
        '/',
        'home',
        'login',
        'logout',
        'register',
        'staff',
        'staff/register',
        'forgot-password',
        'reset-password',
        'reset-password/*',
        'verify-email/*',
        'announcements',
        'contact',
        'guest/announcements',
        'guest/announcements/*',
        'guest/contact',
    ],
];
