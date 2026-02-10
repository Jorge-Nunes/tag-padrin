# Guia de Deploy em Produção

Este guia descreve como colocar a aplicação Tag Padrin em produção utilizando Docker Compose e Nginx.

## Pré-requisitos

1.  Docker e Docker Compose instalados no servidor.
2.  Domínio apontando para o servidor (opcional, pode usar IP).

## 🚀 Deploy Automático (Recomendado)

Para atualizar o código, rebuildar os containers e aplicar as migrações de banco de dados automaticamente, execute:

```bash
chmod +x deploy_prod.sh
./deploy_prod.sh
```

Este script cuida de todo o processo de deploy seguro.

## Passos para Deploy Manual

### 1. Preparar Variáveis de Ambiente

Crie o arquivo `.env.production` baseado no exemplo fornecido:

```bash
cp .env.production.example .env.production
```

Edite o arquivo `.env.production` e defina senhas seguras e o domínio correto (se houver).

### 2. Iniciar a Aplicação

Execute o seguinte comando para construir e iniciar os containers em modo de produção:

```bash
docker compose up -d --build
```

### 3. Verificar Status

Verifique se todos os containers estão rodando:

```bash
docker compose ps
```

Você deve ver três serviços:
- `tag-padrin-db` (Banco de Dados)
- `tag-padrin-api` (Backend)
- `tag-padrin-web` (Frontend + Nginx)

### 4. Acessar a Aplicação

Acesse a aplicação através do navegador:
- **Frontend**: http://seu-dominio-ou-ip (Porta 80)
- **API**: Acessível internamente pelo frontend em `/api`

## Estrutura de Arquivos de Produção

- `docker-compose.prod.yml`: Orquestração dos containers.
- `nginx.conf` (na raiz): Configuração base do Nginx (usada como referência).
- `frontend/Dockerfile.prod`: Dockerfile otimizado para produção (multi-stage build).
- `frontend/nginx.conf`: Configuração do Nginx dentro do container frontend para servir SPA e proxy reverso.
- `.env.production.example`: Modelo das variáveis de ambiente.

## Manutenção

### Migrações de Banco de Dados
As migrações são aplicadas automaticamente via entrypoint. Se precisar rodar manualmente:
```bash
docker compose --env-file .env run --rm backend npx prisma migrate deploy
```

### Logs
Para ver os logs de produção:
```bash
docker compose logs -f
```

### Parar a Aplicação
```bash
docker compose down
```

### Atualizar
```bash
git pull
docker compose up -d --build
```
