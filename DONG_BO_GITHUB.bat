@echo off
chcp 65001 >nul
title Dong bo LocalGo Vietnam len GitHub
echo ========================================================
echo        DONG BO DU AN LOCALGO VIETNAM LEN GITHUB
echo ========================================================
echo.

set GIT_PATH=C:\localgo-dev\git\cmd\git.exe
if not exist "%GIT_PATH%" set GIT_PATH=git

"%GIT_PATH%" remote -v | findstr "origin" >nul
if %errorlevel% neq 0 (
    echo Chua cau hinh link GitHub Repository!
    echo Vui long dan link Repository GitHub cua ban (Vi du: https://github.com/username/localgo-vietnam.git):
    set /p REPO_URL="URL: "
    "%GIT_PATH%" remote add origin %REPO_URL%
    echo Da them remote origin!
)

echo.
echo [1/3] Dang kiem tra thay doi...
"%GIT_PATH%" add .

echo [2/3] Dang commit cac thay doi moi nhat...
set /p COMMIT_MSG="Nhap noi dung commit (hoac Enter de dung mac dinh): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=update: cap nhat ma nguon LocalGo Vietnam
"%GIT_PATH%" commit -m "%COMMIT_MSG%"

echo.
echo [3/3] Dang day code len GitHub (git push -u origin main)...
"%GIT_PATH%" push -u origin main

echo.
echo ========================================================
echo Hoan tat qua trinh dong bo!
echo ========================================================
pause
