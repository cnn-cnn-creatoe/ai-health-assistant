# -*- coding: utf-8 -*-
"""测试配置是否正确"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import os
from dotenv import load_dotenv

load_dotenv()

print("=== 配置检查 ===")
api_key = os.getenv("OPENAI_API_KEY", "")
api_base = os.getenv("OPENAI_API_BASE", "")

print(f"API Key: {api_key[:20]}..." if api_key else "API Key: NOT SET")
print(f"API Base: {api_base}" if api_base else "API Base: NOT SET")

# 测试导入
try:
    from app.agents.health_assistant import HealthAssistant
    print("\n[OK] HealthAssistant 导入成功")
    
    # 测试初始化
    assistant = HealthAssistant()
    print("[OK] HealthAssistant 初始化成功")
except Exception as e:
    print(f"\n[FAIL] 错误: {e}")
    import traceback
    traceback.print_exc()
