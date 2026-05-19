@extends('errors::layout')

@section('title', 'Too Many Requests')
@section('code', '429')

@section('illustration')
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rate limit illustration">
    <title>Too Many Requests</title>
    <rect x="25" y="20" width="70" height="25" rx="6" stroke="var(--warning)" stroke-width="3" fill="none"/>
    <rect x="25" y="50" width="70" height="25" rx="6" stroke="var(--warning)" stroke-width="2" fill="none" opacity="0.4"/>
    <rect x="25" y="80" width="70" height="25" rx="6" stroke="var(--warning)" stroke-width="2" fill="none" opacity="0.2"/>
    <rect x="55" y="26" width="34" height="13" rx="3" fill="var(--warning)" opacity="0.6"/>
    <circle cx="42" cy="32" r="3" fill="var(--warning)"/>
    <path d="M90 105L95 95" stroke="var(--warning)" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
    <path d="M95 105L90 95" stroke="var(--warning)" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
</svg>
@endsection

@section('title', 'Too Many Requests')

@section('description')
You've made too many requests in a short period. Please wait a moment before trying again.
@endsection

@section('actions')
    <a href="javascript:location.reload()" class="btn btn-primary">Try Again</a>
    <a href="/" class="btn btn-ghost">Go Back Home</a>
@endsection
