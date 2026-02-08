#!/bin/bash
# Script para corrigir o banco de dados no ambiente de produção

echo "=== Corrigindo banco de dados ==="

# Encontrar o arquivo de migração
MIGRATION_FILE=$(find . -name "migration.sql" -path "*/migrations/*" | head -1)

if [ -z "$MIGRATION_FILE" ]; then
    echo "❌ Arquivo de migração não encontrado"
    echo "Procurando em:"
    find . -name "*.sql" -type f | grep -i migration || echo "Nenhum arquivo SQL encontrado"
    exit 1
fi

echo "✅ Arquivo de migração encontrado: $MIGRATION_FILE"

# 1. Verificar se as tabelas existem
echo "Verificando tabelas..."
TABLES=$(docker compose exec -T postgres psql -U postgres -d tagpadrin -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | xargs)

if [ "$TABLES" = "0" ] || [ -z "$TABLES" ]; then
    echo "Banco vazio. Aplicando migração..."
    
    # 2. Copiar arquivo SQL para o container postgres
    echo "Copiando arquivo de migração para o container..."
    docker compose cp "$MIGRATION_FILE" postgres:/tmp/migration.sql
    
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao copiar arquivo de migração"
        exit 1
    fi
    
    # 3. Executar migração dentro do container
    echo "Executando migração SQL..."
    docker compose exec postgres psql -U postgres -d tagpadrin -f /tmp/migration.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Migração aplicada com sucesso!"
        
        # 4. Verificar se as tabelas foram criadas
        TABLES_AFTER=$(docker compose exec -T postgres psql -U postgres -d tagpadrin -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | xargs)
        echo "Tabelas criadas: $TABLES_AFTER"
        
        # 5. Regenerar cliente Prisma
        echo "Regenerando cliente Prisma..."
        docker compose exec backend npx prisma generate
        
        # 6. Executar seed
        echo "Executando seed..."
        docker compose exec backend npx ts-node prisma/seed.ts
        
        if [ $? -eq 0 ]; then
            echo "✅ Seed executado com sucesso!"
            echo ""
            echo "=== Correção concluída ==="
            echo "Usuário: admin@tagpadrin.com"
            echo "Senha: admin123"
            echo ""
            echo "Reiniciando backend..."
            docker compose restart backend
            
            echo ""
            echo "Aguardando inicialização..."
            sleep 10
            docker compose logs --tail=10 backend
        else
            echo "❌ Erro ao executar seed"
            exit 1
        fi
    else
        echo "❌ Erro ao aplicar migração"
        exit 1
    fi
else
    echo "✅ Banco já possui tabelas ($TABLES tabelas)"
    echo "Verificando se a tabela settings existe..."
    
    SETTINGS_EXISTS=$(docker compose exec -T postgres psql -U postgres -d tagpadrin -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='settings');" 2>/dev/null | xargs)
    
    if [ "$SETTINGS_EXISTS" = "t" ]; then
        echo "✅ Tabela settings existe"
        
        # Verificar se há dados
        COUNT=$(docker compose exec -T postgres psql -U postgres -d tagpadrin -t -c "SELECT COUNT(*) FROM settings;" 2>/dev/null | xargs)
        if [ "$COUNT" = "0" ]; then
            echo "Tabela settings vazia. Executando seed..."
            docker compose exec backend npx prisma generate
            docker compose exec backend npx ts-node prisma/seed.ts
            docker compose restart backend
        else
            echo "✅ Tabela settings já possui dados"
            echo "Reiniciando backend..."
            docker compose restart backend
        fi
    else
        echo "❌ Tabela settings não existe. Recriando banco..."
        docker compose down -v
        docker compose up -d
        sleep 10
        exec $0
    fi
fi

echo ""
echo "Verificando status do backend..."
docker compose ps backend
