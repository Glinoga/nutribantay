@extends('errors::layout')

@section('title', 'Page Expired')
@section('code', '419')

@section('illustration')
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Session expired illustration">
    <title>Page Expired</title>
    <circle cx="60" cy="60" r="45" stroke="var(--warning)" stroke-width="3" fill="none"/>
    <path d="M60 35V60L75 70" stroke="var(--warning)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="60" cy="35" r="3" fill="var(--warning)"/>
    <path d="M40 45C35 35 40 25 50 22" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
    <path d="M80 45C85 35 80 25 70 22" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
    <path d="M55 82H65" stroke="var(--warning)" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
    <path d="M50 88H70" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
</svg>
@endsection

@section('title', 'Session Expired')

@section('description')
Your session has expired due to inactivity. Please refresh the page and try again to continue where you left off.
@endsection

@section('actions')
    <a href="javascript:location.reload()" class="btn btn-primary">Refresh Page</a>
    <a href="/login" class="btn btn-outline">Go to Login</a>
@endsection
