'use client';

import { useState } from 'react';

interface Lawyer {
  id: string;
  name: string;
  specialization: string;
  contact: string;
}

interface LawyerReferralFormProps {
  lawyers: Lawyer[];
  onSubmit: (data: { name: string; contact: string; preferred_lawyer: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function LawyerReferralForm({ 
  lawyers, 
  onSubmit,
  onBack,
  isLoading = false 
}: LawyerReferralFormProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [preferredLawyer, setPreferredLawyer] = useState('');

  const handleSubmit = () => {
    if (name.trim() && contact.trim() && preferredLawyer) {
      onSubmit({ name: name.trim(), contact: contact.trim(), preferred_lawyer: preferredLawyer });
    }
  };

  const isValid = name.trim().length >= 2 && contact.trim().length >= 8 && preferredLawyer;

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

      {/* Lawyer Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <label className="block text-gray-700 font-medium mb-3">
          選擇你想咨詢的律師 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {lawyers.map((lawyer) => (
            <button
              key={lawyer.id}
              onClick={() => setPreferredLawyer(lawyer.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
                         ${preferredLawyer === lawyer.id 
                           ? 'border-blue-500 bg-blue-50' 
                           : 'border-gray-100 hover:border-gray-200 bg-white'
                         }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white
                              ${preferredLawyer === lawyer.id ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  {lawyer.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{lawyer.name}</p>
                  <p className="text-xs text-gray-500">{lawyer.specialization}</p>
                </div>
                {preferredLawyer === lawyer.id && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
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
