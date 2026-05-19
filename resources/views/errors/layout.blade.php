<!DOCTYPE html>
<html lang="en" class="">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') - {{ config('app.name', 'NutriBantay') }}</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=montserrat:400,500,600,700,800" rel="stylesheet" />
    <script>
        (function() {
            var appearance = localStorage.getItem('appearance') || 'system';
            if (appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        })();
    </script>
    <style>
        :root {
            --bg: hsl(178 61% 92%);
            --bg-light: hsl(178 100% 98%);
            --bg-dark: hsl(178 36% 87%);
            --text: hsl(181 100% 2%);
            --text-muted: hsl(179 40% 22%);
            --border: hsl(179 20% 45%);
            --primary: hsl(180 100% 8%);
            --primary-light: hsl(180 80% 25%);
            --secondary: hsl(351 44% 31%);
            --danger: hsl(9 21% 41%);
            --warning: hsl(52 23% 34%);
            --success: hsl(147 19% 36%);
            --info: hsl(217 22% 41%);
            --radius-sm: .938rem;
            --radius-md: 1.25rem;
        }
        .dark {
            --bg: hsl(180 100% 5%);
            --bg-light: hsl(180 80% 6%);
            --bg-dark: hsl(180 60% 4%);
            --text: hsl(178 100% 95%);
            --text-muted: hsl(179 30% 70%);
            --border: hsl(179 20% 20%);
            --primary: hsl(179 49% 56%);
            --primary-light: hsl(179 60% 65%);
            --secondary: hsl(355 66% 75%);
            --danger: hsl(9 26% 64%);
            --warning: hsl(52 19% 57%);
            --success: hsl(146 17% 59%);
            --info: hsl(217 28% 65%);
        }
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        html {
            height: 100%;
        }
        body {
            font-family: 'Montserrat', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100%;
            display: flex;
            flex-direction: column;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .error-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
            position: relative;
            overflow: hidden;
        }
        .error-card {
            background: color-mix(in srgb, var(--bg-light) 70%, transparent);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid color-mix(in srgb, var(--border) 20%, transparent);
            border-radius: var(--radius-md);
            padding: 3rem 2rem;
            max-width: 480px;
            width: 100%;
            text-align: center;
            position: relative;
            z-index: 1;
            box-shadow: 0 8px 32px rgba(0,0,0,0.08);
        }
        .dark .error-card {
            background: color-mix(in srgb, #1a1a1a 80%, transparent);
            border-color: color-mix(in srgb, var(--border) 30%, transparent);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .error-code {
            font-size: 7rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            position: relative;
        }
        .error-code-bg {
            position: absolute;
            top: -2rem;
            left: 50%;
            transform: translateX(-50%);
            font-size: 15rem;
            font-weight: 800;
            color: var(--primary);
            opacity: 0.04;
            pointer-events: none;
            line-height: 1;
            user-select: none;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        .error-illustration {
            margin: 0 auto 1.5rem;
            animation: float 4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
            .error-illustration { animation: none; }
        }
        .error-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            color: var(--text);
        }
        .error-description {
            font-size: 0.938rem;
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 2rem;
            max-width: 360px;
            margin-left: auto;
            margin-right: auto;
        }
        .error-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            justify-content: center;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.75rem;
            border-radius: 9999px;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
            line-height: 1;
        }
        .btn:focus-visible {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
        }
        .btn-primary {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }
        .btn-primary:hover {
            opacity: 0.9;
            box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent);
        }
        .btn-outline {
            background: transparent;
            color: var(--primary);
            border-color: var(--primary);
        }
        .btn-outline:hover {
            background: var(--primary);
            color: white;
        }
        .btn-ghost {
            background: transparent;
            color: var(--text-muted);
            border-color: transparent;
        }
        .btn-ghost:hover {
            background: color-mix(in srgb, var(--primary) 8%, transparent);
            color: var(--primary);
        }
        .error-footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid color-mix(in srgb, var(--border) 20%, transparent);
            margin-top: auto;
        }
        .error-footer p {
            font-size: 0.813rem;
            color: var(--text-muted);
        }
        .error-footer a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }
        .error-footer a:hover {
            text-decoration: underline;
        }
        .logo {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            margin-bottom: 1.5rem;
        }
        .logo img {
            height: 2.5rem;
            width: auto;
        }
        .logo-text {
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        @media (max-width: 640px) {
            .error-card { padding: 2rem 1.25rem; }
            .error-code { font-size: 5rem; }
            .error-code-bg { font-size: 10rem; top: -1rem; }
            .error-title { font-size: 1.25rem; }
            .btn { padding: 0.625rem 1.25rem; font-size: 0.813rem; }
        }
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0,0,0,0);
            border: 0;
        }
        .bg-decoration {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
        }
        .bg-decoration-1 {
            width: 400px; height: 400px;
            background: color-mix(in srgb, var(--primary) 4%, transparent);
            top: -150px; right: -150px;
        }
        .bg-decoration-2 {
            width: 300px; height: 300px;
            background: color-mix(in srgb, var(--secondary) 4%, transparent);
            bottom: -100px; left: -100px;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="bg-decoration bg-decoration-1"></div>
        <div class="bg-decoration bg-decoration-2"></div>
        <div class="error-card">
            <a href="/" class="logo" aria-label="Go to NutriBantay Home">
                <img src="/NutriBantay Logo.png" alt="NutriBantay logo">
                <span class="logo-text">NutriBantay</span>
            </a>
            <div class="error-illustration">
                @yield('illustration')
            </div>
            <div class="error-code-bg" aria-hidden="true">@yield('code')</div>
            <div class="error-code" role="alert">
                @yield('code')
            </div>
            <h1 class="error-title">@yield('title')</h1>
            <p class="error-description">@yield('description')</p>
            <div class="error-actions">
                @yield('actions')
            </div>
        </div>
    </div>
    <footer class="error-footer">
        <p>
            &copy; {{ date('Y') }} {{ config('app.name', 'NutriBantay') }}.
            Need help? <a href="mailto:nutribantay@gmail.com">Contact Support</a>
        </p>
    </footer>
</body>
</html>
