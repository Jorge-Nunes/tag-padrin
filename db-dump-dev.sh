#!/bin/bash

# Script para gerar dump do banco de dados de DESENVOLVIMENTO
# Tenta detectar o container de banco de dados (padrão tag-padrin-db)

CONTAINER_NAME=$(docker ps --filter "name=db" --format "{{.Names}}" | grep -v "prod" | head -n 1)

if [ -z "$CONTAINER_NAME" ]; then
    echo "❌ Erro: Não encontrei um container de banco de dados de desenvolvimento rodando (ex: tag-padrin-db)."
    echo "Certifique-se que o comando 'docker compose up' (sem o .prod.yml) foi executado."
    exit 1
fi

DUMP_FILE="dev_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "🐘 Gerando dump do banco de desenvolvimento ($CONTAINER_NAME)..."
docker exec -t "$CONTAINER_NAME" pg_dump -U postgres --clean --if-exists tagpadrin > "$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Dump gerado com sucesso: $DUMP_FILE"
    echo "Próximo passo: execute: ./db-restore-prod.sh $DUMP_FILE"
else
    echo "❌ Erro ao gerar dump."
    exit 1
fi
