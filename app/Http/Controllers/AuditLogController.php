<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    /**
     * Display a listing of audit logs.
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('model_type', 'like', "%{$search}%")
                  ->orWhere('model_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('action')) {
            $query->byAction($request->action);
        }

        if ($request->filled('model_type')) {
            $query->byModelType($request->model_type);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        // Restrict by barangay for non-admin users
        $user = auth()->user();
        if ($user && !$user->hasRole('Admin')) {
            $query->byBarangay($user->barangay);
        }

        $logs = $query->paginate(20);

        // Get unique actions and model types for filters
        $actions = AuditLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action')
            ->toArray();

        $modelTypes = AuditLog::select('model_type')
            ->distinct()
            ->whereNotNull('model_type')
            ->orderBy('model_type')
            ->pluck('model_type')
            ->toArray();

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'action', 'model_type', 'user_id', 'start_date', 'end_date']),
            'actions' => $actions,
            'modelTypes' => $modelTypes,
        ]);
    }

    /**
     * Display a single audit log.
     */
    public function show(AuditLog $auditLog)
    {
        $auditLog->load('user');

        return Inertia::render('AuditLogs/Show', [
            'log' => $auditLog,
        ]);
    }
}