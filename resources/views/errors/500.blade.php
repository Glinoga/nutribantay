@extends('errors::layout')

@section('title', 'Server Error')
@section('code', '500')

@section('illustration')
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Server error illustration">
    <title>Server Error</title>
    <rect x="30" y="25" width="60" height="70" rx="8" stroke="var(--danger)" stroke-width="3" fill="none"/>
    <rect x="38" y="32" width="44" height="8" rx="2" stroke="var(--danger)" stroke-width="2" fill="none" opacity="0.4"/>
    <circle cx="60" cy="55" r="3" fill="var(--danger)"/>
    <rect x="50" y="65" width="20" height="4" rx="2" fill="var(--danger)" opacity="0.7"/>
    <path d="M55 75L60 80L65 75" stroke="var(--danger)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    <path d="M45 90H75" stroke="var(--danger)" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
    <path d="M35 18L30 12" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
    <path d="M85 18L90 12" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
    <path d="M60 15V8" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
</svg>
@endsection

@section('title', 'Server Error')

@section('description')
Something went wrong on our end. We've been notified and are working to fix the issue. Please try again later.
@endsection

@section('actions')
    <a href="/" class="btn btn-primary">Go Back Home</a>
    <a href="javascript:location.reload()" class="btn btn-outline">Try Again</a>
@endsection
