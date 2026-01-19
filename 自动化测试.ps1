# AI Health Assistant 自动化测试脚本

Write-Host "=== AI Health Assistant 自动化测试 ===" -ForegroundColor Cyan
Write-Host ""

# 等待服务器启动
Write-Host "[1/5] 等待服务器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 测试后端
Write-Host "[2/5] 测试后端服务器..." -ForegroundColor Yellow
$backendOk = $false
try {
    $response = Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ 后端健康检查通过" -ForegroundColor Green
        $backendOk = $true
    }
} catch {
    Write-Host "  ✗ 后端未响应: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试前端
Write-Host "[3/5] 测试前端服务器..." -ForegroundColor Yellow
$frontendOk = $false
try {
    $response = Invoke-WebRequest -Uri http://localhost:5003 -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ 前端页面可访问" -ForegroundColor Green
        
        # 检查页面内容
        $content = $response.Content
        $checks = @{
            "页面标题" = $content -match "AI 健康助手|Health Assistant"
            "导航栏" = $content -match "首页|问诊|Dashboard|Chat"
            "React应用" = $content -match "root|react"
        }
        
        foreach ($check in $checks.GetEnumerator()) {
            if ($check.Value) {
                Write-Host "    ✓ $($check.Key) 存在" -ForegroundColor Green
            } else {
                Write-Host "    ✗ $($check.Key) 未找到" -ForegroundColor Yellow
            }
        }
        
        $frontendOk = $true
    }
} catch {
    Write-Host "  ✗ 前端未响应: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试 API 端点
Write-Host "[4/5] 测试 API 端点..." -ForegroundColor Yellow
if ($backendOk) {
    # 测试健康数据 API
    try {
        $response = Invoke-WebRequest -Uri http://localhost:8000/api/health-data -UseBasicParsing -TimeoutSec 3
        $data = $response.Content | ConvertFrom-Json
        Write-Host "  ✓ 健康数据 API 正常" -ForegroundColor Green
        Write-Host "    响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ 健康数据 API 失败" -ForegroundColor Red
    }
    
    # 测试对话 API
    try {
        $body = @{ message = "测试消息" } | ConvertTo-Json
        $response = Invoke-WebRequest -Uri http://localhost:8000/api/chat -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
        Write-Host "  ✓ 对话 API 正常" -ForegroundColor Green
        Write-Host "    响应: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))..." -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ 对话 API 失败: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠ 跳过 API 测试（后端未运行）" -ForegroundColor Yellow
}

# 打开浏览器
Write-Host "[5/5] 打开浏览器..." -ForegroundColor Yellow
if ($frontendOk) {
    Start-Process "http://localhost:5003"
    Write-Host "  ✓ 浏览器已打开" -ForegroundColor Green
} else {
    Write-Host "  ✗ 前端未运行，无法打开" -ForegroundColor Red
}

# 总结
Write-Host ""
Write-Host "=== 测试完成 ===" -ForegroundColor Cyan
Write-Host ""
if ($backendOk -and $frontendOk) {
    Write-Host "✓ 所有服务器运行正常！" -ForegroundColor Green
    Write-Host ""
    Write-Host "测试结果:" -ForegroundColor Yellow
    Write-Host "  后端: http://localhost:8000" -ForegroundColor White
    Write-Host "  前端: http://localhost:5003" -ForegroundColor White
    Write-Host "  API文档: http://localhost:8000/docs" -ForegroundColor White
} else {
    Write-Host "⚠ 部分服务器未运行" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请检查:" -ForegroundColor Yellow
    if (-not $backendOk) {
        Write-Host "  1. 后端服务器终端窗口是否有错误" -ForegroundColor White
    }
    if (-not $frontendOk) {
        Write-Host "  2. 前端服务器终端窗口是否有错误" -ForegroundColor White
    }
}
