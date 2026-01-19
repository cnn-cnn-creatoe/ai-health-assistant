# AI Health Assistant - AI 健康助手

基于 LangChain 框架构建的 AI 健康助手，集成 Galaxy UI 组件库和 UI UX Pro Max 设计系统。提供智能健康咨询、健康档案管理、用药提醒、体检提醒等全方位健康管理功能。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-green.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2-blue.svg)

## ✨ 功能特性

### 🤖 AI 健康助手
- **智能症状分析**：基于 LangChain + OpenAI 分析用户描述的症状
- **初步诊断建议**：提供基于循证医学的健康建议
- **紧急情况检测**：自动识别紧急医疗情况，引导用户立即就医
- **多轮对话支持**：支持上下文理解和对话记忆管理

### 📋 健康档案管理
- **文件上传**：支持 PDF、图片（PNG/JPG/GIF等）、Office 文档（Word/Excel/PowerPoint）
- **在线预览**：图片和 PDF 文件可直接在线预览
- **分类管理**：支持报告、指标、症状、其他等分类
- **数据导出**：支持导出为 PDF 报告或 JSON 数据
- **记录删除**：支持单个和批量删除

### 💊 用药提醒
- **用药计划管理**：添加、编辑、删除用药计划
- **智能提醒**：基于浏览器通知 API 的用药提醒
- **频率设置**：支持每日、每周、单次等提醒频率

### 📅 体检提醒
- **体检记录**：记录上次体检日期
- **周期设置**：支持6个月、1年或自定义周期
- **到期提醒**：自动检测到期提醒，发送通知
- **多提醒管理**：支持多个体检提醒同时管理

### 📊 健康数据可视化
- **仪表盘概览**：关键健康指标一目了然
- **趋势分析**：7天/30天健康数据趋势图表
- **健康评分**：基于历史数据的健康评分系统

### 🏥 就医导航
- **附近医院查找**：基于地理位置查找附近医院
- **一键导航**：集成地图导航功能

### 📚 健康知识库
- **健康科普**：丰富的健康知识文章
- **分类浏览**：按类别浏览健康知识
- **搜索功能**：快速查找相关健康知识

### 🔔 通知中心
- **集中管理**：统一管理所有通知
- **分类筛选**：按类型筛选通知
- **批量操作**：支持批量标记已读、按日期删除

### 🆘 紧急联系
- **快速拨号**：一键拨打120急救电话
- **紧急联系人**：快速联系设置的紧急联系人
- **多场景支持**：在 Dashboard 和 Chat 页面均可快速访问

## 📁 项目结构

```
agenttest/
├── frontend/              # React + TypeScript 前端
│   ├── src/
│   │   ├── components/   # UI 组件
│   │   │   ├── EmergencyButton.tsx  # 紧急联系按钮
│   │   │   ├── ConfirmDialog.tsx    # 确认对话框
│   │   │   └── ...
│   │   ├── pages/        # 页面组件
│   │   │   ├── Dashboard.tsx        # 仪表盘
│   │   │   ├── Chat.tsx             # AI 健康助手
│   │   │   ├── Records.tsx           # 健康档案
│   │   │   ├── Medications.tsx      # 用药提醒
│   │   │   ├── CheckupReminders.tsx # 体检提醒
│   │   │   └── ...
│   │   ├── services/     # API 服务
│   │   │   ├── exportService.ts     # 数据导出服务
│   │   │   ├── checkupReminders.ts  # 体检提醒服务
│   │   │   └── ...
│   │   └── styles/       # 样式文件
│   └── package.json
├── backend/              # Python + FastAPI 后端
│   ├── app/
│   │   ├── agents/       # LangChain agents
│   │   │   ├── health_assistant.py  # 健康助手主 Agent
│   │   │   └── tools.py             # 工具定义
│   │   ├── api/          # FastAPI 路由
│   │   │   └── routes.py
│   │   ├── models/       # 数据模型
│   │   └── services/     # 业务逻辑
│   ├── requirements.txt
│   └── run.py           # 启动脚本
├── components/           # Galaxy UI 组件库
├── design-system/        # UI UX Pro Max 设计系统
└── README.md
```

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript** - 现代化前端框架
- **Vite** - 快速构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **React Router** - 路由管理
- **Lucide React** - 图标库

### 后端
- **Python 3.10+** - 编程语言
- **FastAPI** - 现代 Web 框架
- **LangChain** - LLM 应用开发框架
- **LangGraph** - 状态机工作流
- **OpenAI API** - AI 能力

### UI/UX
- **Galaxy UI** - 3000+ UI 组件库
- **UI UX Pro Max** - 专业设计系统
- **医疗健康主题** - 专业医疗配色方案

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- Python 3.10+
- OpenAI API Key

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd agenttest
```

### 2. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 设置环境变量
# Windows:
set OPENAI_API_KEY=your_api_key
# Linux/Mac:
export OPENAI_API_KEY=your_api_key

# 运行服务器
python run.py
```

后端将在 http://localhost:8000 运行

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 http://localhost:5003 运行（或根据配置的端口）

### 4. 访问应用

打开浏览器访问：http://localhost:5003

## 📸 功能演示

### 1. AI 健康助手对话
- 输入症状描述，AI 助手会分析并提供建议
- 自动检测紧急情况，引导用户就医
- 支持多轮对话，保持上下文

### 2. 健康档案管理
- 上传 PDF、图片、Office 文档
- 在线预览图片和 PDF
- 按分类管理健康记录
- 导出 PDF 报告或 JSON 数据

### 3. 紧急联系功能
- Dashboard 和 Chat 页面都有紧急联系按钮
- 一键拨打120急救电话
- 快速联系紧急联系人

### 4. 体检提醒
- 设置上次体检日期和提醒周期
- 系统自动检测到期提醒
- 支持多个体检提醒管理

## 📖 使用指南

### 添加健康记录

1. 进入"健康档案"页面
2. 选择分类（报告/指标/症状/其他）
3. 点击"选择文件"上传文件
4. 文件会自动添加到对应分类

### 设置体检提醒

1. 进入"体检提醒"页面（从 Dashboard 快捷入口）
2. 填写上次体检日期
3. 选择提醒周期（6个月/1年/自定义）
4. 添加备注（可选）
5. 点击"添加"保存

### 导出健康数据

1. 进入"健康档案"页面
2. 点击右上角"导出PDF"或"导出JSON"
3. PDF 报告会打开打印窗口，可保存为 PDF
4. JSON 数据会直接下载

### 紧急情况处理

- 在任何页面看到紧急联系按钮，点击即可快速拨号
- 在 Chat 页面输入紧急症状时，AI 会自动检测并提示
- 紧急情况请立即拨打120或前往医院急诊科

## 🔧 配置说明

### 后端配置

编辑 `backend/app/main.py` 或通过环境变量配置：

```python
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4  # 可选，默认使用 gpt-3.5-turbo
```

### 前端配置

前端端口配置在 `frontend/vite.config.ts`：

```typescript
server: {
  port: 5003,  // 修改为你需要的端口
}
```

## 📝 API 文档

后端启动后，访问 http://localhost:8000/docs 查看完整的 API 文档（Swagger UI）。

### 主要 API 端点

- `POST /api/chat` - AI 健康助手对话
- `GET /api/records` - 获取健康记录
- `GET /health` - 健康检查

## 🎨 设计系统

项目使用医疗健康主题的设计系统：

- **主色调**：医疗蓝色 (#4A90E2)
- **辅助色**：健康绿色 (#52C41A)
- **专业风格**：清晰、可信的界面设计
- **可访问性**：符合 WCAG 标准

详细设计规范请查看 `design-system/healthcare-theme.json`

## ⚠️ 重要提示

### 医疗免责声明

- **本助手仅供参考，不能替代专业医疗诊断**
- 所有医疗建议必须包含免责声明
- 紧急情况必须引导用户联系专业医疗人员
- 不提供具体诊断或处方药推荐

### 数据隐私

- 所有数据存储在浏览器本地（localStorage）
- 不会上传到服务器（除 AI 对话内容）
- 建议定期导出数据备份
- 注意保护个人隐私信息

### 使用建议

- 不要在对话中输入身份证号、住址等敏感信息
- 定期备份健康数据
- 紧急情况请立即就医，不要依赖 AI 助手
- 定期更新体检提醒

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📚 参考项目

本项目参考了以下优秀的开源项目：

- [langgraph-medical-ai-assistant](https://github.com/taherfattahi/langgraph-medical-ai-assistant)
- [AI-HealthCare-Assistant](https://github.com/ahlem-phantom/AI-HealthCare-Assistant)
- [Heal-Smart](https://github.com/Mayank77maruti/Heal-Smart)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- LangChain 团队提供的优秀框架
- Galaxy UI 组件库
- UI UX Pro Max 设计系统
- 所有贡献者和用户

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送 Pull Request
- 邮件联系（如有）

---

**注意**：本项目仅供学习和参考使用，不提供医疗诊断服务。如有健康问题，请咨询专业医生。
