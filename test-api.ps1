# 简单 API 测试脚本

Write-Host "Testing Backend..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing -TimeoutSec 5
    Write-Host "Backend OK: $($r.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Backend Failed" -ForegroundColor Red
}

Write-Host "Testing Frontend..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri http://localhost:5003 -UseBasicParsing -TimeoutSec 5
    Write-Host "Frontend OK: $($r.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Frontend Failed" -ForegroundColor Red
}

Write-Host "Testing API..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri http://localhost:8000/api/health-data -UseBasicParsing -TimeoutSec 5
    Write-Host "API OK: $($r.Content)" -ForegroundColor Green
} catch {
    Write-Host "API Failed" -ForegroundColor Red
}
