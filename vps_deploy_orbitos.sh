#!/bin/bash

# ==========================================================
# 🚀 SCRIPT DE DEPLOY EXCLUSIVO - ORBITOS (OrbitUp.io)
# ==========================================================

echo "🌌 Iniciando Deploy do OrbitOS..."

# 1. Entrar na pasta do Orbitos na VPS
cd /var/www/orbitos || exit

# 2. Atualizar código do GitHub
echo "📥 Puxando atualizações..."
git pull

# 3. Instalar dependências (Raiz e Sub-projetos)
echo "📦 Instalando dependências..."
npm install
cd core-api && npm install && cd ..
cd bot-engine && npm install && cd ..

# 4. Gerar Build de tudo
echo "🏗️ Gerando builds (API, Bot e Web)..."
npm run build

# 5. Reiniciar via PM2 usando o Ecosystem do Orbitos
# Isso garante que apenas os processos 'orbitos-*' sejam afetados
echo "♻️ Reiniciando processos no PM2..."
pm2 restart ecosystem.config.js --env production

# 6. Salvar estado do PM2 para reboot
pm2 save

echo "✅ DEPLOY DO ORBITOS FINALIZADO COM SUCESSO!"
echo "📍 Web: Porta 3001"
echo "📍 API: Porta 4000"
