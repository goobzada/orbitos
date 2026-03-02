# 🗄️ TICKET_SYSTEM_DATABASE_SCHEMA.md
## Banco de Dados — Sistema de Tickets (Core API + Bot Engine)

Este arquivo define o **schema de banco (Prisma + PostgreSQL)** para suportar o sistema de tickets descrito em `TICKET_SYSTEM_V1.md`, integrado ao Core SaaS (Organization, Server, Staff, etc.).

A ideia é:

- Reaproveitar os modelos já existentes:
  - Organization
  - Server
  - Staff
- Adicionar entidades específicas de tickets:
  - Portais, Botões, Templates, Campos, Tickets, Mensagens, Rating, Macros, SLA

---

## 🔗 Contexto — Modelos já existentes (referência)

> Estes já foram definidos no Core API (não repita, apenas use como referência de relacionamento):

```prisma
model Organization {
  id        String    @id @default(uuid())
  name      String
  ownerId   String
  plan      Plan       @default(FREE)
  status    OrgStatus  @default(ACTIVE)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  servers   Server[]
}

model Server {
  id             String         @id @default(uuid())
  organizationId String
  organization   Organization   @relation(fields: [organizationId], references: [id])

  guildId        String         @unique
  name           String
  isActive       Boolean        @default(true)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  config         ServerConfig?
  staff          Staff[]
  ticketPortals  TicketPortal[]
  tickets        Ticket[]
}

model Staff {
  id        String    @id @default(uuid())
  serverId  String
  server    Server    @relation(fields: [serverId], references: [id])

  userId    String
  role      StaffRole
  createdAt DateTime  @default(now())

  ticketsAssigned Ticket[] @relation("TicketAssignedToStaff")
}
```

---

## 🧱 Novos Enums

```prisma
enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
  CANCELED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum TicketFieldType {
  SHORT_TEXT
  LONG_TEXT
  NUMBER
  SELECT
  CHECKBOX
}

enum TicketButtonStyle {
  PRIMARY
  SECONDARY
  SUCCESS
  DANGER
}

enum TicketAuthorType {
  USER
  STAFF
  BOT
  SYSTEM
}
```

---

## 🧩 TicketPortal — Portais de Ticket

Cada servidor pode ter vários **portais** (quadro com botões/select para abrir tickets).

```prisma
model TicketPortal {
  id          String   @id @default(uuid())
  serverId    String
  server      Server   @relation(fields: [serverId], references: [id])

  name        String
  description String?

  channelId   String?  // Canal onde o painel/portal é publicado
  messageId   String?  // Mensagem do painel (para atualizações futuras)

  bannerUrl   String?  // Imagem opcional do portal
  embedColor  String?  // Cor do embed em hex (#2563EB)

  isActive    Boolean  @default(true)
  order       Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  buttons     TicketButton[]
}
```

---

## 🔘 TicketButton — Botões do Portal

Botões que aparecem no painel e que abrem tipos específicos de ticket.

```prisma
model TicketButton {
  id          String          @id @default(uuid())
  portalId    String
  portal      TicketPortal    @relation(fields: [portalId], references: [id])

  label       String          // Texto no botão
  emoji       String?         // Emoji opcional
  style       TicketButtonStyle @default(PRIMARY)

  templateId  String
  template    TicketTemplate  @relation(fields: [templateId], references: [id])

  requiredRoleId String?      // ID do cargo no Discord (opcional)

  isActive    Boolean         @default(true)
  order       Int             @default(0)

  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}
```

---

## 🧾 TicketTemplate — Modelo de Ticket / Modal

Define o layout do formulário/modal para cada tipo de ticket.

```prisma
model TicketTemplate {
  id          String          @id @default(uuid())
  serverId    String
  server      Server          @relation(fields: [serverId], references: [id])

  name        String          // Nome visível (Ex: "Suporte Geral")
  key         String          // Identificador interno (ex: "general_support")
  title       String          // Título do modal
  description String?         // Descrição interna

  isActive    Boolean         @default(true)

  language    String?         // Ex: "pt-BR", "en-US" (para multi-lingua futura)

  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  fields      TicketField[]
  tickets     Ticket[]
}
```

---

## 🧱 TicketField — Campos do Modal

Define os campos individuais de cada template.

```prisma
model TicketField {
  id          String          @id @default(uuid())
  templateId  String
  template    TicketTemplate  @relation(fields: [templateId], references: [id])

  label       String
  type        TicketFieldType
  placeholder String?
  required    Boolean         @default(true)
  order       Int             @default(0)

  // Para SELECT/Checkbox com múltiplas opções
  options     TicketFieldOption[]
}
```

---

## ✅ TicketFieldOption — Opções de SELECT/CHECKBOX

```prisma
model TicketFieldOption {
  id        String       @id @default(uuid())
  fieldId   String
  field     TicketField  @relation(fields: [fieldId], references: [id])

  label     String
  value     String
  order     Int          @default(0)
}
```

---

## 🎟 Ticket — O próprio chamado

Instância de um ticket criado por usuário.

```prisma
model Ticket {
  id              String          @id @default(uuid())
  serverId        String
  server          Server          @relation(fields: [serverId], references: [id])

  templateId      String
  template        TicketTemplate  @relation(fields: [templateId], references: [id])

  portalId        String?
  portal          TicketPortal?   @relation(fields: [portalId], references: [id])

  userId          String          // ID do usuário (Discord)
  channelId       String?         // Canal do Discord usado para esse ticket

  status          TicketStatus    @default(OPEN)
  priority        TicketPriority  @default(MEDIUM)

  subject         String?         // Opcional, pode ser derivado do template/campo
  category        String?         // Campo livre ou preenchido via template

  assignedStaffId String?         // Staff responsável (se atribuído)
  assignedStaff   Staff?          @relation("TicketAssignedToStaff", fields: [assignedStaffId], references: [id])

  language        String?         // Idioma usado no ticket (pt-BR, en-US, etc.)

  // SLA e métricas
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  firstResponseAt DateTime?
  closedAt        DateTime?
  slaBreached     Boolean         @default(false)

  // Campos extras dinâmicos (payload serializado do modal)
  formData        Json?

  // Transcrição / anexos (opcional)
  transcriptUrl   String?

  messages        TicketMessage[]
  rating          TicketRating?
}
```

---

## 💬 TicketMessage — Mensagens dentro do Ticket

Cada interação dentro do ticket (usuário, staff, bot).

```prisma
model TicketMessage {
  id          String           @id @default(uuid())
  ticketId    String
  ticket      Ticket           @relation(fields: [ticketId], references: [id])

  authorId    String           // ID do autor (Discord ou sistema)
  authorType  TicketAuthorType

  content     String           // Texto da mensagem
  meta        Json?            // Extras: anexos, embeds, etc.

  createdAt   DateTime         @default(now())
}
```

---

## ⭐ TicketRating — Avaliação do Atendimento

Um ticket pode ter uma avaliação de 1–5 estrelas.

```prisma
model TicketRating {
  id          String   @id @default(uuid())
  ticketId    String   @unique
  ticket      Ticket   @relation(fields: [ticketId], references: [id])

  userId      String   // Usuário que avaliou (Discord ID)
  score       Int      // 1..5
  comment     String?

  createdAt   DateTime @default(now())
}
```

---

## 📚 TicketMacro — Macros de Resposta

Respostas rápidas para staff.

```prisma
model TicketMacro {
  id          String    @id @default(uuid())
  serverId    String
  server      Server    @relation(fields: [serverId], references: [id])

  name        String
  category    String?
  content     String    // Texto da macro (pode ter placeholders)

  isActive    Boolean   @default(true)

  createdByStaffId String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

---

## ⏱ TicketSlaPolicy — SLA por Server/Template (Enterprise)

Opcional, usado para planos mais altos.

```prisma
model TicketSlaPolicy {
  id              String          @id @default(uuid())
  serverId        String
  server          Server          @relation(fields: [serverId], references: [id])

  name            String
  description     String?

  templateId      String?         // SLA aplicado a um template específico (opcional)
  template        TicketTemplate? @relation(fields: [templateId], references: [id])

  responseMinutes Int?            // Tempo máximo para primeira resposta
  resolveMinutes  Int?            // Tempo máximo para fechamento

  priority        TicketPriority? // Opcional: SLA só para prioridade específica

  isDefault       Boolean         @default(false)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

---

## 🧠 Observações de Arquitetura

- **Plano A/B/C** não precisa de tabela específica:  
  - A limitação de portais/templates/funcionalidades pode ser aplicada via lógica de negócio usando `Organization.plan`.
- Campos como `formData` e `meta` usam `Json` para permitir flexibilidade máxima nos templates.
- A maioria das regras (quem pode criar ticket, quantos portais, etc.) é responsabilidade da **Core API**, não do banco.
- O Bot Engine sempre:
  - Envia dados crus → Core API
  - Recebe instruções → Executa no Discord

---

## ✅ Próximos Passos Técnicos

1. Adicionar esses modelos ao `schema.prisma` da Core API.
2. Rodar:
   - `npx prisma generate`
   - `npx prisma migrate dev --name add_ticket_system`
3. Implementar:
   - Endpoints REST/GraphQL para:
     - Gerenciar Portais, Templates, Campos, Tickets, Mensagens, Rating, Macros, SLA.
4. Conectar Bot Engine:
   - `/tickets/open`
   - `/tickets/message`
   - `/tickets/close`
   - `/tickets/rate`
