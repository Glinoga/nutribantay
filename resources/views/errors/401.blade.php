@extends('errors::layout')

@section('title', 'Unauthorized')
@section('code', '401')

@section('illustration')
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Unauthorized illustration">
    <title>Unauthorized</title>
    <rect x="35" y="20" width="50" height="40" rx="8" stroke="var(--warning)" stroke-width="3" fill="none"/>
    <rect x="40" y="25" width="40" height="30" rx="4" stroke="var(--warning)" stroke-width="2" fill="none" opacity="0.3"/>
    <circle cx="60" cy="48" r="3" fill="var(--warning)"/>
    <rect x="54" y="56" width="12" height="4" rx="2" fill="var(--warning)"/>
    <path d="M60 70V90" stroke="var(--warning)" stroke-width="4" stroke-linecap="round"/>
    <path d="M45 95H75" stroke="var(--warning)" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    <path d="M50 75L60 85L70 75" stroke="var(--warning)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
</svg>
@endsection

@section('title', 'Unauthorized')

@section('description')
You need to log in to access this page. Please sign in with your account to continue.
@endsection

@section('actions')
    <a href="/login" class="btn btn-primary">Go to Login</a>
    <a href="/" class="btn btn-ghost">Go Back Home</a>
@endsection
