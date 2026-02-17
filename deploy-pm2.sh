#!/bin/bash

# Script de Deploy - Tag Manager com PM2
# Uso: sudo ./deploy-pm2.sh

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"; exit 1; }

# Diretórios
INSTALL_DIR="/opt/tag-padrin"
LOG_DIR="/var/log"

# Verificar root
if [[ $EUID -ne 0 ]]; then
    error "Execute como root (sudo)"
fi

# Detectar OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
else
    error "Não foi possível detectar o sistema operacional"
fi

log "Iniciando deploy no $OS..."

# 1. Instalar dependências
log "Instalando dependências..."
case "$OS" in
    "Ubuntu"* | "Debian"*)
        apt-get update
        apt-get install -y curl git nginx postgresql-client redis-tools
        ;;
    "CentOS"* | "Rocky"* | "AlmaLinux"*)
        yum update -y
        yum install -y curl git nginx postgresql
        ;;
esac

# 2. Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. Instalar PM2
npm install -g pm2 serve

# 4. Instalar Docker (apenas para PostgreSQL)
if ! command -v docker &> /dev/null; then
    log "Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 5. Clonar repositório
if [ ! -d "$INSTALL_DIR" ]; then
    log "Clonando repositório..."
    git clone https://github.com/Jorge-Nunes/tag-padrin.git "$INSTALL_DIR"
else
    log "Atualizando repositório..."
    cd "$INSTALL_DIR"
    git pull origin main
fi

cd "$INSTALL_DIR"

# 6. Gerar .env
if [ ! -f ".env" ]; then
    log "Gerando arquivo .env..."
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64)
    
    cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_PASSWORD=${DB_PASSWORD}
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@localhost:5432/tagpadrin
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=7d
BRGPS_BASE_URL=http://www.brgps.com/open
BRGPS_API_TOKEN=seu_token_aqui
EOF
    chmod 600 .env
    warn "IMPORTANTE: Edite o arquivo .env e configure o token BRGPS"
fi

# 7. Iniciar PostgreSQL
log "Iniciando PostgreSQL..."
docker compose -f docker-compose.db.yml up -d

# Aguardar PostgreSQL
log "Aguardando PostgreSQL..."
for i in {1..30}; do
    if docker exec tag-padrin-db pg_isready -U postgres > /dev/null 2>&1; then
        log "PostgreSQL pronto!"
        break
    fi
    sleep 2
done

# 8. Configurar Backend
log "Configurando Backend..."
cd "$INSTALL_DIR/backend"
cp "$INSTALL_DIR/.env" .env
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build

# 9. Configurar Frontend
log "Configurando Frontend..."
cd "$INSTALL_DIR/frontend"
npm ci
npm run build

# 10. Configurar Nginx
log "Configurando Nginx..."
cp "$INSTALL_DIR/nginx-host.conf" /etc/nginx/sites-available/tag-padrin
ln -sf /etc/nginx/sites-available/tag-padrin /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 11. Configurar PM2
log "Configurando PM2..."
cp "$INSTALL_DIR/ecosystem.config.js" "$INSTALL_DIR/"
cd "$INSTALL_DIR"
pm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

# 12. Health check
log "Verificando saúde da aplicação..."
sleep 5

if curl -s http://localhost/api/health > /dev/null 2>&1 || curl -s http://localhost > /dev/null 2>&1; then
    log "✅ Aplicação rodando!"
else
    warn "⚠️  Verifique os logs: pm2 logs"
fi

log "========================================"
log "DEPLOY CONCLUÍDO!"
log "========================================"
log ""
log "Acesse: http://$(hostname -I | awk '{print $1}')"
log ""
log "Comandos úteis:"
log "  pm2 status              - Ver status"
log "  pm2 logs                - Ver logs"
log "  pm2 restart all         - Reiniciar tudo"
log "  pm2 stop all            - Parar tudo"
log ""
log "Nginx: systemctl restart nginx"
log "PostgreSQL: docker compose -f docker-compose.db.yml logs -f"
