"""健康助手工具定义"""
from typing import Dict, Any
import re

class SymptomAnalyzer:
    """症状分析工具"""
    
    def analyze(self, symptoms: str) -> Dict[str, Any]:
        """
        分析用户描述的症状
        注意：这是简化版本，实际应该连接医疗知识库
        """
        symptoms_lower = symptoms.lower()
        
        # 简单的关键词匹配（实际应该使用更复杂的 NLP 模型）
        possible_conditions = []
        
        if any(word in symptoms_lower for word in ['头痛', '头疼', 'headache']):
            possible_conditions.append("可能的原因包括：紧张性头痛、偏头痛、感冒等")
        
        if any(word in symptoms_lower for word in ['咳嗽', 'cough']):
            possible_conditions.append("可能的原因包括：感冒、支气管炎、过敏等")
        
        if any(word in symptoms_lower for word in ['发烧', 'fever', '发热']):
            possible_conditions.append("可能的原因包括：感染、炎症等")
        
        if not possible_conditions:
            possible_conditions.append("建议详细描述症状，或咨询专业医生")
        
        return {
            "symptoms": symptoms,
            "possible_conditions": possible_conditions,
            "recommendation": "建议：如果症状持续或加重，请及时就医。本分析仅供参考，不能替代专业医疗诊断。"
        }

class EmergencyDetector:
    """紧急情况检测工具"""
    
    # 紧急情况关键词（更全面）
    EMERGENCY_KEYWORDS = [
        # 心血管紧急情况
        '胸痛', '胸闷', 'chest pain', '心脏病', 'heart attack', '心肌梗死', '心梗',
        '心悸', '心跳停止', '心律失常', '心律不齐',
        # 呼吸系统紧急情况
        '呼吸困难', 'difficulty breathing', '窒息', 'choking', '无法呼吸', '呼吸停止',
        '哮喘发作', '严重哮喘',
        # 神经系统紧急情况
        '失去意识', 'unconscious', '昏迷', 'coma', '晕厥', '晕倒', '意识不清',
        '癫痫', '抽搐', '惊厥', 'seizure',
        # 出血紧急情况
        '严重出血', 'severe bleeding', '大出血', '大量出血', '动脉出血',
        '呕血', '便血', '咳血',
        # 过敏紧急情况
        '严重过敏', 'severe allergy', '过敏性休克', 'anaphylaxis', '过敏性反应',
        # 中毒和药物
        '中毒', 'poisoning', '药物过量', 'overdose', '误服', '误食',
        # 外伤紧急情况
        '严重外伤', '严重创伤', '骨折', '严重骨折', '头部外伤', '脑外伤',
        # 高热紧急情况
        '高热不退', '高烧不退', '持续高热', '39度以上', '40度',
        # 其他紧急情况
        '剧烈腹痛', '急性腹痛', '急性阑尾炎', '急性胰腺炎',
        '剧烈头痛', '突发头痛', '脑出血', '脑梗死', '中风',
        '急性肾衰竭', '急性肝衰竭',
    ]
    
    def detect(self, message: str) -> Dict[str, Any]:
        """检测紧急情况"""
        message_lower = message.lower()
        
        # 检查是否包含紧急关键词
        matched_keywords = []
        for keyword in self.EMERGENCY_KEYWORDS:
            if keyword.lower() in message_lower:
                matched_keywords.append(keyword)
        
        if matched_keywords:
            # 构建更详细的紧急提示信息（使用自然语言，不使用特殊符号）
            emergency_message = f"""根据你的描述，检测到可能涉及紧急医疗情况的关键词：{', '.join(matched_keywords[:3])}

请立即采取以下行动：
1. 立即拨打急救电话 120
2. 或立即前往最近的医院急诊科
3. 不要延误，时间就是生命

重要提示：
本 AI 助手无法处理紧急医疗情况，请立即寻求专业医疗帮助。在等待救援期间，尽量保持患者平静，避免移动（如怀疑骨折或外伤）。

急救电话：120
如遇火灾等紧急情况，请拨打：119

请立即行动，不要等待！"""
            
            return {
                "is_emergency": True,
                "severity": "high",
                "message": emergency_message,
                "action": "emergency_contact",
                "matched_keywords": matched_keywords
            }
        
        return {
            "is_emergency": False,
            "severity": "low"
        }

class AppointmentManager:
    """预约管理工具"""
    
    def create_appointment(self, doctor: str, date: str, time: str) -> Dict[str, Any]:
        """创建预约"""
        return {
            "success": True,
            "appointment_id": f"apt_{date}_{time}",
            "doctor": doctor,
            "date": date,
            "time": time,
            "status": "待确认"
        }
    
    def get_appointments(self) -> list:
        """获取预约列表"""
        # 模拟数据
        return []

class HealthRecordRetriever:
    """健康记录检索工具"""
    
    def retrieve(self, query: str) -> list:
        """检索健康记录"""
        # 模拟数据，实际应该从数据库检索
        return []
