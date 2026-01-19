"""健康记录数据模型"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HealthRecord(BaseModel):
    """健康记录模型"""
    id: str
    user_id: str
    date: str
    type: str  # 记录类型：体检、问诊、测量等
    doctor: Optional[str] = None
    summary: str
    details: Optional[dict] = None
    created_at: Optional[datetime] = None

class HealthData(BaseModel):
    """健康数据模型"""
    user_id: str
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    last_update: Optional[datetime] = None
