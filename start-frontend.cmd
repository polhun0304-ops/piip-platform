@echo off
setlocal
set PORT=5173

:: Check if Vite server is running
powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:%PORT% -UseBasicParsing -TimeoutSec 5).StatusCode -eq 200 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo Vite 서버가 실행 중이지 않습니다. 먼저 서버를 시작하세요.
    pause
    exit /b 1
)

:: Open the browser
start http://localhost:%PORT%
echo.
echo 브라우저에서 index.html을 열려면 아래 파일을 더블클릭하세요:
echo %~dp0index.html
echo.
pause
