if sudo test -f {{ $path }}; then
    sudo cat {{ $path }}
else
    echo 'VITO_SSH_ERROR' && exit 1
fi
