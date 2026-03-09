# Changelog

All notable changes to this fork are documented in this file.

This project is a custom fork of [VitoDeploy/vito](https://github.com/vitodeploy/vito).
Upstream base: **v3.20.3**.

---

## [Unreleased] — 2026-03-09

### Added

- **MySQL service** — "Edit mysqld.cnf" option for `/etc/mysql/mysql.conf.d/mysqld.cnf` in addition to "Edit my.cnf"

- **File Manager** — full SSH-based file manager in the server panel
  - Browse directories with breadcrumb navigation
  - Create, rename, and delete files and directories
  - Edit files in-browser (up to 1MB) with syntax-aware editor
  - Upload (up to 50MB) and download files via SSH
  - Change permissions (`chmod`) and ownership (`chown`) with recursive support
  - Compress into `.tar.gz` and extract archives
  - Site-scoped mode to restrict access to a site's directory
  - New OS-level SSH helpers: `lsDirectory`, `rename`, `chmod`, `chown`, `compress`, `extract`

- **Enhanced Site Log Viewer** — unified log viewer with multiple log sources
  - Select between Site Log, Nginx Access Log, and Nginx Error Log from a dropdown
  - Live auto-refreshing log content with manual refresh button
  - Download any log file directly from the viewer
  - Clear (delete contents of) any log file from a three-dot menu
  - Nginx log paths resolved automatically from site domain

- **Environment Editor** — edit `.env` files directly from the site panel
  - Monaco editor with `.env` syntax highlighting and dark/light mode
  - Optionally run `php artisan config:cache` after save
  - Optionally run `php artisan queue:restart` after save
  - Support for custom `.env` file paths

- **Enhanced Admin Panel** — granular permissions and cross-user visibility
  - Dashboard with system-wide stats (users, servers, sites, databases, database users)
  - Granular admin permissions: dashboard, users, servers, sites, credentials, plugins, settings
  - View and manage all servers and sites across all users
  - View database credentials (usernames, passwords, linked databases) with show/hide toggle
  - Server provider credentials overview
  - `AdminPermission` enum and migration for `admin_permissions` column

- **Improved Database User Linking** — password is now passed during MySQL/MariaDB user-database linking, fixing compatibility with stricter authentication modes

- **Improved APP_KEY handling** — Docker start script and update scripts now handle `APP_KEY` generation more reliably

---

## 2026-03-05

### Added

- **ClickHouse Support** — full database service integration
  - Install / uninstall ClickHouse (versions 24.3, 24.8)
  - Create and delete ClickHouse databases
  - Create and delete ClickHouse users
  - Link / unlink users to databases with granular access control
  - Dedicated UI pages for managing ClickHouse databases and users
  - SSH script templates for all ClickHouse operations

- **Site Console Commands** — run arbitrary commands on the server from a site's root directory
  - Execute commands as the site's isolated user from **Sites > Console**
  - Commands run in the site's root directory with a 2-minute timeout
  - Real-time output with auto-refreshing logs
  - Command history with status tracking (executing, completed, failed)
  - Re-run previous commands with one click, copy to clipboard
  - Full backend: model, migration, policy, action, controller, and API resource

- **Laravel Log Viewing** — automatic log registration for Laravel sites
  - `storage/logs/laravel.log` registered as a remote log on site creation
  - View, download, and clear Laravel logs from the site's **Logs** page

- **Custom Fork Install & Update Scripts**
  - `scripts/install-fork.sh` — standalone VPS installer for this fork
  - `scripts/update-fork.sh` — pulls latest changes, runs migrations, rebuilds assets, restarts workers

---

## Upstream Highlights (v3.14.0 – v3.20.3)

Below is a condensed summary of notable upstream changes included in this fork.

### v3.20.3 — 2026-03-03
- Fix missing authorization in workflow site creation

### v3.20.2 — 2026-03-03
- Fix placeholder after manual PHP update

### v3.20.1 — 2026-02-01
- Fix WordPress with isolated users
- Prevent cross-site SSL inheritance
- Fix Telegram notifications parse mode
- Add DEV label to logo in dev mode

### v3.20.0 — 2026-01-28
- Filter deprecated Hetzner plans
- Adjust SSH heredoc wrapper
- Fix git hook failing to destroy
- Fix update aliases not working
- Replace `npm install` with `npm ci`

### v3.19.0 — 2026-01-16
- Sites must have isolated users
- Default charset/collation in create database dialog
- Add description to site create aliases

### v3.18.0 — 2025-12-25
- Add `password()` / `passwordWithToggle()` dynamic fields
- Fix undefined variable in Caddy vhost view
- Update AWS SDK
- Add PostgreSQL 18

### v3.17.0 — 2025-12-10
- Improve server logs visibility
- Fix API key creation form not resetting
- Fix site aliases validation
- Improve site selection logic for server-specific validation

### v3.16.0 — 2025-11-28
- Support sorting in data tables
- Fix pagination with search query
- Fix MySQL and PostgreSQL keyring
- Add user selection to SSH key deployment
- Add sync to DNS records
- Add reload option to services
- Add Bitbucket V2 source control via OAuth consumers
- Auto-completion for Gitlab and Gitea repos and branches
- Add search to project, server, and site selects

### v3.15.0 — 2025-11-09
- Add Bitbucket V2 source control
- Add auto-completion for Gitlab/Gitea repos and branches
- Add service reload option

### v3.14.0 — 2025-11-01
- Add DNS Record workflow actions
- Add clear remote log content
- Fix load balancer update method
- Optimize unique queues
- Make Horizon more configurable
