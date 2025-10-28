# 🔐 Variáveis de Ambiente - Guia Rápido

## 📋 Onde Encontrar as Credenciais

### 🗄️ Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:

```bash
# Project URL
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co

# anon/public key
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key (⚠️ PRIVADA - NÃO EXPOR!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🌐 Configuração no Netlify

### Via Dashboard

1. Acesse seu site no Netlify
2. **Site settings** → **Environment variables**
3. Clique em **Add a variable**
4. Cole as variáveis abaixo:

### Variáveis Obrigatórias

| Variável                 | Valor                     | Onde Pegar                |
| ------------------------ | ------------------------- | ------------------------- |
| `VITE_SUPABASE_URL`      | `https://xxx.supabase.co` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...`              | Supabase → Settings → API |

### Variáveis de Contato

| Variável                | Valor                        |
| ----------------------- | ---------------------------- |
| `VITE_CONTACT_EMAIL`    | `matheusauerswald@gmail.com` |
| `VITE_CONTACT_PHONE`    | `67981826022`                |
| `VITE_CONTACT_LOCATION` | `Campo Grande, MS`           |

### Variáveis do Admin (Opcional)

| Variável                    | Valor                          | Onde Pegar                |
| --------------------------- | ------------------------------ | ------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...`                   | Supabase → Settings → API |
| `VITE_ADMIN_EMAIL`          | `seu-email@gmail.com`          | Seu email                 |
| `VITE_APP_URL`              | `https://seu-site.netlify.app` | URL do Netlify            |

---

## ⚠️ Notas Importantes

### ✅ Pode Expor no Frontend (VITE\_)

Variáveis com prefixo `VITE_` são compiladas no JavaScript e podem ser vistas por qualquer usuário:

```bash
VITE_SUPABASE_URL=...        # ✅ OK
VITE_SUPABASE_ANON_KEY=...   # ✅ OK (é pública mesmo)
VITE_CONTACT_EMAIL=...       # ✅ OK
```

### ❌ NUNCA Expor no Frontend

```bash
SUPABASE_SERVICE_ROLE_KEY=...  # ❌ PRIVADA! Só backend
STRIPE_SECRET_KEY=...          # ❌ PRIVADA! Só backend
JWT_SECRET=...                 # ❌ PRIVADA! Só backend
```

---

## 🧪 Testar Localmente

1. Crie `.env.local` na raiz do projeto:

```bash
# Copie o exemplo
cp .env.production.example .env.local
```

2. Edite `.env.local` com suas credenciais

3. Teste:

```bash
pnpm run dev
```

4. Abra http://localhost:3000 e verifique:
   - [ ] Projetos carregam do Supabase
   - [ ] Formulário de contato funciona
   - [ ] Portal do cliente funciona
   - [ ] Admin funciona (se configurado)

---

## 🚀 Deploy

Após configurar as variáveis no Netlify:

1. **Trigger deploy**: Deploys → Trigger deploy → Deploy site
2. **Aguarde** o build terminar (~2-5 min)
3. **Teste** o site em produção
4. **Debug**: Se algo não funcionar, veja os logs em Deploys → [último deploy] → Deploy log

---

## 🔍 Troubleshooting

### "Cannot read properties of undefined"

❌ **Problema**: Variável de ambiente não está configurada

✅ **Solução**:

1. Verifique no Netlify: Site settings → Environment variables
2. Certifique-se de que variáveis do frontend têm prefixo `VITE_`
3. Faça redeploy após adicionar variáveis

### "Failed to fetch from Supabase"

❌ **Problema**: URLs ou keys incorretas

✅ **Solução**:

1. Copie novamente do Supabase (Settings → API)
2. Verifique se não tem espaços extras
3. Teste localmente primeiro

### "403 Forbidden" ou "401 Unauthorized"

❌ **Problema**: RLS policies do Supabase bloqueando

✅ **Solução**:

1. Vá no Supabase SQL Editor
2. Execute os scripts de políticas RLS
3. Ou desative RLS para testes: `ALTER TABLE nome_tabela DISABLE ROW LEVEL SECURITY;`

---

## 📞 Precisa de Ajuda?

Verifique:

- ✅ [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md) - Guia completo de deploy
- ✅ [README.md](./README.md) - Documentação geral
- ✅ [Netlify Docs](https://docs.netlify.com)
- ✅ [Supabase Docs](https://supabase.com/docs)
