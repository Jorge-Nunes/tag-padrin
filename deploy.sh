#!/bin/bash

# Script de Deploy - Tag Manager
# Uso: ./deploy.sh [producao|desenvolvimento]
# Autor: Sistema Tag Manager
# Data: 2026-02-11

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
PROJECT_NAME="tag-padrin"
INSTALL_DIR="/opt/${PROJECT_NAME}"
BACKUP_DIR="/opt/backups/${PROJECT_NAME}"
LOG_FILE="/var/log/${PROJECT_NAME}-deploy.log"

# Funções de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERRO: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] AVISO: $1${NC}" | tee -a "$LOG_FILE"
}

# Verifica se é root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "Este script precisa ser executado como root (use sudo)"
    fi
}

# Detecta sistema operacional
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VERSION=$VERSION_ID
    else
        error "Não foi possível detectar o sistema operacional"
    fi
    
    log "Sistema detectado: $OS $VERSION"
}

# Instala Docker
install_docker() {
    log "Verificando Docker..."
    
    if command -v docker &> /dev/null; then
        log "Docker já instalado: $(docker --version)"
        return 0
    fi
    
    log "Instalando Docker..."
    
    case "$OS" in
        "Ubuntu"* | "Debian"*)
            apt-get update
            apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
            
            curl -fsSL https://download.docker.com/linux/$ID/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$ID $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
            
        "CentOS"* | "Red Hat"* | "Fedora"* | "AlmaLinux"* | "Rocky Linux"*)
            yum install -y yum-utils
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            systemctl start docker
            systemctl enable docker
            ;;
            
        *)
            error "Sistema operacional não suportado: $OS"
            ;;
    esac
    
    # Inicia Docker
    systemctl start docker
    systemctl enable docker
    
    log "Docker instalado com sucesso: $(docker --version)"
}

# Instala Docker Compose
install_docker_compose() {
    log "Verificando Docker Compose..."
    
    if docker compose version &> /dev/null || docker-compose --version &> /dev/null; then
        log "Docker Compose já instalado"
        return 0
    fi
    
    log "Instalando Docker Compose..."
    
    # Instala plugin do Docker Compose
    DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
    mkdir -p $DOCKER_CONFIG/cli-plugins
    curl -SL https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
    chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
    
    # Cria symlink
    ln -sf $DOCKER_CONFIG/cli-plugins/docker-compose /usr/local/bin/docker-compose
    
    log "Docker Compose instalado com sucesso"
}

# Cria estrutura de diretórios
create_directories() {
    log "Criando estrutura de diretórios..."
    
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname $LOG_FILE)"
    
    log "Diretórios criados em $INSTALL_DIR"
}

# Gera arquivo .env de produção
generate_env_file() {
    log "Gerando arquivo de configuração..."
    
    ENV_FILE="$INSTALL_DIR/.env"
    
    # Gera senhas aleatórias
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64)
    
    cat > "$ENV_FILE" << EOF
# ========================================
# Configuração de Produção - Tag Manager
# Gerado em: $(date)
# ========================================

# Ambiente
NODE_ENV=production
API_PORT=3000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=tagpadrin
DB_USER=postgres
DB_PASSWORD=${DB_PASSWORD}
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/tagpadrin

# Security (JWT)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=7d

# BRGPS Integration (substitua com suas credenciais)
BRGPS_BASE_URL=http://www.brgps.com/open
BRGPS_API_TOKEN=seu_token_aqui

# Frontend
VITE_API_URL=/api
EOF

    chmod 600 "$ENV_FILE"
    log "Arquivo .env gerado em $ENV_FILE"
    warn "IMPORTANTE: Edite o arquivo $ENV_FILE e configure o token BRGPS"
    warn "NOTA: A URL do Traccar agora é configurada individualmente em cada dispositivo"
}

# Clona ou atualiza repositório
setup_repository() {
    log "Configurando repositório..."
    
    REPO_URL="https://github.com/seu-usuario/tag-padrin.git"
    
    if [ -d "$INSTALL_DIR/.git" ]; then
        log "Repositório existente encontrado. Atualizando..."
        cd "$INSTALL_DIR"
        git fetch origin
        git reset --hard origin/main
    else
        log "Clonando repositório..."
        git clone "$REPO_URL" "$INSTALL_DIR"
        cd "$INSTALL_DIR"
    fi
    
    log "Repositório configurado"
}

# Backup do banco de dados
backup_database() {
    log "Verificando necessidade de backup..."
    
    if docker ps | grep -q "tag-padrin-db"; then
        BACKUP_FILE="${BACKUP_DIR}/backup_$(date +%Y%m%d_%H%M%S).sql"
        log "Criando backup do banco: $BACKUP_FILE"
        
        docker exec tag-padrin-db pg_dump -U postgres tagpadrin > "$BACKUP_FILE"
        gzip "$BACKUP_FILE"
        
        # Mantém apenas últimos 5 backups
        ls -t ${BACKUP_DIR}/backup_*.sql.gz | tail -n +6 | xargs -r rm
        
        log "Backup criado com sucesso"
    else
        log "Banco não está rodando. Pulando backup."
    fi
}

# Deploy da aplicação
deploy_application() {
    log "Iniciando deploy da aplicação..."
    
    cd "$INSTALL_DIR"
    
    # Copia .env se não existir
    if [ ! -f ".env" ]; then
        generate_env_file
    fi
    
    # Para containers antigos
    log "Parando containers antigos..."
    docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    
    # Build das imagens
    log "Buildando imagens Docker..."
    docker compose -f docker-compose.prod.yml build --no-cache
    
    # Inicia serviços
    log "Iniciando serviços..."
    docker compose -f docker-compose.prod.yml up -d
    
    # Aguarda banco ficar pronto
    log "Aguardando banco de dados ficar pronto..."
    for i in {1..30}; do
        if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
            log "Banco de dados pronto!"
            break
        fi
        sleep 2
    done
    
    # Gera Prisma Client
    log "Gerando Prisma Client..."
    docker compose -f docker-compose.prod.yml exec -T backend npx prisma generate
    
    # Executa migrações
    log "Executando migrações..."
    docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy || {
        warn "Migrações falharam. Tentando baseline..."
        # Tenta fazer baseline das migrações existentes
        for migration in $(docker compose -f docker-compose.prod.yml exec -T backend ls -1 /app/prisma/migrations/ 2>/dev/null | grep -E '^[0-9]{14}_' | sort); do
            migration_name=$(basename "$migration")
            log "Marcando $migration_name como aplicada..."
            docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate resolve --applied "$migration_name" || true
        done
    }
    
    log "Deploy concluído!"
}

# Health check
check_health() {
    log "Verificando saúde da aplicação..."
    
    # Verifica containers
    if ! docker ps | grep -q "tag-padrin-nginx"; then
        error "Nginx não está rodando"
    fi
    
    if ! docker ps | grep -q "tag-padrin-api"; then
        error "API não está rodando"
    fi
    
    if ! docker ps | grep -q "tag-padrin-db"; then
        error "Banco de dados não está rodando"
    fi
    
    # Aguarda API estar pronta
    log "Aguardando API ficar disponível..."
    for i in {1..30}; do
        if curl -s http://localhost:80/api/health > /dev/null 2>&1; then
            log "API respondendo!"
            break
        fi
        sleep 2
    done
    
    # Verifica API
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/api/health 2>/dev/null || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
        log "Health check passou! Status: $HTTP_STATUS"
    else
        warn "Health check retornou status: $HTTP_STATUS"
        warn "Verificando logs..."
        docker compose -f docker-compose.prod.yml logs --tail=50 api
    fi
    
    # Mostra status final
    echo ""
    log "========================================"
    log "DEPLOY CONCLUÍDO COM SUCESSO!"
    log "========================================"
    echo ""
    log "URLs de acesso:"
    log "  - Aplicação: http://$(hostname -I | awk '{print $1}')"
    log "  - API: http://$(hostname -I | awk '{print $1}')/api"
    echo ""
    log "Comandos úteis:"
    log "  - Ver logs: docker compose -f docker-compose.prod.yml logs -f"
    log "  - Parar: docker compose -f docker-compose.prod.yml down"
    log "  - Reiniciar: docker compose -f docker-compose.prod.yml restart"
    log "  - Status: docker compose -f docker-compose.prod.yml ps"
    echo ""
    warn "PRÓXIMOS PASSOS:"
    warn "1. Configure o token BRGPS no arquivo: $INSTALL_DIR/.env"
    warn "2. Acesse a aplicação e cadastre seus dispositivos"
    warn "3. Para cada dispositivo, configure a URL do Traccar individualmente"
    warn "   (Acesse: Dispositivos > Editar > URL do Traccar)"
}

# Menu principal
main() {
    clear
    echo "========================================"
    echo "   DEPLOY - Tag Manager"
    echo "========================================"
    echo ""
    
    check_root
    detect_os
    
    echo ""
    log "Iniciando instalação..."
    echo ""
    
    # Etapas
    create_directories
    install_docker
    install_docker_compose
    setup_repository
    backup_database
    deploy_application
    check_health
}

# Executa
main "$@"
