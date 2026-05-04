<?php

namespace App\Providers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use Google\Client;
use Google\Service\Drive;

class GoogleDriveServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        Storage::extend('google', function ($app, array $config) {
            // Service account JSON file path
            $serviceAccount = $config['service_account'] ?? null;
            
            $client = new Client();
            
            if ($serviceAccount && file_exists($serviceAccount)) {
                // Use service account (recommended for production)
                $client->setAuthConfig($serviceAccount);
            } else {
                // Use OAuth 2.0 (fallback)
                $client->setClientId($config['client_id'] ?? '');
                $client->setClientSecret($config['client_secret'] ?? '');
                $client->refreshToken($config['refresh_token'] ?? '');
            }
            
            $client->addScope(Drive::DRIVE);
            $client->setAccessType('offline');
            
            $service = new Drive($client);
            
            $folderId = $config['folder_id'] ?? null;
            
            // Create a simple adapter that uses the Google Drive service
            return new \Illuminate\Filesystem\FilesystemAdapter(
                new \League\Flysystem\Filesystem(
                    new \App\Services\GoogleDriveAdapter($service, $folderId)
                )
            );
        });
    }
}
