# AI Health Assistant - 完整设置指南

本指南将帮助您完整设置和运行 AI 健康助手项目。

## 前置要求

- Node.js 18+ 和 npm
- Python 3.10+
- OpenAI API Key（用于 AI 对话功能）
- Git

## 步骤 1: 克隆和检查项目

项目结构应该如下：

```
agenttest/
├── frontend/          # React 前端
├── backend/           # Python 后端
├── components/        # Galaxy UI 组件库
└── design-system/     # UI UX Pro Max 设计系统
```

## 步骤 2: 设置后端

### 2.1 创建虚拟环境

```bash
cd backend
python -m venv venv
```

### 2.2 激活虚拟环境

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 2.3 安装依赖

```bash
pip install -r requirements.txt
```

### 2.4 配置环境变量

创建 `backend/.env` 文件：

```env
OPENAI_API_KEY=your_openai_api_key_here
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

### 2.5 启动后端服务器

```bash
python run.py
```

或者：

```bash
uvicorn app.main:app --reload --port 8000
```

后端将在 http://localhost:8000 运行

验证：访问 http://localhost:8000/docs 查看 API 文档

## 步骤 3: 设置前端

### 3.1 安装依赖

```bash
cd frontend
npm install
```

### 3.2 配置环境变量（可选）

创建 `frontend/.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3.3 启动开发服务器

```bash
npm run dev
```

前端将在 http://localhost:3000 运行

## 步骤 4: 验证安装

1. 打开浏览器访问 http://localhost:3000
2. 您应该看到 AI 健康助手的主界面
3. 点击"问诊"标签，尝试发送一条消息
4. 检查后端控制台是否有请求日志

## 常见问题

### 问题 1: 后端启动失败

**错误**: `ModuleNotFoundError: No module named 'fastapi'`

**解决**: 确保虚拟环境已激活，并重新安装依赖：
```bash
pip install -r requirements.txt
```

### 问题 2: OpenAI API 错误

**错误**: `Invalid API Key`

**解决**: 检查 `.env` 文件中的 `OPENAI_API_KEY` 是否正确设置

### 问题 3: 前端无法连接后端

**错误**: `Network Error` 或 `CORS Error`

**解决**: 
1. 确保后端正在运行
2. 检查 `backend/app/main.py` 中的 CORS 配置
3. 确认前端代理配置正确（`frontend/vite.config.ts`）

### 问题 4: 端口已被占用

**错误**: `Address already in use`

**解决**: 
- 后端：修改 `backend/.env` 中的 `PORT` 值
- 前端：修改 `frontend/vite.config.ts` 中的端口配置

## 开发工作流

### 同时运行前后端

**终端 1 - 后端:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python run.py
```

**终端 2 - 前端:**
```bash
cd frontend
npm run dev
```

## 下一步

- 查看 `README.md` 了解项目详情
- 查看 `design-system/healthcare-theme.json` 了解设计系统
- 查看 `components/galaxy/README.md` 了解可用组件

## 获取帮助

如果遇到问题，请检查：
1. 所有依赖是否正确安装
2. 环境变量是否正确配置
3. 端口是否被占用
4. 防火墙设置是否阻止连接
