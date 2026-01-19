from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="AI Health Assistant API",
    description="基于 LangChain 的 AI 健康助手后端 API",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5003"],  # 前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "AI Health Assistant API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
