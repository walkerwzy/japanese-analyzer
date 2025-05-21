'use client';

import { useState, useEffect } from 'react';
import InputSection from './components/InputSection';
import AnalysisResult from './components/AnalysisResult';
import TranslationSection from './components/TranslationSection';
import SettingsModal from './components/SettingsModal';
import { analyzeSentence, TokenData, DEFAULT_API_URL } from './services/api';

export default function Home() {
  const [currentSentence, setCurrentSentence] = useState('');
  const [analyzedTokens, setAnalyzedTokens] = useState<TokenData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  
  // API设置相关状态
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  const [userApiUrl, setUserApiUrl] = useState(DEFAULT_API_URL);

  // 从本地存储加载用户API设置
  useEffect(() => {
    const storedApiKey = localStorage.getItem('userApiKey') || '';
    const storedApiUrl = localStorage.getItem('userApiUrl') || DEFAULT_API_URL;
    
    setUserApiKey(storedApiKey);
    setUserApiUrl(storedApiUrl);
  }, []);
  
  // 保存用户API设置
  const handleSaveSettings = (apiKey: string, apiUrl: string) => {
    localStorage.setItem('userApiKey', apiKey);
    localStorage.setItem('userApiUrl', apiUrl);
    
    setUserApiKey(apiKey);
    setUserApiUrl(apiUrl);
  };

  const handleAnalyze = async (text: string) => {
    if (!text) return;
    
    setIsAnalyzing(true);
    setAnalysisError('');
    setCurrentSentence(text);
    
    try {
      // 传递用户API设置
      const tokens = await analyzeSentence(text, userApiKey, userApiUrl);
      setAnalyzedTokens(tokens);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : '未知错误');
      setAnalyzedTokens([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-8 sm:pt-12 lg:pt-16 p-4">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-8 mt-16">
          <h1 className="text-4xl font-bold text-gray-800">日本語<span className="text-[#007AFF]">文章</span>解析器</h1>
          <p className="text-lg text-gray-600 mt-2">AI驱动・深入理解日语句子结构与词义</p>
        </header>

        <main>
          <InputSection 
            onAnalyze={handleAnalyze}
            userApiKey={userApiKey}
            userApiUrl={userApiUrl}
          />

          {isAnalyzing && (
            <div className="premium-card">
              <div className="flex items-center justify-center py-6">
                <div className="loading-spinner"></div>
                <span className="ml-3 text-gray-600">正在解析中，请稍候...</span>
              </div>
            </div>
          )}

          {analysisError && (
            <div className="premium-card">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-circle text-red-500"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      解析错误：{analysisError}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isAnalyzing && !analysisError && analyzedTokens.length > 0 && (
            <AnalysisResult 
              tokens={analyzedTokens}
              originalSentence={currentSentence}
              userApiKey={userApiKey}
              userApiUrl={userApiUrl}
            />
          )}

          {!isAnalyzing && currentSentence && (
            <TranslationSection 
              japaneseText={currentSentence}
              userApiKey={userApiKey}
              userApiUrl={userApiUrl}
            />
          )}
        </main>

        <footer className="text-center mt-12 py-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">&copy; 2025 高级日语解析工具. All rights reserved.</p>
          <p className="text-gray-400 text-xs mt-1">Powered by Gemini AI</p>
        </footer>
      </div>
      
      {/* 设置模态框 */}
      <SettingsModal
        userApiKey={userApiKey}
        userApiUrl={userApiUrl}
        defaultApiUrl={DEFAULT_API_URL}
        onSaveSettings={handleSaveSettings}
        isModalOpen={isSettingsModalOpen}
        onModalClose={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
      />
    </div>
  );
}
