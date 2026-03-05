if ! clickhouse-client --query "SHOW DATABASES" --format=TabSeparated; then
    echo 'VITO_SSH_ERROR' && exit 1
fi
