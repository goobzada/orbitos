# 🤖 BOT_TICKET_HANDLER_ARCHITECTURE.md
## Arquitetura do Handler de Tickets no Bot Engine

Este documento descreve **como o Bot Engine (Discord.js + TypeScript)** deve lidar com:
- Portais de ticket
- Botões
- Modais
- Criação de tickets
- Mensagens dentro de tickets
- Encerramento e rating

Sempre seguindo o princípio:
> Bot executa • Core API decide.

---

## 1️⃣ Fluxo Geral de Ticket

1. Usuário clica em um botão no painel (TicketPortal).
2. Bot recebe `interactionCreate` (ButtonInteraction).
3. Bot identifica qual botão foi clicado → consulta Core API.
4. Core API responde qual `TicketTemplate` usar.
5. Bot abre Modal com os campos configurados.
6. Usuário envia o Modal.
7. Bot envia payload para Core API criando o ticket.
8. Core API cria ticket, devolve dados (canal, título, staff, etc.).
9. Bot cria canal de ticket no Discord (ou usa canal único/thread, dependendo do modelo).
10. Bot posta mensagem inicial (embed) com infos e ações (fechar, claim, etc.).

Mensagens seguintes:
- Usuário fala → Bot envia para Core API (registrar no histórico).
- Staff fala via painel → Core API manda callback para Bot → Bot posta no canal.

---

## 2️⃣ Handlers Principais

### 2.1 `interactionCreate` (Button)

Responsável por:
- Detectar qual botão foi pressionado.
- Extrair `customId`.
- Enviar para Core API para validar e obter Template:

```ts
// Exemplo de customId:
// ticket_btn:{buttonId}

if (interaction.isButton()) {
  const customId = interaction.customId

  if (customId.startsWith("ticket_btn:")) {
    const buttonId = customId.split(":")[1]

    // Chamar Core API
    // GET /ticket-buttons/{buttonId}/resolve
  }
}
```

Resposta esperada da API:

```json
{
  "templateId": "uuid",
  "modalTitle": "Suporte Geral",
  "fields": [
    {
      "id": "field1",
      "label": "Descreva o problema",
      "type": "LONG_TEXT",
      "placeholder": "Quanto mais detalhes, melhor",
      "required": true
    }
  ]
}
```

Bot monta Modal usando esses campos.

---

### 2.2 `interactionCreate` (ModalSubmit)

Fluxo:

1. `isModalSubmit()`
2. Extrair `customId` (ex: `ticket_modal:{templateId}`)
3. Coletar valores dos campos (`interaction.fields.getTextInputValue(...)`)
4. Enviar payload para Core API:

```json
{
  "serverGuildId": "123",
  "userId": "123456",
  "templateId": "uuid",
  "fields": [
    { "fieldId": "field1", "value": "..." }
  ]
}
```

Endpoint sugerido:
`POST /tickets`

Resposta da Core API:

```json
{
  "ticketId": "uuid",
  "channelStrategy": "CREATE_CHANNEL",
  "channelName": "ticket-1024",
  "categoryId": "1234567890",
  "initialMessage": {
    "content": "",
    "embed": { "...": "..." }
  }
}
```

Bot:
- Cria o canal.
- Define permissões (usuário + staff).
- Envia mensagem inicial.

---

### 2.3 Messages no Ticket (MessageCreate)

Quando alguém fala dentro de um canal de ticket:

- Checar se canal pertence a um ticket (Core API ou cache local).
- Enviar mensagem para Core API:

`POST /tickets/{ticketId}/messages`

Body:

```json
{
  "authorId": "discordUserId",
  "authorType": "USER or STAFF",
  "content": "texto da mensagem",
  "meta": {
    "attachments": [...]
  }
}
```

---

### 2.4 Encerrar Ticket (Button "Fechar")

No embed principal do ticket, terá botões:

- Fechar ticket
- Claim ticket
- Transferir (futuro)

`customId` ex:
- `ticket_close:{ticketId}`
- `ticket_claim:{ticketId}`

Fluxo:
- Bot recebe `interactionCreate` Button.
- Envia para Core API: `POST /tickets/{ticketId}/close`
- API:
  - Verifica permissão.
  - Atualiza status.
  - Decide se canal deve ser deletado, arquivado, renomeado.
- Bot executa conforme resposta e atualiza mensagem (aplica "[FECHADO]" no título, etc.).

---

### 2.5 Rating (Feedback de Ticket)

Após fechamento, o Bot pode:

- Enviar DM ao usuário OU
- Enviar mensagem final no canal antes de deletar:

Com botões:
- ⭐ 1
- ⭐ 2
- ⭐ 3
- ⭐ 4
- ⭐ 5

Cada botão:
`ticket_rate:{ticketId}:{score}`

Bot:
- Envia `POST /tickets/{ticketId}/rating` para Core API.
- Atualiza mensagem com "Obrigado pela avaliação".

---

### 2.6 Logs & Erros

Para cada ação importante do Bot:

- Em caso de erro com API:
  - Logar internamente
  - Opcional: enviar para endpoint `/bot/logs`

Para debugging:
- Utilizar `logger` central (em `utils/logger.ts`).

---

## 3️⃣ Organização dos Handlers (Pasta / Arquitetura)

```text
src/
 ├── events/
 │    ├── interactionCreate.ts
 │    ├── messageCreate.ts
 │    └── ready.ts
 ├── services/
 │    ├── apiClient.ts         # Axios/fetch configurado
 │    ├── ticketService.ts     # Funções helper de ticket
 ├── utils/
 │    ├── logger.ts
 │    ├── embeds.ts
 │    └── permissions.ts
```

- `ticketService.ts` concentra regras de:
  - abrir modal
  - criar ticket via API
  - enviar mensagens
  - fechar, rate, claim

---

## 4️⃣ Segurança & Restrições

- Nunca permitir que o bot execute:
  - Fechar ticket
  - Banir alguém
  - Criar cargo
  - Sem consultar a Core API.
- Validar sempre:
  - GuildId
  - UserId
  - Autorizações definidas pelo painel.

---

## 5️⃣ Performance

- Cache leve em memória:
  - Mapa de `channelId -> ticketId`
  - Mapa de `buttonId -> templateId`
- Mas sempre manter Core API como verdade absoluta.

---

## 6️⃣ Próximos passos

- Implementar `apiClient.ts` com base URL, auth, etc.
- Implementar `interactionCreate` completo.
- Implementar fluxos:
  - Botão → Modal → Ticket
  - Mensagem → Core API
  - Close/Rate → Core API
