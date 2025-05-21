'use client';

import { useState } from 'react';
import { extractTextFromImage } from '../services/api';

interface InputSectionProps {
  onAnalyze: (text: string) => void;
}

export default function InputSection({ 
  onAnalyze
}: InputSectionProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false); 
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadStatusClass, setUploadStatusClass] = useState('');

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      alert('请输入日语句子！');
      return;
    }

    setIsLoading(true);
    onAnalyze(inputText);
    setTimeout(() => setIsLoading(false), 300); // 简化示例，实际应在分析完成后设置
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setUploadStatus('请上传图片文件！');
      setUploadStatusClass('mt-2 text-sm text-red-600');
      return;
    }

    setIsImageUploading(true);
    setUploadStatus('正在上传并识别图片中的文字...');
    setUploadStatusClass('mt-2 text-sm text-gray-600');

    // 文件转Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageData = reader.result as string; 
      
      try {
        const imageExtractionPrompt = "请仅提取并返回这张图片中的所有日文文字。不要添加任何其他评论、解释或格式化。如果文字是多行或者分散的，请将它们合并成一个单一的文本字符串，用换行符（\\n）分隔不同的文本块（如果适用）。";
        
        // 使用服务端API
        const extractedText = await extractTextFromImage(imageData, imageExtractionPrompt);
        setInputText(extractedText); 
        setUploadStatus('文字提取成功！请确认后点击"解析句子"。');
        setUploadStatusClass('mt-2 text-sm text-green-600');
      } catch (error) {
        console.error('Error during image text extraction:', error);
        setUploadStatus(`提取时发生错误: ${error instanceof Error ? error.message : '未知错误'}。`);
        setUploadStatusClass('mt-2 text-sm text-red-600');
      } finally {
        setIsImageUploading(false);
        // 清理file input
        event.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="premium-card">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">输入日语句子</h2>
      <textarea 
        id="japaneseInput" 
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007AFF] focus:border-[#007AFF] transition duration-150 ease-in-out resize-none" 
        rows={4} 
        placeholder="例：今日はいい天気ですね。或上传图片识别文字。"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></textarea>
      
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <input 
          type="file" 
          id="imageUploadInput" 
          accept="image/*" 
          className="hidden" 
          onChange={handleImageUpload}
        />
        <button 
          id="uploadImageButton" 
          className="premium-button premium-button-secondary w-full sm:w-auto mb-3 sm:mb-0 sm:order-1"
          onClick={() => document.getElementById('imageUploadInput')?.click()}
          disabled={isImageUploading}
        >
          <i className="fas fa-camera mr-2"></i>
          {!isImageUploading && <span className="button-text">上传图片提取文字</span>}
          <div className="loading-spinner" style={{ display: isImageUploading ? 'inline-block' : 'none' }}></div>
          {isImageUploading && <span className="button-text">提取中...</span>}
        </button>
        
        <button 
          id="analyzeButton" 
          className="premium-button premium-button-primary w-full sm:w-auto sm:order-2"
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {!isLoading && <span className="button-text">解析句子</span>}
          <div className="loading-spinner" style={{ display: isLoading ? 'inline-block' : 'none' }}></div>
          {isLoading && <span className="button-text">解析中...</span>}
        </button>
      </div>
      
      <div id="imageUploadStatus" className={uploadStatusClass}>{uploadStatus}</div>
    </div>
  );
} 