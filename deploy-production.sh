#!/bin/bash

# Script completo de deploy para produção
# Atualiza código, rebuilda containers e aplica correções

set -e

echo "========================================="
echo "DEPLOY PARA PRODUÇÃO - Tag Padrin"
echo "========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detectar docker compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose -f docker-compose.prod.yml"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose -f docker-compose.prod.yml"
else
    echo -e "${RED}✗ ERRO: Docker Compose não encontrado${NC}"
    exit 1
fi

# Detectar docker compose padrão (para comandos exec)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_BASE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE_BASE="docker compose"
fi

echo -e "${YELLOW}Usando: docker-compose.prod.yml (sem volume mounts)${NC}"
echo ""
echo -e "${BLUE}→ Passo 1: Atualizando código do repositório...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ ERRO: Falha ao fazer git pull${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Código atualizado${NC}"
echo ""

echo -e "${BLUE}→ Passo 2: Parando containers existentes...${NC}"
$DOCKER_COMPOSE down
echo -e "${GREEN}✓ Containers parados${NC}"
echo ""

echo -e "${BLUE}→ Passo 3: Rebuildando imagens (sem cache)...${NC}"
$DOCKER_COMPOSE build --no-cache
echo -e "${GREEN}✓ Imagens rebuildadas${NC}"
echo ""

echo -e "${BLUE}→ Passo 4: Iniciando containers...${NC}"
$DOCKER_COMPOSE up -d
echo -e "${GREEN}✓ Containers iniciados${NC}"
echo ""

echo -e "${BLUE}→ Passo 5: Aguardando banco de dados...${NC}"
sleep 10

# Verificar se postgres está saudável
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if $DOCKER_COMPOSE ps | grep -q "tag-padrin-db.*healthy"; then
        echo -e "${GREEN}✓ Banco de dados pronto${NC}"
        break
    fi
    echo -e "${YELLOW}  Aguardando banco... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}✗ ERRO: Banco não ficou pronto a tempo${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}→ Passo 6: Aplicando correções no banco de dados...${NC}"

# Adicionar colunas faltantes
$DOCKER_COMPOSE exec -T postgres psql -U postgres -d tagpadrin << 'EOF'
-- Adicionar colunas se não existirem
ALTER TABLE settings ADD COLUMN IF NOT EXISTS brgps_base_url TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS brgps_token TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS traccar_url TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS traccar_token TEXT;

-- Atualizar valores nulos
UPDATE settings 
SET brgps_base_url = COALESCE(brgps_base_url, ''), 
    brgps_token = COALESCE(brgps_token, ''), 
    traccar_url = COALESCE(traccar_url, ''), 
    traccar_token = COALESCE(traccar_token, '') 
WHERE brgps_base_url IS NULL OR brgps_token IS NULL OR traccar_url IS NULL OR traccar_token IS NULL;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Correções aplicadas${NC}"
else
    echo -e "${YELLOW}! Algumas correções podem ter falhado (isso é normal se já existirem)${NC}"
fi
echo ""

echo -e "${BLUE}→ Passo 7: Aguardando backend inicializar...${NC}"
sleep 15

# Verificar se backend está rodando
MAX_RETRIES=20
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if $DOCKER_COMPOSE logs --tail 5 backend 2>/dev/null | grep -q "Nest application successfully started"; then
        echo -e "${GREEN}✓ Backend iniciado com sucesso${NC}"
        break
    fi
    echo -e "${YELLOW}  Aguardando backend... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
    sleep 3
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}! Backend pode estar iniciando ainda${NC}"
fi
echo ""

echo -e "${BLUE}→ Passo 8: Verificando se existe usuário admin...${NC}"

# Verificar se existem usuários no banco
USER_COUNT=$($DOCKER_COMPOSE exec -T postgres psql -U postgres -d tagpadrin -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs)

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo -e "${YELLOW}⚠ Nenhum usuário encontrado. Executando seed...${NC}"
    $DOCKER_COMPOSE exec -T backend node prisma/seed.js
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Usuário admin criado!${NC}"
        echo ""
        echo "Credenciais padrão:"
        echo "  Email: admin@tagpadrin.com"
        echo "  Senha: admin123"
    else
        echo -e "${RED}✗ Erro ao criar usuário admin${NC}"
    fi
else
    echo -e "${GREEN}✓ Já existem $USER_COUNT usuário(s) no banco${NC}"
fi
echo ""

echo -e "${BLUE}→ Passo 9: Verificando status final...${NC}"
echo ""
$DOCKER_COMPOSE ps
echo ""

echo "========================================="
echo -e "${GREEN}✓ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo "========================================="
echo ""
echo "Acesse a aplicação em:"
echo "  → http://localhost (ou IP do servidor)"
echo ""
echo "Para verificar logs:"
echo "  $DOCKER_COMPOSE logs -f backend"
echo ""
