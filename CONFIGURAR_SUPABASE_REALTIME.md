# ⚡ Configuração do Supabase Realtime

## 📋 Objetivo

Habilitar funcionalidades em tempo real no Portal do Cliente usando Supabase Realtime para mensagens e notificações.

---

## 🔧 Parte 1: Habilitar Realtime no Supabase

### 1.1 Acessar Dashboard do Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Database** → **Replication**

### 1.2 Habilitar Replicação para Tabelas

Você precisa habilitar a replicação para as tabelas que deseja monitorar em tempo real:

**Tabelas a habilitar:**

- ✅ `portal_messages` (mensagens em tempo real)
- ✅ `portal_notifications` (notificações em tempo real)
- ✅ `portal_activity_logs` (atividades em tempo real)
- ✅ `portal_tasks` (atualização de tarefas)
- ✅ `portal_projects` (atualização de projetos)

**Passos:**

1. Em **Database** → **Replication**
2. Para cada tabela acima, clique em **0 tables** ao lado de "Realtime"
3. Marque a checkbox da tabela desejada
4. Clique em **Save**

### 1.3 Verificar Configuração

Execute no SQL Editor:

```sql
-- Verificar tabelas com Realtime habilitado
SELECT
  schemaname,
  tablename
FROM
  pg_publication_tables
WHERE
  pubname = 'supabase_realtime';
```

Você deve ver as 5 tabelas listadas acima.

---

## 🔐 Parte 2: Configurar RLS para Realtime

### 2.1 Verificar Políticas RLS

As políticas RLS já definidas no `supabase_portal_schema.sql` já suportam Realtime:

```sql
-- Clientes podem ver mensagens de seus projetos
CREATE POLICY "Clientes podem ver mensagens de seus projetos"
  ON portal_messages FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM portal_projects
      WHERE client_id IN (
        SELECT id FROM portal_clients
        WHERE user_id = auth.uid()
      )
    )
  );

-- Clientes podem criar mensagens
CREATE POLICY "Clientes podem criar mensagens"
  ON portal_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    sender_type = 'client'
  );
```

### 2.2 Testar Permissões

No SQL Editor:

```sql
-- Como cliente autenticado
SELECT * FROM portal_messages
WHERE project_id = 'seu-project-id';

-- Deve retornar mensagens sem erro
```

---

## 💻 Parte 3: Implementação no Frontend (Já Implementado)

### 3.1 Hook useMessages

O hook `useMessages.ts` já implementa:

- ✅ Inscrição em canal Realtime
- ✅ Escuta de eventos INSERT
- ✅ Escuta de eventos UPDATE
- ✅ Auto-atualização da lista de mensagens
- ✅ Cleanup ao desmontar

**Código de Exemplo:**

```typescript
const channel = supabase
  .channel(`messages:${projectId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "portal_messages",
      filter: `project_id=eq.${projectId}`,
    },
    (payload) => {
      console.log("Nova mensagem recebida:", payload.new);
      setMessages((prev) => [...prev, payload.new as PortalMessage]);
    }
  )
  .subscribe();
```

### 3.2 Componente ChatBox

O componente `ChatBox.tsx` já implementa:

- ✅ Renderização de mensagens em tempo real
- ✅ Auto-scroll para nova mensagem
- ✅ Marcação automática como lida
- ✅ Indicadores de leitura (check simples/duplo)
- ✅ Animações suaves

---

## 🧪 Parte 4: Testar Realtime

### 4.1 Teste Manual com Dois Navegadores

1. **Navegador 1:** Faça login como cliente
   - Acesse `/portal/messages`
   - Selecione um projeto

2. **Navegador 2 (Privado):** Faça login como admin ou outro cliente
   - Acesse o mesmo projeto

3. **Teste:**
   - Envie uma mensagem do Navegador 1
   - Deve aparecer instantaneamente no Navegador 2
   - Vice-versa

### 4.2 Teste com SQL Editor

Execute no SQL Editor enquanto o chat está aberto:

```sql
-- Inserir mensagem manualmente
INSERT INTO portal_messages (
  project_id,
  sender_id,
  sender_type,
  message,
  is_read
) VALUES (
  'seu-project-id',
  'seu-user-id',
  'admin',
  'Mensagem de teste via SQL',
  false
);
```

A mensagem deve aparecer instantaneamente no chat!

### 4.3 Verificar Logs do Console

No console do navegador, você deve ver:

```
🔍 Subscribed to Realtime channel: messages:project-uuid
✅ Nova mensagem recebida: { id: '...', message: '...', ... }
```

---

## 🐛 Troubleshooting

### Problema: Mensagens não aparecem em tempo real

**Possíveis causas:**

1. **Realtime não habilitado na tabela**
   - Solução: Verificar em Database → Replication

2. **RLS bloqueando acesso**
   - Solução: Testar query manual no SQL Editor
   - Verificar se `auth.uid()` está correto

3. **Filtro incorreto no canal**
   - Solução: Verificar se `project_id` está correto
   - Logs: `console.log("Subscribing to:", projectId)`

4. **Canal não subscrito**
   - Solução: Verificar estado do canal
   ```typescript
   console.log("Channel state:", channel.state);
   // Deve ser 'subscribed'
   ```

### Problema: "permission denied for table portal_messages"

**Solução:**

Verificar se o usuário autenticado tem `user_id` ligado em `portal_clients`:

```sql
SELECT * FROM portal_clients
WHERE user_id = auth.uid();

-- Se vazio, executar:
UPDATE portal_clients
SET user_id = auth.uid()
WHERE email = 'cliente@email.com';
```

### Problema: Muitas reconexões

**Causa:** Supabase Realtime tem limite de conexões.

**Solução:**

1. Usar um único canal por página
2. Fazer cleanup correto:
   ```typescript
   useEffect(() => {
     // Setup
     return () => {
       supabase.removeChannel(channel); // Cleanup
     };
   }, []);
   ```

---

## 📊 Monitoramento

### Ver Conexões Ativas

No Dashboard do Supabase:

1. Vá em **Database** → **Realtime**
2. Veja número de conexões ativas
3. Veja uso de banda

### Limites do Plano Free

- **Conexões simultâneas:** 200
- **Mensagens/dia:** 2 milhões
- **Banda:** 250 GB/mês

Para mais, upgrade para Pro.

---

## 🎯 Próximos Passos

Após configurar Realtime para mensagens:

1. ✅ Habilitar para notificações
2. ✅ Habilitar para atividades
3. ✅ Implementar presence (quem está online)
4. ✅ Implementar typing indicators
5. ✅ Adicionar som de notificação

---

## 📚 Recursos

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Realtime Quotas](https://supabase.com/docs/guides/realtime/quotas)
- [RLS with Realtime](https://supabase.com/docs/guides/realtime/authorization)

---

**Configuração Realtime concluída!** ⚡

Suas mensagens agora são instantâneas e seus clientes têm uma experiência de chat moderna e responsiva!

