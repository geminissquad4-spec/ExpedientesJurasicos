@echo off
title InGen Systems - Expedientes Jurasicos
cd /d "%~dp0"

echo ============================================================
echo   EXPEDIENTES JURASICOS - MODO APLICACION OFFLINE
echo   Iniciando servidor local InGen...
echo ============================================================

:: Iniciar servidor silencioso en segundo plano si no esta activo
start /B "" python -m http.server 8080 --bind 127.0.0.1 >nul 2>&1

:: Esperar brevemente a que el servidor este listo
timeout /t 1 /nobreak >nul

:: Abrir prioritariamente en Google Chrome o Edge en modo App nativo (sin barra de navegacion)
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:8080/index.html"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app="http://localhost:8080/index.html"
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:8080/index.html"
) else (
    start http://localhost:8080/index.html
)
exit
