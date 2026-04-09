@echo off
setlocal

cd /d %~dp0

start "My Darrin Client" cmd /k "cd /d %~dp0mobile-client && npm install && npx expo start"
start "My Darrin Partner" cmd /k "cd /d %~dp0mobile-partner && npm install && npx expo start --port 8082"
