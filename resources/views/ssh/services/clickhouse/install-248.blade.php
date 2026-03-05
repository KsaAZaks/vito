#!/bin/bash

sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg 2>/dev/null || true

ARCH=$(dpkg --print-architecture)
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb lts main" | sudo tee /etc/apt/sources.list.d/clickhouse.list

sudo DEBIAN_FRONTEND=noninteractive apt-get update

sudo DEBIAN_FRONTEND=noninteractive apt-get install -y clickhouse-server clickhouse-client

sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
