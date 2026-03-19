git pull origin $BRANCH

# Ensure SQLite database file exists before any artisan command (avoids boot errors when DB is missing)
if [ -f .env ] && grep -q "DB_CONNECTION=sqlite" .env 2>/dev/null; then
  DB_DATABASE=$(grep "^DB_DATABASE=" .env 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'")
  [ -z "$DB_DATABASE" ] && DB_DATABASE="database/database.sqlite"
  mkdir -p "$(dirname "$DB_DATABASE")"
  touch "$DB_DATABASE"
fi

composer install --no-interaction --prefer-dist --optimize-autoloader
php artisan migrate --force

php artisan optimize:clear
php artisan optimize

npm ci
npm run build

echo "✅ Deployment completed successfully!"
