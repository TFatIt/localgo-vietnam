@echo off
chcp 65001 >nul
title LocalGo Vietnam - Chay tren Web
echo ========================================================
echo       DANG KHOI DONG LOCALGO VIETNAM TREN WEB
echo ========================================================
echo [1/2] Dang bat Backend API (Port 5000)...
start "LocalGo Backend (Port 5000)" cmd /k "chcp 65001 >nul && cd /d %~dp0backend && npm run dev"

echo [2/2] Dang bat Web Server (Port 8081)...
start "LocalGo Web (Port 8081)" cmd /k "chcp 65001 >nul && cd /d C:\localgo-dev\mobile && npx expo start --web"

timeout /t 5 >nul
start http://localhost:8081
echo ========================================================
echo Da mo trinh duyet tai: http://localhost:8081
echo Ban co the trai nghiem truc tiep tren Web ngay bay gio!
echo ========================================================
