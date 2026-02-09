#!/bin/bash

# Script para restaurar dump no banco de PRODUÇÃO
# Container: tag-padrin-db-prod
# Banco: tagpadrin

if [ -z "$1" ]; then
    echo "❌ Uso: $0 <arquivo_dump.sql>"
    exit 1
fi

DUMP_FILE=$1

if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Arquivo não encontrado: $DUMP_FILE"
    exit 1
fi

echo "🚀 Restaurando dump no banco de PRODUÇÃO..."
echo "⚠️  Isso irá sobrescrever os dados atuais da tabela 'settings' e outras."

# Restaura o dump
cat "$DUMP_FILE" | docker exec -i tag-padrin-db-prod psql -U postgres tagpadrin

if [ $? -eq 0 ]; then
    echo "✅ Restauração concluída com sucesso!"
    echo "🔄 Reiniciando containers da API para garantir que o cache do Prisma seja limpo..."
    docker compose -f docker-compose.prod.yml restart backend
    echo "✨ Processo finalizado."
else
    echo "❌ Erro ao restaurar o banco."
    exit 1
fi
