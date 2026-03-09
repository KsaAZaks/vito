sudo chmod {{ $recursive ? '-R ' : '' }}{{ $permissions }} '{{ $path }}'
