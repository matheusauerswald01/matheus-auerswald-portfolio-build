#!/usr/bin/env node

/**
 * Script de Teste de Conexão com o Banco de Dados
 * Verifica se todas as configurações estão corretas
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cores para console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
};

function log(color, symbol, message) {
    console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function success(message) {
    log(colors.green, '✓', message);
}

function error(message) {
    log(colors.red, '✗', message);
}

function warning(message) {
    log(colors.yellow, '⚠', message);
}

function info(message) {
    log(colors.cyan, 'ℹ', message);
}

function header(message) {
    console.log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}\n`);
}

async function main() {
    console.log('\n🚀 Iniciando verificação do banco de dados...\n');

    let hasErrors = false;
    let hasWarnings = false;

    // 1. Verificar arquivo .env.local
    header('1. Verificando arquivo .env.local');

    const envPath = join(dirname(__dirname), '.env.local');
    if (!existsSync(envPath)) {
        error('.env.local não encontrado!');
        error('Crie o arquivo .env.local na raiz do projeto');
        info('Use o arquivo env.example como referência');
        hasErrors = true;
    } else {
        success('.env.local encontrado');

        // Ler e verificar conteúdo
        const envContent = readFileSync(envPath, 'utf-8');

        // Verificar variáveis obrigatórias
        const requiredVars = [
            'VITE_SUPABASE_URL',
            'VITE_SUPABASE_ANON_KEY',
        ];

        for (const varName of requiredVars) {
            const regex = new RegExp(`${varName}=(.+)`);
            const match = envContent.match(regex);

            if (!match || !match[1] || match[1].trim() === '') {
                error(`${varName} não está configurada`);
                hasErrors = true;
            } else {
                success(`${varName} configurada`);
            }
        }
    }

    // 2. Carregar variáveis de ambiente
    header('2. Carregando variáveis de ambiente');

    if (existsSync(envPath)) {
        const envContent = readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([A-Z_]+)=(.+)$/);
            if (match) {
                process.env[match[1]] = match[2].trim();
            }
        });
        success('Variáveis carregadas');
    }

    // 3. Verificar conexão com Supabase
    header('3. Testando conexão com Supabase');

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        error('Credenciais do Supabase não encontradas');
        hasErrors = true;
    } else {
        try {
            info(`URL: ${supabaseUrl.substring(0, 30)}...`);

            const supabase = createClient(supabaseUrl, supabaseKey);

            // Testar conexão
            const { data, error: testError } = await supabase
                .from('analytics_visitors')
                .select('count')
                .limit(1);

            if (testError) {
                error(`Erro na conexão: ${testError.message}`);
                hasErrors = true;
            } else {
                success('Conexão bem-sucedida!');
            }
        } catch (err) {
            error(`Erro ao conectar: ${err.message}`);
            hasErrors = true;
        }
    }

    // 4. Verificar tabelas
    header('4. Verificando tabelas do banco');

    if (supabaseUrl && supabaseKey && !hasErrors) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const tables = [
            'analytics_visitors',
            'contact_messages',
            'meta_pixel_config',
            'projects',
        ];

        for (const table of tables) {
            try {
                const { error: tableError } = await supabase
                    .from(table)
                    .select('count')
                    .limit(1);

                if (tableError) {
                    error(`Tabela '${table}' não encontrada ou sem permissão`);
                    warning('Execute o script supabase-schema.sql no SQL Editor');
                    hasErrors = true;
                } else {
                    success(`Tabela '${table}' OK`);
                }
            } catch (err) {
                error(`Erro ao verificar '${table}': ${err.message}`);
                hasErrors = true;
            }
        }
    }

    // 5. Testar inserção de dados
    header('5. Testando inserção de dados');

    if (supabaseUrl && supabaseKey && !hasErrors) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        try {
            // Testar insert em analytics_visitors
            const testData = {
                timestamp: Date.now(),
                session_id: 'test_' + Date.now(),
                page: '/test',
                referrer: 'test-script',
                user_agent: 'Test Script',
                screen_resolution: '1920x1080',
                language: 'pt-BR',
            };

            const { error: insertError } = await supabase
                .from('analytics_visitors')
                .insert([testData]);

            if (insertError) {
                error(`Erro ao inserir: ${insertError.message}`);
                warning('Verifique as políticas RLS no Supabase');
                hasWarnings = true;
            } else {
                success('Inserção de dados funcionando');

                // Limpar dados de teste
                await supabase
                    .from('analytics_visitors')
                    .delete()
                    .eq('session_id', testData.session_id);
            }
        } catch (err) {
            error(`Erro no teste de inserção: ${err.message}`);
            hasWarnings = true;
        }
    }

    // 6. Verificar configurações opcionais
    header('6. Verificando configurações opcionais');

    const optionalVars = [
        'VITE_GA_MEASUREMENT_ID',
        'VITE_GTM_ID',
        'VITE_META_PIXEL_ID',
        'VITE_ADMIN_PASSWORD',
    ];

    for (const varName of optionalVars) {
        if (process.env[varName]) {
            success(`${varName} configurada`);
        } else {
            warning(`${varName} não configurada (opcional)`);
        }
    }

    // 7. Resultado final
    header('Resultado da Verificação');

    if (hasErrors) {
        error('Verificação falhou! Corrija os erros acima.');
        console.log('\n📚 Consulte: CONFIGURACAO_COMPLETA.md');
        process.exit(1);
    } else if (hasWarnings) {
        warning('Verificação concluída com avisos');
        console.log('\n⚠️  Algumas funcionalidades podem não estar disponíveis');
        process.exit(0);
    } else {
        success('Tudo configurado corretamente! 🎉');
        console.log('\n✅ Seu banco de dados está pronto para uso!');
        console.log('📊 Dados serão salvos no Supabase');
        console.log('🚀 Execute: pnpm run dev\n');
        process.exit(0);
    }
}

// Executar
main().catch(err => {
    error(`Erro fatal: ${err.message}`);
    process.exit(1);
});

