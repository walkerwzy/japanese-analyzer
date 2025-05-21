'use client';

import { useState } from 'react';
import InputSection from './components/InputSection';
import AnalysisResult from './components/AnalysisResult';
import TranslationSection from './components/TranslationSection';
import { analyzeSentence, TokenData } from './services/api';

export default function Home() {
  const [currentSentence, setCurrentSentence] = useState('');
  const [analyzedTokens, setAnalyzedTokens] = useState<TokenData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const handleAnalyze = async (text: string) => {
    if (!text) return;
    
    setIsAnalyzing(true);
    setAnalysisError('');
    setCurrentSentence(text);
    
    try {
      const tokens = await analyzeSentence(text);
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
            />
          )}

          {!isAnalyzing && currentSentence && (
            <TranslationSection 
              japaneseText={currentSentence}
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
