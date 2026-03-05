if ! clickhouse-client --query "DROP USER IF EXISTS \`{{ $username }}\`"; then
    echo 'VITO_SSH_ERROR' && exit 1
fi

echo "Command executed"
