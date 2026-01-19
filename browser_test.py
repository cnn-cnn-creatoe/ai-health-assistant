"""
浏览器自动化测试脚本
使用 Selenium 控制 Chrome 浏览器进行测试
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

def setup_chrome():
    """设置 Chrome 浏览器"""
    chrome_options = Options()
    chrome_options.add_argument("--remote-debugging-port=9222")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"Chrome 启动失败: {e}")
        print("请确保已安装 Chrome 和 ChromeDriver")
        return None

def test_dashboard(driver):
    """测试 Dashboard 页面"""
    print("\n[测试] Dashboard 页面")
    try:
        driver.get("http://localhost:5003/dashboard")
        time.sleep(3)
        
        # 检查页面标题
        title = driver.find_element(By.TAG_NAME, "h1")
        print(f"  ✓ 页面标题: {title.text}")
        
        # 检查健康数据卡片
        cards = driver.find_elements(By.CLASS_NAME, "bg-white")
        print(f"  ✓ 找到 {len(cards)} 个卡片元素")
        
        return True
    except Exception as e:
        print(f"  ✗ 测试失败: {e}")
        return False

def test_chat(driver):
    """测试 Chat 页面"""
    print("\n[测试] Chat 页面")
    try:
        driver.get("http://localhost:5003/chat")
        time.sleep(3)
        
        # 查找输入框
        input_box = driver.find_element(By.TAG_NAME, "input")
        print("  ✓ 找到输入框")
        
        # 输入测试消息
        input_box.send_keys("我最近头痛")
        print("  ✓ 输入测试消息")
        
        # 查找发送按钮
        send_button = driver.find_element(By.XPATH, "//button[contains(text(), '发送')]")
        send_button.click()
        print("  ✓ 点击发送按钮")
        
        time.sleep(2)
        
        return True
    except Exception as e:
        print(f"  ✗ 测试失败: {e}")
        return False

def test_navigation(driver):
    """测试导航功能"""
    print("\n[测试] 导航功能")
    try:
        # 测试各个导航链接
        nav_items = ["首页", "问诊", "健康记录", "预约"]
        for item in nav_items:
            try:
                link = driver.find_element(By.XPATH, f"//a[contains(text(), '{item}')]")
                link.click()
                time.sleep(2)
                print(f"  ✓ 导航到: {item}")
            except:
                print(f"  ✗ 无法导航到: {item}")
        
        return True
    except Exception as e:
        print(f"  ✗ 测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print("=== AI Health Assistant 浏览器自动化测试 ===")
    print("\n启动 Chrome 浏览器...")
    
    driver = setup_chrome()
    if not driver:
        return
    
    try:
        # 访问首页
        print("\n访问 http://localhost:5003")
        driver.get("http://localhost:5003")
        time.sleep(5)
        
        # 检查页面是否加载
        print(f"  页面标题: {driver.title}")
        print(f"  当前 URL: {driver.current_url}")
        
        # 执行测试
        test_dashboard(driver)
        test_chat(driver)
        test_navigation(driver)
        
        # 截图
        print("\n[操作] 截取页面截图")
        driver.save_screenshot("test_screenshot.png")
        print("  ✓ 截图已保存: test_screenshot.png")
        
        print("\n=== 测试完成 ===")
        print("浏览器将保持打开状态 10 秒...")
        time.sleep(10)
        
    except Exception as e:
        print(f"\n测试过程中出错: {e}")
    finally:
        driver.quit()
        print("浏览器已关闭")

if __name__ == "__main__":
    main()
