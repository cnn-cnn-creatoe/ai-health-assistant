# -*- coding: utf-8 -*-
"""测试紧急情况检测"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import requests
import json

# 测试紧急情况
test_message = "我胸痛，感觉很难受"
print(f"发送紧急情况测试消息: {test_message}")

try:
    response = requests.post(
        "http://localhost:8000/api/chat",
        json={"message": test_message},
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n[OK] 响应成功")
        print(f"紧急标志: {data.get('emergency', False)}")
        print(f"\n完整回复:\n{data.get('message', 'N/A')}")
    else:
        print(f"[FAIL] 返回错误: {response.status_code}")
        print(f"响应: {response.text}")
        
except Exception as e:
    print(f"[FAIL] 测试失败: {e}")
    import traceback
    traceback.print_exc()
