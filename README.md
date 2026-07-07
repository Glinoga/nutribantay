# ⛑️ NutriBantay

**Barangay-level child nutrition tracking for the Philippines.**

NutriBantay is a web application built for local health workers to monitor, record, and improve the nutritional status of children aged 0–59 months. It provides a complete workflow — from child registration and growth evaluation using WHO standards to AI-generated nutrition recommendations in Filipino and SMS notifications for caregivers.

---

## Features

### Child Health Management

- **Full child registry** with demographic details (name, sex, age, birthdate)
- **WHO growth standard evaluation** — weight-for-age (WFA), length/height-for-age (LFA), weight-for-length/height (WFL/WFH) via integrated `GrowthHelper`
- **Health visit logging** with auto-sync to child weight, height, and nutrition status
- **BMI calculation** and automated nutrition status classification
- **Import/Export** via Excel (xlsx) and printable reports
- **Over-age protection** — children 60+ months are read-only

### Vaccine & Vitamin Tracking

- **Vaccine catalog** with child-level assignment and dose recording
- **Vitamin A tracking** with dose scheduling (100,000 IU at 6–11 mo, 200,000 IU at 12–59 mo)
- **Deworming records** (albendazole/mebendazole every 6 months from 12 months)
- Mirror-structured vaccine and vitamin routes for consistency

### AI-Powered Recommendations

- OpenAI `gpt-4o-mini` integration producing **Tagalog-language nutrition advice**
- Age-specific meal plans following National Nutrition Council (NNC) guidelines
- Validation and retry logic with local fallback
- Deworming and vitamin A inference from health log data
- Rate-limited to 10 requests/minute (unlimited for Admin)

### Communication

- **SMS notifications** via IPROG API with Philippine number normalization (+63)
- Bulk SMS with individual retry on failure
- SMS credit checking and delivery status

### Dashboard & Analytics

- **Pre-computed dashboard cache** (table-backed, no live queries)
- Five age groups: `0–5`, `6–11`, `12–23`, `24–56` months
- Chart.js visualizations and Leaflet map integration
- Auto-refresh every 5 minutes via scheduler

### Admin Tools

- **User management** with approval workflow (pending → approved/rejected)
- **Registration code system** — pre-generated codes tied to barangays
- **Audit logging** on User and Child models
- **Announcement/CMS system** with image gallery and drag-and-drop reordering
- **Database backup** — AES-256 encrypted zip via custom PDO dumper
- **Website content management** for guest-facing pages
- **System toggle** for maintenance mode

### Security & Access Control

- Role-based access: **Admin** and **Healthworker** (Spatie `laravel-permission`)
- Soft deletes on User, Child, and Announcement models
- Encrypted sessions (`SESSION_ENCRYPT=true`)
- 9 custom Inertia error pages (400/401/403/404/405/419/429/500/503)
- HTTPS forced in production
- Security headers middleware on all web routes
- Sensitive data redaction from all log context

---

## Tech Stack

| Layer             | Technology                                                |
| ----------------- | --------------------------------------------------------- |
| **Backend**       | PHP 8.2+ / Laravel 12                                     |
| **Frontend**      | React 19 / TypeScript / Inertia.js                        |
| **Styling**       | Tailwind CSS v4 (`@tailwindcss/vite`) / Shadcn UI (Radix) |
| **Database**      | SQLite (local) / MySQL 8.0 (production)                   |
| **Cache & Queue** | `database` driver (local) / Redis (production)            |
| **SSR**           | Inertia server-side rendering                             |
| **Maps**          | Leaflet + react-leaflet                                   |
| **Charts**        | Chart.js + react-chartjs-2                                |
| **AI**            | OpenAI `gpt-4o-mini`                                      |
| **SMS**           | IPROG SMS API                                             |
| **Auth**          | Spatie `laravel-permission`                               |
| **CI/CD**         | GitHub Actions (lint, test, deploy)                       |

---

## Getting Started

### Prerequisites

- PHP 8.2+
- Node.js 20+
- Composer
- SQLite (local development) or MySQL 8.0

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/nutribantay.git
cd nutribantay

# Install PHP dependencies
composer install

# Install frontend dependencies
npm install

# Configure environment
copy .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations with seed data
php artisan migrate --seed

# Start development server
composer run dev
```

### Default Accounts

| Role             | Email                   | Password      | Barangay |
| ---------------- | ----------------------- | ------------- | -------- |
| **Admin**        | `nutribantay@gmail.com` | `password123` | 176B     |
| **Healthworker** | `health@example.com`    | `password123` | 176B     |

### Development Commands

```bash
npm run dev                  # Vite dev server
npm run build                # Production build
npm run build:ssr            # Full SSR build (vite build + vite build --ssr)
npm run lint                 # ESLint (with --fix)
npm run format               # Prettier (write)
npm run format:check         # Prettier (check only)
npm run types                # TypeScript type-check (tsc --noEmit)

./vendor/bin/pint            # PHP style fix (PSR-12)
./vendor/bin/pest            # All tests (SQLite :memory:)
./vendor/bin/pest --filter="test name"  # Single test
composer run test            # config:clear → php artisan test

php artisan dashboard:refresh {barangay?}  # Refresh dashboard cache
php artisan slugs:backfill                  # Backfill Child/Announcement slugs
php artisan app:backup-database             # Encrypted database backup
php artisan clean:old-backups               # Clean old backups (14-day retention)

composer run dev             # serve + queue:listen + schedule:work + vite
composer run dev:ssr         # build:ssr → serve + queue + pail + schedule + ssr
```

---

## Project Structure

```
├── app/
│   ├── Console/Commands/        # Custom artisan commands
│   ├── Exports/                 # Excel export classes
│   ├── Helpers/
│   │   ├── AIRecommender.php    # AI recommendation stub
│   │   ├── GrowthHelper.php     # WHO growth standard evaluator
│   │   └── MysqlDumper.php      # Custom PDO database dumper
│   ├── Http/
│   │   ├── Controllers/         # Application controllers
│   │   │   ├── Admin/           # Admin-specific controllers
│   │   │   ├── Auth/            # Authentication controllers
│   │   │   └── Settings/        # Profile/password settings
│   │   ├── Middleware/          # SecurityHeaders, CheckMaintenance, etc.
│   │   └── Requests/Auth/       # Form request validation
│   ├── Imports/                 # Excel import classes
│   ├── Models/                  # 19 Eloquent models
│   ├── Services/
│   │   ├── IprogsmsService.php  # SMS API integration
│   │   └── NutStatusExportService.php
│   └── Traits/
│       └── AuditableModel.php   # Auto-audit logging trait
├── bootstrap/app.php            # Laravel app configuration
├── config/                      # Application configuration
├── database/
│   ├── migrations/              # 38 migration files
│   └── seeders/                 # 12 seeders
├── resources/
│   ├── css/
│   │   ├── app.css              # Main stylesheet (Tailwind v4)
│   │   └── appv2.css            # Additional styles (teal theme)
│   └── js/
│       ├── components/          # Reusable React components
│       │   └── ui/              # Shadcn UI primitives (28 files)
│       ├── hooks/               # React hooks (appearance, mobile, etc.)
│       ├── lib/
│       │   ├── routes.ts        # Hand-maintained frontend route map
│       │   ├── utils.ts         # cn() helper, status shortener
│       │   └── phoneUtils.ts    # Phone number normalizer
│       └── pages/               # Inertia page components (56 files)
├── routes/
│   ├── web.php                  # Primary route definitions
│   ├── auth.php                 # Authentication routes
│   ├── settings.php             # Profile/password routes
│   └── console.php              # Scheduled task configuration
├── tests/
│   ├── Feature/                 # Feature tests (Auth, Admin, SMS, Settings)
│   └── Unit/                    # Unit tests
├── docs/                        # Development notes (gitignored)
├── deploy.ps1                   # Interactive deploy script (PowerShell)
├── .env.example                 # Environment template
└── AGENTS.md                    # OpenCode instruction file (gitignored)
```

---

## Deployment

### CI/CD Pipeline

| Workflow   | Trigger                        | Actions                                                                  |
| ---------- | ------------------------------ | ------------------------------------------------------------------------ |
| **Lint**   | Push/PR to `develop` or `main` | PHP Pint → Prettier → ESLint                                             |
| **Tests**  | Push/PR to `develop` or `main` | `npm run build` → `./vendor/bin/pest`                                    |
| **Deploy** | Push to `merged`               | Composer (no-dev) → SSR build → rsync → migrate → seed → cache → restart |

### Deploy Script

```powershell
.\deploy.ps1              # Build → test → push to origin/merged
.\deploy.ps1 -SkipBuild   # Skip npm run build
.\deploy.ps1 -SkipTests   # Skip lint and pest
.\deploy.ps1 -BuildSsr    # Also run SSR build
```

After pushing to `merged`, the self-hosted GitHub Actions runner handles:

- Composer install (production, no dev dependencies)
- SSR asset build (`npm run build:ssr`)
- rsync to target directory
- Migrations, seeding (`VitaminSeeder`), dashboard refresh
- Config/view cache, queue restart, supervisor restart

---

## Environment Variables

| Variable                     | Required    | Default          | Description                    |
| ---------------------------- | ----------- | ---------------- | ------------------------------ |
| `APP_NAME`                   | —           | NutriBantay      | Application name               |
| `APP_ENV`                    | —           | local            | Environment (local/production) |
| `APP_DEBUG`                  | —           | true             | Debug mode                     |
| `APP_URL`                    | —           | http://localhost | Application URL                |
| `DB_CONNECTION`              | —           | sqlite           | Database driver (sqlite/mysql) |
| `SESSION_DRIVER`             | —           | database         | Session storage                |
| `SESSION_ENCRYPT`            | —           | true             | Encrypt session payloads       |
| `QUEUE_CONNECTION`           | —           | database         | Queue driver                   |
| `CACHE_STORE`                | —           | database         | Cache driver                   |
| `OPENAI_API_KEY`             | For AI      | —                | OpenAI API key                 |
| `IPROGSMS_API_TOKEN`         | For SMS     | —                | IPROG SMS API token            |
| `BACKUP_ENCRYPTION_PASSWORD` | For backups | —                | AES-256 backup encryption key  |

---

## Architecture Notes

- **Authentication** accepts a registration code (checked first) or email — login field is unified
- **Registration** requires a pre-generated code from an Admin, tying the user to a specific barangay
- **Growth evaluation** uses the WHO `GrowthStandard` table with the `GrowthHelper` autoloaded via Composer `files`
- **Dashboard** is not queried live — pre-computed every 5 minutes into `dashboard_cache`
- **Backups** are AES-256 encrypted zip files created by a custom PDO-based dumper (no `mysqldump` subprocess)
- **Two separate queues**: `default` (general) and `dashboard` (dashboard refresh) — require separate workers
- **AI Recommender** is a stub returning `''` without `OPENAI_API_KEY`; the controller still returns a fallback message
- **SSR page resolution** is case-sensitive — mismatched casing causes 404s on server-rendered pages
- **Soft deletes** on User, Child, and Announcement models; `AuditableModel` trait logs CRUD to `audit_logs`

---

## License

This project is open-source software.
