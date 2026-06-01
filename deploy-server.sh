#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Post-deploy server config for NutriBantay production
# Run as root or with sudo on the production VPS.
# ============================================================

echo "==> 1. Adding Nginx cache headers for hashed assets..."

NGINX_CONF="/etc/nginx/sites-available/nutribantay"

if [ -f "$NGINX_CONF" ]; then
    # Check if cache headers block already exists
    if grep -q 'public, immutable' "$NGINX_CONF"; then
        echo "  Cache headers already present in $NGINX_CONF"
    else
        # Insert cache block before the closing '}' of the server block
        sed -i '/^server {/a\\n    # Hashed assets - cache forever\n    location ~* \\.(js|css|svg|png|jpg|jpeg|gif|ico|woff2?)$ {\n        expires 1y;\n        add_header Cache-Control "public, immutable";\n    }' "$NGINX_CONF"
        echo "  Added cache headers to $NGINX_CONF"
    fi
else
    echo "  WARNING: $NGINX_CONF not found. Skipping nginx config."
    echo "  Manually add to your nginx server block:"
    echo ""
    echo '    location ~* \.(js|css|svg|png|jpg|jpeg|gif|ico|woff2?)$ {'
    echo '        expires 1y;'
    echo '        add_header Cache-Control "public, immutable";'
    echo '    }'
    echo ""
fi

# Test and reload nginx
echo "  Testing nginx config..."
sudo nginx -t
echo "  Reloading nginx..."
sudo systemctl reload nginx

echo "==> 2. Restarting supervisor processes..."
sudo supervisorctl restart nutribantay-ssr:*
sudo supervisorctl restart nutribantay-queue-default:*
sudo supervisorctl restart nutribantay-queue-dashboard:*

echo "==> 3. Ensuring Laravel scheduler cron job exists..."
SCHEDULE_CRON="* * * * * cd $(pwd) && php artisan schedule:run >> /dev/null 2>&1"
(crontab -l 2>/dev/null | grep -v "artisan schedule:run"; echo "$SCHEDULE_CRON") | crontab -
echo "  Scheduler cron added/verified."

echo "==> 4. Clearing opcache and Laravel caches..."
php8.3 artisan optimize:clear || php artisan optimize:clear || true

echo ""
echo "==> DONE! Run PageSpeed Insights at https://pagespeed.web.dev"
echo "    Baseline: Mobile 49, Desktop 89"


