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

        // Restrict by barangay
        $user = auth()->user();
        $query->byBarangay($user->barangay);

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
        abort_if($auditLog->barangay !== auth()->user()->barangay, 403);

        $auditLog->load('user');

        return Inertia::render('AuditLogs/Show', [
            'log' => $auditLog,
        ]);
    }

    /**
     * Export audit logs to CSV.
     */
    public function export(Request $request)
    {
        $query = AuditLog::with('user')
            ->orderBy('created_at', 'desc');

        // Apply same filters as index
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

        // Restrict by barangay
        $user = auth()->user();
        $query->byBarangay($user->barangay);

        $filename = 'audit_logs_'.now()->format('Y_m_d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Timestamp', 'User', 'Action', 'Type', 'Model Name', 'Description', 'IP Address']);

            $query->chunk(500, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $log->created_at->toIso8601String(),
                        $log->user_name ?? $log->user?->name ?? 'System',
                        $log->action,
                        $log->model_type ?? '-',
                        $log->model_name ?? '-',
                        str_replace('"', '""', $log->description ?? '-'),
                        $log->ip_address ?? '-',
                    ]);
                }
            });

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
