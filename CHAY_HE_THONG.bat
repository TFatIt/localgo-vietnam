@echo off
chcp 65001 >nul
title Khoi dong LocalGo Vietnam
echo ========================================================
echo       DANG KHOI DONG HE THONG LOCALGO VIETNAM
echo ========================================================
echo [1/2] Dang bat Backend API (Port 5000)...
start "LocalGo - Backend (Port 5000)" cmd /k "chcp 65001 >nul && title LocalGo Backend && cd /d d:\vinut-IT08\Downloads\localgo-vietnam-main\backend && npm run dev"

echo [2/2] Dang bat Expo Mobile (Port 8081)...
start "LocalGo - Mobile Expo (Port 8081)" cmd /k "chcp 65001 >nul && title LocalGo Mobile Expo && cd /d C:\localgo-dev\mobile && npx expo start"

echo ========================================================
echo Da khoi dong 2 cua so Terminal rieng biet tren man hinh!
echo - Cua so 1: Backend API (Port 5000)
echo - Cua so 2: Mobile Expo (Port 8081) co ma QR
echo ========================================================
pause
