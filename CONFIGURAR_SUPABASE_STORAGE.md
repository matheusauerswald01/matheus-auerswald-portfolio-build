# 🗄️ Configuração do Supabase Storage

## 📋 Objetivo

Configurar o bucket de armazenamento para os arquivos do Portal do Cliente.

## 🚀 Passo a Passo

### 1. Acessar o Painel do Supabase

1. Abra o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**

### 2. Criar o Bucket

1. Clique em **Create a new bucket**
2. Preencha os dados:
   ```
   Name: portal-files
   Public bucket: NÃO (deixar desmarcado) ⚠️
   File size limit: 52428800 (50 MB)
   Allowed MIME types: Deixar vazio (aceitar todos) ou especificar
   ```

3. Clique em **Create bucket**

### 3. Configurar Políticas de Segurança (RLS)

No bucket `portal-files`, clique em **Policies** e adicione as seguintes políticas:

#### Política 1: Clientes podem fazer upload

```sql
CREATE POLICY "Clients can upload files to their projects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portal-files' AND
  (storage.foldername(name))[1] = 'projects' AND
  -- Verificar se o projeto pertence ao cliente
  (storage.foldername(name))[2] IN (
    SELECT p.id::text
    FROM portal_projects p
    JOIN portal_clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  )
);
```

#### Política 2: Clientes podem ver seus arquivos

```sql
CREATE POLICY "Clients can view their project files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portal-files' AND
  (storage.foldername(name))[1] = 'projects' AND
  (storage.foldername(name))[2] IN (
    SELECT p.id::text
    FROM portal_projects p
    JOIN portal_clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  )
);
```

#### Política 3: Clientes podem baixar seus arquivos

```sql
CREATE POLICY "Clients can download their project files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portal-files' AND
  (storage.foldername(name))[1] = 'projects' AND
  (storage.foldername(name))[2] IN (
    SELECT p.id::text
    FROM portal_projects p
    JOIN portal_clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  )
);
```

#### Política 4: Admin pode fazer tudo

```sql
CREATE POLICY "Admin has full access"
ON storage.objects
TO authenticated
USING (
  bucket_id = 'portal-files' AND
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'portal-files' AND
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);
```

### 4. Estrutura de Pastas

Os arquivos serão organizados automaticamente nesta estrutura:

```
portal-files/
├── projects/
│   ├── {project_id}/
│   │   ├── 1234567890_documento.pdf
│   │   ├── 1234567891_imagem.jpg
│   │   └── tasks/
│   │       └── {task_id}/
│   │           └── 1234567892_arquivo.zip
│   └── {project_id_2}/
│       └── ...
```

### 5. Tipos de Arquivo Permitidos (Opcional)

Se quiser restringir os tipos de arquivo, configure no bucket:

```
Allowed MIME types:
- image/*
- application/pdf
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document
- application/vnd.ms-excel
- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- text/*
- video/mp4
- video/webm
- application/zip
- application/x-zip-compressed
```

### 6. Configurar CORS (Se Necessário)

Se estiver tendo problemas com CORS, adicione no Supabase:

1. Vá em **Settings** → **API**
2. Em **CORS Origins**, adicione:
   ```
   http://localhost:3000
   https://seu-dominio.com
   ```

### 7. Variáveis de Ambiente

Certifique-se de que seu `.env.local` tem:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

### 8. Testar o Upload

Execute este código no console do navegador após fazer login:

```javascript
// Testar upload
const testUpload = async () => {
  const { data, error } = await supabase.storage
    .from('portal-files')
    .upload('test/arquivo-teste.txt', new Blob(['Teste de upload']), {
      cacheControl: '3600',
      upsert: false,
    });

  console.log('Upload test:', { data, error });
};

testUpload();
```

Se retornar `data` sem `error`, está funcionando! ✅

### 9. Monitoramento

Para ver os arquivos enviados:

1. Vá em **Storage** → **portal-files**
2. Navegue pelas pastas
3. Veja tamanho, data de upload, etc.

### 10. Limpeza (Opcional)

Para excluir arquivos antigos automaticamente, crie uma Edge Function:

```javascript
// functions/cleanup-old-files/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { data: files } = await supabaseAdmin.storage
    .from('portal-files')
    .list('projects', { limit: 1000 });

  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  for (const file of files) {
    if (new Date(file.created_at).getTime() < thirtyDaysAgo) {
      await supabaseAdmin.storage
        .from('portal-files')
        .remove([file.name]);
    }
  }

  return new Response(JSON.stringify({ cleaned: files.length }));
});
```

## ✅ Verificação Final

- [ ] Bucket `portal-files` criado
- [ ] Políticas RLS configuradas
- [ ] CORS configurado (se necessário)
- [ ] Variáveis de ambiente definidas
- [ ] Teste de upload funcionando
- [ ] Arquivos aparecem no portal

## 🚨 Problemas Comuns

### Erro: "permission denied"
- **Causa:** Políticas RLS incorretas
- **Solução:** Revise as políticas acima

### Erro: "CORS policy"
- **Causa:** Origem não permitida
- **Solução:** Configure CORS no Supabase Settings → API

### Arquivos não aparecem
- **Causa:** Caminho incorreto ou permissões
- **Solução:** Verifique a estrutura de pastas e políticas

### Upload muito lento
- **Causa:** Arquivo muito grande
- **Solução:** Comprima o arquivo ou aumente o limite

## 📚 Recursos

- [Documentação Supabase Storage](https://supabase.com/docs/guides/storage)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)

---

**Configuração concluída!** 🎉

Seus clientes agora podem fazer upload e gerenciar arquivos no portal.


