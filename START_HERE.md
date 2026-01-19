# 🚀 启动服务器 - 简单步骤

## ⚠️ 重要：服务器必须手动启动

由于服务器需要在独立的进程中运行，请按照以下步骤操作：

## 方法 1: 使用 Cursor 终端（推荐）

### 步骤 1: 启动后端

1. 在 Cursor 中按 `` Ctrl+` `` 打开终端
2. 运行以下命令：

```powershell
cd C:\Users\nan\Desktop\agent\agenttest\backend
.\venv\Scripts\python.exe run.py
```

**保持这个终端窗口打开！**

### 步骤 2: 启动前端（新终端）

1. 在 Cursor 中点击终端右上角的 **+** 按钮创建新终端
2. 或者按 `` Ctrl+Shift+` `` 创建新终端
3. 运行以下命令：

```powershell
cd C:\Users\nan\Desktop\agent\agenttest\frontend
npm run dev
```

**保持这个终端窗口打开！**

### 步骤 3: 打开浏览器

等待看到以下信息：

**后端终端应该显示**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**前端终端应该显示**:
```
  VITE v5.0.8  ready in xxx ms
  ➜  Local:   http://localhost:5003/
```

然后：
1. 在 Cursor 中按 `Ctrl+Shift+P`
2. 输入 `Simple Browser` 或 `Browser`
3. 输入 URL: `http://localhost:5003`

或者直接在外部浏览器打开: http://localhost:5003

## 方法 2: 使用独立 PowerShell 窗口

### 后端窗口

打开 PowerShell，运行：
```powershell
cd C:\Users\nan\Desktop\agent\agenttest\backend
.\venv\Scripts\activate
python run.py
```

### 前端窗口

打开另一个 PowerShell，运行：
```powershell
cd C:\Users\nan\Desktop\agent\agenttest\frontend
npm run dev
```

## ✅ 验证服务器运行

### 检查后端
在浏览器中访问: http://localhost:8000/docs
应该看到 FastAPI 文档页面

### 检查前端
在浏览器中访问: http://localhost:5003
应该看到 AI 健康助手界面

## 🔍 如果还是打不开

### 检查端口是否被占用

```powershell
# 检查端口 5003
netstat -ano | findstr :5003

# 检查端口 8000
netstat -ano | findstr :8000
```

### 检查防火墙

确保防火墙允许本地端口 5003 和 8000

### 查看错误信息

检查终端窗口中的错误信息：
- 后端终端：查看 Python 错误
- 前端终端：查看 npm/Vite 错误

## 🐛 常见问题

### 问题：端口已被占用

**解决**：
- 修改 `frontend/vite.config.ts` 中的端口（改为 5004 或其他）
- 或关闭占用端口的程序

### 问题：模块未找到

**后端**：
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

**前端**：
```powershell
cd frontend
npm install
```

### 问题：无法连接到后端

**检查**：
1. 后端是否真的在运行？（访问 http://localhost:8000/health）
2. 检查 `frontend/vite.config.ts` 中的代理配置
3. 检查 `backend/app/main.py` 中的 CORS 配置

## 📝 快速命令参考

```powershell
# 后端
cd backend
.\venv\Scripts\python.exe run.py

# 前端（新终端）
cd frontend
npm run dev

# 打开浏览器
Start-Process http://localhost:5003
```

## 💡 提示

- 两个服务器必须**同时运行**
- 保持终端窗口打开
- 使用 `Ctrl+C` 停止服务器
- 修改代码后，Vite 会自动刷新前端
- 修改后端代码后，Uvicorn 会自动重启
