@php
    $grants = match($permission ?? 'admin') {
        'read' => 'SELECT, SHOW',
        'write' => 'SELECT, INSERT, ALTER, CREATE, DROP, TRUNCATE, OPTIMIZE, SHOW',
        default => 'ALL'
    };
@endphp

if ! clickhouse-client --query "REVOKE ALL ON \`{{ $database }}\`.* FROM \`{{ $username }}\`" 2>/dev/null; then
    true
fi

if ! clickhouse-client --query "GRANT {{ $grants }} ON \`{{ $database }}\`.* TO \`{{ $username }}\`"; then
    echo 'VITO_SSH_ERROR' && exit 1
fi

echo "Linking to {{ $database }} finished"
