#!/bin/bash

# Script de deploy para produção

echo "🚀 Iniciando deploy do Tag-Padrin..."

# Verificar se .env.production existe
if [ ! -f .env.production ]; then
    echo "❌ Arquivo .env.production não encontrado!"
    echo "📝 Crie o arquivo .env.production baseado em .env.production.example"
    exit 1
fi

# Carregar variáveis de ambiente
export $(cat .env.production | grep -v '^#' | xargs)

# Validar variáveis obrigatórias
if [ -z "$API_URL" ]; then
    echo "❌ API_URL não definida em .env.production"
    exit 1
fi

if [ -z "$FRONTEND_PORT" ]; then
    echo "⚠️  FRONTEND_PORT não definida, usando padrão 5175"
    export FRONTEND_PORT=5175
fi

echo "📋 Configuração:"
echo "   Frontend Porta: $FRONTEND_PORT"
echo "   API URL: $API_URL"
echo ""

# Parar containers antigos
echo "🛑 Parando containers antigos..."
docker compose -f docker-compose.prod.yml down

# Reconstruir e iniciar containers
echo "🏗️  Construindo e iniciando containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 10

# Verificar status
echo "✅ Verificando status..."
docker compose -f docker-compose.prod.yml ps

# Testar backend
echo ""
echo "🧪 Testando backend..."
if curl -f -s -o /dev/null http://localhost:3000/; then
    echo "✅ Backend respondendo na porta 3000"
else
    echo "⚠️  Backend não respondeu na porta 3000 (pode ser normal se ainda estiver iniciando)"
fi

# Testar frontend
echo ""
echo "🧪 Testando frontend..."
if curl -f -s -o /dev/null http://localhost:$FRONTEND_PORT/; then
    echo "✅ Frontend respondendo na porta $FRONTEND_PORT"
else
    echo "⚠️  Frontend não respondeu na porta $FRONTEND_PORT (pode ser normal se ainda estiver iniciando)"
fi

echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "📱 Acessos:"
echo "   Frontend: http://$API_URL:$FRONTEND_PORT"
echo "   Backend:  http://$API_URL:3000"
echo ""
echo "🔐 Credenciais:"
echo "   Email: admin@tagpadrin.com"
echo "   Senha: admin123"
