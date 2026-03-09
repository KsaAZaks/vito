sudo chown {{ $recursive ? '-R ' : '' }}{{ $owner }}:{{ $group }} '{{ $path }}'
