sudo systemctl stop clickhouse-server 2>/dev/null || true

sudo DEBIAN_FRONTEND=noninteractive apt-get purge -y clickhouse-server clickhouse-client clickhouse-common-static 2>/dev/null || true
sudo DEBIAN_FRONTEND=noninteractive apt-get autoremove --purge -y 2>/dev/null || true
sudo DEBIAN_FRONTEND=noninteractive apt-get autoclean -y 2>/dev/null || true

sudo rm -rf /etc/clickhouse-server
sudo rm -rf /etc/clickhouse-client
sudo rm -rf /var/lib/clickhouse
sudo rm -rf /var/log/clickhouse-server
sudo rm -f /etc/apt/sources.list.d/clickhouse.list
sudo rm -f /usr/share/keyrings/clickhouse-keyring.gpg

sudo DEBIAN_FRONTEND=noninteractive apt-get update
