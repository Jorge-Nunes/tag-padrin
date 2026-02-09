#!/bin/bash
set -e

echo "🚀 Iniciando deploy de produção..."

# 1. Atualizar código
echo "📥 Atualizando repositório..."
git pull

# 2. Reconstruir imagens (importante para copiar novas migrations e dependências)
echo "🏗️ Construindo containers..."
docker compose -f docker-compose.prod.yml --env-file .env build

# 3. Subir containers
echo "🔄 Reiniciando serviços..."
docker compose -f docker-compose.prod.yml --env-file .env up -d

# 4. Rodar Migrations
echo "🗄️ Aplicando migrações de banco de dados..."
docker compose -f docker-compose.prod.yml --env-file .env run --rm backend npx prisma migrate deploy

# 5. Limpeza (opcional)
# echo "🧹 Limpando imagens antigas..."
# docker image prune -f

echo "✅ Deploy concluído com sucesso!"
