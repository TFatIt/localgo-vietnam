@echo off
chcp 65001 >nul
:MENU
cls
title Trinh dieu khien khoi dong LocalGo Vietnam
echo ========================================================
echo        LOCALGO VIETNAM - CROSS-PLATFORM LAUNCHER
echo ========================================================
echo.
echo   [1] Chay tren WEB (Google Chrome / Edge)
echo   [2] Chay tren ANDROID STUDIO (May ao Emulator / Thiet bi)
echo   [3] Chay tren IPHONE (App Expo Go / Ma QR)
echo   [4] Chay toan bo Backend API + Mobile Server
echo   [0] Thoat
echo.
echo ========================================================
set /p choice="Nhap lua chon cua ban (1-4, hoac 0): "

if "%choice%"=="1" goto WEB
if "%choice%"=="2" goto ANDROID
if "%choice%"=="3" goto IPHONE
if "%choice%"=="4" goto ALL
if "%choice%"=="0" exit
goto MENU

:WEB
call "%~dp0CHAY_WEB.bat"
goto END

:ANDROID
call "%~dp0CHAY_ANDROID.bat"
goto END

:IPHONE
call "%~dp0CHAY_IPHONE.bat"
goto END

:ALL
call "%~dp0CHAY_HE_THONG.bat"
goto END

:END
