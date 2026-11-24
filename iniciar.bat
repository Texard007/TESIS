@echo off
chcp 65001 >nul
title Plataforma de Adopcion de Mascotas - Iniciador
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
echo  [1] Iniciar TODO (Backend API en puerto 4000 + Frontend Expo SDK 58)
echo  [2] Iniciar SOLO el Frontend Expo (Para probar en el celular o web)
echo  [3] Iniciar SOLO el Backend API (Node.js + Express)
echo  [4] Generar archivo APK para instalar en el celular (EAS Build)
echo.
set /p opcion="Elige una opcion (1-4) y presiona Enter: "

if "%opcion%"=="1" goto start_all
if "%opcion%"=="2" goto start_frontend
if "%opcion%"=="3" goto start_backend
if "%opcion%"=="4" goto build_apk
goto start_all

:start_all
echo.
echo [1/2] Iniciando Backend en ventana separada...
start "Backend API - Adopcion Mascotas" cmd /k "cd /d %~dp0backend && npm start"
echo [2/2] Iniciando Frontend Expo con codigo QR...
cd /d %~dp0frontend
npx expo start -c
pause
exit

:start_frontend
echo.
echo Iniciando Frontend Expo...
cd /d %~dp0frontend
npx expo start -c
pause
exit

:start_backend
echo.
echo Iniciando Backend API...
cd /d %~dp0backend
npm start
pause
exit

:build_apk
echo.
echo ======================================================================
echo   COMPILACION DE APK PARA ANDROID (EAS BUILD EN LA NUBE)
echo ======================================================================
echo.
echo Se iniciara el asistente de compilacion en la nube de Expo.
echo Te pedira iniciar sesion con tu cuenta gratuita de https://expo.dev
echo.
cd /d %~dp0frontend
npx eas-cli build -p android --profile preview
pause
exit
