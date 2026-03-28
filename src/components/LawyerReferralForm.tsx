'use client';

import { useState } from 'react';

interface LawyerReferralFormProps {
  onSubmit: (data: { name: string; contact: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function LawyerReferralForm({ 
  onSubmit,
  onBack,
  isLoading = false 
}: LawyerReferralFormProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (name.trim() && contact.trim() && agreed) {
      onSubmit({ name: name.trim(), contact: contact.trim() });
    }
  };

  const isValid = name.trim().length >= 2 && contact.trim().length >= 8 && agreed;

  return (
    <div className="space-y-5">
      {/* Header */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">律師轉介服務</h2>
        <p className="text-gray-500 text-sm">填寫以下資料，我們會盡快為你聯繫</p>
      </div>

      {/* Declaration */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-gray-700 font-semibold mb-3">聲明及注意事項</h3>
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2 mb-4">
          <p>• 本服務為免費法律諮詢轉介，不保證成功配對律師</p>
          <p>• 我們只會使用所提供的聯絡資料就此事宜聯絡你</p>
          <p>• 你的資料不會用於任何其他用途或轉交第三方</p>
          <p>• 如有需要，請自行決定是否聘請律師</p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-600 text-sm">
            我已閱讀並同意上述聲明（細則以英文版為準）
          </span>
        </label>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            你的姓名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="請輸入姓名"
            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 
                     focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none
                     text-gray-700 placeholder-gray-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            聯絡方式 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="電話號碼或電郵"
            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 
                     focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none
                     text-gray-700 placeholder-gray-400 transition-all"
          />
          <p className="text-xs text-gray-400 mt-2">
            我們只會使用此資料聯絡你，不會用作其他用途
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200
                   ${!isValid 
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
            提交中...
          </span>
        ) : (
          '確認提交'
        )}
      </button>

      {/* Privacy Note */}
      <p className="text-xs text-center text-gray-400">
        提交後代表你同意我們的隱私政策
      </p>
    </div>
  );
}
