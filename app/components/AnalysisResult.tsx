'use client';

import { useState, useEffect, useRef } from 'react';
import { containsKanji, getPosClass, posChineseMap, speakJapanese } from '../utils/helpers';

interface TokenData {
  word: string;
  pos: string;
  furigana?: string;
  romaji?: string;
}

interface WordDetail {
  originalWord: string;
  chineseTranslation: string;
  pos: string;
  furigana?: string;
  romaji?: string;
  dictionaryForm?: string;
  explanation: string;
}

interface AnalysisResultProps {
  tokens: TokenData[];
  originalSentence: string;
  apiKey: string;
  apiUrl: string;
  onShowSettingsModal: () => void;
}

export default function AnalysisResult({ 
  tokens, 
  originalSentence,
  apiKey,
  apiUrl,
  onShowSettingsModal
}: AnalysisResultProps) {
  const [activeWordToken, setActiveWordToken] = useState<HTMLElement | null>(null);
  const [wordDetail, setWordDetail] = useState<WordDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleWordClick = async (e: React.MouseEvent<HTMLSpanElement>, token: TokenData) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    
    // 如果点击的是当前活动词，切换关闭
    if (activeWordToken === target) {
      setActiveWordToken(null);
      setWordDetail(null);
      return;
    }

    // 设置新活动词
    if (activeWordToken) {
      activeWordToken.classList.remove('active-word');
    }
    target.classList.add('active-word');
    setActiveWordToken(target);
    
    // 获取词汇详情
    await fetchWordDetails(token.word, token.pos, originalSentence, token.furigana, token.romaji);
  };

  const fetchWordDetails = async (word: string, pos: string, sentence: string, furigana?: string, romaji?: string) => {
    if (!apiKey) {
      onShowSettingsModal();
      return;
    }

    setIsLoading(true);

    let contextWordInfo = `单词 "${word}" (词性: ${pos}`;
    if (furigana && furigana !== word && containsKanji(word)) contextWordInfo += `, 读音: ${furigana}`;
    if (romaji) contextWordInfo += `, 罗马音: ${romaji}`;
    contextWordInfo += `)`;

    const wordDetailPrompt = `在日语句子 "${sentence}" 的上下文中，${contextWordInfo} 的具体含义是什么？请提供以下信息，并以严格的JSON对象格式返回，不要包含任何markdown或其他非JSON字符：
{
  "originalWord": "${word}",
  "chineseTranslation": "中文翻译",
  "pos": "${pos}",
  "furigana": "${(furigana && furigana !== word && containsKanji(word)) ? furigana : ''}",
  "romaji": "${romaji || ''}",
  "dictionaryForm": "辞书形（如果适用）",
  "explanation": "中文解释（包括外来语来源和活用形原因）"
}`;

    const payload = {
      model: "gemini-2.5-flash-preview-05-20",
      reasoning_effort: "none",
      messages: [{ role: "user", content: wordDetailPrompt }],
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      let details: WordDetail;

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error (Word Detail):', errorData);
        details = { 
          originalWord: word, 
          pos: pos, 
          furigana: (furigana && furigana !== word && containsKanji(word)) ? furigana : '', 
          romaji: romaji || '', 
          dictionaryForm: '', 
          chineseTranslation: '错误', 
          explanation: `查询释义失败：${errorData.error?.message || response.statusText || '未知错误'}` 
        };
      } else {
        const result = await response.json();
        if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
          let responseContent = result.choices[0].message.content;
          try {
            const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
              responseContent = jsonMatch[1];
            }
            details = JSON.parse(responseContent);
            if (!details.furigana && furigana && furigana !== word && containsKanji(word)) details.furigana = furigana;
            if (!details.romaji && romaji) details.romaji = romaji;
          } catch (e) {
            console.error("Failed to parse JSON from word detail response:", e, responseContent);
            details = { 
              originalWord: word, 
              pos: pos, 
              furigana: (furigana && furigana !== word && containsKanji(word)) ? furigana : '', 
              romaji: romaji || '', 
              dictionaryForm: '', 
              chineseTranslation: '错误', 
              explanation: `释义结果JSON格式错误。原始回复: ${responseContent}`
            };
          }
        } else {
          console.error('Unexpected API response structure for word detail:', result);
          details = { 
            originalWord: word, 
            pos: pos, 
            furigana: (furigana && furigana !== word && containsKanji(word)) ? furigana : '', 
            romaji: romaji || '', 
            dictionaryForm: '', 
            chineseTranslation: '错误', 
            explanation: '释义结果格式错误。'
          };
        }
      }
      setWordDetail(details);

    } catch (error) {
      console.error('Error fetching word details:', error);
      setWordDetail({ 
        originalWord: word, 
        pos: pos, 
        furigana: (furigana && furigana !== word && containsKanji(word)) ? furigana : '', 
        romaji: romaji || '', 
        dictionaryForm: '', 
        chineseTranslation: '错误', 
        explanation: `查询释义时发生错误: ${error instanceof Error ? error.message : '未知错误'}。`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseWordDetail = () => {
    if (activeWordToken) {
      activeWordToken.classList.remove('active-word');
      setActiveWordToken(null);
    }
    setWordDetail(null);
  };

  // 点击外部关闭详情
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeWordToken && 
        wordDetail && 
        !(activeWordToken.contains(event.target as Node)) && 
        !(document.getElementById('wordDetailInlineContainer')?.contains(event.target as Node)) &&
        !(event.target as Element)?.closest('.word-unit-wrapper')
      ) {
        handleCloseWordDetail();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeWordToken, wordDetail]);

  if (!tokens || tokens.length === 0) {
    return null;
  }

  return (
    <div className="premium-card">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">解析结果</h2>
      <div id="analyzedSentenceOutput" className="text-gray-800 mb-2 p-3 bg-gray-50 rounded-lg min-h-[70px]">
        {tokens.map((token, index) => (
          <span key={index} className="word-unit-wrapper tooltip">
            <span 
              className={`word-token ${getPosClass(token.pos)}`}
              onClick={(e) => handleWordClick(e, token)}
            >
              <ruby>
                <rb>{token.word}</rb>
                {token.furigana && token.furigana !== token.word && containsKanji(token.word) && token.pos !== '記号' && (
                  <rt>{token.furigana}</rt>
                )}
              </ruby>
            </span>
            
            {token.romaji && token.pos !== '記号' && (
              <span className="romaji-text">{token.romaji}</span>
            )}
            
            <span className="tooltiptext">
              {posChineseMap[token.pos.split('-')[0]] || posChineseMap['default']}
            </span>
          </span>
        ))}
      </div>
      
      {(isLoading || wordDetail) && (
        <div id="wordDetailInlineContainer" style={{ display: 'block' }}>
          <button 
            className="detail-close-button" 
            title="关闭详情"
            onClick={handleCloseWordDetail}
          >
            &times;
          </button>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-5">
              <div className="loading-spinner"></div>
              <span className="ml-2 text-gray-600">正在查询释义...</span>
            </div>
          ) : wordDetail && (
            <>
              <h3 className="text-xl font-semibold text-[#007AFF] mb-3">词汇详解</h3>
              <p className="mb-1">
                <strong>原文:</strong> 
                <span className="font-mono text-lg text-gray-800">{wordDetail.originalWord}</span> 
                <button 
                  className="read-aloud-button" 
                  title="朗读此词汇"
                  onClick={() => speakJapanese(wordDetail.originalWord)}
                >
                  <i className="fas fa-volume-up"></i>
                </button>
              </p>
              
              {wordDetail.furigana && (
                <p className="mb-1">
                  <strong>读音 (Furigana):</strong> 
                  <span className="text-sm text-purple-700">{wordDetail.furigana}</span>
                </p>
              )}
              
              {wordDetail.romaji && (
                <p className="mb-1">
                  <strong>罗马音 (Romaji):</strong> 
                  <span className="text-sm text-cyan-700">{wordDetail.romaji}</span>
                </p>
              )}
              
              {wordDetail.dictionaryForm && wordDetail.dictionaryForm !== wordDetail.originalWord && (
                <p className="mb-2">
                  <strong>辞书形:</strong> 
                  <span className="text-md text-blue-700 font-medium">{wordDetail.dictionaryForm}</span>
                </p>
              )}
              
              <p className="mb-2">
                <strong>词性:</strong> 
                <span className={`detail-pos-tag ${getPosClass(wordDetail.pos)}`}>
                  {wordDetail.pos} ({posChineseMap[wordDetail.pos.split('-')[0]] || posChineseMap['default']})
                </span>
              </p>
              
              <p className="mb-2">
                <strong>中文译文:</strong> 
                <span className="text-lg text-green-700 font-medium">{wordDetail.chineseTranslation}</span>
              </p>
              
              <div className="mb-1"><strong>解释:</strong></div>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md text-base leading-relaxed">
                {wordDetail.explanation}
              </p>
            </>
          )}
        </div>
      )}
      
      <p className="text-sm text-gray-500 italic mt-3">点击词汇查看详细释义。悬停词汇可查看词性。</p>
    </div>
  );
} 