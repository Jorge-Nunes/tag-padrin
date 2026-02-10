#!/bin/bash

# Script para criar usuário admin e configurações iniciais
# Execute em novos servidores ou quando o banco estiver vazio

echo "========================================="
echo "Criando usuário admin e configurações"
echo "========================================="
echo ""

# Detectar docker compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    DOCKER_COMPOSE_FILE="-f docker-compose.prod.yml"
    # Verificar se arquivo prod existe
    if [ ! -f "docker-compose.prod.yml" ]; then
        DOCKER_COMPOSE_FILE=""
    fi
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    if [ -f "docker-compose.prod.yml" ]; then
        DOCKER_COMPOSE_FILE="-f docker-compose.prod.yml"
    else
        DOCKER_COMPOSE_FILE=""
    fi
else
    echo "❌ ERRO: Docker Compose não encontrado"
    exit 1
fi

echo "→ Verificando se containers estão rodando..."
if ! $DOCKER_COMPOSE $DOCKER_COMPOSE_FILE ps | grep -q "tag-padrin-api.*Up"; then
    echo "❌ ERRO: Backend não está rodando"
    echo "Execute primeiro: $DOCKER_COMPOSE $DOCKER_COMPOSE_FILE up -d"
    exit 1
fi

echo "✓ Backend está rodando"
echo ""

echo "→ Executando seed para criar usuário admin..."
$DOCKER_COMPOSE $DOCKER_COMPOSE_FILE exec -T backend npx prisma db seed

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Usuário criado com sucesso!"
    echo "========================================="
    echo ""
    echo "Credenciais de acesso:"
    echo "  Email: admin@tagpadrin.com"
    echo "  Senha: admin123"
    echo ""
    echo "Recomendamos alterar a senha após o primeiro login."
    echo ""
else
    echo ""
    echo "❌ Erro ao executar seed"
    echo "Verifique os logs: $DOCKER_COMPOSE $DOCKER_COMPOSE_FILE logs backend"
    exit 1
fi
