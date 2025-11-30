@echo off
chcp 65001 >nul
echo ?뵩 PIIP ?꾩껜 媛쒕컻 ?섍꼍 ?쒖옉 以?..

REM Docker ?ㅽ뻾 ?뺤씤
docker info >nul 2>&1
IF ERRORLEVEL 1 (
    echo ??Docker Desktop???ㅽ뻾 以묒씠 ?꾨떃?덈떎. 癒쇱? ?ㅽ뻾?댁＜?몄슂.
    pause
    exit /b
)

REM Docker Compose ?ㅽ뻾
echo ?맫 Docker Compose濡?紐⑤뱺 ?쒕퉬???ㅽ뻾 以?..
docker-compose -f "%~dp0docker-compose.yml" up -d --build

REM 諛깆뿏??濡쒓렇 蹂닿린
start cmd /k "docker logs -f piip-backend"

REM ?꾨줎?몄뿏???닿린
start http://localhost:3000

REM 紐⑤컮?????닿린 (Expo)
start http://localhost:19006

echo ??紐⑤뱺 ?쒕퉬?ㅺ? ?ㅽ뻾?섏뿀?듬땲??
pause

