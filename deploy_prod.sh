#!/bin/bash
set -e

echo "🚀 Iniciando deploy de produção..."

# 1. Atualizar código
echo "📥 Atualizando repositório..."
git pull

# 2. Reconstruir e subir containers (importante para copiar novas migrations)
# Agora as migrações são aplicadas automaticamente via entrypoint
echo "🏗️ Construindo e reiniciando containers..."
docker compose --env-file .env up -d --build

# 3. Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 5

# 4. Verificar status
echo "📊 Status dos containers:"
docker compose ps

# 5. Limpeza (opcional)
# echo "🧹 Limpando imagens antigas..."
# docker image prune -f

echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📝 Para verificar os logs:"
echo "   docker compose logs -f backend"
echo "   docker compose logs -f postgres"
