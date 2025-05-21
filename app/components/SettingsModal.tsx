'use client';

import { useState, useEffect } from 'react';

interface SettingsModalProps {
  userProvidedApiKey: string;
  userProvidedApiUrl: string;
  defaultApiUrl: string;
  onSaveSettings: (apiKey: string, apiUrl: string) => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

export default function SettingsModal({ 
  userProvidedApiKey, 
  userProvidedApiUrl,
  defaultApiUrl,
  onSaveSettings,
  isModalOpen,
  onModalClose
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(userProvidedApiKey);
  const [apiUrl, setApiUrl] = useState(userProvidedApiUrl === defaultApiUrl ? '' : userProvidedApiUrl);
  const [status, setStatus] = useState('');
  const [statusClass, setStatusClass] = useState('');

  useEffect(() => {
    setApiKey(userProvidedApiKey);
    setApiUrl(userProvidedApiUrl === defaultApiUrl ? '' : userProvidedApiUrl);
  }, [userProvidedApiKey, userProvidedApiUrl, defaultApiUrl]);

  const closeModal = () => {
    onModalClose();
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && userProvidedApiKey) {
      // 只有在已经有API密钥的情况下，才允许点击外部关闭
      closeModal();
    }
  };

  const handleSaveSettings = () => {
    const trimmedApiKey = apiKey.trim();
    const trimmedApiUrl = apiUrl.trim();
    
    onSaveSettings(
      trimmedApiKey, 
      trimmedApiUrl || defaultApiUrl
    );
    
    setStatus('设置已保存！');
    setStatusClass('mt-3 text-sm text-green-600');
    
    // 如果保存后有API密钥，则关闭模态框
    if (trimmedApiKey) {
      setTimeout(() => closeModal(), 1500);
    }
  };

  return (
    <>
      <button 
        id="settingsButton" 
        title="API 设置"
        onClick={onModalClose}
      >
        <i className="fas fa-cog"></i>
      </button>

      <div 
        id="settingsModal" 
        className="settings-modal" 
        style={{ display: isModalOpen ? 'flex' : 'none' }}
        onClick={handleOutsideClick}
      >
        <div className="settings-modal-content">
          {userProvidedApiKey && (
            <span 
              id="closeSettingsModal" 
              className="settings-modal-close-button"
              onClick={closeModal}
            >
              &times;
            </span>
          )}
          <h3 className="text-xl font-semibold text-gray-700 mb-4">API 设置</h3>
          
          <div className="mb-4">
            <label htmlFor="modalApiKeyInput" className="block text-sm font-medium text-gray-700 mb-1">
              Gemini API 密钥:
            </label>
            <input 
              type="password" 
              id="modalApiKeyInput" 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              placeholder="输入您的 API 密钥"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {!userProvidedApiKey && (
              <p className="text-xs text-red-500 mt-1">请设置API密钥以使用应用功能</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="modalApiUrlInput" className="block text-sm font-medium text-gray-700 mb-1">
              自定义 API URL (OpenAI 兼容):
            </label>
            <input 
              type="text" 
              id="modalApiUrlInput" 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              placeholder="例如: https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">留空则使用默认端点。</p>
          </div>

          <button 
            id="saveSettingsButton" 
            className="premium-button premium-button-success w-full"
            onClick={handleSaveSettings}
          >
            <i className="fas fa-save mr-2"></i>保存设置
          </button>
          <div id="settingsStatus" className={statusClass}>{status}</div>
        </div>
      </div>
    </>
  );
} 