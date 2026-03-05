# 🚀 Guia de Deploy VPS — OrbitOS

Como você já fez o `git push`, agora vamos configurar a sua VPS para rodar o sistema em produção.

## 1. Preparação da VPS (Ubuntu 22.04+)

Execute estes comandos na sua VPS para instalar o básico:

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Docker (para o Banco de Dados)
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker

# Instalar PM2 globalmente
sudo npm install -g pm2
```

## 2. Download e Configuração

```bash
# Vá para a pasta onde deseja salvar o projeto
cd /var/www
git clone https://github.com/goobzada/orbitos.git
cd orbitos

# Instalar dependências da raiz
npm install

# Instalar dependências da API e Bot
cd core-api && npm install && cd ..
cd bot-engine && npm install && cd ..
```

## 3. Configuração de Ambiente (.env)

Você precisa criar os arquivos `.env` com os dados reais:

**Raiz (Frontend):** `nano .env.local`
**API:** `nano core-api/.env`
**Bot:** `nano bot-engine/.env`

> [!IMPORTANT]
> Use os arquivos `.env.example` de cada pasta como base. Certifique-se de que o `DATABASE_URL` na API aponte para o container que vamos subir.

## 4. Subir o Banco de Dados (Docker)

```bash
docker-compose up -d
```

## 5. Sincronizar o Prisma (Banco de Dados)

```bash
cd core-api
npx prisma generate
npx prisma db push
cd ..
```

## 6. Build e Start (PM2)

Agora vamos compilar tudo e colocar para rodar:

```bash
# Compilar todos os módulos (API, Web, Bot)
npm run build

# Iniciar com PM2 usando o arquivo de configuração que eu criei
pm2 start ecosystem.config.js

# Garantir que o PM2 inicie com a VPS
pm2 save
pm2 startup
```

---

## 🛠️ Comandos Úteis na VPS

- **Ver Logs:** `pm2 logs`
- **Ver Status:** `pm2 status`
- **Reiniciar tudo:** `pm2 restart all`
- **Atualizar código:**
  ```bash
  git pull
  npm run build
  pm2 restart all
  ```
