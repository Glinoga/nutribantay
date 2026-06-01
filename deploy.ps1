param(
    [switch]$SkipBuild,
    [switch]$SkipTests,
    [switch]$BuildSsr
)

$ErrorActionPreference = 'Stop'

$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'
$Cyan = 'Cyan'

function Write-Status($Color, $Msg) {
    Write-Host "" -NoNewline
    Write-Host "==> $Msg" -ForegroundColor $Color
}

# --- Step 0: Check git status ---
Write-Status $Cyan "Checking git status..."
$status = git status --porcelain
if ($status) {
    Write-Host "You have uncommitted changes:" -ForegroundColor $Yellow
    git status --short
    Write-Host ""
    $choice = Read-Host "Continue deploy with uncommitted changes? (y/N)"
    if ($choice -ne 'y') { exit 1 }
}

$branch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $branch" -ForegroundColor $Cyan

# --- Step 1: Run verification ---
if (-not $SkipBuild) {
    Write-Status $Cyan "Running production build..."
    npm run build
    if (-not $?) { Write-Status $Red "Build failed"; exit 1 }

    if ($BuildSsr) {
        Write-Status $Cyan "Running SSR build..."
        npm run build:ssr
        if (-not $?) { Write-Status $Red "SSR build failed"; exit 1 }
    }
}

if (-not $SkipTests) {
    Write-Status $Cyan "Running lint check... (npm run lint)"
    npm run lint
    if (-not $?) { Write-Status $Red "Lint failed"; exit 1 }

    Write-Status $Cyan "Running PHP tests... (./vendor/bin/pest)"
    php vendor/bin/pest
    if (-not $?) {
        Write-Status $Yellow "Tests failed, proceeding anyway (press enter to continue, Ctrl+C to abort)"
        $null = Read-Host
    }
}

# --- Step 2: Confirm ---
Write-Status $Yellow "About to push '$branch' to origin merged and trigger deploy."
$confirm = Read-Host "Proceed? (y/N)"
if ($confirm -ne 'y') { Write-Host "Cancelled."; exit 0 }

# --- Step 3: Push ---
Write-Status $Green "Pushing $branch -> origin/merged..."
$targetRef = "$($branch):merged"
git push origin $targetRef
if (-not $?) { Write-Status $Red "Push failed"; exit 1 }

Write-Status $Green "Done! Deploy triggered at:"
$repoUrl = git config --get remote.origin.url
if ($repoUrl -match 'github\.com[:/](.+)') {
    $repo = $matches[1] -replace '\.git$', ''
    Write-Host "  https://github.com/$repo/actions" -ForegroundColor $Cyan
}
Write-Host ""
Write-Host "Monitor the CI run and verify post-deploy steps on the server." -ForegroundColor $Cyan
