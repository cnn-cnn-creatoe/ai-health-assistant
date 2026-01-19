# AI Health Assistant - Frontend

AI 健康助手前端应用，基于 React + TypeScript + Tailwind CSS 构建。

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 http://localhost:3000 运行

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/     # 可复用组件
│   ├── Layout.tsx
│   ├── HealthCard.tsx
│   └── ChatBubble.tsx
├── pages/         # 页面组件
│   ├── Dashboard.tsx
│   ├── Chat.tsx
│   ├── Records.tsx
│   └── Appointments.tsx
├── services/      # API 服务
│   └── api.ts
└── styles/        # 样式文件
    └── index.css
```

## 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```
VITE_API_BASE_URL=http://localhost:8000/api
```

## 设计系统

项目使用医疗健康主题设计系统，配色方案：
- 医疗蓝: #4A90E2
- 健康绿: #52C41A
- 警告橙: #FA8C16
- 危险红: #F5222D

详细设计规范请查看 `../design-system/healthcare-theme.json`
