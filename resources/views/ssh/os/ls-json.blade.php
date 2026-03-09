if [ ! -d '{{ $path }}' ]; then
    echo 'VITO_SSH_ERROR: Directory does not exist'
    exit 1
fi

echo "VITO_LS_START"
for f in '{{ $path }}'/* '{{ $path }}'/.* ; do
    basename=$(basename "$f")
    [ "$basename" = "." ] || [ "$basename" = ".." ] && continue
    [ ! -e "$f" ] && [ ! -L "$f" ] && continue
    if [ -L "$f" ]; then
        type="link"
    elif [ -d "$f" ]; then
        type="directory"
    else
        type="file"
    fi
    perms=$(stat -c '%a' "$f" 2>/dev/null || stat -f '%Lp' "$f" 2>/dev/null)
    owner=$(stat -c '%U' "$f" 2>/dev/null || stat -f '%Su' "$f" 2>/dev/null)
    group=$(stat -c '%G' "$f" 2>/dev/null || stat -f '%Sg' "$f" 2>/dev/null)
    size=$(stat -c '%s' "$f" 2>/dev/null || stat -f '%z' "$f" 2>/dev/null)
    mtime=$(stat -c '%Y' "$f" 2>/dev/null || stat -f '%m' "$f" 2>/dev/null)
    echo "VITO_FILE:${basename}|${type}|${perms}|${owner}|${group}|${size}|${mtime}"
done
echo "VITO_LS_END"
