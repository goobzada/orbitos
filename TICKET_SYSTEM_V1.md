# 🎫 TICKET_SYSTEM_V1.md
## Sistema de Tickets — Versão 1 (SaaSBot)

---

# 🎯 Visão Geral

O sistema de tickets é modular, multi-servidor e controlado pela Core API.
O Bot Engine apenas executa ações autorizadas.

Objetivo:
Criar o sistema de tickets mais flexível e profissional para Discord + FiveM.

---

# 1️⃣ Ticket Hub (Até 5 Portais - Plano Pro)

Cada servidor pode criar múltiplos Portais de Ticket.

Exemplos:
1. Suporte Geral
2. Pagamentos
3. Denúncias
4. Aplicação Staff
5. Suporte FiveM

Cada Portal possui:

- Nome
- Descrição
- Canal onde será publicado
- Banner personalizado
- Cor do embed
- Tipo de abertura (Botões ou Select Menu)
- Permissões (Quem pode abrir)
- Lista de Botões vinculados a Templates

---

# 2️⃣ Editor de Botões

Para cada botão:

- Label
- Emoji
- Cor (Primary, Success, Danger, Secondary)
- Template vinculado
- Restrição por cargo (opcional)

Tudo salvo na Core API.

---

# 3️⃣ Modal Builder (Templates de Ticket)

Cada tipo de ticket possui um Template configurável.

Campos possíveis:
- Short Text
- Long Text
- Number
- Select
- Checkbox

Cada campo possui:
- Label
- Placeholder
- Obrigatório (true/false)
- Opções (caso select)

---

# 4️⃣ Fluxo de Criação de Ticket

1. Usuário clica no botão.
2. Modal é exibido.
3. Bot envia dados para Core API.
4. Core API valida plano e regras.
5. Bot cria canal de ticket.
6. Ticket é registrado no banco.

---

# 5️⃣ Funcionalidades Avançadas

✔ Rating de atendimento (1–5 estrelas)
✔ Macros para staff
✔ Transcrição automática
✔ SLA configurável
✔ Logs completos
✔ Permissões por plano
✔ Integração FiveM (Whitelist, VIP, etc.)
✔ Multi-linguagem

---

# 6️⃣ Planos

🟢 Plano A (Básico)
- 2 Portais
- 3 Templates
- Logs simples

🟡 Plano B (Pro)
- 5 Portais
- 10 Templates
- Rating
- Macros
- Métricas Staff
- Integração FiveM

🔴 Plano C (Enterprise)
- Portais ilimitados
- Templates ilimitados
- Workflow Automation
- AI Assistente
- SLA Avançado
- API pública
- Webhooks

---

# 7️⃣ Arquitetura

Bot = Execução  
Core API = Regras, Banco, Planos, Permissões  
Dashboard = Configuração visual  

---

# 🚀 Próximo Passo

Implementar:

1. Ticket Hub UI
2. Modal Builder
3. Bot Handler de interação
4. Integração com Core API
