# 🤖 BOT ENGINE — MASTER PLAN (ESCOPO COMPLETO)
## Motor do Discord do SaaSBot

O Bot Engine é um microserviço independente. Toda regra de negócio, banco de dados e decisões ficam na **Core API**. O bot é apenas "os braços" do SaaS dentro dos servidores dos clientes.

---

## STACK
- **Runtime:** Node.js + TypeScript
- **Biblioteca:** Discord.js v14
- **Comunicação:** Axios → Core API
- **Auth:** Internal Service Key (x-internal-service-key)

---

## PRIORIDADES DE IMPLEMENTAÇÃO

### 🟢 P1 — IMPLEMENTAR AGORA
- [x] `/setup` — Onboarding inicial
- [x] GuildCreate → notifica Core API
- [x] Sistema de Tickets (abrir, fechar, canal privado)
- [ ] `/sync` — Re-sincroniza configs do servidor
- [ ] `/ping` — Latência + status da API
- [ ] `/help` — Lista de comandos dinâmica
- [ ] Comandos de Moderação: `/warn`, `/mute`, `/ban`, `/kick`
- [ ] GuildDelete → marca servidor como desconectado
- [ ] Logs de auditoria (embed em canal configurado)

### 🟡 P2 — PRÓXIMO SPRINT
- [ ] Tickets com categorias (Support/Billing/Staff/Report)
- [ ] Mensagens Staff → Usuário via Webhook da Core API
- [ ] Mensagens Usuário → posta na timeline do ticket via API
- [ ] Auto-role na entrada de membros
- [ ] Heartbeat periódico para Core API

### 🔵 P3 — FUTURO
- [ ] Integração FiveM: `/whitelist add/remove/check`
- [ ] Link de contas: `/link fivem`
- [ ] Notificações de status do servidor FiveM
- [ ] Broadcasts globais do painel
- [ ] Notificações de billing (plano expirando)
- [ ] Sharding e telemetria avançada

---

## 5.1 Onboarding & Setup
- `/setup` — Envia dados do servidor para Core API, recebe configs iniciais, exibe embed de boas-vindas.
- `/sync` — Re-sincroniza configs após mudanças no painel (canais, cargos, permissões).
- `GuildCreate` — Notifica Core API, aguarda validação de plano.
- `GuildDelete` — Notifica Core API, marca servidor como offline.

## 5.2 Tickets & Suporte
- Categorias de ticket configuradas via painel (Support, Billing, Report, FiveM, etc.)
- Criação de canal SOMENTE após API aprovar o ticket.
- Fechar ticket: registra motivo + staff na Core API → bot arquiva/deleta canal.
- Staff responde pelo Dashboard → Core API envia evento → bot posta no canal do ticket.
- Mensagem do usuário → bot envia para Core API anexar ao histórico do ticket.

## 5.3 Moderação & Staff
- `/ban`, `/kick`, `/mute`, `/warn`, `/unban`, `/clear`
- Toda ação é validada pela Core API antes de ser executada.
- Core API registra histórico completo (staffId, userId, motivo, duração).
- Sincronização de cargos: painel define quem pode usar cada comando.

## 5.4 Automação & Workflows
- Auto-role: bot chama API ao membro entrar, aplica cargos conforme regras.
- Auto-respostas: palavras-chave configuradas no painel → API responde o que fazer.
- Core API pode comandar o bot: mover ticket, renomear canal, mudar permissões.

## 5.5 Integração FiveM
- `/whitelist add/remove/check` — bot envia Discord↔Steam para API validar.
- `/link fivem` — token gerado pela API para vincular playerId ↔ discordId.
- Notificações de status (`server_online`, `server_offline`, `queue_size`, etc.)

## 5.6 Logs & Auditoria
- Entradas/saídas de membros.
- Ações de staff (ban, kick, mute, warn, fechamento de ticket).
- Canal de log configurado via painel → bot posta embeds de forma automática.

## 5.7 Comandos de Utilidade
- `/help` — Lista dinâmica de comandos enviada pela Core API.
- `/ping` — Latência do bot + status da API (OK / lento / down).
- `/status` — Indicadores que a Core API mandar (fila, players online, uptime).

## 5.8 Notificações & Broadcasts
- Admin dispara comunicado via painel → Core API avisa o bot → bot publica nos servidores.
- Billing: plano expirando ou pagamento falho → bot notifica canal admin ou DM do dono.

## 5.9 Multi-Organização
- Cada Guild é ligada a uma Organização (tenant) na Core API.
- Bot NUNCA guarda estado crítico localmente; sempre consulta a API.

## 5.10 Segurança
1. Verificar permissão do usuário (API valida).
2. Verificar se servidor está ativo no plano.
3. Verificar se a feature está habilitada para o plano.

## 5.11 Observabilidade
- Heartbeats periódicos → Core API (shard status, qtd guilds, uptime, erros).
- Logs de erro graves → endpoint de telemetria da API.
