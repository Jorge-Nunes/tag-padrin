# 🚀 Deploy com PM2 - Tag Padrin

Este guia explica como instalar a aplicação **sem Docker** para backend e frontend, usando:
- **PostgreSQL** no Docker
- **Backend** rodando com PM2 (Node.js)
- **Frontend** rodando com PM2 (serve)
- **Nginx** no host como proxy reverso

## 📋 Vantagens desta abordagem

- ✅ **Sem problemas de cache** do Docker
- ✅ **Mais fácil de debugar** (logs diretos)
- ✅ **Reinício automático** com PM2
- ✅ **Melhor performance**
- ✅ **Mais simples de atualizar**

---

## 🚀 Execução Rápida

### 1. Execute o script de deploy

```bash
# Clone o repositório
cd /opt
git clone https://github.com/Jorge-Nunes/tag-padrin.git
cd tag-padrin

# Execute o deploy
sudo ./deploy-pm2.sh
```

O script irá:
- ✅ Instalar Node.js 20
- ✅ Instalar PM2 e dependências
- ✅ Instalar Docker (apenas para PostgreSQL)
- ✅ Instalar e configurar Nginx
- ✅ Configurar backend e frontend
- ✅ Iniciar todos os serviços

### 2. Configure o token BRGPS

```bash
sudo nano /opt/tag-padrin/.env
```

Adicione seu token:
```env
BRGPS_API_TOKEN=seu_token_real_aqui
```

### 3. Reinicie o backend

```bash
pm2 restart tag-padrin-backend
```

---

## 📁 Estrutura

```
/opt/tag-padrin/
├── backend/              # Código do backend
│   ├── dist/            # Compilado
│   ├── node_modules/
│   └── .env
├── frontend/            # Código do frontend
│   ├── dist/           # Build
│   └── node_modules/
├── docker-compose.db.yml  # Apenas PostgreSQL
├── ecosystem.config.js    # Config PM2
├── nginx-host.conf        # Config Nginx
└── .env                   # Variáveis de ambiente
```

---

## 🔧 Comandos Úteis

### PM2 (Gerenciamento)

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs de um serviço específico
pm2 logs tag-padrin-backend
pm2 logs tag-padrin-frontend

# Reiniciar
pm2 restart all
pm2 restart tag-padrin-backend

# Parar
pm2 stop all

# Iniciar
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

### Nginx

```bash
# Testar configuração
nginx -t

# Reiniciar
systemctl restart nginx

# Ver logs
tail -f /var/log/nginx/tag-padrin-error.log
tail -f /var/log/nginx/tag-padrin-access.log
```

### PostgreSQL (Docker)

```bash
cd /opt/tag-padrin

# Ver logs
docker compose -f docker-compose.db.yml logs -f

# Parar
docker compose -f docker-compose.db.yml down

# Iniciar
docker compose -f docker-compose.db.yml up -d

# Acessar banco
docker exec -it tag-padrin-db psql -U postgres tagpadrin
```

---

## 🔄 Atualização

Para atualizar a aplicação:

```bash
cd /opt/tag-padrin

# 1. Atualizar código
git pull origin main

# 2. Atualizar backend
cd backend
npm ci
npx prisma migrate deploy
npm run build
cd ..

# 3. Atualizar frontend
cd frontend
npm ci
npm run build
cd ..

# 4. Reiniciar PM2
pm2 restart all

# 5. Verificar
pm2 status
```

---

## 🐛 Troubleshooting

### Erro 502 Bad Gateway

```bash
# Verificar se backend está rodando
pm2 status

# Ver logs
curl http://localhost:3000/api/health
pm2 logs tag-padrin-backend
```

### Erro de conexão com banco

```bash
# Verificar PostgreSQL
docker ps | grep tag-padrin-db
docker logs tag-padrin-db

# Testar conexão
docker exec -it tag-padrin-db psql -U postgres tagpadrin -c "SELECT 1"
```

### Frontend não carrega

```bash
# Verificar se está rodando
curl http://localhost:5173

# Ver logs
pm2 logs tag-padrin-frontend
```

### Permissão negada nos logs

```bash
sudo chown -R $USER:$USER /var/log/tag-padrin-*
```

---

## 📝 Configuração Nginx (Manual)

Se preferir configurar o nginx manualmente:

```bash
sudo nano /etc/nginx/sites-available/tag-padrin
```

Copie o conteúdo do arquivo `nginx-host.conf` e cole.

Depois:
```bash
sudo ln -sf /etc/nginx/sites-available/tag-padrin /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🎯 Resumo

| Serviço | Tecnologia | Comando Status |
|---------|-----------|----------------|
| PostgreSQL | Docker | `docker ps` |
| Backend | PM2 | `pm2 status` |
| Frontend | PM2 | `pm2 status` |
| Nginx | systemd | `systemctl status nginx` |

Acesso: **http://IP_DO_SERVIDOR**

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs: `pm2 logs`
2. Verifique nginx: `tail -f /var/log/nginx/error.log`
3. Verifique banco: `docker logs tag-padrin-db`
