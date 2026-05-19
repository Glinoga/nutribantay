@extends('errors::layout')

@section('title', 'Page Not Found')
@section('code', '404')

@section('illustration')
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Page not found illustration">
    <title>Page Not Found</title>
    <circle cx="52" cy="52" r="22" stroke="var(--info)" stroke-width="3" fill="none"/>
    <circle cx="52" cy="52" r="14" stroke="var(--info)" stroke-width="2" fill="none" opacity="0.4"/>
    <path d="M68 68L95 95" stroke="var(--info)" stroke-width="4" stroke-linecap="round"/>
    <path d="M52 42V52L60 58" stroke="var(--info)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
    <path d="M35 30L28 25" stroke="var(--info)" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
    <path d="M30 35L22 32" stroke="var(--info)" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
    <path d="M75 30L82 25" stroke="var(--info)" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
</svg>
@endsection

@section('title', 'Page Not Found')

@section('description')
The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to a known page.
@endsection

@section('actions')
    <a href="/" class="btn btn-primary">Go Back Home</a>
    <a href="javascript:history.back()" class="btn btn-ghost">Go Back</a>
@endsection
