import { NextRequest, NextResponse } from 'next/server';

// API密钥从环境变量获取，不暴露给前端
const API_KEY = process.env.API_KEY || '';
const API_URL = process.env.API_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

// 配置API路由支持大尺寸请求
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    // 获取请求内容
    const requestBody = await req.text();
    let parsedBody;
    
    try {
      // 尝试解析请求体为JSON
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: { message: '请求体解析失败，请确保发送有效的JSON格式' } },
        { status: 400 }
      );
    }
    
    const { imageData, prompt, model = MODEL_NAME, apiUrl } = parsedBody;
    
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

    if (!imageData) {
      return NextResponse.json(
        { error: { message: '缺少必要的图片数据' } },
        { status: 400 }
      );
    }

    // 构建发送到AI服务的请求
    const payload = {
      model: model,
      reasoning_effort: "none",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt || "请提取并返回这张图片中的所有日文文字。不要添加任何解释。" },
            {
              type: "image_url",
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ]
    };

    // 验证imageData大小
    if (imageData.length > 1024 * 1024 * 8) { // 8MB限制
      return NextResponse.json(
        { error: { message: '图片数据太大，请压缩后重试' } },
        { status: 413 }
      );
    }

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
    let data;
    try {
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
      } catch (_error) {
        console.error('Failed to parse API response:', responseText.substring(0, 200) + '...');
        return NextResponse.json(
          { error: { message: '无法解析API响应，请稍后重试' } },
          { status: 500 }
        );
      }
    } catch (readError) {
      console.error('Failed to read API response:', readError);
      return NextResponse.json(
        { error: { message: '读取API响应时出错，请稍后重试' } },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('AI API error (Image):', data);
      return NextResponse.json(
        { error: data.error || { message: '处理图片请求时出错' } },
        { status: response.status }
      );
    }

    // 将AI API的响应传回给客户端
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error (Image):', error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : '服务器错误' } },
      { status: 500 }
    );
  }
} 