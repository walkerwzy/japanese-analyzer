// API与分析相关的服务函数

export interface TokenData {
  word: string;
  pos: string;
  furigana?: string;
  romaji?: string;
}

export interface WordDetail {
  originalWord: string;
  chineseTranslation: string;
  pos: string;
  furigana?: string;
  romaji?: string;
  dictionaryForm?: string;
  explanation: string;
}

// 默认API地址
export const DEFAULT_API_URL = 
  process.env.API_URL || 
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

export const DEFAULT_API_KEY = process.env.API_KEY || "";
export const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

// 分析日语句子
export async function analyzeSentence(
  sentence: string, 
  apiKey: string, 
  apiUrl: string = DEFAULT_API_URL
): Promise<TokenData[]> {
  if (!sentence) {
    throw new Error('缺少句子');
  }
  
  if (!apiKey) {
    throw new Error('缺少API密钥，请在设置中填写');
  }

  const analysisPrompt = `请对以下日语句子进行详细的词法分析，并以JSON数组格式返回结果。每个对象应包含以下字段："word", "pos", "furigana", "romaji"。确保输出是严格的JSON格式，不包含任何markdown或其他非JSON字符。
待解析句子： "${sentence}"`;
  
  const payload = {
    model: MODEL_NAME,
    reasoning_effort: "none",
    messages: [{ role: "user", content: analysisPrompt }],
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Error (Analysis):', errorData);
    throw new Error(`解析失败：${errorData.error?.message || response.statusText || '未知错误'}`);
  }
  
  const result = await response.json();

  if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
    let responseContent = result.choices[0].message.content;
    try {
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        responseContent = jsonMatch[1];
      }
      return JSON.parse(responseContent) as TokenData[];
    } catch (e) {
      console.error("Failed to parse JSON from analysis response:", e, responseContent);
      throw new Error('解析结果JSON格式错误');
    }
  } else {
    console.error('Unexpected API response structure (Analysis):', result);
    throw new Error('解析结果格式错误，请重试');
  }
} 