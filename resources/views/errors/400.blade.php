@extends('errors::layout')

@section('title', 'Bad Request')
@section('code', '400')

@section('illustration')
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bad request illustration">
    <title>Bad Request</title>
    <circle cx="60" cy="60" r="50" stroke="var(--warning)" stroke-width="3" fill="none" opacity="0.3"/>
    <circle cx="60" cy="60" r="40" stroke="var(--warning)" stroke-width="2" fill="none" opacity="0.2"/>
    <path d="M60 40V60" stroke="var(--warning)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="60" cy="72" r="3" fill="var(--warning)"/>
    <path d="M40 45L48 40L52 50" stroke="var(--warning)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    <path d="M80 45L72 40L68 50" stroke="var(--warning)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
</svg>
@endsection

@section('title', 'Bad Request')

@section('description')
The request could not be understood by the server due to malformed syntax. Please check your request and try again.
@endsection

@section('actions')
    <a href="/" class="btn btn-primary">Go Back Home</a>
    <a href="javascript:history.back()" class="btn btn-ghost">Go Back</a>
@endsection
