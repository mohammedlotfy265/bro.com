#!/bin/bash
# scripts/switch-db-provider.sh
# Switches Prisma provider between sqlite and postgresql based on DATABASE_URL

# Use absolute path if running locally, relative if running on Vercel
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SCHEMA_FILE="$PROJECT_DIR/prisma/schema.prisma"

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "ERROR: Schema file not found at: $SCHEMA_FILE"
  echo "Current directory: $(pwd)"
  echo "Looking for schema in: $SCHEMA_FILE"
  ls -la "$PROJECT_DIR/prisma/" 2>&1 || echo "prisma/ directory not found"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set, defaulting to sqlite"
  PROVIDER="sqlite"
elif [[ "$DATABASE_URL" == postgresql://* ]] || [[ "$DATABASE_URL" == postgres://* ]]; then
  PROVIDER="postgresql"
  echo "Detected PostgreSQL DATABASE_URL"
else
  PROVIDER="sqlite"
  echo "Detected SQLite DATABASE_URL"
fi

# Replace the provider line in schema.prisma
sed -i "s/provider = \"\(sqlite\|postgresql\)\"/provider = \"$PROVIDER\"/" "$SCHEMA_FILE"
echo "✓ Prisma provider set to: $PROVIDER"
echo "✓ Schema file: $SCHEMA_FILE"

# Run prisma generate with explicit schema path
cd "$PROJECT_DIR" && npx prisma generate --schema=./prisma/schema.prisma
