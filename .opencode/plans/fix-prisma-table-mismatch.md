# Plano de Correção: Erro Prisma - Tabela system_settings não existe

## Resumo do Problema

O erro ocorre porque há uma inconsistência entre o schema.prisma e a migração SQL:
- O schema.prisma espera uma tabela chamada `system_settings` (linha 109)
- A migração SQL criou uma tabela chamada `settings` (migration.sql:90)

## Solução Escolhida: Opção 1

Corrigir o schema.prisma para mapear o model `SystemSettings` para a tabela existente `settings`, sem perder dados.

---

## Passos de Execução

### 1. Editar o arquivo schema.prisma

**Arquivo:** `backend/prisma/schema.prisma`
**Linha:** 109

**Alteração:**
```diff
- @@map("system_settings")
+ @@map("settings")
```

**Comando para executar:**
```bash
cd /home/jorgenunes/projetos/tag-padrin/backend/prisma
sed -i 's/@@map("system_settings")/@@map("settings")/g' schema.prisma
```

### 2. Verificar a alteração

```bash
grep -n "@@map" schema.prisma
```

Deve mostrar:
```
24:  @@map("users")
47:  @@map("tags")
66:  @@map("positions")
81:  @@map("sync_logs")
96:  @@map("traccar_logs")
109: @@map("settings")
```

### 3. Regenerar o cliente Prisma

```bash
cd /home/jorgenunes/projetos/tag-padrin/backend
npx prisma generate
```

### 4. Reiniciar o container do backend

```bash
cd /home/jorgenunes/projetos/tag-padrin
docker-compose restart backend
```

Ou, se preferir recriar o container:
```bash
cd /home/jorgenunes/projetos/tag-padrin
docker-compose up -d --force-recreate backend
```

### 5. Verificar os logs

```bash
docker-compose logs -f backend
```

O erro `The table 'public.system_settings' does not exist` deve desaparecer.

---

## Validação

Após executar os passos acima:
1. O backend deve iniciar sem o erro de tabela inexistente
2. A aplicação deve conseguir acessar as configurações do sistema
3. Nenhum dado será perdido

---

## Alternativa (se necessário)

Se por algum motivo a alteração não funcionar, você pode recriar as migrações do zero (⚠️ **isso apagará todos os dados**):

```bash
cd /home/jorgenunes/projetos/tag-padrin/backend
npx prisma migrate reset --force
```

**Atenção:** Este comando recria todo o banco de dados do zero!
