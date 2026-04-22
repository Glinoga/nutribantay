# AGENTS.md

## Key Notes

- **Repository Type**: Laravel + React Hybrid (Inertia.js)
- **Backend**: Laravel 12 (PHP >= 8.2, CI uses PHP 8.4), Pest for testing, Pint for formatting
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS v4
- **UI**: shadcn/ui components with Radix UI primitives + Lucide icons
- **Path aliases**: `@/*` → `resources/js/*`

---

## Setup

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate
```

---

## Dev Commands

| Command | Description |
|---------|-------------|
| `composer run dev` | Runs Laravel + queue worker + Vite concurrently |
| `composer run dev:ssr` | Full SSR stack (includes inertia:start-ssr) |
| `npm run dev` | Vite dev server only |
| `npm run build` | Production build |
| `npm run types` | TypeScript check (strict mode) |
| `composer test` | Laravel/Pest tests |
| `npm run lint && npm run format` | Pre-commit checks |

**Note**: Queue worker runs automatically in dev mode (`composer run dev`).

---

## Code Quality

- **PHP tests**: `composer test` or `vendor/bin/pest`
- **Run single test**: `vendor/bin/pest tests/Unit/YourTest.php`
- **PHP formatting**: Laravel Pint (auto-runs via git hooks)
- **JS/TS**: ESLint + Prettier (npm run lint/format)
- **TypeScript**: Strict mode enforced, `noImplicitAny: true`

---

## Project Structure

- `app/` - Laravel PHP logic
- `resources/js/` - React/TypeScript frontend
- `resources/js/components/` - UI components (shadcn/ui style)
- `resources/js/lib/` - Utilities (utils, API helpers)
- `routes/web.php` - Inertia route definitions
- `database/migrations/` - Laravel migrations
