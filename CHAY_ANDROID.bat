@echo off
chcp 65001 >nul
title LocalGo Vietnam - Chay tren Android Studio
echo ========================================================
echo   DANG KHOI DONG LOCALGO CHO ANDROID STUDIO / EMULATOR
echo ========================================================
echo [1/2] Dang bat Backend API (Port 5000)...
start "LocalGo Backend (Port 5000)" cmd /k "chcp 65001 >nul && cd /d %~dp0backend && npm run dev"

echo [2/2] Dang ket noi Android Studio Emulator / Thiet bi...
start "LocalGo Android (Port 8081)" cmd /k "chcp 65001 >nul && cd /d C:\localgo-dev\mobile && npx expo start --android"

echo ========================================================
echo Luu y: Hay mo san may ao Android (Android Studio Emulator)
echo hoac cam cap dien thoai Android bat USB Debugging.
echo ========================================================
pause
