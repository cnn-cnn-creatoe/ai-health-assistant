# -*- coding: utf-8 -*-
"""测试 API 端点"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import time
import requests
import json

print("等待服务器启动...")
time.sleep(5)

# 测试健康检查
try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    print(f"[OK] 健康检查: {response.status_code} - {response.json()}")
except Exception as e:
    print(f"[FAIL] 健康检查失败: {e}")
    sys.exit(1)

# 测试聊天 API
try:
    test_message = "我最近有点头痛，持续了三天"
    print(f"\n发送测试消息: {test_message}")
    
    response = requests.post(
        "http://localhost:8000/api/chat",
        json={"message": test_message},
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n[OK] 聊天 API 响应成功")
        print(f"会话 ID: {data.get('session_id', 'N/A')}")
        print(f"紧急标志: {data.get('emergency', False)}")
        print(f"\n回复内容:\n{data.get('message', 'N/A')[:200]}...")
    else:
        print(f"[FAIL] 聊天 API 返回错误: {response.status_code}")
        print(f"响应: {response.text}")
        
except Exception as e:
    print(f"[FAIL] 聊天 API 测试失败: {e}")
    import traceback
    traceback.print_exc()
