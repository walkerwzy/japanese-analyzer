'use client';

import { useState } from 'react';

interface TranslationSectionProps {
  japaneseText: string;
  apiKey: string;
  apiUrl: string;
  onShowSettingsModal: () => void;
}

export default function TranslationSection({ 
  japaneseText, 
  apiKey, 
  apiUrl,
  onShowSettingsModal
}: TranslationSectionProps) {
  const [translation, setTranslation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleTranslate = async () => {
    if (!japaneseText) {
      alert('请先输入或分析日语句子！');
      return;
    }

    if (!apiKey) {
      onShowSettingsModal();
      return;
    }

    setIsLoading(true);
    setIsVisible(true); // 确保显示翻译区域

    try {
      const translationPrompt = `请将以下日语句子翻译成简体中文：\n\n"${japaneseText}"\n\n请仅返回翻译后的中文文本。`;
      const payload = {
        model: "gemini-2.5-flash-preview-05-20",
        reasoning_effort: "none",
        messages: [{ role: "user", content: translationPrompt }]
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
        console.error('API Error (Full Translate):', errorData);
        setTranslation(`翻译失败：${errorData.error?.message || response.statusText || '未知错误'}`);
        return;
      }
      
      const result = await response.json();
      if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
        setTranslation(result.choices[0].message.content);
      } else {
        setTranslation('翻译结果格式错误。');
        console.error('Unexpected API response structure for full translation:', result);
      }
    } catch (error) {
      console.error('Error during full sentence translation:', error);
      setTranslation(`翻译时发生错误: ${error instanceof Error ? error.message : '未知错误'}。`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button 
          id="translateSentenceButton" 
          className="premium-button premium-button-primary w-full sm:w-auto"
          onClick={handleTranslate}
          disabled={isLoading}
        >
          {!isLoading && <span className="button-text">翻译整句</span>}
          <div className="loading-spinner" style={{ display: isLoading ? 'inline-block' : 'none' }}></div>
          {isLoading && <span className="button-text">翻译中...</span>}
        </button>
      </div>

      {(isLoading || translation) && (
        <div id="fullTranslationCard" className="premium-card mt-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-semibold text-gray-700" style={{ marginBottom: isVisible ? '0.75rem' : '0' }}>全文翻译 (中)</h2>
            <button 
              id="toggleFullTranslationButton" 
              className="premium-button premium-button-outlined text-sm px-3 py-1"
              onClick={toggleVisibility}
            >
              {isVisible ? '隐藏' : '显示'}
            </button>
          </div>
          
          {isVisible && (
            <div id="fullTranslationOutput" className="text-gray-800 p-3 bg-gray-50 rounded-lg min-h-[50px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="loading-spinner"></div>
                  <span className="ml-2 text-gray-500">正在翻译，请稍候...</span>
                </div>
              ) : (
                translation
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
} 