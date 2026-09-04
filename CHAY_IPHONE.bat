@echo off
chcp 65001 >nul
title LocalGo Vietnam - Chay tren iPhone (Expo Go)
echo ========================================================
echo       DANG KHOI DONG LOCALGO CHO IPHONE (EXPO GO)
echo ========================================================
echo [1/2] Dang bat Backend API (Port 5000)...
start "LocalGo Backend (Port 5000)" cmd /k "chcp 65001 >nul && cd /d %~dp0backend && npm run dev"

echo [2/2] Dang bat Metro Bundler cho iOS...
start "LocalGo iPhone (Port 8081)" cmd /k "chcp 65001 >nul && cd /d C:\localgo-dev\mobile && npx expo start"

timeout /t 3 >nul
start "" "%~dp0QUET_MA_EXPO.html"
echo ========================================================
echo Da mo trang ma QR chuan tren trinh duyet!
echo Mo app Camera tren iPhone de quet ma hoac nhap:
echo exp://192.168.10.148:8081
echo ========================================================
pause
