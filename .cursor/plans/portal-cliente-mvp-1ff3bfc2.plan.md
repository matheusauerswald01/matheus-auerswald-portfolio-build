<!-- 1ff3bfc2-40e8-459b-94a3-b36f2dea98d7 baa440ad-55a7-41b6-98fc-1e73194e5243 -->
# Portal do Cliente MVP - Supabase

## Estrutura Geral

Adicionar nova rota `/portal` ao portfólio existente com botão de acesso no Header. O portal terá duas áreas principais: área do cliente (visualização de projetos, mensagens, faturas) e área administrativa (gestão completa).

## 1. Banco de Dados - Supabase

### Criar arquivo de schema SQL para novas tabelas:

**Arquivo: `supabase_portal_schema.sql`**

Criar schema completo com as seguintes tabelas:

- `portal_clients` - informações dos clientes
- `portal_projects` - projetos do portal
- `portal_milestones` - marcos dos projetos
- `portal_tasks` - tarefas dos projetos
- `portal_invoices` - faturas
- `portal_invoice_items` - itens das faturas
- `portal_payments` - pagamentos
- `portal_files` - arquivos do portal
- `portal_messages` - mensagens do chat
- `portal_notifications` - notificações
- `portal_deliveries` - entregas para aprovação
- `portal_activity_logs` - logs de atividade

Incluir Row Level Security (RLS) policies para:

- Clientes só verem seus próprios dados
- Admin ver todos os dados

### Atualizar `client/src/lib/supabase.ts`:

Adicionar tipos TypeScript e funções helper para todas as novas tabelas do portal.

## 2. Autenticação de Clientes

### Criar hook personalizado: `client/src/_core/hooks/usePortalAuth.ts`

Sistema de autenticação com magic link específico para clientes do portal:

- Login via email (magic link)
- Verificação de token
- Gerenciamento de sessão
- Proteção de rotas

### Criar contexto: `client/src/contexts/PortalAuthContext.tsx`

Context API para gerenciar estado de autenticação do portal separado do admin.

## 3. Estrutura de Rotas e Componentes

### Atualizar `client/src/App.tsx`:

Adicionar rotas do portal:

```typescript
<Route path="/portal" component={PortalLayout} />
<Route path="/portal/login" component={PortalLogin} />
<Route path="/portal/dashboard" component={PortalDashboard} />
<Route path="/portal/projects/:id" component={PortalProjectDetail} />
<Route path="/portal/messages" component={PortalMessages} />
<Route path="/portal/invoices" component={PortalInvoices} />
<Route path="/portal/files" component={PortalFiles} />
```

### Criar componentes principais:

**Páginas:**

- `client/src/pages/portal/PortalLogin.tsx` - Login com magic link
- `client/src/pages/portal/PortalDashboard.tsx` - Dashboard do cliente
- `client/src/pages/portal/PortalProjectDetail.tsx` - Detalhes do projeto
- `client/src/pages/portal/PortalMessages.tsx` - Sistema de mensagens
- `client/src/pages/portal/PortalInvoices.tsx` - Visualização de faturas
- `client/src/pages/portal/PortalFiles.tsx` - Gestão de arquivos

**Layouts:**

- `client/src/components/portal/PortalLayout.tsx` - Layout base do portal
- `client/src/components/portal/PortalHeader.tsx` - Header do portal
- `client/src/components/portal/PortalSidebar.tsx` - Sidebar de navegação

## 4. Dashboard do Cliente

### `client/src/components/portal/ClientDashboard.tsx`

Criar dashboard com:

- Cards de resumo (projetos ativos, tarefas pendentes, próximos prazos)
- Feed de atividades recentes
- Resumo financeiro (faturas pendentes/pagas)
- Acesso rápido às principais funcionalidades
- Gráfico de progresso dos projetos (usando recharts)

## 5. Gestão de Projetos (Visão Cliente)

### `client/src/components/portal/ProjectCard.tsx`

Card de projeto com progresso visual, status e milestone atual.

### `client/src/components/portal/ProjectTimeline.tsx`

Timeline visual dos milestones e progresso.

### `client/src/components/portal/TaskList.tsx`

Lista de tarefas com filtros por status, visualização Kanban opcional.

### `client/src/components/portal/DeliveryReview.tsx`

Interface para revisar entregas: aprovar ou solicitar alterações com feedback.

## 6. Sistema de Comunicação

### `client/src/components/portal/ChatWindow.tsx`

Chat em tempo real usando Supabase Realtime:

- Mensagens organizadas por projeto
- Upload de arquivos nas mensagens
- Indicador de mensagens não lidas
- Notificações em tempo real

### `client/src/components/portal/CommentSystem.tsx`

Sistema de comentários contextualizados em tarefas e arquivos.

## 7. Gestão de Arquivos

### `client/src/components/portal/FileManager.tsx`

Gerenciador de arquivos:

- Upload via drag & drop para Supabase Storage
- Organização por pastas (projeto/tarefa)
- Versionamento de documentos
- Visualização inline quando possível
- Download seguro com URLs assinadas

### `client/src/lib/supabaseStorage.ts`

Funções helper para interagir com Supabase Storage.

## 8. Faturamento e Pagamentos

### `client/src/components/portal/InvoiceList.tsx`

Lista de faturas com filtros (todas, pendentes, pagas, atrasadas).

### `client/src/components/portal/InvoiceDetail.tsx`

Detalhes da fatura com botão "Pagar Agora".

### `client/src/lib/payments.ts`

Integração com gateways de pagamento:

- Stripe: criar checkout session e processar webhooks
- Mercado Pago: gerar preferência de pagamento
- Webhooks para atualização automática de status

### Criar endpoints no backend:

**`server/routers.ts` - adicionar rotas:**

- POST `/api/payments/stripe/create-checkout` - criar sessão Stripe
- POST `/api/payments/mercadopago/create-preference` - criar preferência MP
- POST `/api/webhooks/stripe` - webhook Stripe
- POST `/api/webhooks/mercadopago` - webhook Mercado Pago

## 9. Painel Admin do Portal

### Expandir `client/src/pages/Admin.tsx`:

Adicionar nova aba "Portal" no admin existente com:

**Gestão de Clientes:**

- `client/src/components/admin/portal/ClientList.tsx` - lista de clientes
- `client/src/components/admin/portal/ClientForm.tsx` - criar/editar cliente
- `client/src/components/admin/portal/ClientDetail.tsx` - detalhes completos

**Gestão de Projetos:**

- `client/src/components/admin/portal/ProjectList.tsx` - lista de projetos
- `client/src/components/admin/portal/ProjectForm.tsx` - criar/editar projeto
- `client/src/components/admin/portal/ProjectKanban.tsx` - visualização Kanban
- `client/src/components/admin/portal/MilestoneManager.tsx` - gestão de milestones
- `client/src/components/admin/portal/TaskManager.tsx` - gestão de tarefas

**Gestão Financeira:**

- `client/src/components/admin/portal/InvoiceGenerator.tsx` - criar faturas
- `client/src/components/admin/portal/PaymentDashboard.tsx` - dashboard financeiro
- `client/src/components/admin/portal/FinancialReports.tsx` - relatórios

**Comunicação:**

- `client/src/components/admin/portal/AdminMessages.tsx` - inbox unificado
- `client/src/components/admin/portal/NotificationCenter.tsx` - gerenciar notificações

## 10. Botão de Acesso no Header

### Atualizar `client/src/components/Header.tsx`:

Adicionar item "Portal do Cliente" no menu de navegação:

- Desktop: adicionar no array `navItems`
- Mobile: incluir no menu mobile
- Link para `/portal` com ícone distintivo
- Destacar visualmente (badge ou cor diferente)

Exemplo de adição:

```typescript
const navItems = [
  // ... itens existentes
  { label: "Portal do Cliente", href: "/portal", badge: true }
];
```

## 11. Notificações e Tempo Real

### `client/src/hooks/useRealtimeNotifications.ts`

Hook para escutar eventos do Supabase Realtime:

- Novas mensagens
- Atualizações de projeto
- Pagamentos confirmados
- Entregas aprovadas/rejeitadas

### `client/src/components/portal/NotificationBell.tsx`

Sino de notificações no header do portal com badge de contagem.

## 12. Variáveis de Ambiente

### Atualizar `.env.example`:

Adicionar variáveis necessárias:

```
# Stripe
VITE_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Mercado Pago
VITE_MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_ACCESS_TOKEN=

# Supabase Storage
VITE_SUPABASE_STORAGE_BUCKET=portal-files
```

## 13. Utilitários e Helpers

### `client/src/lib/portalUtils.ts`

Funções auxiliares:

- Formatação de datas
- Cálculo de progresso de projeto
- Geração de cores de status
- Validação de permissões

### `client/src/lib/emailTemplates.ts`

Templates de email para:

- Convite de novo cliente
- Nova fatura disponível
- Pagamento confirmado
- Entrega pronta para revisão
- Lembrete de pagamento

## 14. Testes e Validação

Após implementação, testar:

- Fluxo completo de onboarding de cliente
- Criação e visualização de projeto
- Envio de mensagens
- Upload de arquivos
- Geração e visualização de fatura
- Fluxo de pagamento (modo test)
- Aprovação de entregas
- Notificações em tempo real

## Arquivos Principais a Criar/Modificar

**Criar:**

- `supabase_portal_schema.sql`
- `client/src/_core/hooks/usePortalAuth.ts`
- `client/src/contexts/PortalAuthContext.tsx`
- 15+ componentes do portal (páginas e componentes)
- `client/src/lib/supabaseStorage.ts`
- `client/src/lib/payments.ts`
- `client/src/lib/portalUtils.ts`
- `client/src/lib/emailTemplates.ts`

**Modificar:**

- `client/src/App.tsx` (rotas)
- `client/src/components/Header.tsx` (botão portal)
- `client/src/lib/supabase.ts` (tipos e funções)
- `client/src/pages/Admin.tsx` (aba portal)
- `server/routers.ts` (endpoints pagamento)
- `.env.example`

## Ordem de Implementação (Passo a Passo)

**Abordagem:** Implementar cada etapa completamente e aguardar aprovação antes de prosseguir para a próxima.

### Etapa 1: Schema do Banco de Dados

- Criar arquivo `supabase_portal_schema.sql` com todas as tabelas
- Incluir políticas RLS completas
- Adicionar índices para performance
- **Aguardar aprovação antes de prosseguir**

### Etapa 2: Helpers do Supabase

- Atualizar `client/src/lib/supabase.ts` com tipos e funções
- Criar `client/src/lib/supabaseStorage.ts`
- Criar `client/src/lib/portalUtils.ts`
- **Aguardar aprovação antes de prosseguir**

### Etapa 3: Autenticação

- Criar hook `usePortalAuth.ts`
- Criar contexto `PortalAuthContext.tsx`
- Implementar proteção de rotas
- **Aguardar aprovação antes de prosseguir**

### Etapa 4: Estrutura Base

- Adicionar rotas no `App.tsx`
- Criar componentes de layout (PortalLayout, Header, Sidebar)
- Criar página de login
- **Aguardar aprovação antes de prosseguir**

### Etapa 5: Dashboard do Cliente

- Implementar dashboard com métricas e cards
- Feed de atividades
- Gráficos de progresso
- **Aguardar aprovação antes de prosseguir**

### Etapa 6: Visualização de Projetos

- Lista de projetos
- Detalhes do projeto
- Timeline e milestones
- Lista de tarefas
- **Aguardar aprovação antes de prosseguir**

### Etapa 7: Sistema de Comunicação

- Chat em tempo real
- Sistema de comentários
- Notificações
- **Aguardar aprovação antes de prosseguir**

### Etapa 8: Gestão de Arquivos

- Upload/download com Supabase Storage
- Versionamento
- Visualização
- **Aguardar aprovação antes de prosseguir**

### Etapa 9: Faturamento

- Lista de faturas
- Detalhes de fatura
- Interface de visualização
- **Aguardar aprovação antes de prosseguir**

### Etapa 10: Pagamentos

- Integração Stripe
- Integração Mercado Pago
- Webhooks
- Backend endpoints
- **Aguardar aprovação antes de prosseguir**

### Etapa 11: Aprovação de Entregas

- Interface de revisão
- Feedback e comentários
- Fluxo de aprovação
- **Aguardar aprovação antes de prosseguir**

### Etapa 12: Painel Admin

- Gestão de clientes
- Gestão de projetos
- Gestão financeira
- Comunicação admin
- **Aguardar aprovação antes de prosseguir**

### Etapa 13: Botão no Header

- Adicionar item de navegação
- Estilização
- Responsividade
- **Aguardar aprovação antes de prosseguir**

### Etapa 14: Notificações Tempo Real

- Hook de realtime
- Componente NotificationBell
- Integração com Supabase Realtime
- **Aguardar aprovação antes de prosseguir**

### Etapa 15: Testes e Ajustes Finais

- Testar todos os fluxos
- Ajustes de UX
- Documentação

### To-dos

- [ ] Criar schema SQL completo para todas as tabelas do Portal no Supabase com RLS policies
- [ ] Implementar sistema de autenticação de clientes com magic link usando Supabase Auth
- [ ] Criar estrutura de rotas do portal e componentes de layout base (PortalLayout, Header, Sidebar)
- [ ] Desenvolver dashboard do cliente com cards de resumo, feed de atividades e métricas
- [ ] Criar visualização de projetos para o cliente (lista, detalhes, timeline, tarefas)
- [ ] Implementar sistema de mensagens em tempo real usando Supabase Realtime
- [ ] Criar sistema de upload/download de arquivos usando Supabase Storage
- [ ] Desenvolver sistema de visualização de faturas e detalhes para o cliente
- [ ] Integrar Stripe e Mercado Pago com webhooks para processamento de pagamentos
- [ ] Criar sistema de aprovação de entregas com feedback do cliente
- [ ] Expandir painel admin com gestão completa do portal (clientes, projetos, faturas)
- [ ] Adicionar botão 'Portal do Cliente' no Header com link para /portal
- [ ] Implementar sistema de notificações em tempo real com Supabase Realtime
- [ ] Criar funções helper para interagir com todas as tabelas do portal no Supabase
- [ ] Criar templates de email para convites, faturas, pagamentos e notificações