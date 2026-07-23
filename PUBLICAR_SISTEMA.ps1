# ======================================================================
# ÍRISCLIN ENTERPRISE - UTILITÁRIO DE PUBLICAÇÃO & DEPLOY AUTOMÁTICO
# ======================================================================
# Este script automatiza o push para o GitHub, deploy na Vercel,
# e configuração do banco do Supabase de forma 100% interativa.
# ======================================================================

Clear-Host
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                 ÍRISCLIN ENTERPRISE DEPLOY TOOL                      " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Este utilitário automatiza a publicação do sistema ÍrisClin." -ForegroundColor White
Write-Host "----------------------------------------------------------------------" -ForegroundColor Gray

function Menu-Principal {
    Write-Host "`nEscolha uma opção para continuar:" -ForegroundColor Yellow
    Write-Host "1) 🚀 Publicar no GitHub (Criar repositório e enviar código)" -ForegroundColor White
    Write-Host "2) ☁️ Configurar Banco de Dados no Supabase (Instruções da Migration)" -ForegroundColor White
    Write-Host "3) ⚡ Deploy na Vercel (Hospedar frontend e backend em produção)" -ForegroundColor White
    Write-Host "4) 🟢 Rodar Servidor Local (Ambiente de Testes)" -ForegroundColor White
    Write-Host "5) ❌ Sair" -ForegroundColor White
    
    $opcao = Read-Host "`nDigite o número da opção desejada"
    
    switch ($opcao) {
        "1" { Publicar-GitHub }
        "2" { Mostrar-Supabase }
        "3" { Deploy-Vercel }
        "4" { Iniciar-Local }
        "5" { Exit }
        default { 
            Write-Host "`nOpção inválida! Tente novamente." -ForegroundColor Red
            Menu-Principal
        }
    }
}

function Publicar-GitHub {
    Write-Host "`n--- PUBLICAÇÃO NO GITHUB ---" -ForegroundColor Yellow
    Write-Host "Para enviar o código para o GitHub, você precisa primeiro criar um repositório vazio no site github.com." -ForegroundColor White
    
    $url = Read-Host "`nCole a URL do seu repositório do GitHub (ex: https://github.com/seu-usuario/seu-repo.git)"
    
    if ([string]::IsNullOrWhiteSpace($url)) {
        Write-Host "URL inválida!" -ForegroundColor Red
        Menu-Principal
        return
    }

    Write-Host "`nConfigurando repositório remoto..." -ForegroundColor Gray
    
    # Remove remote antigo se existir
    git remote remove origin 2>$null
    
    # Adiciona novo remote
    git remote add origin $url
    
    Write-Host "Enviando arquivos para a branch 'main' no GitHub..." -ForegroundColor Cyan
    Write-Host "Insira suas credenciais do GitHub se solicitado na tela." -ForegroundColor Yellow
    
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nSucesso! Seu projeto foi publicado com sucesso no GitHub na branch 'main'!" -ForegroundColor Green
        Write-Host "O workflow de CI/CD do GitHub Actions agora verificará seus builds automaticamente a cada commit." -ForegroundColor Gray
    } else {
        Write-Host "`nFalha ao enviar o repositório. Verifique a URL e suas credenciais de login e tente novamente." -ForegroundColor Red
    }
    
    Read-Host "`nPressione Enter para voltar ao menu..."
    Menu-Principal
}

function Mostrar-Supabase {
    Write-Host "`n--- CONFIGURAÇÃO DO BANCO SUPABASE ---" -ForegroundColor Yellow
    Write-Host "As tabelas do ÍrisClin estão 100% isoladas com o prefixo 'iris_' para garantir que NUNCA colidam" -ForegroundColor White
    Write-Host "com tabelas do sistema MANUTENÇÃO DI CASA caso usem o mesmo banco de dados." -ForegroundColor White
    Write-Host "`nPara carregar o banco de dados na nuvem:" -ForegroundColor Gray
    Write-Host "1. Acesse o painel do seu projeto no Supabase (app.supabase.com)." -ForegroundColor White
    Write-Host "2. Vá na seção 'SQL Editor' no menu lateral esquerdo." -ForegroundColor White
    Write-Host "3. Clique em 'New Query' (Nova consulta)." -ForegroundColor White
    Write-Host "4. Copie todo o conteúdo do arquivo:" -ForegroundColor White
    Write-Host "   [supabase/migrations/20260723_init_database.sql]" -ForegroundColor Cyan
    Write-Host "5. Cole no editor SQL do Supabase e clique em 'RUN' (Executar)." -ForegroundColor White
    Write-Host "`nPronto! O banco de dados estará configurado com todas as tabelas prefixadas, RLS e índices de performance." -ForegroundColor Green
    
    Read-Host "`nPressione Enter para voltar ao menu..."
    Menu-Principal
}

function Deploy-Vercel {
    Write-Host "`n--- DEPLOY NA VERCEL ---" -ForegroundColor Yellow
    Write-Host "Certifique-se de ter a ferramenta Vercel CLI instalada globalmente (npm install -g vercel)." -ForegroundColor White
    
    $checkVercel = Get-Command vercel -ErrorAction SilentlyContinue
    if (-not $checkVercel) {
        Write-Host "Vercel CLI não encontrada. Deseja instalar agora automaticamente? (S/N)" -ForegroundColor Yellow
        $instalar = Read-Host
        if ($instalar.ToLower() -eq 's') {
            Write-Host "Instalando Vercel CLI via npm..." -ForegroundColor Gray
            npm install -g vercel
        } else {
            Write-Host "Cancelado pelo usuário. Você pode subir as pastas 'dist' e 'vercel.json' direto no site vercel.com após fazer o push do GitHub." -ForegroundColor Red
            Read-Host "`nPressione Enter para voltar ao menu..."
            Menu-Principal
            return
        }
    }

    Write-Host "`nIniciando deploy na Vercel..." -ForegroundColor Cyan
    Write-Host "Faça login no painel da Vercel se solicitado." -ForegroundColor Yellow
    
    # Roda primeiro build para garantir que a Vercel sirva o compilado recente
    Write-Host "Rodando build de produção local..." -ForegroundColor Gray
    npm run build
    
    # Executa o deploy da Vercel
    vercel deploy --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nSucesso! O sistema ÍrisClin foi implantado na Vercel!" -ForegroundColor Green
        Write-Host "Lembre-se de configurar as variáveis de ambiente (VITE_SUPABASE_URL, GEMINI_API_KEY, etc.) no painel da Vercel." -ForegroundColor Yellow
    } else {
        Write-Host "`nFalha no deploy. Verifique os logs acima." -ForegroundColor Red
    }
    
    Read-Host "`nPressione Enter para voltar ao menu..."
    Menu-Principal
}

function Iniciar-Local {
    Write-Host "`n--- INICIANDO SERVIDOR LOCAL ---" -ForegroundColor Yellow
    Write-Host "O sistema ficará acessível localmente em http://localhost:3000" -ForegroundColor Gray
    Write-Host "Pressione CTRL+C no console para parar o servidor." -ForegroundColor Red
    Write-Host "----------------------------------------------------------------------" -ForegroundColor Gray
    
    npm run dev
}

# Inicia o script
Menu-Principal
