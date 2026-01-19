# 快速启动和调试指南

## 🚀 启动服务器

### 方法 1: 手动启动（推荐）

#### 步骤 1: 启动后端服务器

打开 **第一个 PowerShell 终端**，运行：

```powershell
cd C:\Users\nan\Desktop\agent\agenttest\backend
.\venv\Scripts\activate
python run.py
```

**预期输出**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**验证**: 访问 http://localhost:8000/docs 应该看到 API 文档

#### 步骤 2: 启动前端服务器

打开 **第二个 PowerShell 终端**，运行：

```powershell
cd C:\Users\nan\Desktop\agent\agenttest\frontend
npm run dev
```

**预期输出**:
```
  VITE v5.0.8  ready in xxx ms

  ➜  Local:   http://localhost:5003/
  ➜  Network: use --host to expose
```

**验证**: 访问 http://localhost:5003 应该看到应用界面

### 方法 2: 使用启动脚本

```powershell
cd C:\Users\nan\Desktop\agent\agenttest
powershell -ExecutionPolicy Bypass -File .\start-servers.ps1
```

## 🔍 调试检查

### 1. 检查服务器状态

在浏览器中访问：
- **后端健康检查**: http://localhost:8000/health
- **后端 API 文档**: http://localhost:8000/docs
- **前端应用**: http://localhost:5003

### 2. 浏览器开发者工具

按 `F12` 打开开发者工具，检查：

#### Console 标签
- ✅ 无红色错误
- ✅ 查看 API 调用日志
- ✅ 检查 React 警告

#### Network 标签
- ✅ 过滤 `XHR` 或 `Fetch`
- ✅ 检查 `/api/chat` 请求
- ✅ 状态码应该是 200
- ✅ 检查响应数据

#### Elements 标签
- ✅ DOM 结构正确
- ✅ Tailwind CSS 类已应用
- ✅ 组件正常渲染

### 3. 功能测试清单

#### Dashboard 页面
- [ ] 页面加载正常
- [ ] 健康数据卡片显示（血压、心率、体温）
- [ ] 快速操作按钮可点击
- [ ] 导航栏工作正常

#### Chat 页面
- [ ] 可以输入消息
- [ ] 可以发送消息（按 Enter 或点击发送）
- [ ] 消息显示在聊天界面
- [ ] 加载状态正常显示
- [ ] AI 回复正常（需要 OPENAI_API_KEY）

#### Records 页面
- [ ] 健康记录列表显示
- [ ] 记录卡片样式正确
- [ ] 可以查看详情

#### Appointments 页面
- [ ] 预约列表显示
- [ ] 可以创建新预约
- [ ] 表单正常工作

## ⚠️ 常见问题

### 问题 1: 后端无法启动

**错误**: `ModuleNotFoundError` 或 `ImportError`

**解决**:
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 问题 2: 前端无法启动

**错误**: `Cannot find module` 或端口被占用

**解决**:
```powershell
cd frontend
npm install
# 如果端口被占用，修改 vite.config.ts 中的端口
```

### 问题 3: API 请求失败

**错误**: CORS 错误或网络错误

**检查**:
1. 后端是否运行？访问 http://localhost:8000/health
2. 前端代理配置是否正确（`vite.config.ts`）
3. 后端 CORS 配置是否包含 `http://localhost:5003`

### 问题 4: AI 对话不工作

**错误**: 没有回复或错误信息

**解决**:
1. 检查 `backend/.env` 文件是否存在
2. 确认 `OPENAI_API_KEY` 已设置
3. 查看后端终端窗口的错误日志
4. 检查网络连接和 API 配额

## 📝 调试日志

### 后端日志
后端服务器会在终端输出：
- 请求路径和方法
- 响应状态码
- 错误堆栈（如果有）

### 前端日志
在浏览器控制台查看：
- React 组件渲染日志
- API 调用日志
- 错误堆栈信息

## 🎯 下一步

1. ✅ 确保两个服务器都在运行
2. ✅ 在浏览器中打开 http://localhost:5003
3. ✅ 打开开发者工具 (F12)
4. ✅ 测试各个功能页面
5. ✅ 检查 Console 和 Network 标签

## 💡 提示

- 如果修改了代码，Vite 会自动热重载前端
- 如果修改了后端代码，Uvicorn 会自动重启（reload=True）
- 使用 `Ctrl+C` 停止服务器
- 查看终端窗口的输出以了解服务器状态
