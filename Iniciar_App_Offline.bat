@echo off
title InGen Systems - Expedientes Jurasicos
cd /d "%~dp0"

echo ============================================================
echo   EXPEDIENTES JURASICOS - MODO APLICACION OFFLINE
echo   Iniciando servidor local InGen...
echo ============================================================

:: Iniciar servidor silencioso en segundo plano
start /B "" python -m http.server 8080 --bind 127.0.0.1 >nul 2>&1

:: Esperar brevemente a que el servidor este listo
timeout /t 1 /nobreak >nul

:: Abrir en Microsoft Edge o Chrome en modo App nativo (sin barra de navegacion)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="http://127.0.0.1:8080/index.html"
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://127.0.0.1:8080/index.html"
) else (
    start http://127.0.0.1:8080/index.html
)
exit
