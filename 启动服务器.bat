@echo off
chcp 65001 >nul
echo ========================================
echo   AI Health Assistant - 启动服务器
echo ========================================
echo.

echo [1/2] 启动后端服务器...
start "Backend Server" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe run.py"

timeout /t 3 /nobreak >nul

echo [2/2] 启动前端服务器...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   服务器正在启动中...
echo ========================================
echo.
echo 后端: http://localhost:8000
echo 前端: http://localhost:5003
echo.
echo 等待几秒钟后，浏览器将自动打开...
echo.

timeout /t 5 /nobreak >nul
start http://localhost:5003

echo.
echo 如果浏览器没有自动打开，请手动访问:
echo http://localhost:5003
echo.
pause
