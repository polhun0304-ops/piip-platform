# PowerShell wrapper for start-dev.cmd
# 목적: PowerShell 환경에서 출력 인코딩을 UTF-8로 설정한 뒤 기존 start-dev.cmd를 실행합니다.

# Set script parameters
param(
    [switch]$Local  # If provided, force local npm dev startup instead of Docker
)

# If running under Windows PowerShell (5.1), try to re-launch under PowerShell Core (pwsh)
# to get proper UTF-8 handling and more reliable console behavior.
try {
    if ($PSVersionTable.PSEdition -ne 'Core') {
        $pwshCmd = Get-Command pwsh -ErrorAction SilentlyContinue
        if ($pwshCmd) {
            Write-Host "PowerShell Core (pwsh) found. Relaunching under pwsh for UTF-8 output..." -ForegroundColor Yellow
            $argList = @()
            if ($Local) { $argList += '-Local' }
            & $pwshCmd.Source -NoProfile -ExecutionPolicy Bypass -File $MyInvocation.MyCommand.Path @argList
            exit
        } else {
            Write-Warning "PowerShell Core (pwsh) not found. Continuing under Windows PowerShell 5.1. UTF-8 output may be limited."
        }
    }
} catch {
    Write-Warning "Failed to check/relaunch pwsh: $($_.Exception.Message)"
}

# Set output encoding so non-ASCII (한글 등) 출력이 깨지지 않도록 합니다.
$OutputEncoding = [System.Text.Encoding]::UTF8

# Ensure console code page is UTF-8 as well
chcp 65001 > $null

function Start-LocalDev {
    Write-Host "Docker 미사용 폴백: 로컬 npm dev 서버를 시작합니다..." -ForegroundColor Yellow

    $backendDir = Join-Path $PSScriptRoot 'packages\backend'
    $frontendDir = Join-Path $PSScriptRoot 'packages\frontend'

    # Try to ensure a local mongod is running if Docker is not available
    Start-MongoLocal

    if (Test-Path $backendDir) {
        Write-Host "백엔드 개발서버 시작: npm --prefix $backendDir run dev" -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$backendDir'; npm install; npm run dev" -WorkingDirectory $backendDir
    } else {
        Write-Warning "백엔드 디렉터리를 찾을 수 없습니다: $backendDir"
    }

    if (Test-Path $frontendDir) {
        Write-Host "프론트엔드 개발서버 시작: npm --prefix $frontendDir run dev" -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$frontendDir'; npm install; npm run dev" -WorkingDirectory $frontendDir
    } else {
        Write-Warning "프론트엔드 디렉터리를 찾을 수 없습니다: $frontendDir"
    }
}

function Start-MongoLocal {
    # If Mongo is already accepting connections on 27017, do nothing
    $ping = Test-NetConnection -ComputerName '127.0.0.1' -Port 27017 -WarningAction SilentlyContinue
    if ($ping.TcpTestSucceeded) {
        Write-Host "로컬 MongoDB가 이미 127.0.0.1:27017에서 실행 중입니다." -ForegroundColor Green
        return
    }

    # Check if mongod binary is available (PowerShell 5.1 compatible)
    $mongodCmd = Get-Command mongod -ErrorAction SilentlyContinue
    $mongodPath = $null
    if ($mongodCmd) { $mongodPath = $mongodCmd.Source }
    if (-not $mongodPath) {
        Write-Warning "로컬에 'mongod' 실행 파일을 찾을 수 없습니다. Docker가 없다면 MongoDB를 설치하거나 Docker를 사용하세요."
        return
    }

    # Ensure data directory exists
    $dbPath = Join-Path $PSScriptRoot 'data\mongo'
    if (-not (Test-Path $dbPath)) { New-Item -ItemType Directory -Path $dbPath | Out-Null }

    # Start mongod as a background process bound to localhost
    Write-Host "로컬 mongod 시작: $mongodPath --dbpath $dbPath --bind_ip 127.0.0.1" -ForegroundColor Cyan
    $startInfo = @(
        "-NoExit",
        "-Command",
        "& '$mongodPath' --dbpath '$dbPath' --bind_ip 127.0.0.1"
    )
    Start-Process powershell -ArgumentList $startInfo -WorkingDirectory $dbPath

    # Wait for port
    if (Wait-ForPort -Port 27017 -TimeoutSeconds 20) {
        Write-Host "mongod가 127.0.0.1:27017에서 응답합니다." -ForegroundColor Green
    } else {
        Write-Warning "mongod가 지정된 시간 내에 시작되지 않았습니다. 로그를 확인하세요.";
    }
}

function Wait-ForPort {
    param(
        [int]$Port,
        [int]$TimeoutSeconds = 30
    )
    $start = Get-Date
    while ((Get-Date) -lt $start.AddSeconds($TimeoutSeconds)) {
        $resp = Test-NetConnection -ComputerName 'localhost' -Port $Port -WarningAction SilentlyContinue
        if ($resp.TcpTestSucceeded) { return $true }
        Start-Sleep -Seconds 1
    }
    return $false
}


# Try Docker first unless forced local
if (-not $Local) {
    try {
        $dockerInfo = & docker info 2>&1
        $dockerExit = $LASTEXITCODE
    } catch {
        $dockerInfo = $_.Exception.Message
        $dockerExit = 1
    }

    if ($dockerExit -ne 0) {
        Write-Warning "Docker가 사용 불가합니다 (exit $dockerExit). 자동 폴백으로 로컬 서버를 시도합니다."
        Start-LocalDev
        # wait for typical dev ports
        $backendPort = 5001
        $frontendPort = 5173
        Write-Host "백엔드 포트($backendPort) 준비 대기..."
        if (Wait-ForPort -Port $backendPort -TimeoutSeconds 60) { Write-Host "백엔드가 $backendPort에서 응답 중" -ForegroundColor Green } else { Write-Warning "백엔드가 $backendPort에서 응답하지 않습니다." }
        Write-Host "프론트엔드 포트($frontendPort) 준비 대기..."
        if (Wait-ForPort -Port $frontendPort -TimeoutSeconds 60) { Write-Host "프론트엔드가 $frontendPort에서 응답 중" -ForegroundColor Green } else { Write-Warning "프론트엔드가 $frontendPort에서 응답하지 않습니다." }
        return
    }

    # If Docker available, run fixed batch through cmd
    $scriptPath = Join-Path $PSScriptRoot '.\start-dev-fixed.cmd'
    if (Test-Path $scriptPath) {
        Write-Host "Docker 사용: 기존 도커 기반 시작 스크립트를 실행합니다." -ForegroundColor Green
        Start-Process -FilePath cmd.exe -ArgumentList "/c `"$scriptPath`"" -Wait
    } else {
        Write-Error "start-dev-fixed.cmd 파일을 찾을 수 없습니다: $scriptPath"
    }
} else {
    Start-LocalDev
}
