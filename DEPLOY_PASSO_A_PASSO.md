# 🚀 Deploy no Netlify - Passo a Passo Visual

## ⏱️ Tempo Estimado: 10-15 minutos

---

## 📝 Pré-requisitos

Antes de começar, certifique-se de que você tem:

- ✅ Conta no GitHub (gratuita)
- ✅ Conta no Netlify (gratuita)
- ✅ Projeto Supabase configurado
- ✅ Código commitado no GitHub

---

## 🎯 PASSO 1: Preparar o Repositório GitHub

### 1.1 Inicializar Git (se ainda não fez)

```bash
cd /Users/matheusauerswald/Desktop/codes/matheus-auerswald-portfolio-build

# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "Initial commit - Portfolio Matheus Auerswald"
```

### 1.2 Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique no **+** (canto superior direito) → **New repository**
3. Preencha:
   - **Repository name**: `matheus-auerswald-portfolio`
   - **Description**: `Portfólio profissional - Full Stack Developer`
   - **Visibility**: Private ou Public (sua escolha)
4. **NÃO** marque "Add README" (já temos)
5. Clique em **Create repository**

### 1.3 Conectar e Enviar o Código

```bash
# Adicionar origem remota (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/matheus-auerswald-portfolio.git

# Renomear branch para main
git branch -M main

# Enviar código
git push -u origin main
```

✅ **Pronto!** Código está no GitHub.

---

## 🎯 PASSO 2: Conectar Netlify ao GitHub

### 2.1 Criar Conta no Netlify

1. Acesse [app.netlify.com/signup](https://app.netlify.com/signup)
2. Clique em **Sign up with GitHub**
3. Autorize o Netlify a acessar sua conta GitHub

### 2.2 Importar Projeto

1. No dashboard do Netlify, clique em **Add new site**
2. Escolha **Import an existing project**
3. Clique em **GitHub**
4. Encontre e selecione `matheus-auerswald-portfolio`

### 2.3 Configurar Build Settings

Na tela de configuração:

**Build command:**
```
pnpm install && pnpm run build:frontend
```

**Publish directory:**
```
dist/public
```

**⚠️ NÃO CLIQUE EM "Deploy" AINDA!**

Clique em **Show advanced** → **New variable** para adicionar variáveis de ambiente primeiro.

---

## 🎯 PASSO 3: Configurar Variáveis de Ambiente

### 3.1 Pegar Credenciais do Supabase

1. Abra [app.supabase.com](https://app.supabase.com) em outra aba
2. Selecione seu projeto
3. Vá em **Settings** (⚙️ canto esquerdo)
4. Clique em **API**
5. **DEIXE ESTA ABA ABERTA** - vamos copiar daqui

### 3.2 Adicionar Variáveis no Netlify

No Netlify, adicione as variáveis uma por uma:

| Key (Nome) | Value (Valor) | Onde Pegar |
|------------|---------------|------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → API → anon/public |

**Variáveis de Contato (Opcionais mas Recomendadas):**

| Key | Value |
|-----|-------|
| `VITE_CONTACT_EMAIL` | `matheusauerswald@gmail.com` |
| `VITE_CONTACT_PHONE` | `67981826022` |
| `VITE_CONTACT_LOCATION` | `Campo Grande, MS` |

✅ **Pronto!** Variáveis configuradas.

---

## 🎯 PASSO 4: Fazer o Deploy

### 4.1 Iniciar o Deploy

1. **Agora sim**, clique em **Deploy [nome-do-site]**
2. Aguarde o build (~2-5 minutos)
3. Veja os logs em tempo real

### 4.2 Acompanhar o Build

Você verá algo assim:

```
✓ Installing dependencies
✓ Build command started
✓ Building application
✓ Optimizing files
✓ Deploy successful!
```

### 4.3 Acessar o Site

Quando terminar, você verá:

```
🎉 Site is live!
https://random-name-123abc.netlify.app
```

**Clique no link** para ver seu portfólio ao vivo! 🚀

---

## 🎯 PASSO 5: Configurar Domínio Customizado (Opcional)

### 5.1 Comprar Domínio

Opções populares:
- [Registro.br](https://registro.br) - R$ 40/ano (.com.br)
- [Namecheap](https://namecheap.com) - ~$10/ano (.com)
- [GoDaddy](https://godaddy.com)

### 5.2 Adicionar ao Netlify

1. No Netlify: **Site settings** → **Domain management**
2. Clique em **Add custom domain**
3. Digite seu domínio (ex: `matheusauerswald.com`)
4. Siga as instruções para configurar DNS

O Netlify vai te dar os nameservers:

```
dns1.p01.nsone.net
dns2.p01.nsone.net
dns3.p01.nsone.net
dns4.p01.nsone.net
```

### 5.3 Configurar DNS

No seu provedor de domínio:
1. Vá em configurações de DNS/Nameservers
2. Substitua os nameservers pelos do Netlify
3. Aguarde propagação (até 24h, geralmente 1-2h)

✅ **SSL Automático**: O Netlify configura HTTPS automaticamente!

---

## 🎯 PASSO 6: Testar Tudo

### Checklist de Testes

Abra seu site e teste:

- [ ] **Homepage carrega** sem erros
- [ ] **Navegação funciona** (Home, Sobre, Projetos, Contato)
- [ ] **Projetos aparecem** (vindo do Supabase)
- [ ] **Imagens carregam** (incluindo profile.jpg)
- [ ] **Depoimentos aparecem** com fotos corretas
- [ ] **Formulário de contato** funciona
- [ ] **Responsivo** - teste em mobile/tablet
- [ ] **Dark/Light mode** funciona
- [ ] **Animações** funcionam suavemente

### Testar Portal do Cliente

- [ ] Acesse `/portal`
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Projetos aparecem

### Testar Admin (Se configurado)

- [ ] Acesse `/admin`
- [ ] Login funciona
- [ ] Pode criar/editar projetos
- [ ] Upload de mídia funciona

---

## 🐛 Problemas Comuns

### ❌ "Page Not Found" nas rotas

**Problema**: Arquivo `_redirects` não foi incluído no build

**Solução**:
```bash
# Verifique se existe
ls client/public/_redirects

# Se não existir, já foi criado. Faça commit:
git add client/public/_redirects
git commit -m "Add _redirects for SPA routing"
git push
```

O Netlify vai fazer redeploy automaticamente.

---

### ❌ Projetos não aparecem

**Problema**: Variáveis de ambiente não configuradas

**Solução**:
1. Netlify → Site settings → Environment variables
2. Verifique `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Redeploy: Deploys → Trigger deploy → Deploy site

---

### ❌ Erro 500 ou tela branca

**Problema**: Erro de build ou JavaScript

**Solução**:
1. Veja os logs: Deploys → [último deploy] → Deploy log
2. Teste localmente:
   ```bash
   pnpm run build:frontend
   ```
3. Se funcionar local, compare variáveis de ambiente

---

## 🎉 Pronto!

Seu portfólio está **AO VIVO** na internet! 🌐

### 📊 Próximos Passos Sugeridos

1. **SEO**: 
   - Adicione meta tags no `client/index.html`
   - Submeta ao Google Search Console
   - Crie sitemap.xml

2. **Analytics**:
   - Configure Google Analytics
   - Ou use Netlify Analytics (pago)

3. **Performance**:
   - Teste com [PageSpeed Insights](https://pagespeed.web.dev)
   - Otimize imagens se necessário

4. **Marketing**:
   - Compartilhe nas redes sociais
   - Adicione ao LinkedIn
   - Envie para clientes potenciais

5. **Backup**:
   - Configure backup do Supabase
   - Faça commits regulares no GitHub

---

## 📞 Precisa de Ajuda?

- 📖 **Guia Completo**: [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md)
- 🔐 **Variáveis de Ambiente**: [VARIAVEIS_AMBIENTE.md](./VARIAVEIS_AMBIENTE.md)
- 📚 **Documentação**: [README.md](./README.md)
- 🌐 **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)

---

**🎊 Parabéns pelo seu novo portfólio online!**

Desenvolvido por **Matheus Auerswald** 💻
Campo Grande, MS | matheusauerswald@gmail.com

