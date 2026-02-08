# Deploy em Produção

## Configuração Rápida

### 1. Clone ou atualize o repositório
```bash
cd /opt/tag-padrin
git pull origin main
```

### 2. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.production.example .env.production

# Edite o arquivo com suas configurações
nano .env.production
```

#### Variáveis obrigatórias:
- `FRONTEND_PORT`: Porta onde o frontend vai rodar (padrão: 5175)
- `API_URL`: URL ou IP do servidor para acesso à API
  - Para acesso local: `http://localhost:3000`
  - Para acesso externo por IP: `http://192.168.1.100:3000`
  - Para acesso por domínio: `http://tagpadrin.evo.dedyn.io:3000`

**Exemplo de .env.production:**
```env
FRONTEND_PORT=5175
API_URL=http://tagpadrin.evo.dedyn.io:3000
```

### 3. Execute o deploy
```bash
./deploy.sh
```

## Deploy Manual

Se preferir fazer manualmente:

```bash
# Carregar variáveis
export $(cat .env.production | grep -v '^#' | xargs)

# Parar containers antigos
docker compose -f docker-compose.prod.yml down

# Iniciar containers
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## Verificação

### Verificar status dos containers
```bash
docker compose -f docker-compose.prod.yml ps
```

### Verificar logs
```bash
# Backend
docker logs tag-padrin-api -f

# Frontend
docker logs tag-padrin-web -f

# Banco de dados
docker logs tag-padrin-db -f
```

### Testar endpoints
```bash
# Backend health check
curl http://localhost:3000/

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tagpadrin.com","password":"admin123"}'

# Frontend
curl -I http://localhost:5175/
```

## Configuração de Firewall

Certifique-se de que as portas estão abertas no firewall:

```bash
# UFW
sudo ufw allow 3000/tcp
sudo ufw allow 5175/tcp
sudo ufw reload

# FirewallD
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=5175/tcp
sudo firewall-cmd --reload

# iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5175 -j ACCEPT
```

## Acessos

Após o deploy:

- **Frontend**: `http://SEU_IP:5175` ou `http://seu-dominio.com:5175`
- **Backend API**: `http://SEU_IP:3000` ou `http://seu-dominio.com:3000`

## Credenciais Padrão

- **Email**: `admin@tagpadrin.com`
- **Senha**: `admin123`

**⚠️ Importante**: Altere as credenciais após o primeiro login!

## Troubleshooting

### Container não inicia
```bash
docker logs tag-padrin-api
docker logs tag-padrin-web
```

### Erro de porta já em uso
```bash
# Verificar o que está usando a porta
sudo lsof -i :5175
sudo lsof -i :3000

# Matar o processo
sudo kill -9 <PID>
```

### Frontend não consegue acessar backend
1. Verifique se o IP/domínio no .env.production está correto
2. Verifique se as portas estão abertas no firewall
3. Verifique se o backend está respondendo: `curl http://localhost:3000/`

### Banco de dados não conecta
```bash
# Verificar logs do postgres
docker logs tag-padrin-db

# Verificar conexão
docker exec -it tag-padrin-db psql -U postgres -d tagpadrin -c "SELECT 1"
```

## Atualização

Para atualizar a aplicação:

```bash
cd /opt/tag-padrin

# Pull das mudanças
git pull origin main

# Executar deploy
./deploy.sh
```

## Backup do Banco de Dados

```bash
# Backup
docker exec tag-padrin-db pg_dump -U postgres tagpadrin > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker exec -i tag-padrin-db psql -U postgres tagpadrin < backup_20240108_200000.sql
```
