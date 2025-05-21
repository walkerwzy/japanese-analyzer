# 日本語文章解析器

AI驱动的日语文章解析工具，帮助中文用户深入理解日语句子结构与词义。

## 特点

- 🔍 日语句子详细解析，包括词性、发音和罗马音标注
- 🈸 每个词汇的详细释义和例句
- 🖼️ 图片文字识别功能，轻松从图片中提取日文
- 🔈 内置朗读功能
- 🔄 整句翻译为中文


## 部署说明

### 本地开发

1. 克隆仓库
```bash
git clone https://github.com/cokice/japanese-analyzer.git
cd japanese-analyzer
```

2. 安装依赖
```bash
npm install
```

3. 创建 `.env.local` 文件并添加API密钥
```
API_URL=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
API_KEY=your_gemini_api_key_here
```

4. 启动开发服务器
```bash
npm run dev
```

### Vercel部署

1. 在Vercel部署项目
2. 在Vercel项目设置中添加以下环境变量：
   - `API_URL`: Gemini API URL（可选）
   - `API_KEY`: 你的Gemini API密钥（必选）

### 技术栈

- Next.js
- TypeScript
- Tailwind CSS
- Gemini AI API

## 许可证

MIT
