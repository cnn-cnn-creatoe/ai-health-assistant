# -*- coding: utf-8 -*-
"""测试 LangChain 导入"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("测试 LangChain 导入...")

try:
    from langchain_openai import ChatOpenAI
    print("[OK] langchain_openai.ChatOpenAI")
except Exception as e:
    print(f"[FAIL] langchain_openai: {e}")

try:
    from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
    print("[OK] langchain_core.messages")
except Exception as e:
    print(f"[FAIL] langchain_core.messages: {e}")

try:
    from langchain.memory import ConversationBufferMemory
    print("[OK] langchain.memory")
except Exception as e:
    print(f"[FAIL] langchain.memory: {e}")

try:
    from langchain.schema import HumanMessage as HM2, AIMessage as AM2, SystemMessage as SM2
    print("[OK] langchain.schema (old)")
except Exception as e:
    print(f"[FAIL] langchain.schema: {e}")
