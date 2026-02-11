# 🚀 Deploy em Produção - Tag Padrin

Este guia explica como fazer deploy da aplicação em um servidor novo/zerado usando o script automatizado.

## 📋 Pré-requisitos

- Servidor com acesso root/sudo
- Conexão com internet
- Sistema operacional suportado:
  - Ubuntu (18.04+)
  - Debian (10+)
  - CentOS (7+)
  - RHEL (7+)
  - Fedora (32+)
  - AlmaLinux
  - Rocky Linux

## 🚀 Execução Rápida

### 1. Clone o repositório

```bash
cd /opt
git clone https://github.com/seu-usuario/tag-padrin.git
cd tag-padrin
```

### 2. Execute o script de deploy

```bash
sudo ./deploy.sh
```

O script irá automaticamente:
- ✅ Instalar Docker (se não estiver instalado)
- ✅ Instalar Docker Compose (se não estiver instalado)
- ✅ Criar estrutura de diretórios em `/opt/tag-padrin`
- ✅ Gerar arquivo `.env` com senhas aleatórias seguras
- ✅ Buildar imagens Docker
- ✅ Iniciar todos os serviços (nginx, api, postgres)
- ✅ Executar migrações do banco de dados
- ✅ Verificar saúde da aplicação
- ✅ Criar backup automático

### 3. Configure as credenciais BRGPS

Após o deploy, **é obrigatório** editar o arquivo `/opt/tag-padrin/.env`:

```bash
sudo nano /opt/tag-padrin/.env
```

Configure o token BRGPS:

```env
# BRGPS Integration (obrigatório)
BRGPS_BASE_URL=http://www.brgps.com/open
BRGPS_API_TOKEN=seu_token_real_aqui
```

### 4. Reinicie os serviços

```bash
cd /opt/tag-padrin
docker compose -f docker-compose.prod.yml restart
```

### 5. Configure a URL do Traccar por dispositivo

Agora cada dispositivo pode enviar para um servidor Traccar diferente:

1. **Acesse a aplicação** em `http://IP_DO_SERVIDOR`
2. **Faça login** com as credenciais padrão:
   - Email: `admin@tagpadrin.com`
   - Senha: `admin123`
3. **Vá em "Dispositivos"** e clique em **"Novo Dispositivo"**
4. **Preencha os dados** do dispositivo
5. **No campo "URL do Traccar"**, informe a URL do servidor:
   - Ex: `http://acesso.ljlrastreadores.com.br:5055`
   - Se não informar, o dispositivo não enviará para o Traccar
6. **Salve** o dispositivo

**Para dispositivos existentes:**
- Clique no ícone de edição (lápis) do dispositivo
- Adicione ou altere a URL do Traccar
- Salve as alterações

## 📁 Estrutura de Diretórios

```
/opt/tag-padrin/              # Código fonte e configurações
/opt/backups/tag-padrin/      # Backups automáticos do banco
/var/log/tag-padrin-deploy.log # Logs do deploy
```

## 🔧 Comandos Úteis

### Ver logs
```bash
cd /opt/tag-padrin

# Todas as aplicações
docker compose -f docker-compose.prod.yml logs -f

# Apenas API
docker compose -f docker-compose.prod.yml logs -f api

# Apenas banco de dados
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Gerenciar serviços
```bash
cd /opt/tag-padrin

# Parar todos os serviços
docker compose -f docker-compose.prod.yml down

# Reiniciar
docker compose -f docker-compose.prod.yml restart

# Status dos containers
docker compose -f docker-compose.prod.yml ps
```

### Backup manual
```bash
cd /opt/tag-padrin

# Criar backup
docker exec tag-padrin-db pg_dump -U postgres tagpadrin > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20260211.sql | docker exec -i tag-padrin-db psql -U postgres tagpadrin
```

### Acesso ao banco de dados
```bash
docker exec -it tag-padrin-db psql -U postgres tagpadrin
```

### Executar migrações manualmente
```bash
cd /opt/tag-padrin
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## 🔒 Segurança

- O arquivo `.env` tem permissão 600 (apenas root pode ler)
- Senhas são geradas automaticamente com alta entropia
- JWT_SECRET é gerado com 64 bytes aleatórios
- Banco de dados não é exposto externamente (apenas na rede Docker)
- PostgreSQL acessível apenas internamente via Docker network

## 🌐 Acesso

Após o deploy, a aplicação estará disponível em:
- **Aplicação**: http://IP_DO_SERVIDOR
- **API**: http://IP_DO_SERVIDOR/api

Portas utilizadas:
- 80 (nginx - aplicação principal)
- 3000 (api - apenas interno)
- 5432 (postgres - apenas interno)

## 🐛 Troubleshooting

### Erro: "Cannot find module /app/dist/src/main"
```bash
# Rebuildar imagens sem cache
cd /opt/tag-padrin
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Erro de permissão no banco
```bash
# Corrigir permissões do volume
cd /opt/tag-padrin
docker compose -f docker-compose.prod.yml down
docker volume rm tag-padrin_postgres_data
docker compose -f docker-compose.prod.yml up -d
```

### API não responde
```bash
# Verificar logs
cd /opt/tag-padrin
docker compose -f docker-compose.prod.yml logs api | tail -50

# Verificar se migrações foram aplicadas
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate status
```

### Erro de migração
```bash
# Resetar migrações (CUIDADO: perde dados)
cd /opt/tag-padrin
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate reset --force

# Ou resolver conflito específico
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate resolve --applied NOME_DA_MIGRACAO
```

### Container do banco não inicia
```bash
# Verificar logs
docker logs tag-padrin-db

# Verificar se porta 5433 está livre
sudo lsof -i :5433

# Se necessário, alterar porta no docker-compose.prod.yml
```

### Frontend não carrega
```bash
# Verificar se nginx está rodando
docker ps | grep nginx

# Verificar logs do nginx
docker logs tag-padrin-nginx
```

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs do deploy: `cat /var/log/tag-padrin-deploy.log`
2. Verifique status dos containers: `docker ps -a`
3. Verifique logs em tempo real: 
   ```bash
   cd /opt/tag-padrin
   docker compose -f docker-compose.prod.yml logs -f
   ```

## 📝 Notas Importantes

- O script pode ser executado múltiplas vezes para atualizar a aplicação
- Backups são criados automaticamente antes de atualizações
- Requisitos mínimos: 2GB RAM, 10GB disco, 1 CPU
- Sempre configure os tokens BRGPS após instalação
- Altere a senha padrão do admin após primeiro login

## 🔄 Atualização

Para atualizar para uma nova versão:

```bash
cd /opt/tag-padrin
git pull origin main
sudo ./deploy.sh
```

O script automaticamente:
- Faz backup do banco atual
- Atualiza o código
- Rebuilda as imagens
- Executa migrações pendentes
- Verifica saúde da aplicação

## 📦 Deploy Manual (Alternativo)

Se preferir não usar o script automatizado:

```bash
# 1. Instalar Docker manualmente
# 2. Clonar repositório
cd /opt
git clone https://github.com/seu-usuario/tag-padrin.git
cd tag-padrin

# 3. Configurar .env
cp .env.example .env
nano .env

# 4. Subir aplicação
docker compose -f docker-compose.prod.yml up -d --build

# 5. Executar migrações
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```
