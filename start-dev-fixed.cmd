docker info >nul 2>&1
echo 🐳 Docker Compose로 모든 서비스 실행 중...
docker-compose -f "%~dp0docker-compose.yml" up -d --build
@echo off
chcp 65001 >nul

REM Log file for debugging
set LOGFILE=%~dp0start-dev.log
echo [%date% %time%] PIIP start-dev-fixed started > "%LOGFILE%"
echo [%date% %time%] Using working dir: %~dp0 >> "%LOGFILE%"

echo [%date% %time%] Step: check docker availability...
echo [%date% %time%] Running: docker info >> "%LOGFILE%" 2>&1
docker info >> "%LOGFILE%" 2>&1
set RC=%ERRORLEVEL%
echo [%date% %time%] docker info exit code: %RC% >> "%LOGFILE%"
IF %RC% NEQ 0 (
    echo ❌ Docker Desktop이 실행 중이 아닙니다. 먼저 실행해주세요.
    echo [%date% %time%] ERROR: Docker not available (exit %RC%) >> "%LOGFILE%"
    echo 로그 확인: %LOGFILE%
    pause
    exit /b %RC%
)

echo [%date% %time%] Step: docker-compose up (build)...
echo [%date% %time%] Running: docker-compose -f "%~dp0docker-compose.yml" up -d --build >> "%LOGFILE%" 2>&1
docker-compose -f "%~dp0docker-compose.yml" up -d --build >> "%LOGFILE%" 2>&1
set RC=%ERRORLEVEL%
echo [%date% %time%] docker-compose exit code: %RC% >> "%LOGFILE%"
IF %RC% NEQ 0 (
    echo ❌ docker-compose 실행에 실패했습니다. 로그를 확인하세요: %LOGFILE%
    pause
    exit /b %RC%
)

echo [%date% %time%] Step: open backend logs and frontend/mobile URLs
start cmd /k "docker logs -f piip-backend >> "%LOGFILE%" 2>&1"
start "" "http://localhost:3000"
start "" "http://localhost:19006"

echo [%date% %time%] 모든 서비스가 실행되었습니다. 로그: %LOGFILE%
echo [%date% %time%] Done >> "%LOGFILE%"
pause
