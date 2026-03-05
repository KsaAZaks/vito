if ! clickhouse-client --query "REVOKE ALL ON *.* FROM \`{{ $username }}\`" 2>/dev/null; then
    true
fi

echo "Command executed"
