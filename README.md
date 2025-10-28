# 💼 Matheus Auerswald - Portfólio Profissional

Portfólio full-stack desenvolvido com React, TypeScript, Tailwind CSS, tRPC e Supabase.

## 🚀 Tecnologias

### Frontend

- **React 19** + **TypeScript**
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Estilização moderna
- **Framer Motion** - Animações fluidas
- **Wouter** - Roteamento leve
- **React Query** - Gerenciamento de estado

### Backend

- **Node.js** + **Express**
- **tRPC** - API type-safe
- **Supabase** - Database + Auth + Storage
- **Zod** - Validação de schemas

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/matheus-auerswald-portfolio.git

# Entre na pasta
cd matheus-auerswald-portfolio

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.production.example .env.local
# Edite .env.local com suas credenciais
```

## 🔧 Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute os scripts SQL na pasta raiz:
   - `supabase_portal_schema.sql` - Schema do portal
   - Execute via SQL Editor no Supabase

3. Configure Storage:
   - Crie bucket `portfolio-media` (público)
   - Tamanho máximo: 40MB
   - Tipos permitidos: imagens e vídeos

4. Copie as credenciais:
   - URL do projeto
   - Anon key (pública)
   - Service role key (privada)

### 2. Variáveis de Ambiente

Edite `.env.local`:

```bash
VITE_SUPABASE_URL=sua-url-aqui
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-key-aqui
```

## 🏃‍♂️ Desenvolvimento

```bash
# Rodar em modo desenvolvimento
pnpm run dev

# Abre em http://localhost:3000
```

## 🏗️ Build

```bash
# Build completo (frontend + backend)
pnpm run build

# Apenas frontend
pnpm run build:frontend

# Apenas backend
pnpm run build:backend
```

## 🚀 Deploy

### Netlify (Recomendado para Frontend)

**Veja o guia completo em [DEPLOY_NETLIFY.md](./DEPLOY_NETLIFY.md)**

#### Deploy Rápido:

1. Conecte seu repositório GitHub ao Netlify
2. Configure build:
   ```
   Build command: pnpm install && pnpm run build:frontend
   Publish directory: dist/public
   ```
3. Adicione variáveis de ambiente no painel do Netlify
4. Deploy! 🎉

### Vercel (Alternativa)

```bash
npm i -g vercel
vercel --prod
```

### Render/Railway (Para Backend)

Se precisar do painel admin com backend:

1. Deploy frontend no Netlify
2. Deploy backend no Render/Railway
3. Atualize `VITE_APP_URL` para a URL do backend

## 📁 Estrutura do Projeto

```
.
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilitários
│   └── public/          # Assets estáticos
├── server/              # Backend Node.js
│   ├── _core/          # Core do servidor
│   └── routers/        # tRPC routers
├── shared/             # Código compartilhado
└── drizzle/            # Schema do banco
```

## ✨ Features

### Portfólio

- ✅ Homepage responsiva e moderna
- ✅ Seção de projetos com filtros
- ✅ Depoimentos de clientes
- ✅ Formulário de contato
- ✅ Dark/Light mode
- ✅ Animações suaves
- ✅ SEO otimizado

### Portal do Cliente

- ✅ Autenticação segura
- ✅ Dashboard personalizado
- ✅ Gerenciamento de projetos
- ✅ Sistema de mensagens
- ✅ Entregas e aprovações
- ✅ Faturas e pagamentos
- ✅ Upload de arquivos

### Painel Admin

- ✅ CRUD completo de clientes
- ✅ Gerenciamento de projetos
- ✅ Upload de mídia (imagens/vídeos)
- ✅ Sistema de faturas
- ✅ Analytics e estatísticas

## 📞 Contato

**Matheus Auerswald**

- 📧 Email: matheusauerswald@gmail.com
- 📱 WhatsApp: (67) 98182-6022
- 📍 Campo Grande, MS

## 📄 Licença

MIT © 2025 Matheus Auerswald

---

**Desenvolvido com ❤️ por Matheus Auerswald**
