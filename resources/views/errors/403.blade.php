@extends('errors::layout')

@section('title', 'Forbidden')
@section('code', '403')

@section('illustration')
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Forbidden illustration">
    <title>Forbidden</title>
    <path d="M60 20L95 55L95 80L60 100L25 80L25 55L60 20Z" stroke="var(--danger)" stroke-width="3" fill="none"/>
    <path d="M45 60H75" stroke="var(--danger)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="60" cy="50" r="3" fill="var(--danger)"/>
    <path d="M60 55V70" stroke="var(--danger)" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    <path d="M50 85H70" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
</svg>
@endsection

@section('title', 'Forbidden')

@section('description')
You don't have permission to access this page. If you believe this is a mistake, please contact your administrator.
@endsection

@section('actions')
    <a href="/dashboard" class="btn btn-primary">Go to Dashboard</a>
    <a href="mailto:nutribantay@gmail.com" class="btn btn-outline">Contact Support</a>
@endsection
