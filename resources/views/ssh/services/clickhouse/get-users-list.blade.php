if ! clickhouse-client --query "SHOW USERS" --format=TabSeparated; then
    echo 'VITO_SSH_ERROR' && exit 1
fi
