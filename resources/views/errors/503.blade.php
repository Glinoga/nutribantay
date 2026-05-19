@extends('errors::layout')

@section('title', 'Service Unavailable')
@section('code', '503')

@section('illustration')
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Service unavailable illustration">
    <title>Service Unavailable</title>
    <circle cx="60" cy="60" r="45" stroke="var(--info)" stroke-width="3" fill="none"/>
    <path d="M40 55C42 48 48 42 55 40" stroke="var(--info)" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
    <path d="M80 55C78 48 72 42 65 40" stroke="var(--info)" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
    <path d="M45 75C50 80 55 83 60 83C65 83 70 80 75 75" stroke="var(--info)" stroke-width="3" stroke-linecap="round"/>
    <rect x="52" y="55" width="16" height="10" rx="3" fill="var(--info)" opacity="0.5"/>
    <path d="M60 65V75" stroke="var(--info)" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    <circle cx="60" cy="80" r="2" fill="var(--info)" opacity="0.7"/>
    <path d="M50 92L55 85" stroke="var(--info)" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
    <path d="M70 92L65 85" stroke="var(--info)" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
</svg>
@endsection

@section('title', 'Service Unavailable')

@section('description')
We're currently undergoing maintenance to improve your experience. Please check back shortly.
@endsection

@section('actions')
    <a href="javascript:location.reload()" class="btn btn-primary">Refresh Page</a>
    <a href="mailto:nutribantay@gmail.com" class="btn btn-outline">Contact Support</a>
@endsection
