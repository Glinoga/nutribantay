<!DOCTYPE html>
<html lang="en" class="">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Under Maintenance - {{ config('app.name', 'NutriBantay') }}</title>
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
        .container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
            position: relative;
            overflow: hidden;
        }
        .card {
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
        .dark .card {
            background: color-mix(in srgb, #1a1a1a 80%, transparent);
            border-color: color-mix(in srgb, var(--border) 30%, transparent);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .code-bg {
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
        .code {
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
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        .illustration {
            margin: 0 auto 1.5rem;
            animation: float 4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
            .illustration { animation: none; }
        }
        .title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            color: var(--text);
        }
        .description {
            font-size: 0.938rem;
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 0.75rem;
            max-width: 360px;
            margin-left: auto;
            margin-right: auto;
        }
        .highlight {
            font-weight: 600;
        }
        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            justify-content: center;
            margin-top: 2rem;
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
        .footer {
            text-align: center;
            padding: 2rem 1rem;
            border-top: 1px solid color-mix(in srgb, var(--border) 20%, transparent);
            margin-top: auto;
        }
        .footer p {
            font-size: 0.813rem;
            color: var(--text-muted);
        }
        .footer a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }
        .footer a:hover {
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
        .divider {
            margin: 1.5rem auto;
            width: 3rem;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            border-radius: 2px;
        }
        @media (max-width: 640px) {
            .card { padding: 2rem 1.25rem; }
            .code { font-size: 5rem; }
            .code-bg { font-size: 10rem; top: -1rem; }
            .title { font-size: 1.25rem; }
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
    <div class="container">
        <div class="bg-decoration bg-decoration-1"></div>
        <div class="bg-decoration bg-decoration-2"></div>
        <div class="card">
            <a href="/" class="logo" aria-label="Go to NutriBantay Home">
                <img src="/NutriBantayLogo.svg" alt="NutriBantay logo">
                <span class="logo-text">NutriBantay</span>
            </a>

            <div class="illustration" role="img" aria-label="Under maintenance illustration">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <title>Under Maintenance</title>
                    <circle cx="60" cy="60" r="45" stroke="var(--info)" stroke-width="3" fill="none"/>
                    <path d="M52 42C52 37.6 55.6 34 60 34C64.4 34 68 37.6 68 42" stroke="var(--info)" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
                    <path d="M45 55C47 50 53 46 60 46" stroke="var(--info)" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
                    <path d="M75 55C73 50 67 46 60 46" stroke="var(--info)" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
                    <path d="M48 75C52 80 56 83 60 83C64 83 68 80 72 75" stroke="var(--info)" stroke-width="3" stroke-linecap="round"/>
                    <rect x="53" y="58" width="14" height="10" rx="3" fill="var(--info)" opacity="0.55"/>
                    <path d="M60 68V75" stroke="var(--info)" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
                    <circle cx="60" cy="79" r="2" fill="var(--info)" opacity="0.7"/>
                    <path d="M52 90L55 85" stroke="var(--info)" stroke-width="2" stroke-linecap="round" opacity="0.35"/>
                    <path d="M68 90L65 85" stroke="var(--info)" stroke-width="2" stroke-linecap="round" opacity="0.35"/>
                    <path d="M58 61L60 64L62 61" stroke="var(--info)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
                </svg>
            </div>

            <div class="code-bg" aria-hidden="true">503</div>
            <div class="code" role="alert">503</div>

            <h1 class="title">Under Maintenance</h1>

            <p class="description">
                NutriBantay is currently undergoing scheduled maintenance to improve your experience.
            </p>
            <p class="description">
                <span class="highlight">Your session has been logged out</span> for security purposes.
            </p>
            <p class="description">
                Please check back later. We apologize for any inconvenience.
            </p>

            <div class="divider"></div>

            <p class="description" style="font-size: 0.813rem;">
                For urgent matters, please contact your system administrator.
            </p>

            <div class="actions">
                <button onclick="location.reload()" class="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                    Refresh Page
                </button>
                <a href="mailto:nutribantay@gmail.com" class="btn btn-outline">Contact Support</a>
            </div>
        </div>
    </div>

    <footer class="footer">
        <p>
            &copy; {{ date('Y') }} {{ config('app.name', 'NutriBantay') }}.
            Need help? <a href="mailto:nutribantay@gmail.com">Contact Support</a>
        </p>
    </footer>
</body>
</html>
