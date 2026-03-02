RELATÓRIO TÉCNICO COMPLETO – ESTADO ATUAL DO PROJETO

Preciso de um relatório técnico completo contendo:

1. Estrutura de Pastas

Estrutura completa do Core API

Estrutura completa do Bot Engine

Estrutura completa do Dashboard (Next.js)

Separação de módulos

2. Schema Prisma Atual

Todos os models

Relacionamentos

Índices

Campos JSON

Enum existentes

Cascade deletes

Multi-tenant structure

3. Fluxo Atual de Tickets

Controller

Service

Fluxo Bot → API → DB

Onde lógica está concentrada

4. Fluxo Atual de Allowlist V2

Controller

Validações

Anti-flood

Onde decisão de approve/reject ocorre

5. Sistema de Permissões

Onde valida role

Como OrganizationMember é estruturado

Como SUPER_ADMIN é identificado

Middleware de autorização

6. Autenticação

JWT payload

Estrutura de login

Mock ou OAuth real

Refresh token (se existir)

7. Integração Bot

Como Bot chama API

Endpoints internos

Segurança (x-internal-service-key)

Existe WebSocket?

Tudo síncrono ou assíncrono?

8. Logs

Existe tabela de logs?

Existe auditoria?

Como são armazenadas ações administrativas?

9. Billing Atual

Existe model de plano?

Existe model de assinatura?

Existe model de pagamento?

Existe integração Stripe?

Está mockado?

10. Pontos Técnicos Sensíveis

Onde há hardcode

Onde há lógica misturada

Onde há risco de vazamento multi-tenant

Onde há dependência direta do Discord

IMPORTANTE

Não sugerir melhorias ainda.
Apenas descrever o estado atual real do código.

🎯 POR QUE ISSO É IMPORTANTE

Antes de:

Implementar Event Bus

Criar Automation Engine

Separar painel Super Admin

Criar Driver Layer

Integrar Stripe

Eu preciso saber exatamente:

Onde estamos de verdade.