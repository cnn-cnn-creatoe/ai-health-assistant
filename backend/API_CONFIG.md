# API 配置说明

## 环境变量配置

请创建 `backend/.env` 文件，并添加以下配置：

```env
# OpenAI API 配置
OPENAI_API_KEY=sk-jlN8Md0eEMC0nG7BDaA778E37b054bC59d62EeD505AcE047
OPENAI_API_BASE=https://aihubmix.com/v1

# 服务器配置
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5003
```

## 配置说明

- `OPENAI_API_KEY`: 你的 API 密钥
- `OPENAI_API_BASE`: API 端点地址（已配置为 https://aihubmix.com/v1）
- `HOST`: 服务器监听地址
- `PORT`: 服务器端口（默认 8000）
- `CORS_ORIGINS`: 允许的前端地址

## 注意事项

⚠️ **重要**：`.env` 文件包含敏感信息，请勿提交到版本控制系统。
