# Guia de Deploy em Produção

Este guia descreve como colocar a aplicação Tag Padrin em produção utilizando Docker Compose e Nginx.

## Pré-requisitos

1.  Docker e Docker Compose instalados no servidor.
2.  Domínio apontando para o servidor (opcional, pode usar IP).

## Passos para Deploy

### 1. Preparar Variáveis de Ambiente

Crie o arquivo `.env.production` baseado no exemplo fornecido:

```bash
cp .env.production.example .env.production
```

Edite o arquivo `.env.production` e defina senhas seguras e o domínio correto (se houver).

### 2. Iniciar a Aplicação

Execute o seguinte comando para construir e iniciar os containers em modo de produção:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Verificar Status

Verifique se todos os containers estão rodando:

```bash
docker compose -f docker-compose.prod.yml ps
```

Você deve ver três serviços:
- `tag-padrin-db-prod` (Banco de Dados)
- `tag-padrin-api-prod` (Backend)
- `tag-padrin-web-prod` (Frontend + Nginx)

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

### Logs
Para ver os logs de produção:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Parar a Aplicação
```bash
docker compose -f docker-compose.prod.yml down
```

### Atualizar
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```
