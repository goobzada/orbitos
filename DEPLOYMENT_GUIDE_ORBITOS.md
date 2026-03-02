# OrbitOS — Guia Oficial de Modo Dev e Produção (Deploy & Updates)

> Este documento define **como rodar, deployar e atualizar** o OrbitOS  
> em **modo desenvolvimento** e **modo produção**, com fluxo padrão via GitHub.

---

## 0. Visão Geral

- Repositório: `orbitos` (exemplo)
- Stack base: Node.js + TypeScript + Discord Bot + Dashboard Web + Worker
- Ambientes:
  - **DEV**: sem PM2, terminal / tmux, foco em desenvolvimento.
  - **PROD**: com PM2, usando JS compilado, auto-restart e auto-boot.

Caminhos padrão de projeto:

```txt
/core-api   → Core API (REST/WS)
/src        → Dashboard (frontend Next.js)
/bot-engine → Bot do Discord
/docs       → Documentação (.md)
.env.example
package.json
tsconfig.json
```

Qualquer rascunho, anotação, plano etc. vai pra `/docs` (ou diretório raiz equivalente).
Código que roda em produção é só código gerado em `/dist` ou `/build` + configs.

## 1. Padrão de Scripts no package.json (RAIZ)

Objetivo: todo mundo usar os mesmos comandos, sem adivinhar nada.

Na raiz do projeto (`package.json`):

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\" \"npm run dev:bot\"",
    "dev:api": "cd core-api && npm run dev",
    "dev:web": "npm run dev",
    "dev:bot": "cd bot-engine && npm run dev",

    "build": "npm run build:api && npm run build:web && npm run build:bot",
    "build:api": "cd core-api && npm run build",
    "build:web": "npm run build",
    "build:bot": "cd bot-engine && npm run build",

    "start:api": "cd core-api && node dist/server.js",
    "start:web": "npm run start",
    "start:bot": "cd bot-engine && node dist/index.js"
  }
}
```

Cada app (`core-api`, `bot-engine`, etc.) precisa ter:

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## 2. Configuração de TypeScript (TS → JS)

Em cada app TS (`core-api`/`bot-engine`), garantir um `tsconfig.json` com:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Regra de ouro:

*   **Em DEV:** roda `src` com `ts-node-dev`.
*   **Em PROD:** roda somente `dist` com `node`.

## 3. Modo DEV (Local ou VPS, sem PM2)

### 3.1. Pré-requisitos
*   Node.js LTS (18 ou 20)
*   npm ou pnpm/yarn
*   (Opcional) tmux na VPS para não perder sessões.

### 3.2. Setup inicial
Na máquina ou VPS (em diretório de trabalho):

```bash
git clone SEU_REPO_GIT.git orbitos
cd orbitos

cp .env.example .env.local   # ou .env local
# editar .env.local com credenciais de DEV (sandbox, guild de teste etc.)

npm install
cd core-api && npm install && cd ..
cd bot-engine && npm install && cd ..
```

### 3.3. Subir tudo em modo Dev
Rodar na raiz:

```bash
npm run dev
```

Ou separado:

```bash
npm run dev:api
npm run dev:web
npm run dev:bot
```

*   Logs mais verbosos
*   Tokens / chaves de sandbox
*   Focado em testes e ajustes.

### 3.4. Modo Dev na VPS usando tmux (opcional)
```bash
sudo apt install -y tmux

cd /var/www/orbitos
tmux new -s orbitos-dev
```

Dentro do tmux:

```bash
npm run dev:api
# (novo pane) npm run dev:bot
# (novo pane) npm run dev:web
```

*   **Detach** (deixar rodando em background): `Ctrl + B`, depois `D`
*   **Attach** de volta: `tmux attach -t orbitos-dev`

Modo Dev é isso: liberdade, flexível, se cair você sobe na mão, sem PM2.

## 4. Modo PRODUÇÃO (VPS + PM2)

### 4.1. Pré-requisitos na VPS
Sistema recomendado: Ubuntu 22.04+

Na VPS:

```bash
sudo apt update
sudo apt upgrade -y

sudo apt install -y git build-essential

# Node.js 20 (exemplo)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2
```

### 4.2. Clonar projeto e configurar ambiente
```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www

git clone SEU_REPO_GIT.git orbitos
cd orbitos
```

Criar `.env` de produção e também configurar os `.env` de cada serviço:

```bash
cp .env.example .env.production
nano .env.production

# E nos subprojetos:
cp core-api/.env.example core-api/.env
cp bot-engine/.env.example bot-engine/.env
```

Configurar:

```env
NODE_ENV=production

DATABASE_URL=postgres://usuario:senha@localhost:5432/orbitos

DISCORD_BOT_TOKEN=TOKEN_REAL
DISCORD_CLIENT_ID=...
DISCORD_GUILD_ID_PROD=...

STRIPE_SECRET_KEY=...
PIX_ENVIRONMENT=production

API_URL=https://api.seudominio.com
WEB_URL=https://app.seudominio.com
```

### 4.3. Instalar dependências e build
```bash
cd /var/www/orbitos

npm install
cd core-api && npm install && cd ..
cd bot-engine && npm install && cd ..

npm run build
```

> **Nota:** Se `npm run build` falhar, o problema é de código/TS, não da VPS.

## 5. Configuração PM2 (Produção)

Criar `ecosystem.config.js` na raiz do projeto:

```javascript
module.exports = {
  apps: [
    {
      name: "orbitos-api",
      cwd: "./core-api",
      script: "dist/server.js",
      interpreter: "node",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "orbitos-bot",
      cwd: "./bot-engine",
      script: "dist/index.js",
      interpreter: "node",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "orbitos-web",
      cwd: "./",
      script: "npm",
      args: "run start",
      interpreter: "node",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
```

### 5.1. Subir serviços com PM2
Na raiz:

```bash
cd /var/www/orbitos

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

O `pm2 startup` vai mostrar um comando — copiar e colar para registrar no sistema.

### 5.2. Comandos úteis do PM2
```bash
pm2 ls                    # lista processos
pm2 status                # status detalhado
pm2 logs orbitos-api      # logs da API
pm2 logs orbitos-bot      # logs do bot
pm2 restart orbitos-api   # restart só da API
pm2 restart all           # restart tudo
pm2 stop all              # para tudo
pm2 delete all            # remove todos do PM2
```

Em produção, se API/BOT cair, o PM2 sobe de novo automaticamente.
Se a VPS reiniciar, o `pm2 startup` + `pm2 save` garantem que tudo volte.

## 6. Fluxo de Primeiro Deploy (Resumo)

1.  Criar VPS (Ubuntu 22.04+).
2.  Instalar Node, git, PM2.
3.  Clonar projeto:
    ```bash
    cd /var/www
    git clone SEU_REPO_GIT.git orbitos
    cd orbitos
    ```
4.  Configurar `.env` de produção.
5.  Instalar dependências:
    ```bash
    npm install
    # (E nos subdiretórios se necessário dependendo do workspace setup)
    ```
6.  Build:
    ```bash
    npm run build
    ```
7.  Criar `ecosystem.config.js`.
8.  Subir com PM2:
    ```bash
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    ```

## 7. Fluxo de Update (Sincronização GitHub → VPS)

Sempre que tiver update no GitHub:

1.  Acessar VPS:
    ```bash
    ssh usuario@SEU_IP
    cd /var/www/orbitos
    ```
2.  Puxar alterações:
    ```bash
    git pull
    ```
3.  Se `package.json` mudou (novas deps), rodar:
    ```bash
    npm install
    ```
4.  Rebuild:
    ```bash
    npm run build
    ```
5.  Restart nos serviços:
    ```bash
    pm2 restart orbitos-api orbitos-bot orbitos-web
    # ou simplesmente:
    pm2 restart all
    ```

**Regra:** qualquer mudança de código → `git pull` → `npm run build` → `pm2 restart`.

## 8. .gitignore e Limpeza de Projeto

Garantir que `.gitignore` contenha:

```text
node_modules
dist
.next
.env
.env.*
logs
*.log
tmp
.DS_Store
```

*   Não versionar `node_modules`.
*   Não versionar `.env`.
*   Pastas antigas (`/old`, `/backup`, `/trash`) devem ser movidas para `/docs/archive` ou removidas.
*   Scripts quebrados e arquivos não usados → remover para não confundir na hora do deploy.

## 9. Modo Dev x Produção — Resumo Mental

**Dev**
*   `npm run dev` ou `dev:*`
*   Pode rodar local ou VPS com tmux
*   Usa `.env.local` / `.env.dev`, guild de teste, sandbox

**Produção**
*   `npm run build` → gera `dist` / `.next`
*   PM2 rodando:
    *   `pm2 start ecosystem.config.js`
*   `.env` com credenciais reais
*   Atualização = `git pull` + `npm run build` + `pm2 restart`

## 10. Checklist para o Dev (Antigravidade)

Antes de considerar “pronto para deploy”, o dev responsável deve validar:

- [ ] `npm install` funciona sem erros
- [ ] `npm run build` compila tudo sem erro
- [ ] `npm run start:api` roda a API em `dist`
- [ ] `npm run start:bot` roda o bot em `dist`
- [ ] `npm run start:web` sobe o dashboard em modo produção
- [ ] `ecosystem.config.js` está criado e testado com `pm2 start`
- [ ] `.env.example` está atualizado com todas as variáveis necessárias

Se esse checklist estiver ✅, o deploy na VPS segue sem dor de cabeça.
