# 🚀 Iniciar Tag-Padrin

## Sistema está rodando!

### Acessos

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **Banco de Dados:** localhost:5433 (PostgreSQL)

### Credenciais

- **Email:** admin@tagpadrin.com
- **Senha:** admin123

## Comandos Docker

```bash
cd /home/jorgenunes/projetos/tag-padrin/tag-padrin

# Ver status
docker compose ps

# Ver logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Reiniciar
docker compose restart

# Parar
docker compose down

# Parar e remover volumes (cuidado!)
docker compose down -v
```

## Configuração

Edite o arquivo `.env` para configurar:
- Token da API BRGPS
- URL do servidor Traccar
- Token do Traccar

## Primeiros Passos

1. Acesse http://localhost:3001
2. Faça login com admin@tagpadrin.com / admin123
3. Cadastre suas tags na tela "Tags"
4. Configure as credenciais BRGPS e Traccar em "Configurações"
5. O sistema sincronizará automaticamente a cada minuto
