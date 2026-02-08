# Tag-Padrin

Sistema de integração entre BRGPS e Traccar para gerenciamento de tags/dispositivos GPS.

## 📋 Visão Geral

Aplicação full-stack que consome a API da BRGPS, converte dados para formato compatível com OSMAnd/Traccar e envia automaticamente para o servidor Traccar.

## 🏗️ Stack Tecnológica

- **Backend**: NestJS + TypeScript + Prisma ORM
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Database**: PostgreSQL
- **Autenticação**: JWT + Passport
- **Scheduler**: node-cron

## 🚀 Instalação Rápida

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- npm ou yarn

### Usando Docker (Recomendado)

```bash
# Configure as variáveis de ambiente
# Edite o arquivo .env com suas configurações

# Inicie todos os serviços
docker-compose up -d

# Acesse a aplicação
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
```

## 📁 Estrutura do Projeto

```
tag-padrin/
├── backend/           # API NestJS
├── frontend/          # Aplicação React
├── docker-compose.yml
└── .env
```
