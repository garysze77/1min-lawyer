'use client';

import { useState } from 'react';

interface QuestionInputProps {
  category: string;
  subcategory: string;
  onSubmit: (question: string) => void;
  isLoading?: boolean;
}

export default function QuestionInput({ 
  category, 
  subcategory, 
  onSubmit,
  isLoading = false 
}: QuestionInputProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = () => {
    if (question.trim().length >= 10) {
      onSubmit(question.trim());
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium">{category}</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-700">{subcategory}</span>
      </div>

      {/* Question Input Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <label className="block text-gray-700 font-medium mb-3">
          請描述您的法律問題
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例如：我同男朋友分手，佢要我搬走，但我已經係呢度住咗兩年，請問我是否有權繼續住？"
          className="w-full h-40 p-4 bg-gray-50 rounded-xl border border-gray-200 
                   focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none
                   text-gray-700 placeholder-gray-400 resize-none transition-all"
          maxLength={1000}
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-400">
            {question.length}/1000
          </span>
          {question.trim().length < 10 && question.trim().length > 0 && (
            <span className="text-xs text-amber-500">請輸入至少10個字</span>
          )}
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
        <p className="text-sm text-amber-800 font-medium mb-2">💡 小提示</p>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>• 盡量詳細描述事情經過</li>
          <li>• 包含重要日期和金額（如適用）</li>
          <li>• 說明你希望達到的結果</li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={question.trim().length < 10 || isLoading}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200
                   ${question.trim().length < 10 
                     ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                     : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-200'
                   }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI 分析中...
          </span>
        ) : (
          '提交問題'
        )}
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-center text-gray-400 mt-4">
        AI 分析僅供參考，不構成法律意見
      </p>
    </div>
  );
}
