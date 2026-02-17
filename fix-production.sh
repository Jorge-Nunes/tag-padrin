#!/bin/bash

# Script de correção do banco de dados para produção
# Resolve o problema de coluna 'brgps_base_url' ausente na tabela settings

set -e  # Para execução em caso de erro

echo "========================================="
echo "Script de correção do banco de dados"
echo "Tag Manager - Produção"
echo "========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se docker compose está disponível
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo -e "${RED}✗ ERRO: Docker Compose não encontrado${NC}"
    exit 1
fi

echo -e "${YELLOW}→ Verificando containers...${NC}"

# Verificar se o container do banco está rodando
if ! $DOCKER_COMPOSE ps | grep -q "tag-padrin-db.*running\|tag-padrin-db.*Up"; then
    echo -e "${RED}✗ ERRO: Container do banco de dados não está rodando${NC}"
    echo "Execute primeiro: $DOCKER_COMPOSE up -d postgres"
    exit 1
fi

echo -e "${GREEN}✓ Container do banco está rodando${NC}"
echo ""

echo -e "${YELLOW}→ Adicionando colunas faltantes ao banco de dados...${NC}"

# Executar comandos SQL para adicionar as colunas
$DOCKER_COMPOSE exec -T postgres psql -U postgres -d tagpadrin << 'EOF'
-- Adicionar colunas se não existirem
ALTER TABLE settings ADD COLUMN IF NOT EXISTS brgps_base_url TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS brgps_token TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS traccar_url TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS traccar_token TEXT;

-- Inicializar valores padrão para registros existentes
UPDATE settings 
SET brgps_base_url = COALESCE(brgps_base_url, ''), 
    brgps_token = COALESCE(brgps_token, ''), 
    traccar_url = COALESCE(traccar_url, ''), 
    traccar_token = COALESCE(traccar_token, '') 
WHERE brgps_base_url IS NULL OR brgps_token IS NULL OR traccar_url IS NULL OR traccar_token IS NULL;

-- Verificar se a coluna foi criada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'settings' 
AND column_name IN ('brgps_base_url', 'brgps_token', 'traccar_url', 'traccar_token');
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Colunas adicionadas com sucesso${NC}"
else
    echo -e "${RED}✗ ERRO ao adicionar colunas${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}→ Verificando se backend está rodando...${NC}"

# Verificar se o backend está rodando
if $DOCKER_COMPOSE ps | grep -q "tag-padrin-api.*running\|tag-padrin-api.*Up"; then
    echo -e "${GREEN}✓ Backend está rodando${NC}"
    echo -e "${YELLOW}→ Reiniciando backend para aplicar mudanças...${NC}"
    $DOCKER_COMPOSE restart backend
    
    # Aguardar backend iniciar
    echo -e "${YELLOW}→ Aguardando backend inicializar...${NC}"
    sleep 10
    
    # Verificar se iniciou corretamente
    if $DOCKER_COMPOSE logs --tail 5 backend | grep -q "Nest application successfully started"; then
        echo -e "${GREEN}✓ Backend reiniciado com sucesso${NC}"
    else
        echo -e "${YELLOW}! Backend pode estar iniciando ainda. Verifique os logs com:${NC}"
        echo "  $DOCKER_COMPOSE logs backend"
    fi
else
    echo -e "${YELLOW}! Backend não está rodando. Iniciando...${NC}"
    $DOCKER_COMPOSE up -d backend
    echo -e "${GREEN}✓ Backend iniciado${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✓ Correção aplicada com sucesso!${NC}"
echo "========================================="
echo ""
echo "Próximos passos:"
echo "1. Acesse a aplicação no navegador"
echo "2. Tente salvar as configurações novamente"
echo ""
echo "Se ainda houver problemas, verifique os logs:"
echo "  $DOCKER_COMPOSE logs backend"
echo ""
