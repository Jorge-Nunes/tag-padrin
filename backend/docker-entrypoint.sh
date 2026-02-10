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

# Verificar se precisa fazer baseline (banco existe mas sem _prisma_migrations)
echo "🔍 Verificando estado das migrações..."
if ! npx prisma db execute --stdin <<<'SELECT 1 FROM _prisma_migrations LIMIT 1' > /dev/null 2>&1; then
    echo "⚠️  Tabela _prisma_migrations não encontrada. Verificando se o banco tem dados..."
    # Verificar se existe alguma tabela no schema public
    TABLE_COUNT=$(npx prisma db execute --stdin <<<'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '"'"'public'"'"' AND table_type = '"'"'BASE TABLE'"'"'' 2>/dev/null | grep -E '^[0-9]+$' || echo "0")
    
    if [ "$TABLE_COUNT" -gt "0" ]; then
        echo "📋 Banco contém $TABLE_COUNT tabela(s). Fazendo baseline das migrações existentes..."
        # Resolver todas as migrações como já aplicadas
        for migration in $(ls -1 /app/prisma/migrations/2* 2>/dev/null | sort); do
            migration_name=$(basename "$migration")
            echo "   → Marcando $migration_name como aplicada"
            npx prisma migrate resolve --applied "$migration_name" || true
        done
        echo "✅ Baseline concluído"
    fi
fi

# Aplicar migrações pendentes
echo "🗄️ Aplicando migrações de banco de dados..."
npx prisma migrate deploy

echo "✅ Migrações aplicadas com sucesso!"

# Iniciar a aplicação
echo "🚀 Iniciando aplicação..."
exec "$@"
