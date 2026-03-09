<p align="center">
    <img alt="VitoDeploy" src="https://github.com/user-attachments/assets/f477ab88-8e1c-474e-8238-bf5892b2840f">
    <p align="center">
        <a href="https://github.com/vitodeploy/vito/actions"><img alt="GitHub Workflow Status" src="https://github.com/vitodeploy/vito/workflows/tests/badge.svg"></a>
    </p>
</p>

------

## About Vito

Vito is a self-hosted web application that helps you manage your servers and deploy your PHP applications into
production servers without a hassle.

## Quick Start

```sh
bash <(curl -Ls https://raw.githubusercontent.com/vitodeploy/vito/3.x/scripts/install.sh)
```

## Features

- Provisions and Manages the server
- Easy database management, Supports Mysql and MariaDB
- Deploy your PHP applications such as Laravel
- Manage your server's firewall
- Supports Custom and Letsencrypt SSL
- Uses supervisor to handle queues
- Manages server's services
- Deploy your SSH Keys to the server
- Create and Manage cron jobs on the server
- API
- Plugins
- Export and Import
- Workflows and Automations
- Domains and DNS Management

## Fork Modifications

This is a custom fork of [VitoDeploy/vito](https://github.com/vitodeploy/vito) with the following additions:

### ClickHouse Support

Full ClickHouse database service integration including:

- Install / uninstall ClickHouse (versions 24.3, 24.8)
- Create and delete ClickHouse databases
- Create and delete ClickHouse users
- Link / unlink users to databases with granular access control
- Dedicated UI pages for managing ClickHouse databases and users
- SSH script templates for all ClickHouse operations

### Site Console Commands

Run arbitrary commands on the server from within a site's root directory, directly from the Vito panel:

- Execute commands as the site's isolated user from **Sites > Console**
- Commands run in the site's root directory with a 2-minute timeout
- View command output in real-time with auto-refreshing logs
- Command history with status tracking (executing, completed, failed)
- Re-run previous commands with one click, copy commands to clipboard
- Full backend: model, migration, policy, action, controller, and API resource

### Enhanced Site Log Viewer

Unified log viewer with support for multiple log sources:

- Switch between **Site Log**, **Nginx Access Log**, and **Nginx Error Log** via a dropdown selector
- Live auto-refreshing log content (every 5 seconds) with a manual refresh button
- Download any log file directly from the viewer
- Clear log file contents from a three-dot menu
- Nginx log paths (`/var/log/nginx/{domain}-access.log`, `/var/log/nginx/{domain}-error.log`) are resolved automatically from the site domain
- When a Laravel site is created, `storage/logs/laravel.log` is automatically registered as the site log

### File Manager

A full-featured SSH file manager built into the server panel:

- Browse server directories with breadcrumb navigation
- Create, rename, and delete files and directories
- Edit files in-browser (up to 1MB) with syntax-aware editor
- Upload files (up to 50MB) and download files from the server
- Change file permissions (`chmod`) and ownership (`chown`) with recursive support
- Compress files/directories into `.tar.gz` archives and extract them
- Site-scoped mode — restrict browsing to a specific site's directory

### Environment Editor

Edit `.env` files for your sites directly from the panel:

- Monaco editor with `.env` syntax highlighting and dark/light mode support
- After saving, optionally run `php artisan config:cache` and/or `php artisan queue:restart`
- Support for custom `.env` file paths

### Enhanced Admin Panel

Extended admin panel with granular permissions and cross-user visibility:

- Dashboard with system-wide stats (users, servers, sites, databases, database users)
- Granular admin permissions per section: dashboard, users, servers, sites, credentials, plugins, settings
- View and manage all servers and sites across all users
- View all database credentials (usernames, passwords, linked databases) with show/hide toggle
- Server provider credentials overview

### Improved Database User Linking

Password is now passed during MySQL/MariaDB user-database linking, improving compatibility with stricter MySQL authentication configurations.

### Custom Fork Install & Update Scripts

- **`scripts/install-fork.sh`** — standalone installer that deploys this fork directly on a VPS (similar to the upstream install script but points to the fork repository)
- **`scripts/update-fork.sh`** — pulls the latest changes from the fork, runs migrations, rebuilds frontend assets, and restarts workers

```sh
# Install
bash <(curl -Ls https://raw.githubusercontent.com/KsaAZaks/vito/3.x/scripts/install-fork.sh)

# Update
bash /home/vito/vito/scripts/update-fork.sh
```

## Useful Links

- [Documentation](https://vitodeploy.com)
- [Demo Website](https://demo.vitodeploy.com)
- [Install on Server](https://vitodeploy.com/getting-started/installation.html#install-on-vps)
- [Install via Docker](https://vitodeploy.com/getting-started/installation.html#install-via-docker)
- [Roadmap](https://github.com/orgs/vitodeploy/projects/5)
- [Discord](https://discord.gg/uZeeHZZnm5)
- [Contribution](https://vitodeploy.com/prologue/contribution-guide.html)
- [Security](/SECURITY.md)

## Credits

- Laravel
- InertiaJS
- ReactJS
- Shadcn UI
- PHPSecLib
- PHPUnit
- Tailwindcss
- Vite
- Prettier
- Spatie
- Opcodesio log viewer
- Tightenco
