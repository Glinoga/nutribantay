<?php

namespace App\Traits;

use App\Models\AuditLog;

trait AuditableModel
{
    /**
     * Boot the auditable trait for a model.
     */
    public static function bootAuditableModel()
    {
        static::created(function ($model) {
            $model->auditCreated();
        });

        static::updated(function ($model) {
            $model->auditUpdated();
        });

        static::deleted(function ($model) {
            $model->auditDeleted();
        });

        // For soft deletes
        if (method_exists(static::class, 'restored')) {
            static::restored(function ($model) {
                $model->auditRestored();
            });
        }

        // For force delete
        if (method_exists(static::class, 'forceDeleted')) {
            static::forceDeleted(function ($model) {
                $model->auditForceDeleted();
            });
        }
    }

    /**
     * Log the creation of a model.
     */
    protected function auditCreated()
    {
        AuditLog::logAction([
            'action' => 'created',
            'model_type' => class_basename($this),
            'model_id' => $this->getKey(),
            'model_name' => $this->getAuditName(),
            'description' => $this->getAuditDescription('created'),
            'new_values' => $this->getAuditableAttributes(),
        ]);
    }

    /**
     * Log the update of a model.
     */
    protected function auditUpdated()
    {
        // Only log if there are actual changes
        if (!$this->isDirty()) {
            return;
        }

        AuditLog::logAction([
            'action' => 'updated',
            'model_type' => class_basename($this),
            'model_id' => $this->getKey(),
            'model_name' => $this->getAuditName(),
            'description' => $this->getAuditDescription('updated'),
            'old_values' => $this->getOriginalAuditableAttributes(),
            'new_values' => $this->getChangedAuditableAttributes(),
        ]);
    }

    /**
     * Log the deletion of a model.
     */
    protected function auditDeleted()
    {
        $action = $this->isForceDeleting() ? 'permanently_deleted' : 'archived';
        
        AuditLog::logAction([
            'action' => $action,
            'model_type' => class_basename($this),
            'model_id' => $this->getKey(),
            'model_name' => $this->getAuditName(),
            'description' => $this->getAuditDescription($action),
            'old_values' => $this->getAuditableAttributes(),
        ]);
    }

    /**
     * Log the restoration of a soft-deleted model.
     */
    protected function auditRestored()
    {
        AuditLog::logAction([
            'action' => 'restored',
            'model_type' => class_basename($this),
            'model_id' => $this->getKey(),
            'model_name' => $this->getAuditName(),
            'description' => $this->getAuditDescription('restored'),
            'new_values' => $this->getAuditableAttributes(),
        ]);
    }

    /**
     * Log the force deletion of a model.
     */
    protected function auditForceDeleted()
    {
        AuditLog::logAction([
            'action' => 'permanently_deleted',
            'model_type' => class_basename($this),
            'model_id' => $this->getKey(),
            'model_name' => $this->getAuditName(),
            'description' => $this->getAuditDescription('permanently_deleted'),
            'old_values' => $this->getAuditableAttributes(),
        ]);
    }

    /**
     * Get the name to display in audit logs.
     */
    protected function getAuditName(): string
    {
        // Try to use common naming attributes
        if (isset($this->attributes['name'])) {
            return $this->attributes['name'];
        }

        if (isset($this->attributes['fullname'])) {
            return $this->attributes['fullname'];
        }

        if (isset($this->attributes['title'])) {
            return $this->attributes['title'];
        }

        // For Child model
        if (method_exists($this, 'getFullnameAttribute')) {
            return $this->fullname;
        }

        // Fallback to model type + ID
        return class_basename($this) . ' #' . $this->getKey();
    }

    /**
     * Get the description for the audit log.
     */
    protected function getAuditDescription(string $action): string
    {
        $modelName = $this->getAuditName();
        $modelType = class_basename($this);

        switch ($action) {
            case 'created':
                return "{$modelType} '{$modelName}' was created";
            case 'updated':
                return "{$modelType} '{$modelName}' was updated";
            case 'archived':
                return "{$modelType} '{$modelName}' was archived";
            case 'restored':
                return "{$modelType} '{$modelName}' was restored";
            case 'permanently_deleted':
                return "{$modelType} '{$modelName}' was permanently deleted";
            default:
                return "{$modelType} '{$modelName}' - {$action}";
        }
    }

    /**
     * Get auditable attributes (current state).
     */
    protected function getAuditableAttributes(): array
    {
        $attributes = $this->getAttributes();

        // Remove sensitive or unnecessary fields
        $excludedFields = array_merge(
            ['password', 'remember_token', 'created_at', 'updated_at', 'deleted_at'],
            $this->getAuditExclude()
        );

        return array_diff_key($attributes, array_flip($excludedFields));
    }

    /**
     * Get original auditable attributes (before changes).
     */
    protected function getOriginalAuditableAttributes(): array
    {
        $original = $this->getOriginal();
        
        $excludedFields = array_merge(
            ['password', 'remember_token', 'created_at', 'updated_at', 'deleted_at'],
            $this->getAuditExclude()
        );

        // Only return fields that were changed
        $changes = array_keys($this->getDirty());
        $relevantOriginal = array_intersect_key($original, array_flip($changes));

        return array_diff_key($relevantOriginal, array_flip($excludedFields));
    }

    /**
     * Get changed auditable attributes (after changes).
     */
    protected function getChangedAuditableAttributes(): array
    {
        $changes = $this->getDirty();
        
        $excludedFields = array_merge(
            ['password', 'remember_token', 'created_at', 'updated_at', 'deleted_at'],
            $this->getAuditExclude()
        );

        return array_diff_key($changes, array_flip($excludedFields));
    }

    /**
     * Get fields to exclude from auditing.
     * Override this method in your model to customize.
     */
    protected function getAuditExclude(): array
    {
        return property_exists($this, 'auditExclude') ? $this->auditExclude : [];
    }
}