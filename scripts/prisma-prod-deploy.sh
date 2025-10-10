#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env.prod"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "No se encontró ${ENV_FILE}." >&2
  echo "Crea el fichero o ajusta la ruta en scripts/prisma-prod-deploy.sh." >&2
  exit 1
fi

echo "Cargando variables desde ${ENV_FILE}"
# shellcheck disable=SC1090
set -a
source "${ENV_FILE}"
set +a

cd "${PROJECT_ROOT}"

echo "Aplicando migraciones Prisma en la base de producción..."
npx prisma migrate deploy

echo "Regenerando Prisma Client..."
npx prisma generate

echo "Completado."
