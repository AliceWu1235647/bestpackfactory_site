#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed. Install Node.js 20 or newer first."
  exit 1
fi

node scripts/deploy.mjs "$@"
