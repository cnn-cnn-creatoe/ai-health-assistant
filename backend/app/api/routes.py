from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.agents.health_assistant import HealthAssistant

router = APIRouter()

# 初始化健康助手
health_assistant = HealthAssistant()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    session_id: str
    emergency: bool = False

class HealthRecord(BaseModel):
    id: str
    date: str
    type: str
    doctor: str
    summary: str

class Appointment(BaseModel):
    id: str
    doctor: str
    department: str
    date: str
    time: str
    status: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """处理用户对话请求"""
    try:
        response = await health_assistant.process_message(
            request.message,
            request.session_id
        )
        return ChatResponse(
            message=response["message"],
            session_id=response["session_id"],
            emergency=response.get("emergency", False)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/records", response_model=List[HealthRecord])
async def get_records():
    """获取健康记录列表"""
    # 模拟数据，实际应该从数据库获取
    return [
        HealthRecord(
            id="1",
            date="2024-01-15",
            type="体检报告",
            doctor="张医生",
            summary="常规体检，各项指标正常"
        ),
        HealthRecord(
            id="2",
            date="2024-01-10",
            type="血压测量",
            doctor="系统记录",
            summary="血压：120/80 mmHg"
        ),
    ]

@router.get("/appointments", response_model=List[Appointment])
async def get_appointments():
    """获取预约列表"""
    # 模拟数据，实际应该从数据库获取
    return [
        Appointment(
            id="1",
            doctor="张医生",
            department="内科",
            date="2024-01-20",
            time="10:00",
            status="已预约"
        ),
    ]

@router.get("/health-data")
async def get_health_data():
    """获取健康数据"""
    # 模拟数据，实际应该从数据库获取
    return {
        "bloodPressure": "120/80",
        "heartRate": 72,
        "temperature": 36.5,
        "lastUpdate": "2024-01-19"
    }
