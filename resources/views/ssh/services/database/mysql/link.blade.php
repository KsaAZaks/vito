@php
    $grants = match($permission ?? 'admin') {
        'read' => 'SELECT, SHOW VIEW',
        'write' => 'SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, LOCK TABLES, REFERENCES, SHOW VIEW, TRIGGER, CREATE VIEW, EXECUTE',
        default => 'ALL PRIVILEGES'
    };
@endphp

if ! sudo mysql -e "CREATE USER IF NOT EXISTS '{{ $username }}'@'{{ $host }}' IDENTIFIED BY '{{ $password }}'"; then
    echo 'VITO_SSH_ERROR' && exit 1
fi

# Revoke all privileges first to ensure clean state
sudo mysql -e "REVOKE ALL PRIVILEGES ON {{ $database }}.* FROM '{{ $username }}'@'{{ $host }}'" 2>/dev/null || true

# Grant the specific privileges
if ! sudo mysql -e "GRANT {{ $grants }} ON {{ $database }}.* TO '{{ $username }}'@'{{ $host }}'"; then
    echo 'VITO_SSH_ERROR' && exit 1
fi

if ! sudo mysql -e "FLUSH PRIVILEGES"; then
    echo 'VITO_SSH_ERROR' && exit 1
fi

echo "Linking to {{ $database }} finished"
