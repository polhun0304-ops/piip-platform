@echo off
cd /d "%~dp0packages\backend"
echo PIIP 백엔드 서버를 시작합니다...
echo 포트: 4000
echo.
call npm run dev

