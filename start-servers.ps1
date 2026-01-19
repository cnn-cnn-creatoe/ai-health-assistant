# 启动 AI Health Assistant 服务器脚本

Write-Host "=== Starting AI Health Assistant Servers ===" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\nan\Desktop\agent\agenttest"

# 启动后端
Write-Host "Starting Backend Server (port 8000)..." -ForegroundColor Yellow
$backendPath = Join-Path $projectRoot "backend"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; .\venv\Scripts\activate; python run.py"
) -WindowStyle Normal

Start-Sleep -Seconds 3

# 启动前端
Write-Host "Starting Frontend Server (port 5003)..." -ForegroundColor Yellow
$frontendPath = Join-Path $projectRoot "frontend"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev"
) -WindowStyle Normal

Start-Sleep -Seconds 5

# 检查服务器状态
Write-Host ""
Write-Host "Checking server status..." -ForegroundColor Cyan

$backendOk = $false
$frontendOk = $false

try {
    $response = Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend is running on http://localhost:8000" -ForegroundColor Green
        $backendOk = $true
    }
} catch {
    Write-Host "⚠ Backend may still be starting..." -ForegroundColor Yellow
}

try {
    $response = Invoke-WebRequest -Uri http://localhost:5003 -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Frontend is running on http://localhost:5003" -ForegroundColor Green
        $frontendOk = $true
    }
} catch {
    Write-Host "⚠ Frontend may still be starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Opening Browser ===" -ForegroundColor Cyan
Start-Process "http://localhost:5003"

Write-Host ""
Write-Host "Servers are starting in separate windows." -ForegroundColor Green
Write-Host "Please check the terminal windows for any errors." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend API Docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "Frontend App: http://localhost:5003" -ForegroundColor Gray
Write-Host ""
