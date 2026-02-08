#!/bin/bash

echo "=== Setup GitHub Repository ==="
echo ""

# Verificar se gh está instalado
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI não encontrado. Instalando..."
    echo "Execute: sudo dnf install gh -y"
    echo ""
    read -p "Pressione ENTER após instalar o gh..."
fi

# Verificar autenticação
echo "Verificando autenticação no GitHub..."
if ! gh auth status &> /dev/null; then
    echo "Você precisa fazer login no GitHub CLI"
    gh auth login
fi

# Criar repositório remoto
echo ""
echo "Criando repositório remoto 'tag-padrin'..."
gh repo create tag-padrin \
    --public \
    --source=. \
    --remote=origin \
    --description="BRGPS Tag Management System - Integração com API BRGPS e Traccar" \
    --push

echo ""
echo "✅ Repositório criado e código enviado com sucesso!"
echo "🔗 Acesse: https://github.com/$(gh api user -q .login)/tag-padrin"
