#!/bin/bash
# Entrypoint script para garantir migrações antes de iniciar a aplicação

set -e

echo "🏥 Verificando saúde do banco de dados..."

# Aguardar banco de dados estar disponível (timeout de 30 segundos)
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if npx prisma db execute --stdin <<<'SELECT 1' > /dev/null 2>&1; then
        echo "✅ Banco de dados está acessível"
        break
    fi
    attempt=$((attempt + 1))
    echo "⏳ Aguardando banco de dados... (tentativa $attempt/$max_attempts)"
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Timeout: Banco de dados não está acessível"
    exit 1
fi

# Aplicar migrações pendentes
echo "🗄️ Aplicando migrações de banco de dados..."
npx prisma migrate deploy

echo "✅ Migrações aplicadas com sucesso!"

# Iniciar a aplicação
echo "🚀 Iniciando aplicação..."
exec "$@"
