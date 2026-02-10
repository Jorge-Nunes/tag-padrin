# Correção: Erro P2022 - Coluna brgps_base_url não existe

## Data da Correção
2025-02-10

## Problema
Erro em produção ao iniciar a aplicação:
```
PrismaClientKnownRequestError: 
Invalid `this.prisma.systemSettings.findUnique()` invocation
The column `settings.brgps_base_url` does not exist in the current database.
code: 'P2022'
```

## Causa Raiz
A migration `20260209024101_add_brgps_base_url` foi nomeada para adicionar a coluna `brgps_base_url`, mas o SQL **não continha** o comando para adicionar a coluna. A migration só fazia ALTER COLUMN em colunas existentes.

**Por que funcionava localmente mas não em produção:**
- **Local**: Usava `prisma db push` ou recriava o banco do zero, sincronizando diretamente com o schema.prisma
- **Produção**: Usa `prisma migrate deploy` que só aplica migrations existentes. Como nenhuma migration adicionava a coluna, o banco permanecia sem ela.

## Solução Aplicada

### 1. Criada Migration Corretiva
**Arquivo**: `backend/prisma/migrations/20260210030000_add_missing_brgps_base_url/migration.sql`

```sql
-- Adicionar coluna brgps_base_url na tabela settings
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "brgps_base_url" TEXT;

-- Garantir que a coluna seja nullable
ALTER TABLE "settings" ALTER COLUMN "brgps_base_url" DROP NOT NULL;
```

### 2. Adicionado Entrypoint Automático
**Arquivo**: `backend/docker-entrypoint.sh`

Criado script de entrypoint que:
- Aguarda o banco de dados estar acessível
- Executa `prisma migrate deploy` automaticamente antes de iniciar a aplicação
- Inicia a aplicação apenas após migrações bem-sucedidas

**Arquivo**: `backend/Dockerfile`

Atualizado para usar o entrypoint script.

## Verificação de Outras Colunas

Comparando `schema.prisma` com as migrations:

| Model | Coluna no Schema | Status na Migration Inicial | Status Atual |
|-------|------------------|----------------------------|--------------|
| SystemSettings | id | ✅ Criada | ✅ OK |
| SystemSettings | syncInterval (sync_interval) | ✅ Criada | ✅ OK |
| SystemSettings | brgpsBaseUrl (brgps_base_url) | ❌ Faltando | ✅ Corrigido |
| SystemSettings | brgpsToken (brgps_token) | ✅ Criada | ✅ OK |
| SystemSettings | traccarUrl (traccar_url) | ✅ Criada | ✅ OK |
| SystemSettings | traccarToken (traccar_token) | ✅ Criada | ✅ OK |
| SystemSettings | updatedAt (updated_at) | ✅ Criada | ✅ OK |

**Conclusão**: Apenas a coluna `brgps_base_url` estava faltando. Todas as outras colunas estão corretas.

## Procedimento de Deploy

### Para Aplicar a Correção em Produção

1. **Reconstruir as imagens Docker**:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env build --no-cache
   ```

2. **Subir os containers**:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env up -d
   ```

3. **Ou usar o script de deploy automático** (recomendado):
   ```bash
   chmod +x deploy_prod.sh
   ./deploy_prod.sh
   ```

### Comportamento Após a Correção

- O container do backend aguardará automaticamente o banco estar disponível
- As migrações serão aplicadas automaticamente antes de iniciar a aplicação
- A aplicação só iniciará após todas as migrações serem aplicadas com sucesso

## Lições Aprendidas

1. **Sempre verificar o conteúdo das migrations**: O nome do arquivo não garante que a migration faz o que propõe
2. **Testar migrations em ambiente limpo**: Antes de deploy, testar `prisma migrate deploy` em um banco vazio
3. **Automatizar migrações no entrypoint**: Isso garante que migrações sejam sempre aplicadas antes da aplicação iniciar
4. **Nunca usar `prisma db push` em produção**: Sempre usar `prisma migrate deploy`

## Comandos Úteis para Diagnóstico

```bash
# Verificar estado das migrações
npx prisma migrate status

# Listar colunas de uma tabela no PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d tagpadrin -c "\d settings"

# Ver logs do banco
docker compose -f docker-compose.prod.yml logs -f postgres

# Ver logs da aplicação
docker compose -f docker-compose.prod.yml logs -f backend
```
