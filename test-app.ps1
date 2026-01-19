# 测试应用脚本

Write-Host "=== AI Health Assistant Test ===" -ForegroundColor Cyan
Write-Host ""

# 检查并启动后端
Write-Host "[1/3] Checking Backend..." -ForegroundColor Yellow
$backendRunning = $false
try {
    $r = Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) {
        Write-Host "✓ Backend is running" -ForegroundColor Green
        $backendRunning = $true
    }
} catch {
    Write-Host "✗ Backend not running, starting..." -ForegroundColor Yellow
    $backendJob = Start-Job -ScriptBlock {
        Set-Location 'C:\Users\nan\Desktop\agent\agenttest\backend'
        & '.\venv\Scripts\python.exe' 'run.py'
    }
    Start-Sleep -Seconds 5
    try {
        $r = Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) {
            Write-Host "✓ Backend started successfully" -ForegroundColor Green
            $backendRunning = $true
        }
    } catch {
        Write-Host "✗ Backend failed to start" -ForegroundColor Red
    }
}

# 检查并启动前端
Write-Host "[2/3] Checking Frontend..." -ForegroundColor Yellow
$frontendRunning = $false
try {
    $r = Invoke-WebRequest -Uri http://localhost:5003 -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) {
        Write-Host "✓ Frontend is running" -ForegroundColor Green
        $frontendRunning = $true
    }
} catch {
    Write-Host "✗ Frontend not running, starting..." -ForegroundColor Yellow
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location 'C:\Users\nan\Desktop\agent\agenttest\frontend'
        & 'npm' 'run' 'dev'
    }
    Start-Sleep -Seconds 8
    try {
        $r = Invoke-WebRequest -Uri http://localhost:5003 -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) {
            Write-Host "✓ Frontend started successfully" -ForegroundColor Green
            $frontendRunning = $true
        }
    } catch {
        Write-Host "✗ Frontend failed to start" -ForegroundColor Red
    }
}

# 打开浏览器
Write-Host "[3/3] Opening Browser..." -ForegroundColor Yellow
if ($backendRunning -and $frontendRunning) {
    Write-Host "✓ Opening http://localhost:5003" -ForegroundColor Green
    Start-Process "http://localhost:5003"
    Write-Host ""
    Write-Host "=== Test URLs ===" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:5003" -ForegroundColor White
    Write-Host "Backend API: http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "To test in Cursor browser:" -ForegroundColor Yellow
    Write-Host "1. Press Ctrl+Shift+P" -ForegroundColor Gray
    Write-Host "2. Type 'Simple Browser'" -ForegroundColor Gray
    Write-Host "3. Enter: http://localhost:5003" -ForegroundColor Gray
} else {
    Write-Host "✗ Servers not ready. Please start manually:" -ForegroundColor Red
    Write-Host "  Backend: cd backend && .\venv\Scripts\python.exe run.py" -ForegroundColor Yellow
    Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor Yellow
}
