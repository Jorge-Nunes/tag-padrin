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
    echo "⚠️  FRONTEND_PORT não definida, usando padrão 8080"
    export FRONTEND_PORT=8080
fi

if [ -z "$BACKEND_PORT" ]; then
    echo "⚠️  BACKEND_PORT não definida, usando padrão 6000"
    export BACKEND_PORT=6000
fi

# Extrair o domínio/host da API_URL
if [[ $API_URL =~ http://([^/:]+) ]]; then
    export HOST="${BASH_REMATCH[1]}"
else
    export HOST="localhost"
fi

echo "📋 Configuração:"
echo "   Backend Porta: $BACKEND_PORT"
echo "   Frontend Porta: $FRONTEND_PORT"
echo "   API URL: $API_URL"
echo "   Host: $HOST"
echo ""

# Parar containers antigos
echo "🛑 Parando containers antigos..."
docker compose down

# Reconstruir e iniciar containers
echo "🏗️  Construindo e iniciando containers..."
docker compose --env-file .env.production up -d --build

# Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 10

# Verificar status
echo "✅ Verificando status..."
docker compose ps

# Testar backend
echo ""
echo "🧪 Testando backend..."
if curl -f -s -o /dev/null http://localhost:$BACKEND_PORT/; then
    echo "✅ Backend respondendo na porta $BACKEND_PORT"
else
    echo "⚠️  Backend não respondeu na porta $BACKEND_PORT (pode ser normal se ainda estiver iniciando)"
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
echo "   Frontend: http://$HOST:$FRONTEND_PORT"
echo "   Backend:  http://$HOST:$BACKEND_PORT/api"
echo ""
echo "🔐 Credenciais:"
echo "   Email: admin@tagpadrin.com"
echo "   Senha: admin123"
