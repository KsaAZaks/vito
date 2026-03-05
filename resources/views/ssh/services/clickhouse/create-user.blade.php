if ! clickhouse-client --query "CREATE USER IF NOT EXISTS \`{{ $username }}\` IDENTIFIED BY '{{ $password }}'"; then
    echo 'VITO_SSH_ERROR' && exit 1
fi

echo "Command executed"
