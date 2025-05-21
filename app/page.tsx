'use client';

import { useState, useEffect } from 'react';
import SettingsModal from './components/SettingsModal';
import InputSection from './components/InputSection';
import AnalysisResult from './components/AnalysisResult';
import TranslationSection from './components/TranslationSection';
import { analyzeSentence, TokenData, DEFAULT_API_URL } from './services/api';
import { saveApiSettings, getApiSettings } from './utils/helpers';

export default function Home() {
  const [currentSentence, setCurrentSentence] = useState('');
  const [analyzedTokens, setAnalyzedTokens] = useState<TokenData[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // 从localStorage加载设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { apiKey: savedApiKey, apiUrl: savedApiUrl } = getApiSettings();
      if (savedApiKey) setApiKey(savedApiKey);
      if (savedApiUrl) setApiUrl(savedApiUrl);
      
      // 如果没有API密钥，显示设置模态框
      if (!savedApiKey) {
        setShowSettingsModal(true);
      }
    }
  }, []);

  const handleApiSettingsSave = (newApiKey: string, newApiUrl: string) => {
    setApiKey(newApiKey);
    setApiUrl(newApiUrl || DEFAULT_API_URL);
    saveApiSettings(newApiKey, newApiUrl || DEFAULT_API_URL);
    
    // 只有当保存了API密钥时才关闭设置窗口
    if (newApiKey) {
      setShowSettingsModal(false);
    }
  };

  const handleAnalyze = async (text: string) => {
    if (!text) return;
    
    if (!apiKey) {
      setShowSettingsModal(true);
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError('');
    setCurrentSentence(text);
    
    try {
      const tokens = await analyzeSentence(text, apiKey, apiUrl);
      setAnalyzedTokens(tokens);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : '未知错误');
      setAnalyzedTokens([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSettingsModal = () => {
    setShowSettingsModal(!showSettingsModal);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-8 sm:pt-12 lg:pt-16 p-4">
      <SettingsModal 
        userProvidedApiKey={apiKey}
        userProvidedApiUrl={apiUrl}
        defaultApiUrl={DEFAULT_API_URL}
        onSaveSettings={handleApiSettingsSave}
        isModalOpen={showSettingsModal}
        onModalClose={toggleSettingsModal}
      />

      <div className="w-full max-w-3xl">
        <header className="text-center mb-8 mt-16">
          <h1 className="text-4xl font-bold text-gray-800">日本語<span className="text-[#007AFF]">文章</span>解析器</h1>
          <p className="text-lg text-gray-600 mt-2">AI驱动・深入理解日语句子结构与词义</p>
        </header>

        <main>
          <InputSection 
            onAnalyze={handleAnalyze}
            apiKey={apiKey}
            apiUrl={apiUrl}
            onShowSettingsModal={() => setShowSettingsModal(true)}
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
              apiKey={apiKey}
              apiUrl={apiUrl}
              onShowSettingsModal={() => setShowSettingsModal(true)}
            />
          )}

          {!isAnalyzing && currentSentence && (
            <TranslationSection 
              japaneseText={currentSentence}
              apiKey={apiKey}
              apiUrl={apiUrl}
              onShowSettingsModal={() => setShowSettingsModal(true)}
            />
          )}
        </main>

        <footer className="text-center mt-12 py-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">&copy; 2025 高级日语解析工具. All rights reserved.</p>
          <p className="text-gray-400 text-xs mt-1">Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
}
