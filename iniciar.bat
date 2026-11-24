@echo off
chcp 65001 >nul
title Plataforma de Adopcion de Mascotas - Iniciador

:menu
cls
echo ======================================================================
echo    🐾 PLATAFORMA COLABORATIVA DE ADOPCION DE MASCOTAS (ESTADO ZULIA)
echo ======================================================================
echo.
echo [INFO] Tu direccion IP local en red LAN es: 192.168.1.200
echo [INFO] Los celulares conectados a tu misma red Wi-Fi podran conectarse directamente.
echo.
echo Selecciona como deseas iniciar el sistema:
echo.
echo  [1] Iniciar TODO (Backend API en puerto 4000 + Codigo QR para Celular)
echo  [2] Abrir en el Navegador Web (PC)
echo  [3] Iniciar SOLO el Backend API (Node.js + Express)
echo  [4] MOSTRAR CODIGO QR PARA EXPO GO (Escanear y abrir en el celular)
echo  [5] Salir
echo.
set /p opcion="Elige una opcion (1-5) y presiona Enter: "

if "%opcion%"=="1" goto start_all
if "%opcion%"=="2" goto start_web
if "%opcion%"=="3" goto start_backend
if "%opcion%"=="4" goto start_expogo
if "%opcion%"=="5" goto salir
goto menu

:start_all
echo.
echo [1/2] Iniciando Backend en ventana separada...
start "Backend API - Adopcion Mascotas" cmd /k "cd /d %~dp0backend && npm start"
echo [2/2] Generando Codigo QR para tu celular...
cd /d %~dp0frontend
call npx expo start
echo.
pause
goto menu

:start_web
echo.
echo Iniciando version Web en el navegador...
cd /d %~dp0frontend
call npx expo start --web
echo.
pause
goto menu

:start_backend
echo.
echo Iniciando Backend API en puerto 4000...
cd /d %~dp0backend
call npm start
echo.
pause
goto menu

:start_expogo
cls
echo ======================================================================
echo    📲 CODIGO QR PARA EXPO GO (ABRIR EN EL CELULAR)
echo ======================================================================
echo.
echo  Paso 1: Abre la aplicacion Expo Go en tu celular (Version 58.0.5).
echo  Paso 2: Toca en "Scan QR code".
echo  Paso 3: Enfoca el codigo QR grande que saldra a continuacion.
echo.
echo  Generando codigo QR...
echo.
cd /d %~dp0frontend
call npx expo start -c
echo.
pause
goto menu

:salir
exit
