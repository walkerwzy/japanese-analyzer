'use client';

import { useState, useEffect } from 'react';

interface SettingsModalProps {
  userApiKey: string;
  userApiUrl: string;
  defaultApiUrl: string;
  onSaveSettings: (apiKey: string, apiUrl: string) => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

export default function SettingsModal({ 
  userApiKey, 
  userApiUrl,
  defaultApiUrl,
  onSaveSettings,
  isModalOpen,
  onModalClose
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(userApiKey);
  const [apiUrl, setApiUrl] = useState(userApiUrl === defaultApiUrl ? '' : userApiUrl);
  const [status, setStatus] = useState('');
  const [statusClass, setStatusClass] = useState('');

  useEffect(() => {
    setApiKey(userApiKey);
    setApiUrl(userApiUrl === defaultApiUrl ? '' : userApiUrl);
  }, [userApiKey, userApiUrl, defaultApiUrl]);

  const closeModal = () => {
    onModalClose();
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
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
    setTimeout(() => closeModal(), 1500);
  };

  return (
    <>
      <button 
        id="settingsButton" 
        title="API 设置"
        onClick={onModalClose}
        className="fixed top-6 right-6 z-1000 bg-white text-[#007AFF] border border-[#007AFF] rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-50 transition-all"
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
          <span 
            id="closeSettingsModal" 
            className="settings-modal-close-button"
            onClick={closeModal}
          >
            &times;
          </span>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">自定义API设置</h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              应用默认使用服务器端API密钥，无需配置即可使用。如需使用自己的密钥和API，请在下方配置。
            </p>
            
            <label htmlFor="modalApiKeyInput" className="block text-sm font-medium text-gray-700 mb-1">
              自定义 API 密钥 (可选):
            </label>
            <input 
              type="password" 
              id="modalApiKeyInput" 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
              placeholder="输入您的 API 密钥"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="modalApiUrlInput" className="block text-sm font-medium text-gray-700 mb-1">
              自定义 API URL (可选):
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
          {status && <div id="settingsStatus" className={statusClass}>{status}</div>}
          
          <div className="mt-4 text-xs text-gray-500">
            <p>注意：自定义密钥仅存储在您的浏览器中，不会传输到我们的服务器。</p>
          </div>
        </div>
      </div>
    </>
  );
} 