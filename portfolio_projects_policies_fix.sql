-- =====================================================
-- CORREÇÃO: Políticas de RLS para Portfolio Projects
-- =====================================================
-- Este script corrige as políticas para permitir
-- operações de CRUD sem necessidade de autenticação
-- =====================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Permitir SELECT público em projetos publicados" ON portfolio_projects;
DROP POLICY IF EXISTS "Admin pode ver todos os projetos" ON portfolio_projects;
DROP POLICY IF EXISTS "Permitir INSERT autenticado em projetos" ON portfolio_projects;
DROP POLICY IF EXISTS "Permitir UPDATE autenticado em projetos" ON portfolio_projects;
DROP POLICY IF EXISTS "Permitir DELETE autenticado em projetos" ON portfolio_projects;

-- =====================================================
-- NOVAS POLÍTICAS PERMISSIVAS
-- =====================================================

-- 1. SELECT: Qualquer um pode ler projetos publicados
CREATE POLICY "Allow public read published projects"
ON portfolio_projects FOR SELECT
USING (is_published = true);

-- 2. SELECT: Permitir ler todos os projetos (incluindo não publicados)
-- Útil para o admin
CREATE POLICY "Allow read all projects"
ON portfolio_projects FOR SELECT
USING (true);

-- 3. INSERT: Permitir criar projetos sem autenticação
CREATE POLICY "Allow insert projects"
ON portfolio_projects FOR INSERT
WITH CHECK (true);

-- 4. UPDATE: Permitir atualizar projetos sem autenticação
CREATE POLICY "Allow update projects"
ON portfolio_projects FOR UPDATE
USING (true)
WITH CHECK (true);

-- 5. DELETE: Permitir deletar projetos sem autenticação
CREATE POLICY "Allow delete projects"
ON portfolio_projects FOR DELETE
USING (true);

-- =====================================================
-- ALTERNATIVA: Desabilitar RLS completamente
-- =====================================================
-- Se preferir desabilitar RLS na tabela (mais simples):
-- Descomente a linha abaixo e execute:

-- ALTER TABLE portfolio_projects DISABLE ROW LEVEL SECURITY;

-- Para reabilitar depois:
-- ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

