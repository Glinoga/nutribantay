<?php

namespace App\Services;

use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use League\Flysystem\FilesystemAdapter;
use League\Flysystem\Config;

class GoogleDriveAdapter implements FilesystemAdapter
{
    protected Drive $service;
    protected string $folderId;

    public function __construct(Drive $service, string $folderId = 'root')
    {
        $this->service = $service;
        $this->folderId = $folderId;
    }

    public function write(string $path, string $contents, Config $config): array
    {
        $file = new DriveFile([
            'name' => basename($path),
            'parents' => [$this->folderId],
        ]);

        $result = $this->service->files->create($file, [
            'data' => $contents,
            'uploadType' => 'multipart',
            'fields' => 'id, name, size, modifiedTime',
        ]);

        return $this->normalizeFileInfo($result);
    }

    public function writeStream(string $path, $resource, Config $config): array
    {
        return $this->write($path, stream_get_contents($resource), $config);
    }

    public function update(string $path, string $contents, Config $config): array
    {
        return $this->write($path, $contents, $config);
    }

    public function updateStream(string $path, $resource, Config $config): array
    {
        return $this->write($path, stream_get_contents($resource), $config);
    }

    public function rename(string $from, string $to): void
    {
        $files = $this->service->files->listFiles([
            'q' => "name='".basename($from)."' and '{$this->folderId}' in parents",
            'fields' => 'files(id)',
        ]);

        if (count($files->files) > 0) {
            $fileId = $files->files[0]->id;
            $this->service->files->update($fileId, new DriveFile(['name' => basename($to)]));
        }
    }

    public function copy(string $from, string $to): void
    {
        $files = $this->service->files->listFiles([
            'q' => "name='".basename($from)."' and '{$this->folderId}' in parents",
            'fields' => 'files(id)',
        ]);

        if (count($files->files) > 0) {
            $fileId = $files->files[0]->id;
            $this->service->files->copy($fileId, new DriveFile(['name' => basename($to)]));
        }
    }

    public function delete(string $path): void
    {
        $files = $this->service->files->listFiles([
            'q' => "name='".basename($path)."' and '{$this->folderId}' in parents",
            'fields' => 'files(id)',
        ]);

        if (count($files->files) > 0) {
            $this->service->files->delete($files->files[0]->id);
        }
    }

    public function deleteDirectory(string $path): void
    {
        $this->delete($path);
    }

    public function createDirectory(string $path, Config $config): void
    {
        $folder = new DriveFile([
            'name' => basename($path),
            'mimeType' => 'application/vnd.google-apps.folder',
            'parents' => [$this->folderId],
        ]);

        $this->service->files->create($folder);
    }

    public function setVisibility(string $path, string $visibility): void
    {
        // Google Drive handles visibility via sharing settings
    }

    public function visibility(string $path): array
    {
        return ['visibility' => 'private'];
    }

    public function has(string $path): bool
    {
        return $this->fileExists($path);
    }

    public function fileExists(string $path): bool
    {
        $files = $this->service->files->listFiles([
            'q' => "name='".basename($path)."' and '{$this->folderId}' in parents",
            'fields' => 'files(id)',
        ]);

        return count($files->files) > 0;
    }

    public function directoryExists(string $path): bool
    {
        return $this->fileExists($path);
    }

    public function read(string $path): array
    {
        $files = $this->service->files->listFiles([
            'q' => "name='".basename($path)."' and '{$this->folderId}' in parents",
            'fields' => 'files(id)',
        ]);

        if (count($files->files) === 0) {
            throw new \Exception("File not found: $path");
        }

        $fileId = $files->files[0]->id;
        $response = $this->service->files->get($fileId, ['alt' => 'media']);
        
        return [
            'contents' => $response->getBody()->getContents(),
            'path' => $path,
        ];
    }

    public function readStream(string $path)
    {
        $data = $this->read($path);
        return fopen('php://memory', 'r+') ?: throw new \Exception('Failed to open memory stream');
    }

    public function listContents(string $path, bool $deep): iterable
    {
        $files = $this->service->files->listFiles([
            'q' => "'{$this->folderId}' in parents",
            'fields' => 'files(id, name, size, modifiedTime, mimeType)',
        ]);

        $contents = [];
        foreach ($files->files as $file) {
            $isFolder = $file->mimeType === 'application/vnd.google-apps.folder';
            $contents[] = [
                'type' => $isFolder ? 'dir' : 'file',
                'path' => $file->name,
                'size' => $file->size ?? 0,
                'timestamp' => strtotime($file->modifiedTime),
            ];
        }

        return $contents;
    }

    public function move(string $from, string $to): void
    {
        $this->rename($from, $to);
    }

    public function fileSize(string $path): array
    {
        $files = $this->service->files->listFiles([
            'q' => "name='".basename($path)."' and '{$this->folderId}' in parents",
            'fields' => 'files(id, size)',
        ]);

        if (count($files->files) > 0) {
            return ['size' => $files->files[0]->size ?? 0];
        }

        throw new \Exception("File not found: $path");
    }

    public function mimeType(string $path): array
    {
        return ['mimetype' => 'application/octet-stream'];
    }

    public function lastModified(string $path): array
    {
        $files = $this->service->files->listFiles([
            'q' => "name='".basename($path)."' and '{$this->folderId}' in parents",
            'fields' => 'files(id, modifiedTime)',
        ]);

        if (count($files->files) > 0) {
            return ['timestamp' => strtotime($files->files[0]->modifiedTime)];
        }

        throw new \Exception("File not found: $path");
    }

    protected function normalizeFileInfo($file): array
    {
        return [
            'type' => 'file',
            'path' => $file->name,
            'size' => $file->size ?? 0,
            'timestamp' => strtotime($file->modifiedTime ?? 'now'),
        ];
    }
}
