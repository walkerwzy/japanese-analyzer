# 日本語文章解析器

AI驱动的日语文章解析工具，帮助中文用户深入理解日语句子结构与词义。

## 特点

- 🔍 日语句子详细解析，包括词性、发音和罗马音标注
- 🈸 每个词汇的详细释义和例句
- 🖼️ 图片文字识别功能，轻松从图片中提取日文
- 🔈 内置朗读功能，纠正发音
- 🔄 整句翻译为中文

## 安全说明

**重要**: API密钥仅存储在服务器端，所有API请求通过服务器API路由进行代理处理，确保API密钥的安全。

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
   - `API_URL`: Gemini API URL
   - `API_KEY`: 你的Gemini API密钥

### 技术栈

- Next.js
- TypeScript
- Tailwind CSS
- Gemini AI API

## 许可证

MIT

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
