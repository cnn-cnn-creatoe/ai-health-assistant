# AI Health Assistant - Backend

AI 健康助手后端 API，基于 FastAPI + LangChain 构建。

## 技术栈

- Python 3.10+
- FastAPI
- LangChain
- LangGraph
- OpenAI API
- Uvicorn

## 快速开始

### 1. 创建虚拟环境

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
OPENAI_API_KEY=your_openai_api_key_here
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

### 4. 运行服务器

```bash
python run.py
```

或者使用 uvicorn 直接运行：

```bash
uvicorn app.main:app --reload --port 8000
```

API 文档将在 http://localhost:8000/docs 可用

## API 端点

### POST /api/chat
处理用户对话请求

**请求体:**
```json
{
  "message": "我最近头痛",
  "session_id": "optional_session_id"
}
```

**响应:**
```json
{
  "message": "根据您的描述...",
  "session_id": "session_id",
  "emergency": false
}
```

### GET /api/records
获取健康记录列表

### GET /api/appointments
获取预约列表

### GET /api/health-data
获取健康数据

## 项目结构

```
app/
├── agents/          # LangChain Agents
│   ├── health_assistant.py
│   └── tools.py
├── api/            # API 路由
│   └── routes.py
├── models/         # 数据模型
│   └── health_record.py
├── services/       # 业务逻辑
└── main.py         # 应用入口
```

## 功能特性

- ✅ 症状分析和初步诊断建议
- ✅ 紧急情况自动检测
- ✅ 对话记忆管理
- ✅ 健康记录管理
- ✅ 预约管理

## 注意事项

⚠️ **重要提示**：
- 需要有效的 OpenAI API Key
- 所有医疗建议仅供参考，不能替代专业诊断
- 紧急情况必须引导用户联系专业医疗人员
