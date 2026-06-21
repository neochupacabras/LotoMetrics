@echo off
REM Inicia o servidor de desenvolvimento do LotoMetrics e abre o navegador
REM automaticamente. Deixe este arquivo dentro da pasta loterias-web
REM (no mesmo nivel do package.json).

cd /d "%~dp0"

echo Iniciando o servidor de desenvolvimento...
start "LotoMetrics - Servidor (nao feche esta janela)" cmd /k npm run dev

echo Aguardando o servidor subir...
timeout /t 5 /nobreak >nul

start "" http://localhost:3000

echo.
echo Pronto. O navegador deve ter aberto em http://localhost:3000
echo Se a pagina nao carregar de primeira, espere mais alguns segundos e atualize.
echo Para parar o servidor, feche a outra janela (a do "npm run dev").
