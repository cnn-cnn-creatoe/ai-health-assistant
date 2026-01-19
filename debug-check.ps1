# AI Health Assistant - 调试检查脚本

Write-Host "`n=== AI Health Assistant Debug Check ===" -ForegroundColor Cyan
Write-Host ""

# 检查后端
Write-Host "1. Checking Backend (port 8000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Backend is running" -ForegroundColor Green
        Write-Host "   → API: http://localhost:8000" -ForegroundColor Gray
        Write-Host "   → Docs: http://localhost:8000/docs" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Backend not responding" -ForegroundColor Red
    Write-Host "   → Start with: cd backend && .\venv\Scripts\python.exe run.py" -ForegroundColor Yellow
}

Write-Host ""

# 检查前端
Write-Host "2. Checking Frontend (port 5003)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:5003 -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Frontend is running" -ForegroundColor Green
        Write-Host "   → URL: http://localhost:5003" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Frontend not responding" -ForegroundColor Red
    Write-Host "   → Start with: cd frontend && npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# 检查 API 连接
Write-Host "3. Testing API Connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:8000/api/health-data -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ API endpoint is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ API endpoint not accessible" -ForegroundColor Red
}

Write-Host ""

# 检查端口占用
Write-Host "4. Checking Port Status..." -ForegroundColor Yellow
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
$port5003 = Get-NetTCPConnection -LocalPort 5003 -ErrorAction SilentlyContinue

if ($port8000) {
    Write-Host "   ✓ Port 8000 is in use (Backend)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Port 8000 is not in use" -ForegroundColor Red
}

if ($port5003) {
    Write-Host "   ✓ Port 5003 is in use (Frontend)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Port 5003 is not in use" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Debug Check Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To open in browser:" -ForegroundColor Yellow
Write-Host "  Start-Process http://localhost:5003" -ForegroundColor Gray
Write-Host ""
