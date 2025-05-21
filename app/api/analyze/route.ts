import { NextRequest, NextResponse } from 'next/server';

// API密钥从环境变量获取，不暴露给前端
const API_KEY = process.env.API_KEY || '';
const API_URL = process.env.API_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const requestData = await req.json();
    
    if (!API_KEY) {
      return NextResponse.json(
        { error: { message: '服务器未配置API密钥' } },
        { status: 500 }
      );
    }

    // 从请求中提取数据
    const { prompt, model = MODEL_NAME } = requestData;
    
    if (!prompt) {
      return NextResponse.json(
        { error: { message: '缺少必要的prompt参数' } },
        { status: 400 }
      );
    }

    // 构建发送到AI服务的请求
    const payload = {
      model: model,
      reasoning_effort: "none", 
      messages: [{ role: "user", content: prompt }],
    };

    // 发送到实际的AI API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    // 获取AI API的响应
    const data = await response.json();

    if (!response.ok) {
      console.error('AI API error:', data);
      return NextResponse.json(
        { error: data.error || { message: '处理请求时出错' } },
        { status: response.status }
      );
    }

    // 将AI API的响应传回给客户端
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : '服务器错误' } },
      { status: 500 }
    );
  }
} 