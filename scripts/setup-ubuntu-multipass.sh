#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Installing Ubuntu packages"
sudo apt update
sudo apt install -y curl git build-essential openssl

if ! command -v node >/dev/null 2>&1 || ! node --version | grep -Eq '^v22\.'; then
  echo "==> Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
fi

if ! command -v multipass >/dev/null 2>&1; then
  echo "==> Installing Multipass"
  sudo snap install multipass
fi

if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example"
  cp .env.example .env
  echo "Edit .env and set DATABASE_URL to Neon before running migrations."
fi

npm install
npm run prisma:generate
npm run prisma:deploy
npm run db:seed
npm run build
multipass version

echo "Setup complete. Start with: npm start"
