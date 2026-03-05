#!/bin/bash

set -e

FORK_REPO="https://github.com/KsaAZaks/vito.git"
FORK_BRANCH="3.x"
VITO_DIR="/home/vito/vito"

echo "
 __      ___ _        _____             _
 \ \    / (_) |      |  __ \           | |
  \ \  / / _| |_ ___ | |  | | ___ _ __ | | ___  _   _
   \ \/ / | | __/ _ \| |  | |/ _ \ '_ \| |/ _ \| | | |
    \  /  | | || (_) | |__| |  __/ |_) | | (_) | |_| |
     \/   |_|\__\___/|_____/ \___| .__/|_|\___/ \__, |
                                 | |             __/ |
                                 |_|            |___/
                        (Custom Fork Update)
"

echo "Updating Vito from custom fork..."

git config --global --add safe.directory "$VITO_DIR"
export COMPOSER_ALLOW_SUPERUSER=1

cd "$VITO_DIR"

CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null)

if [[ "$CURRENT_REMOTE" != "$FORK_REPO" ]]; then
  echo "Switching remote from '$CURRENT_REMOTE' to '$FORK_REPO'..."
  git remote set-url origin "$FORK_REPO"
fi

echo "Discarding any possible local changes..."
git reset --hard HEAD
git clean -fd

echo "Fetching from fork..."
git fetch origin

echo "Checking out branch: $FORK_BRANCH"
git checkout "$FORK_BRANCH" 2>/dev/null || git checkout -b "$FORK_BRANCH" "origin/$FORK_BRANCH"

echo "Pulling latest changes..."
git reset --hard "origin/$FORK_BRANCH"

echo "Installing composer dependencies..."
composer install --no-dev

echo "Running migrations..."
php artisan migrate --force

echo "Optimizing..."
php artisan optimize:clear
php artisan optimize

echo "Fixing file ownership..."
chown -R vito:vito "$VITO_DIR"

echo "Restarting workers..."
sudo supervisorctl restart worker:*

if [[ -f scripts/post-update.sh ]]; then
  bash scripts/post-update.sh
fi

CURRENT_COMMIT=$(git log -1 --format='%h %s')
echo ""
echo "✅ Vito updated successfully from custom fork!"
echo "📌 Current commit: $CURRENT_COMMIT"
