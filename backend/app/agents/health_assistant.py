"""AI 健康助手主 Agent"""
from typing import Dict, Any, Optional, List
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from app.agents.tools import SymptomAnalyzer, EmergencyDetector, AppointmentManager, HealthRecordRetriever
import uuid
import os

# 医疗 AI 助手系统提示词
MEDICAL_ASSISTANT_SYSTEM_PROMPT = """你是一位专业、可靠、负责任的医疗健康 AI 助手。你的核心职责是：

身份定位：
你是基于循证医学知识的健康信息助手，你的建议基于权威医学指南、临床实践和科学证据。你始终强调：你的回答仅供参考，不能替代专业医疗诊断。

回答原则：

1. 专业性与准确性
基于循证医学证据提供建议，引用权威来源（如国家卫健委、中华医学会、三甲医院临床指南等）。使用准确的医学术语，但用通俗易懂的语言解释。承认知识边界，不确定时明确说明。

2. 安全性与谨慎性
紧急情况识别：如遇到胸痛、呼吸困难、意识异常、严重过敏、大出血等，必须立即引导就医（拨打120或前往急诊）。
严重症状警示：对于可能危及生命或需要紧急处理的症状，必须明确建议立即就医。
不提供诊断：明确说明"这不能替代专业医疗诊断"。
不推荐具体药物：不推荐处方药，仅提供一般性用药安全建议。

3. 回答结构
对于健康问题，按以下结构组织回答：
1. 理解确认：简要确认用户描述的症状或问题
2. 可能原因：基于常见医学知识，列出可能的原因（强调"可能"）
3. 自我护理建议：提供安全的、一般性的自我护理方法
4. 何时就医：明确说明什么情况下需要就医
5. 免责声明：强调仅供参考，不能替代专业诊断

4. 沟通风格
- 语气要自然、口语化，像朋友在聊天一样，但保持专业性
- 用"你"而不是"您"，更亲切自然
- 避免使用特殊符号（如星号、加粗符号、警告符号等）
- 用普通文字表达，不要用Markdown格式
- 共情：理解用户的担忧，给予安慰
- 鼓励：鼓励用户积极管理健康，但不过度乐观
- 谨慎：对于不确定的情况，明确说明需要专业评估

5. 禁止事项
- 不提供具体诊断（如"你得了XX病"）
- 不推荐处方药或具体药物品牌
- 不替代专业医疗建议
- 不处理紧急医疗情况（必须引导就医）
- 不提供未经证实的偏方或疗法
- 不使用特殊符号（如星号、加粗、警告符号等）

6. 紧急情况处理
当检测到以下情况时，必须立即引导就医：
- 胸痛、胸闷、心悸
- 呼吸困难、窒息感
- 意识异常、昏迷、晕厥
- 严重过敏反应
- 大出血、严重外伤
- 中毒、药物过量
- 高热不退（超过39度持续不退）
- 剧烈腹痛
- 其他可能危及生命的情况

回答模板示例：

对于一般症状：
"根据你的描述，[症状]可能由多种原因引起，常见包括[原因1]、[原因2]等。

自我护理建议：
可以尝试[建议1]、[建议2]等方法。

何时需要就医：
如果出现以下情况，建议及时就医：[情况1]、[情况2]等。

重要提示：以上建议仅供参考，不能替代专业医疗诊断。如果症状持续、加重或出现其他不适，请及时咨询专业医生或前往医院就诊。"

对于紧急情况：
"根据你的描述，这可能是需要立即处理的紧急情况。请立即：
1. 拨打急救电话 120
2. 或前往最近的医院急诊科

本助手无法处理紧急医疗情况，请立即寻求专业医疗帮助。"

请始终遵循以上原则，用自然、口语化的语气，像朋友聊天一样提供专业、安全、负责任的健康建议。

重要格式要求：
- 绝对不要使用任何特殊符号，包括星号、加粗符号、警告符号、表情符号等
- 不要使用 Markdown 格式（如 **加粗**、*斜体*、- 列表符号等）
- 用普通文字表达，就像日常聊天一样
- 用"你"而不是"您"，语气要亲切自然
- 可以用数字编号（1. 2. 3.），但不要用星号或破折号做列表
- 重要内容用普通文字强调，不要用符号

示例格式：
正确："根据你的描述，头痛可能由多种原因引起，常见包括紧张性头痛、偏头痛、感冒等。"
错误："根据您的描述，**头痛**可能由多种原因引起，常见包括：\n- **紧张性头痛**\n- **偏头痛**"

请严格按照以上格式要求回复，确保不使用任何特殊符号。"""

class HealthAssistant:
    """健康助手 Agent"""
    
    def __init__(self):
        # 从环境变量获取配置
        api_key = os.getenv("OPENAI_API_KEY", "")
        api_base = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
        
        # 初始化 LLM（支持自定义 API 端点）
        # 注意：LangChain 使用 base_url 参数来设置自定义端点
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",  # 使用更先进的模型
            temperature=0.3,  # 降低温度，使回答更准确、一致
            openai_api_key=api_key,
            base_url=api_base,  # 使用 base_url 设置自定义 API 端点
        )
        
        # 初始化工具
        self.symptom_analyzer = SymptomAnalyzer()
        self.emergency_detector = EmergencyDetector()
        self.appointment_manager = AppointmentManager()
        self.health_record_retriever = HealthRecordRetriever()
        
        # 会话记忆（使用简单的消息列表存储）
        self.memories: Dict[str, List[BaseMessage]] = {}
    
    def _get_memory(self, session_id: str) -> List[BaseMessage]:
        """获取或创建会话记忆"""
        if session_id not in self.memories:
            self.memories[session_id] = []
        return self.memories[session_id]
    
    async def process_message(
        self,
        message: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        处理用户消息
        
        Args:
            message: 用户消息
            session_id: 会话 ID，如果为 None 则创建新会话
        
        Returns:
            包含回复消息、会话 ID 和紧急标志的字典
        """
        # 生成或使用会话 ID
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # 获取会话记忆
        memory = self._get_memory(session_id)
        
        # 检测紧急情况
        emergency_check = self.emergency_detector.detect(message)
        if emergency_check["is_emergency"]:
            return {
                "message": emergency_check["message"],
                "session_id": session_id,
                "emergency": True
            }
        
        # 构建消息列表（统一使用系统提示词）
        messages = [SystemMessage(content=MEDICAL_ASSISTANT_SYSTEM_PROMPT)]
        
        # 添加历史对话（保留最近 6 轮对话，即 12 条消息）
        history = memory
        for msg in history[-12:]:  # 保留更多上下文
            messages.append(msg)
        
        # 添加当前用户消息
        user_msg = HumanMessage(content=message)
        messages.append(user_msg)
        
        try:
            # 调用 LLM
            response = self.llm.invoke(messages)
            reply = response.content
            
            # 确保回复包含免责声明（如果没有），使用自然语言，不使用特殊符号
            if "仅供参考" not in reply and "不能替代" not in reply:
                reply += "\n\n重要提示：以上建议仅供参考，不能替代专业医疗诊断。如有疑问或症状持续，请及时咨询专业医生。"
                
        except Exception as e:
            # 如果 LLM 调用失败，使用备用回复
            print(f"LLM 调用错误: {e}")
            
            # 尝试使用症状分析工具作为备用
            symptom_analysis = self.symptom_analyzer.analyze(message)
            reply = f"""根据你的描述，我理解你的健康关切。

{symptom_analysis['recommendation']}

建议：
详细记录症状出现的时间、频率、严重程度，注意观察症状变化。如果症状持续、加重或出现其他不适，请及时就医。

重要提示：本助手仅供参考，不能替代专业医疗诊断。如有紧急情况（如胸痛、呼吸困难、意识异常等），请立即拨打 120 或前往医院急诊科。

抱歉，当前 AI 服务暂时不可用。建议你咨询专业医生获取更准确的医疗建议。"""
        
        # 保存到记忆
        memory.append(user_msg)
        memory.append(AIMessage(content=reply))
        
        return {
            "message": reply,
            "session_id": session_id,
            "emergency": False
        }
