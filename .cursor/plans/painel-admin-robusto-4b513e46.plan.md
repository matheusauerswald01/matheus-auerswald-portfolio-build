<!-- 4b513e46-72f7-4c75-b7a3-3837b901c859 24f6069c-f51d-47da-8261-4c298e2823ad -->
# Painel Administrativo Robusto para Gerenciamento de Clientes

## Arquitetura Geral

Criar um sistema admin completo que integra backend (tRPC), frontend (React + Shadcn UI), e serviços externos (Supabase Auth + Email Service) para gerenciamento total do ciclo de vida do cliente e seus projetos.

## 1. Backend - API com tRPC

### 1.1 Router de Clientes (`server/routers/adminRouter.ts`)

Criar novo router tRPC com endpoints protegidos para:

- `clients.list` - Listar todos os clientes com paginação, filtros e busca
- `clients.get` - Obter detalhes completos de um cliente por ID
- `clients.create` - Criar cliente no Supabase Auth + DB + enviar email
- `clients.update` - Atualizar dados do cliente
- `clients.delete` - Desativar/deletar cliente (soft delete)
- `clients.stats` - Estatísticas agregadas (total de clientes, projetos, faturamento)

### 1.2 Router de Projetos Admin (`server/routers/adminProjectRouter.ts`)

- `projects.listByClient` - Listar projetos de um cliente
- `projects.create` - Criar novo projeto completo (com milestones e tarefas)
- `projects.update` - Atualizar projeto
- `projects.delete` - Deletar projeto
- `milestones.create/update/delete` - Gerenciar milestones
- `tasks.create/update/delete` - Gerenciar tarefas

### 1.3 Router de Faturas Admin (`server/routers/adminInvoiceRouter.ts`)

- `invoices.listByClient` - Listar faturas de um cliente
- `invoices.create` - Criar fatura com itens
- `invoices.update` - Atualizar fatura
- `invoices.addItem` - Adicionar item à fatura
- `invoices.removeItem` - Remover item
- `invoices.send` - Enviar fatura por email
- `payments.register` - Registrar pagamento manual
- `payments.history` - Histórico de pagamentos

### 1.4 Serviço de Email (`server/services/emailService.ts`)

Configurar serviço de email usando Resend ou SendGrid:

- `sendWelcomeEmail()` - Email de boas-vindas com magic link
- `sendInvoiceEmail()` - Email com fatura anexada
- `sendProjectInviteEmail()` - Notificar cliente sobre novo projeto
- Usar templates do `client/src/emails/`

### 1.5 Integração com Supabase Admin SDK

Criar `server/services/supabaseAdmin.ts` para:

- Criar usuários no Supabase Auth
- Gerar magic links
- Gerenciar permissões
- Validar admin authentication

### 1.6 Atualizar `server/routers.ts`

Adicionar os novos routers ao `appRouter`:

```typescript
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  admin: adminRouter,
  adminProjects: adminProjectRouter,
  adminInvoices: adminInvoiceRouter,
});
```

## 2. Frontend - Componentes Admin

### 2.1 Dashboard de Clientes (`client/src/components/admin/ClientDashboard.tsx`)

Card dashboard com:

- Estatísticas em tempo real (clientes ativos, projetos em andamento, faturamento total, faturas pendentes)
- Gráficos usando Recharts (crescimento de clientes, receita mensal)
- Cards clicáveis com animações Framer Motion

### 2.2 Tabela de Clientes (`client/src/components/admin/ClientsTable.tsx`)

Tabela avançada com:

- Shadcn Table component
- Busca em tempo real (nome, email, empresa)
- Filtros (status ativo/inativo, data de cadastro)
- Paginação (10, 25, 50, 100 por página)
- Ordenação por colunas
- Ações rápidas (editar, ver detalhes, desativar)
- Badges de status coloridos
- Avatar do cliente

### 2.3 Formulário de Cliente (`client/src/components/admin/ClientForm.tsx`)

Modal/Dialog com React Hook Form + Zod para validação:

Campos:

- Nome completo (obrigatório)
- Email (obrigatório, validação)
- Empresa
- Telefone (máscara)
- Documento (CPF/CNPJ)
- Endereço completo (CEP, rua, cidade, estado, país)
- Timezone
- Idioma (pt-BR, en-US, es-ES)
- Notas internas
- Avatar (upload para Supabase Storage)

Ações:

- Salvar e criar Auth automaticamente
- Enviar email de boas-vindas
- Loading states
- Toast notifications

### 2.4 Detalhes do Cliente (`client/src/components/admin/ClientDetailView.tsx`)

View completa com tabs:

**Aba 1 - Informações Gerais:**

- Card com dados pessoais
- Botões: Editar, Desativar, Reenviar Convite
- Estatísticas do cliente (projetos, faturas, arquivos)

**Aba 2 - Projetos:**

- Lista de projetos com status
- Botão "Criar Novo Projeto"
- Componente `ProjectManagementSection`

**Aba 3 - Faturas:**

- Lista de faturas com status de pagamento
- Totais (pago, pendente, vencido)
- Botão "Criar Fatura"
- Componente `InvoiceManagementSection`

**Aba 4 - Arquivos:**

- Grid de arquivos do cliente
- Upload direto
- Componente `FileManagementSection`

**Aba 5 - Mensagens:**

- Chat history
- Enviar mensagem como admin
- Componente `MessageManagementSection`

**Aba 6 - Atividades:**

- Log de todas as atividades do cliente
- Timeline com ícones

### 2.5 Gerenciamento de Projetos (`client/src/components/admin/ProjectManagementSection.tsx`)

Funcionalidades:

- Criar projeto com wizard multi-step:
  - Step 1: Info básica (nome, descrição, datas)
  - Step 2: Valor e faturamento (fixo/hora)
  - Step 3: Milestones (adicionar múltiplos)
  - Step 4: Tarefas iniciais
- Editar projeto inline ou em modal
- Gerenciar status (ativo, pausado, completo, cancelado)
- Adicionar/editar milestones com drag & drop para reordenar
- Adicionar/editar tarefas com checklist

### 2.6 Gerenciamento de Faturas (`client/src/components/admin/InvoiceManagementSection.tsx`)

Funcionalidades:

- Criar fatura com formulário:
  - Número automático ou manual
  - Data de emissão e vencimento
  - Selecionar projeto/milestone
  - Adicionar itens com quantidade e valor
  - Calcular subtotal, impostos, desconto, total
  - Termos e notas
- Preview da fatura (design print-ready)
- Enviar por email
- Registrar pagamento manual
- Histórico de pagamentos
- Gerar PDF (futuro)

### 2.7 Gerenciamento de Arquivos (`client/src/components/admin/FileManagementSection.tsx`)

Funcionalidades:

- Visualizar todos os arquivos do cliente
- Upload múltiplo com drag & drop
- Organizar por projeto
- Preview de imagens
- Download
- Deletar com confirmação

### 2.8 Gerenciamento de Mensagens (`client/src/components/admin/MessageManagementSection.tsx`)

Funcionalidades:

- Ver histórico de mensagens por projeto
- Enviar mensagem como admin
- Interface de chat
- Marcar como lida
- Notificar cliente por email

### 2.9 Atualizar `client/src/components/PortalClientManagement.tsx`

Substituir o componente atual com o novo dashboard completo, integrando todos os componentes acima.

## 3. Hooks Customizados

### 3.1 `client/src/hooks/useClients.ts`

Hook usando tRPC e React Query para:

- `useClientsList()` - Lista com paginação e filtros
- `useClientById()` - Detalhes do cliente
- `useCreateClient()` - Mutation para criar
- `useUpdateClient()` - Mutation para atualizar
- `useDeleteClient()` - Mutation para deletar
- `useClientStats()` - Estatísticas agregadas
- Cache invalidation automático

### 3.2 `client/src/hooks/useAdminProjects.ts`

Hook para gerenciar projetos do admin:

- `useClientProjects()` - Projetos de um cliente
- `useCreateProject()` - Criar projeto completo
- `useUpdateProject()` - Atualizar
- `useDeleteProject()` - Deletar
- Mutations para milestones e tarefas

### 3.3 `client/src/hooks/useAdminInvoices.ts`

Hook para faturas:

- `useClientInvoices()` - Faturas de um cliente
- `useCreateInvoice()` - Criar com itens
- `useUpdateInvoice()` - Atualizar
- `useSendInvoice()` - Enviar email
- `useRegisterPayment()` - Registrar pagamento

## 4. Tipos e Validações

### 4.1 `shared/types/admin.ts`

Criar tipos compartilhados:

- `CreateClientInput` - Dados para criar cliente
- `UpdateClientInput` - Dados para atualizar
- `ClientFilters` - Filtros de busca
- `PaginationParams` - Parâmetros de paginação
- Schemas Zod para validação

### 4.2 Adicionar validações Zod em todas as mutations tRPC

## 5. Configurações e Variáveis de Ambiente

### 5.1 Adicionar ao `.env.local`

```
# Email Service (Resend ou SendGrid)
EMAIL_SERVICE=resend
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@seudominio.com
EMAIL_FROM_NAME=Seu Nome

# Supabase Service Role (para admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Configuration
VITE_ADMIN_EMAIL=admin@seudominio.com
```

### 5.2 Atualizar `env.example`

Adicionar as novas variáveis ao arquivo de exemplo.

## 6. Rotas e Navegação

### 6.1 Atualizar `client/src/App.tsx`

Adicionar rotas admin protegidas:

- `/admin/clients` - Lista de clientes
- `/admin/clients/:id` - Detalhes do cliente
- `/admin/clients/new` - Criar cliente

### 6.2 Guardar rotas com HOC AdminOnly

Usar ou criar HOC para proteger rotas admin (verificar role no token).

## 7. UI/UX Avançado

### 7.1 Componentes Auxiliares

- Loading skeletons para tabelas
- Empty states com ilustrações
- Error boundaries
- Confirmação de ações destrutivas (AlertDialog)
- Toast notifications (Sonner)
- Animações de transição (Framer Motion)

### 7.2 Responsividade

- Mobile: Cards empilhados, drawer para filtros
- Tablet: Grid 2 colunas
- Desktop: Layout completo com sidebar

### 7.3 Acessibilidade

- Labels ARIA
- Navegação por teclado
- Focus management em modals
- Mensagens de erro descritivas

## 8. Testes e Documentação

### 8.1 Criar `ADMIN_PANEL_README.md`

Documentação completa:

- Como acessar o painel
- Como criar um cliente
- Como gerenciar projetos e faturas
- Troubleshooting

### 8.2 Exemplos de uso

Incluir screenshots e GIFs demonstrativos (opcional).

## Ordem de Implementação Recomendada

1. Backend: Setup de routers, serviços e Supabase Admin
2. Email Service: Configurar e testar envio
3. Hooks: Criar hooks customizados
4. Componentes base: Dashboard, Tabela, Formulário
5. Componentes avançados: Detail View, Projetos, Faturas
6. Rotas e integração
7. Testes e ajustes finais
8. Documentação

### To-dos

- [ ] Criar estrutura backend: routers tRPC (adminRouter, adminProjectRouter, adminInvoiceRouter) com endpoints CRUD completos
- [ ] Implementar serviço Supabase Admin SDK para criar usuários, gerar magic links e gerenciar auth
- [ ] Configurar serviço de email (Resend/SendGrid) com templates de boas-vindas, faturas e notificações
- [ ] Criar hooks customizados: useClients, useAdminProjects, useAdminInvoices com React Query e tRPC
- [ ] Implementar ClientDashboard com estatísticas em tempo real e gráficos (Recharts)
- [ ] Criar ClientsTable com busca, filtros, paginação, ordenação e ações rápidas
- [ ] Implementar ClientForm com validação Zod, React Hook Form, upload de avatar e criação automática no Auth
- [ ] Criar ClientDetailView com tabs (info, projetos, faturas, arquivos, mensagens, atividades)
- [ ] Implementar ProjectManagementSection com wizard multi-step, milestones e tarefas
- [ ] Criar InvoiceManagementSection com criação de faturas, itens, preview, envio por email e registro de pagamentos
- [ ] Implementar FileManagementSection com upload, visualização, organização e download
- [ ] Criar MessageManagementSection com chat interface e envio de mensagens como admin
- [ ] Configurar rotas admin no App.tsx com proteção por role e navegação
- [ ] Adicionar loading states, error boundaries, confirmações, animações e responsividade
- [ ] Criar ADMIN_PANEL_README.md com guia completo de uso do painel administrativo