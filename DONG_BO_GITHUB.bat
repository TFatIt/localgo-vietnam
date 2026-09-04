@echo off
chcp 65001 >nul
title Dong bo LocalGo Vietnam len GitHub
echo ========================================================
echo        DONG BO DU AN LOCALGO VIETNAM LEN GITHUB
echo ========================================================
echo.

:: Dung MinGit da cai tai C:\localgo-dev\git
set GIT=C:\localgo-dev\git\cmd\git.exe

:: Kiem tra MinGit ton tai
if not exist "%GIT%" (
    echo [LOI] Khong tim thay MinGit tai: %GIT%
    echo Vui long kiem tra lai hoac dung lenh: git.exe neu da cai Git chinh thuc.
    pause
    exit /b 1
)

:: Cau hinh remote neu chua co
%GIT% remote -v | findstr "origin" >nul
if %errorlevel% neq 0 (
    %GIT% remote add origin https://github.com/TFatIt/localgo-vietnam.git
    echo Da cau hinh remote: https://github.com/TFatIt/localgo-vietnam.git
)

echo [1/3] Dang kiem tra thay doi...
%GIT% status --short

echo.
echo [2/3] Dang commit cac thay doi moi nhat...
%GIT% add .

%GIT% commit -m "feat: sync local changes - %date% %time:~0,5% (Web, Android, iOS support)" 2>nul
if %errorlevel% equ 0 (
    echo Da commit thanh cong.
) else (
    echo Khong co thay doi moi de commit. Bo qua buoc nay.
)

echo.
echo [3/3] Dang day code len GitHub (git push origin main)...
echo Neu trinh duyet bat len, vui long bam "Sign in with your browser" de xac thuc GitHub.
echo.
%GIT% push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  Hoan tat! Code da duoc day len GitHub thanh cong!
    echo  https://github.com/TFatIt/localgo-vietnam
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  [CANH BAO] Push co the that bai. Kiem tra:
    echo  1. Ket noi internet
    echo  2. Dang nhap GitHub tren trinh duyet
    echo  3. Quyen write tren repo
    echo ========================================================
)
pause
