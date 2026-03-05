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
