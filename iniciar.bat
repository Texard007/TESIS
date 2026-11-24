@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Plataforma de Adopcion de Mascotas - Iniciador

:menu
cls
echo ======================================================================
echo    PLATAFORMA COLABORATIVA DE ADOPCION DE MASCOTAS (ESTADO ZULIA)
echo ======================================================================
echo.
echo [INFO] Tu direccion IP local en red LAN es: 192.168.1.200
echo [INFO] Los celulares conectados a tu misma red Wi-Fi podran conectarse.
echo.
echo ======================================================================
echo                            MENU DE OPCIONES
echo ======================================================================
echo.
echo  [1] Iniciar Servidores (Backend API :4000 + Servidor para Celular)
echo  [2] Abrir en el Navegador Web (PC)
echo  [3] Iniciar SOLO el Backend API (Node.js + Express)
echo  [4] Instalar la aplicacion en el celular mediante Codigo QR
echo  [5] Salir
echo.
echo ======================================================================
set "opcion="
set /p opcion="Elige una opcion (1-5) y presiona Enter: "

if "%opcion%"=="1" goto start_all
if "%opcion%"=="2" goto start_web
if "%opcion%"=="3" goto start_backend
if "%opcion%"=="4" goto start_instalar
if "%opcion%"=="5" goto salir
goto menu

:start_all
echo.
echo [1/2] Iniciando Backend en ventana separada...
start "Backend API - Adopcion Mascotas" cmd /k "cd /d \"%~dp0backend\" && npm.cmd start"
echo [2/2] Iniciando servidor para celular...
cd /d "%~dp0frontend"
call npx.cmd expo start -c
echo.
pause
goto menu

:start_web
echo.
echo Iniciando version Web en el navegador...
cd /d "%~dp0frontend"
call npx.cmd expo start --web
echo.
pause
goto menu

:start_backend
echo.
echo Iniciando Backend API en puerto 4000...
cd /d "%~dp0backend"
call npm.cmd start
echo.
pause
goto menu

:start_instalar
cls
chcp 65001 >nul
call node "%~dp0scripts\show_apk_qr.js"
echo.
echo ======================================================================
echo  [E] Si deseas iniciar el servidor Metro para Expo Go (v58.0.5)
echo  [M] Volver al menu principal
echo ======================================================================
set "subopt="
set /p subopt="Opcion (E o presiona Enter para menu): "
if /i "%subopt%"=="E" goto start_expogo
goto menu

:start_expogo
cls
echo ======================================================================
echo    CODIGO QR PARA EXPO GO (SDK 58 / REACT NATIVE 0.88)
echo ======================================================================
echo.
echo  1. Abre la app Expo Go en tu celular (Version 58.0.5).
echo  2. Toca en "Scan QR code".
echo  3. Escanea el codigo QR que aparecera a continuacion:
echo.
cd /d "%~dp0frontend"
call npx.cmd expo start -c
echo.
pause
goto menu

:salir
exit
