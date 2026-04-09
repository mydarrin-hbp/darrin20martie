@echo off
setlocal

cd /d %~dp0

echo [1/4] Installing mobile-client dependencies...
cd /d %~dp0mobile-client
npm.cmd install
if errorlevel 1 exit /b 1
npm.cmd ls --depth=0 > nul
if errorlevel 1 exit /b 1

echo [2/4] Installing mobile-partner dependencies...
cd /d %~dp0mobile-partner
npm.cmd install
if errorlevel 1 exit /b 1
npm.cmd ls --depth=0 > nul
if errorlevel 1 exit /b 1

cd /d %~dp0
echo [3/4] Mobile dependencies verified.
echo [4/4] Ready for Expo or EAS build.
