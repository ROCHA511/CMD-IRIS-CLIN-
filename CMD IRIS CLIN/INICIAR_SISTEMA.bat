@echo off
title IrisClin - Inicializador Inteligente
color 0B
cls

echo ======================================================================
echo               IRISCLIN - INTELIGENCIA RELACIONAL INTEGRADA
echo                   INICIALIZADOR DO SERVIDOR LOCAL
echo ======================================================================
echo.

:: Detect if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js nao foi localizado no seu sistema!
    echo Por favor, instale o Node.js LTS em https://nodejs.org/ e tente novamente.
    echo.
    pause
    exit /b
)

:: Check where the project files (package.json) are located
set "PROJECT_DIR=%~dp0"
if not exist "%PROJECT_DIR%package.json" (
    :: Try parent directory (if running from inside /CMD IRIS CLIN/)
    set "PROJECT_DIR=%~dp0..\"
)

if not exist "%PROJECT_DIR%package.json" (
    echo [ERRO] O arquivo 'package.json' do projeto nao foi localizado!
    echo Garanta que voce extraiu a pasta completa do projeto e esta executando
    echo este script dentro da estrutura do IrisClin.
    echo.
    pause
    exit /b
)

cd /d "%PROJECT_DIR%"
echo [SUCESSO] Diretorio do projeto localizado em: "%PROJECT_DIR%"
echo.

:: Create a local .env file if it doesn't exist
if not exist ".env" (
    echo [INFO] Criando arquivo de configuracao .env padrao...
    echo GEMINI_API_KEY=> .env
)

:: Check if node_modules folder exists, if not run npm install
if not exist "node_modules\" (
    echo [INFO] Primeira execucao detectada. Instalando dependencias do projeto...
    echo Isso pode levar alguns instantes, por favor aguarde...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar as dependencias via npm. Verifique sua conexao.
        pause
        exit /b
    )
)

:: Start the server and launch the browser
echo [INFO] Iniciando o servidor do IrisClin...
start "" http://localhost:3000
call npm run dev

pause
