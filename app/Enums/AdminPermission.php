<?php

namespace App\Enums;

enum AdminPermission: string
{
    case DASHBOARD = 'dashboard';
    case USERS = 'users';
    case SERVERS = 'servers';
    case SITES = 'sites';
    case CREDENTIALS = 'credentials';
    case PLUGINS = 'plugins';
    case SETTINGS = 'settings';
}
