@echo off
chcp 65001 >nul
title Dong bo LocalGo Vietnam len GitHub
echo ========================================================
echo        DONG BO DU AN LOCALGO VIETNAM LEN GITHUB
echo ========================================================
echo.

set PATH=C:\localgo-dev\git\cmd;%PATH%

git remote -v | findstr "origin" >nul
if %errorlevel% neq 0 (
    git remote add origin https://github.com/TFatIt/localgo-vietnam.git
    echo Da cau hinh remote: https://github.com/TFatIt/localgo-vietnam.git
)

echo [1/3] Dang kiem tra thay doi...
git add .

echo [2/3] Dang commit cac thay doi moi nhat...
git commit -m "feat: sync local changes with GitHub (Web, Android Studio, and iOS support)" 2>nul

echo.
echo [3/3] Dang day code len GitHub (git push origin main)...
echo Neu trinh duyet bat len, vui long bam "Sign in with your browser" de xac thuc GitHub.
echo.
git push -u origin main

echo.
echo ========================================================
echo Hoan tat qua trinh dong bo!
echo ========================================================
pause
