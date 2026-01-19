# 部署指南

本文档介绍如何将 AI Health Assistant 部署到生产环境。

## 📋 部署前准备

### 环境要求

- **服务器**：Linux/Windows Server
- **Node.js**：18+ 
- **Python**：3.10+
- **数据库**（可选）：PostgreSQL/MySQL（如需持久化存储）
- **反向代理**（推荐）：Nginx/Caddy

### 必需配置

1. **OpenAI API Key**：确保有有效的 API Key
2. **域名**（可选）：如需公网访问
3. **SSL 证书**（推荐）：使用 HTTPS 保护数据传输

## 🚀 部署方式

### 方式一：Docker 部署（推荐）

#### 1. 构建 Docker 镜像

```bash
# 构建后端镜像
cd backend
docker build -t ai-health-backend .

# 构建前端镜像
cd ../frontend
docker build -t ai-health-frontend .
```

#### 2. 使用 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "5003:5003"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
```

启动服务：

```bash
docker-compose up -d
```

### 方式二：传统部署

#### 1. 后端部署

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 设置环境变量
export OPENAI_API_KEY=your_api_key

# 使用 Gunicorn 运行（生产环境）
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

#### 2. 前端部署

```bash
cd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 使用 Nginx 或 Apache 部署 dist 目录
# 或使用 serve 简单部署
npm install -g serve
serve -s dist -l 5003
```

#### 3. Nginx 配置示例

创建 `/etc/nginx/sites-available/ai-health`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 前端
    location / {
        proxy_pass http://localhost:5003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 支持（如需要）
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/ai-health /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 方式三：云平台部署

#### Vercel（前端）

1. 安装 Vercel CLI：`npm i -g vercel`
2. 在 `frontend` 目录运行：`vercel`
3. 配置环境变量和构建设置

#### Railway/Render（后端）

1. 连接 GitHub 仓库
2. 设置构建命令：`pip install -r requirements.txt`
3. 设置启动命令：`python run.py`
4. 配置环境变量：`OPENAI_API_KEY`

#### 全栈部署（推荐）

使用 **Render** 或 **Fly.io**：

1. 后端部署为 Web Service
2. 前端部署为 Static Site
3. 配置前端 API 地址指向后端服务

## 🔒 安全配置

### 1. 环境变量保护

- 使用 `.env` 文件（不要提交到 Git）
- 使用环境变量管理工具（如 Vault）
- 定期轮换 API Key

### 2. HTTPS 配置

- 使用 Let's Encrypt 免费证书
- 配置 HSTS 头
- 启用 TLS 1.2+

### 3. CORS 配置

在生产环境中，限制 CORS 来源：

```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # 限制为你的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. 速率限制

添加 API 速率限制：

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/chat")
@limiter.limit("10/minute")
async def chat(request: Request):
    # ...
```

## 📊 监控和日志

### 1. 日志配置

```python
# backend/app/main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### 2. 健康检查

后端已包含健康检查端点：`GET /health`

可以配置监控服务定期检查此端点。

### 3. 错误追踪

集成 Sentry 或其他错误追踪服务：

```python
import sentry_sdk
sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0
)
```

## 🔄 更新和维护

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# 重启服务
# Docker:
docker-compose restart

# 传统部署:
sudo systemctl restart ai-health-backend
sudo systemctl restart nginx
```

### 备份数据

由于数据存储在浏览器本地，建议：

1. 定期提醒用户导出数据
2. 如需要，可以添加后端数据库存储
3. 实现数据同步功能

## 🐛 故障排查

### 后端无法启动

1. 检查 Python 版本：`python --version`
2. 检查依赖安装：`pip list`
3. 检查环境变量：`echo $OPENAI_API_KEY`
4. 查看日志：`tail -f app.log`

### 前端无法连接后端

1. 检查后端是否运行：`curl http://localhost:8000/health`
2. 检查 CORS 配置
3. 检查网络防火墙设置
4. 查看浏览器控制台错误

### API 请求失败

1. 检查 OpenAI API Key 是否有效
2. 检查 API 配额和限制
3. 查看后端日志
4. 检查网络连接

## 📞 支持

如遇到部署问题，请：

1. 查看日志文件
2. 检查 GitHub Issues
3. 提交新的 Issue（包含错误日志和环境信息）

---

**提示**：首次部署建议先在测试环境验证，确认无误后再部署到生产环境。
