# 🚀 OrbitOS — Guia de Inicialização do Sistema

> Siga os passos **na ordem correta** para evitar erros de conexão entre os serviços.

---

## 📋 Pré-requisitos

| Dependência | Versão mínima | Verificar |
|---|---|---|
| Node.js | 18+ | `node -v` |
| PostgreSQL (Docker) | qualquer | `docker ps` |
| XAMPP / Apache | qualquer | para servir frontend em dev |

---

## ⚙️ Passo 1 — Banco de Dados (Docker)

Certifique-se que o container do PostgreSQL está rodando:

```powershell
docker ps
```

Se **não** aparecer `orbitos-db`, inicie com:

```powershell
docker start orbitos-db
```

Ou crie do zero (primeira vez):

```powershell
docker run --name orbitos-db `
  -e POSTGRES_USER=orbitos `
  -e POSTGRES_PASSWORD=orbitos_dev `
  -e POSTGRES_DB=orbitos_core `
  -p 5432:5432 -d postgres:16
```

---

## ⚙️ Passo 2 — Core API (Porta 4000)

Abra um terminal e execute:

```powershell
cd C:\xampp\htdocs\saasbot\core-api
npm run dev
```

✅ Sucesso quando aparecer:
```
[CORE API] 🚀 Servidor rodando na porta 4000
[WS SERVER] ✅ WebSocket Server inicializado
```

> **Se for a primeira vez:**
> ```powershell
> cd C:\xampp\htdocs\saasbot\core-api
> npm install
> npx prisma db push
> node seed-init.js
> npm run dev
> ```

---

## ⚙️ Passo 3 — Bot Engine (Discord)

Abra **outro terminal** e execute:

```powershell
cd C:\xampp\htdocs\saasbot\bot-engine
npm run dev
```

✅ Sucesso quando aparecer:
```
[INFO] Conectando ao Discord...
[INFO] [AUTO-SYNC] Guild ... sincronizada.
[INFO] 💓 Heartbeat: X guilds
```

> **Se for a primeira vez:**
> ```powershell
> cd C:\xampp\htdocs\saasbot\bot-engine
> npm install
> npm run dev
> ```

---

## ⚙️ Passo 4 — Dashboard (Frontend Next.js — Porta 3001)

Abra **outro terminal** e execute:

```powershell
cd C:\xampp\htdocs\saasbot
npm run dev
```

✅ Sucesso quando aparecer:
```
▲ Next.js 16.x
- Local: http://localhost:3001
```

Acesse no browser: **http://localhost:3001**

> **Se for a primeira vez:**
> ```powershell
> cd C:\xampp\htdocs\saasbot
> npm install
> npm run dev
> ```

---

## ⚙️ Passo 5 — Orbit Agent (opcional)

Se precisar do agente de automação:

```powershell
cd C:\xampp\htdocs\saasbot\orbit-agent
npm run dev
```

---

## 🔢 Ordem de Start (Resumo Rápido)

```
1. docker start orbitos-db          ← Banco de dados
2. core-api:   npm run dev          ← API (porta 4000)
3. bot-engine: npm run dev          ← Bot Discord
4. saasbot:    npm run dev          ← Dashboard (porta 3001)
```

> ⚠️ **Sempre inicie a `core-api` ANTES do `bot-engine`.**
> O bot tenta conectar via WebSocket à API no startup.

---

## 🛑 Como Parar

Em cada terminal pressione `Ctrl + C`.

Para parar o banco:
```powershell
docker stop orbitos-db
```

---

## 🐛 Troubleshooting

### ❌ "A API do OrbitOS está offline"
→ A `core-api` não está rodando. Execute o **Passo 2**.

### ❌ `/painel` retorna "Erro ao buscar módulos"
→ Verifique se a `core-api` está no ar.
→ Verifique se o servidor Discord está **vinculado** no dashboard em **Servidores**.

### ❌ "/painel Nenhuma automação está ativa"
→ Acesse o dashboard → **Bots & Automação** → ative pelo menos 1 módulo para o servidor.

### ❌ Bot não conecta
→ Verifique o `DISCORD_TOKEN` no arquivo `bot-engine/.env`.

### ❌ Erro de banco de dados (Prisma)
```powershell
cd core-api
npx prisma db push
```

### ❌ Frontend não carrega / erro de build
```powershell
cd C:\xampp\htdocs\saasbot
npm install
npm run dev
```

---

## 📁 Estrutura dos Serviços

```
saasbot/
├── src/              ← Dashboard Next.js (porta 3001)
├── core-api/         ← API REST + WebSocket (porta 4000)
├── bot-engine/       ← Bot Discord
├── orbit-agent/      ← Agente de Automação (opcional)
└── STARTUP.md        ← Este arquivo
```

---

## 🔑 Variáveis de Ambiente Importantes

### `core-api/.env`
| Variável | Valor padrão |
|---|---|
| `PORT` | `4000` |
| `DATABASE_URL` | `postgresql://orbitos:orbitos_dev@localhost:5432/orbitos_core` |
| `JWT_SECRET` | `super-secret-jwt-key-...` |
| `INTERNAL_SERVICE_KEY` | `saasbot-internal-secret-v2-...` |
| `BOT_INTERNAL_TOKEN` | `bot-ws-token-v2-...` |
| `DISCORD_CLIENT_ID` | ID do app no Discord |
| `DISCORD_CLIENT_SECRET` | Secret do app no Discord |
| `DISCORD_REDIRECT_URI` | `http://localhost:3001/login/callback` |

### `bot-engine/.env`
| Variável | Valor padrão |
|---|---|
| `DISCORD_TOKEN` | Token do bot no Discord |
| `DISCORD_CLIENT_ID` | ID do app no Discord |
| `CORE_API_URL` | `http://localhost:4000` |
| `INTERNAL_SERVICE_KEY` | Deve ser **igual** ao da `core-api` |
| `BOT_INTERNAL_TOKEN` | Deve ser **igual** ao da `core-api` |
