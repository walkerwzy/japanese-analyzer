import { NextRequest, NextResponse } from 'next/server';

// API密钥从环境变量获取，不暴露给前端
const API_KEY = process.env.API_KEY || '';
const API_URL = process.env.API_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

// 启用Edge Runtime，适用于Vercel部署
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const { word, pos, sentence, furigana, romaji, model = MODEL_NAME, apiUrl } = await req.json();
    
    // 从请求头中获取用户提供的API密钥（如果有）
    const authHeader = req.headers.get('Authorization');
    const userApiKey = authHeader ? authHeader.replace('Bearer ', '') : '';
    
    // 优先使用用户API密钥，如果没有则使用环境变量中的密钥
    const effectiveApiKey = userApiKey || API_KEY;
    
    // 优先使用用户提供的API URL，否则使用环境变量中的URL
    const effectiveApiUrl = apiUrl || API_URL;
    
    if (!effectiveApiKey) {
      return NextResponse.json(
        { error: { message: '未提供API密钥，请在设置中配置API密钥或联系管理员配置服务器密钥' } },
        { status: 500 }
      );
    }

    if (!word || !pos || !sentence) {
      return NextResponse.json(
        { error: { message: '缺少必要的参数' } },
        { status: 400 }
      );
    }

    // 构建上下文信息
    let contextWordInfo = `单词 "${word}" (词性: ${pos}`;
    if (furigana) contextWordInfo += `, 读音: ${furigana}`;
    if (romaji) contextWordInfo += `, 罗马音: ${romaji}`;
    contextWordInfo += `)`;

    // 构建详情查询请求
    const detailPrompt = `在日语句子 "${sentence}" 的上下文中，${contextWordInfo} 的具体含义是什么？请提供以下信息，并以严格的JSON对象格式返回，不要包含任何markdown或其他非JSON字符：

请特别注意：
1. 如果是动词，准确识别其时态（过去式、现在式等）、语态（被动、使役等）和礼貌程度（简体、敬体等）
2. 对于助动词与动词组合（如"食べた"），明确说明原形及活用变化过程
3. 对于形容词，注意区分い形容词和な形容词，并识别其活用形式
4. 准确提供辞书形，对于已经是辞书形的词汇，可以填写相同的值

{
  "originalWord": "${word}",
  "chineseTranslation": "中文翻译",
  "pos": "${pos}",
  "furigana": "${furigana || ''}",
  "romaji": "${romaji || ''}",
  "dictionaryForm": "辞书形（如果适用）",
  "explanation": "中文解释（包括词形变化、时态、语态等详细语法信息）"
}`;

    const payload = {
      model: model,
      reasoning_effort: "none",
      messages: [{ role: "user", content: detailPrompt }],
    };

    // 发送到实际的AI API
    const response = await fetch(effectiveApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveApiKey}`
      },
      body: JSON.stringify(payload)
    });

    // 获取AI API的响应
    const data = await response.json();

    if (!response.ok) {
      console.error('AI API error (Word Detail):', data);
      return NextResponse.json(
        { error: data.error || { message: '获取词汇详情时出错' } },
        { status: response.status }
      );
    }

    // 将AI API的响应传回给客户端
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error (Word Detail):', error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : '服务器错误' } },
      { status: 500 }
    );
  }
} 