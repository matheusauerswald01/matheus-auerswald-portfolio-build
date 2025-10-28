# ✅ Checklist de Deploy - Netlify

Use este checklist para garantir que tudo está pronto antes do deploy.

---

## 📦 PRÉ-DEPLOY

### Código e Repositório

- [ ] Todo código commitado no Git
- [ ] `.gitignore` configurado (não commitar `.env`)
- [ ] Repositório criado no GitHub
- [ ] Código enviado para GitHub (`git push`)

### Build Local

- [ ] `pnpm run build:frontend` funciona sem erros
- [ ] Arquivos gerados em `dist/public/`
- [ ] Testes manuais funcionando localmente

### Supabase

- [ ] Projeto Supabase criado
- [ ] Schema do banco executado (`supabase_portal_schema.sql`)
- [ ] Storage bucket `portfolio-media` criado
- [ ] Políticas RLS configuradas
- [ ] Credenciais anotadas:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`

### Arquivos Necessários

- [ ] `netlify.toml` existe na raiz
- [ ] `client/public/_redirects` existe
- [ ] `README.md` atualizado
- [ ] `.gitignore` atualizado

---

## 🚀 DURANTE O DEPLOY

### Netlify - Configuração Inicial

- [ ] Conta Netlify criada
- [ ] Repositório GitHub conectado
- [ ] Build command: `pnpm install && pnpm run build:frontend`
- [ ] Publish directory: `dist/public`
- [ ] Node version: 20 (configurado no `netlify.toml`)

### Variáveis de Ambiente

**Obrigatórias:**
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`

**Recomendadas:**
- [ ] `VITE_CONTACT_EMAIL`
- [ ] `VITE_CONTACT_PHONE`
- [ ] `VITE_CONTACT_LOCATION`

**Admin (se usar painel):**
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `VITE_ADMIN_EMAIL`
- [ ] `VITE_APP_URL`

### Deploy

- [ ] Clicou em "Deploy site"
- [ ] Build finalizou com sucesso (sem erros)
- [ ] Site gerou URL `.netlify.app`

---

## 🧪 PÓS-DEPLOY - TESTES

### Funcionalidades Básicas

- [ ] Site abre sem erro 404
- [ ] Homepage carrega completamente
- [ ] Navegação entre páginas funciona
- [ ] Logo "Matheus Auerswald" aparece no header
- [ ] Footer com informações corretas

### Seções da Homepage

- [ ] **Hero Section**:
  - [ ] Animações funcionando
  - [ ] Estatísticas corretas (10+ projetos, 7+ clientes, 2 anos)
  - [ ] Botões funcionam

- [ ] **Sobre**:
  - [ ] Foto de perfil (`profile.jpg`) aparece
  - [ ] Bio correta com "Campo Grande, MS"

- [ ] **Projetos**:
  - [ ] Projetos carregam do Supabase
  - [ ] Imagens/vídeos aparecem
  - [ ] Tags aparecem (se projeto tiver)
  - [ ] Botões Demo/GitHub aparecem (se projeto tiver)
  - [ ] Vídeos tocam (autoplay, loop, muted)

- [ ] **Depoimentos**:
  - [ ] 3 depoimentos aparecem
  - [ ] João Silva: foto de homem ✅
  - [ ] Maria Santos: foto de mulher ✅
  - [ ] Carlos Oliveira: foto de homem ✅
  - [ ] Estatísticas corretas

- [ ] **Contato**:
  - [ ] Email: matheusauerswald@gmail.com
  - [ ] Telefone: (67) 98182-6022
  - [ ] Localização: Campo Grande, MS
  - [ ] Formulário funciona (se configurado)

### Responsividade

- [ ] **Desktop** (1920px+): Layout completo
- [ ] **Laptop** (1366px): Tudo visível
- [ ] **Tablet** (768px): Menu adaptado
- [ ] **Mobile** (375px): Menu hambúrguer
- [ ] Botões são clicáveis em todos os tamanhos
- [ ] Imagens não cortadas/distorcidas

### Performance

- [ ] Tempo de carregamento < 3 segundos
- [ ] Animações suaves (60fps)
- [ ] Imagens carregam progressivamente
- [ ] Sem erros no Console (F12)

### Portal do Cliente (se ativo)

- [ ] `/portal` abre
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Projetos aparecem
- [ ] Mensagens funcionam
- [ ] Upload de arquivos funciona

### Admin (se ativo)

- [ ] `/admin` abre
- [ ] Login admin funciona
- [ ] Dashboard carrega
- [ ] CRUD de clientes funciona
- [ ] CRUD de projetos funciona
- [ ] Upload de mídia funciona
- [ ] Estatísticas aparecem

---

## 🔧 OTIMIZAÇÕES PÓS-DEPLOY

### SEO Básico

- [ ] Meta tags configuradas
- [ ] Open Graph tags
- [ ] Twitter Cards
- [ ] Favicon configurado
- [ ] `robots.txt` configurado
- [ ] `sitemap.xml` criado

### Analytics

- [ ] Google Analytics configurado
- [ ] Meta Pixel configurado (opcional)
- [ ] Hotjar/Clarity configurado (opcional)

### Segurança

- [ ] HTTPS ativo (automático no Netlify)
- [ ] Headers de segurança configurados (no `netlify.toml`)
- [ ] Variáveis sensíveis NÃO expostas

### Domínio Customizado (Opcional)

- [ ] Domínio comprado
- [ ] DNS configurado
- [ ] SSL certificado ativo
- [ ] Redirecionamento www → não-www (ou vice-versa)

---

## 📊 MONITORAMENTO CONTÍNUO

### Semanal

- [ ] Verificar erros no Netlify Analytics
- [ ] Backup do Supabase
- [ ] Atualizar projetos/conteúdo

### Mensal

- [ ] Analisar Google Analytics
- [ ] Revisar performance (PageSpeed)
- [ ] Atualizar dependências (`pnpm update`)

---

## 🐛 SE ALGO DER ERRADO

### Build Falha

1. ✅ Veja logs: Netlify → Deploys → [último] → Deploy log
2. ✅ Teste local: `pnpm run build:frontend`
3. ✅ Verifique package.json e netlify.toml

### Site Não Abre

1. ✅ Verifique URL do deploy
2. ✅ Veja se build terminou com sucesso
3. ✅ Limpe cache do navegador (Ctrl+Shift+R)

### Projetos Não Aparecem

1. ✅ Verifique variáveis de ambiente Supabase
2. ✅ Teste conexão Supabase localmente
3. ✅ Verifique RLS policies no Supabase

### Erro 404 nas Rotas

1. ✅ Confirme que `_redirects` existe em `client/public/`
2. ✅ Redeploy no Netlify
3. ✅ Verifique `netlify.toml` redirects

### Erro "Access Denied"

1. ✅ Verifique RLS policies do Supabase
2. ✅ Confirme que `VITE_SUPABASE_ANON_KEY` está correta
3. ✅ Execute scripts SQL de políticas

---

## 📚 RECURSOS ÚTEIS

- 📖 **Guia Completo**: [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md)
- 🎯 **Passo a Passo**: [DEPLOY_PASSO_A_PASSO.md](./DEPLOY_PASSO_A_PASSO.md)
- 🔐 **Variáveis**: [VARIAVEIS_AMBIENTE.md](./VARIAVEIS_AMBIENTE.md)
- 📘 **README**: [README.md](./README.md)

---

## ✅ STATUS DO DEPLOY

**Marque conforme avançar:**

- [ ] 🔵 Preparação completa
- [ ] 🟡 Deploy iniciado
- [ ] 🟢 Deploy bem-sucedido
- [ ] ✅ Testes passaram
- [ ] 🎉 Site no ar e funcionando!

---

**Boa sorte com o deploy! 🚀**

_Desenvolvido por Matheus Auerswald_

