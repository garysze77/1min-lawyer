'use client';

import { useState } from 'react';
import { Home, Users, Building, Briefcase, AlertTriangle, Shield, ArrowLeft } from 'lucide-react';

// Types
interface AIResult {
  analysis: string;
  relevant_laws: string[];
  possible_outcomes: string;
  recommendation: string;
  disclaimer: string;
}

interface QuestionData {
  id: string;
  category: string;
  subcategory: string;
  question_text: string;
  ai_response: AIResult | null;
  created_at: string;
}

// Categories Configuration
const CATEGORIES = [
  { id: 'family', icon: Users, titleZh: '婚姻家庭', titleEn: 'Family' },
  { id: 'property', icon: Building, titleZh: '樓宇地產', titleEn: 'Property' },
  { id: 'employment', icon: Briefcase, titleZh: '僱傭勞工', titleEn: 'Employment' },
  { id: 'commercial', icon: Home, titleZh: '商業貿易', titleEn: 'Commercial' },
  { id: 'injury', icon: AlertTriangle, titleZh: '個人傷亡', titleEn: 'Personal Injury' },
  { id: 'criminal', icon: Shield, titleZh: '刑事罪行', titleEn: 'Criminal' },
];

const SUBCATEGORIES: Record<string, string[]> = {
  family: ['結婚/同居', '離婚/分居', '子女監護', '遺產/遺囑'],
  property: ['樓宇買賣', '租賃糾紛', '釐印問題', '大廈管理'],
  employment: ['解僱/賠償', '合約條款', '工傷意外', '強積金'],
  commercial: ['商業合約', '債項追討', '公司註冊', '知識產權'],
  injury: ['交通意外', '醫療疏忽', '工傷索償', '其他意外'],
  criminal: ['被捕/保釋', '毆打/傷人', '盜竊', '其他刑事'],
};

const LAWYERS = [
  { id: 'katrina', name: 'Katrina Kwan', specialization: '上市公司監管調查', contact: 'TBC' },
  { id: 'kelly', name: 'Kelly Ho', specialization: '婚禮、樓宇、遺產', contact: 'TBC' },
  { id: 'mike', name: 'Mike Kwok', specialization: '大灣區、商務、CFA', contact: 'TBC' },
];

type Step = 'category' | 'subcategory' | 'question' | 'loading' | 'result' | 'referral' | 'thankyou';

export default function OneMinuteLawyer() {
  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [charCount, setCharCount] = useState(0);

  const getCategoryTitle = (id: string) => {
    const cat = CATEGORIES.find(c => c.id === id);
    return cat ? cat.titleZh : '';
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep('subcategory');
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setStep('question');
  };

  const handleQuestionSubmit = async (question: string) => {
    setIsLoading(true);
    setStep('loading');
    setError(null);

    // 30-second timeout controller
    const timeoutId = setTimeout(() => {
      setError('AI 分析時間過長，請稍後再試。如問題緊急，建議直接聯絡律師。');
      setStep('result');
      setIsLoading(false);
    }, 30000);

    try {
      // Call the API to submit question and get AI analysis
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          subcategory: selectedSubcategory,
          question_text: question,
        }),
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit question');
      }

      console.log('API response:', JSON.stringify(data, null, 2));
      setQuestionId(data.data.id);
      setAiResult(data.data.ai_response.data);
      setStep('result');
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Error submitting question:', err);
      setError(err instanceof Error ? err.message : '提交問題時發生錯誤');
      setStep('result');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReferral = () => {
    setStep('referral');
  };

  const handleReferralSubmit = async (data: { name: string; contact: string }) => {
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit referral');
      }

      setStep('thankyou');
    } catch (err) {
      console.error('Error submitting referral:', err);
      // Still go to thank you page even if referral fails
      setStep('thankyou');
    }
  };

  const handleBack = () => {
    if (step === 'subcategory') {
      setStep('category');
      setSelectedCategory(null);
    } else if (step === 'question') {
      setStep('subcategory');
      setSelectedSubcategory(null);
    } else if (step === 'result') {
      setStep('question');
    } else if (step === 'referral') {
      setStep('result');
    }
  };

  const handleNewQuery = () => {
    setStep('category');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setQuestionId(null);
    setAiResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {step !== 'category' ? (
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">返回</span>
              </button>
            ) : (
              <div />
            )}
            <h1 className="text-lg font-bold text-gray-800">
              1分鐘律師
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Category Selection */}
        {step === 'category' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-gray-800">你好，歡迎使用</h2>
              <p className="text-gray-500">選擇你想咨詢的法律類別</p>
            </div>

            {/* 2x3 Grid of Categories */}
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100
                           hover:shadow-md hover:border-blue-200 transition-all duration-300
                           active:scale-95 min-h-[130px] flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 
                                  flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                    <category.icon className="w-6 h-6 text-blue-600" strokeWidth={1.8} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800 text-sm">{category.titleZh}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{category.titleEn}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-center text-gray-400 mt-8">
              AI 分析僅供參考，不構成法律意見
            </p>
          </div>
        )}

        {/* Subcategory Selection */}
        {step === 'subcategory' && selectedCategory && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 mb-1">你選擇了</p>
              <h2 className="text-xl font-bold text-gray-800">{getCategoryTitle(selectedCategory)}</h2>
            </div>

            <div className="space-y-2">
              {SUBCATEGORIES[selectedCategory]?.map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleSubcategorySelect(sub)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100
                           hover:shadow-md hover:border-blue-200 transition-all
                           active:scale-[0.98] flex items-center justify-between"
                >
                  <span className="text-gray-700 font-medium">{sub}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question Input */}
        {step === 'question' && (
          <div className="space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium">
                {getCategoryTitle(selectedCategory!)}
              </span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-700">{selectedSubcategory}</span>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <label className="block text-gray-700 font-medium mb-3">
                請描述您的法律問題
              </label>
              <textarea
                placeholder="例如：我同男朋友分手，佢要我搬走，但我已經係呢度住咗兩年，請問我是否有權繼續住？"
                className="w-full h-40 p-4 bg-gray-50 rounded-xl border border-gray-200 
                         focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none
                         text-gray-700 placeholder-gray-400 resize-none transition-all
                         touch-action-manipulation"
                maxLength={1000}
                id="questionInput"
                inputMode="text"
                autoComplete="off"
                value={questionText}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuestionText(val);
                  setCharCount(val.length);
                }}
              />
              <div className="flex justify-end mt-2">
                <span className="text-xs text-gray-400">{charCount}/1000</span>
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
              id="submitBtn"
              onClick={() => {
                console.log('Submit button clicked, questionText length:', questionText.trim().length);
                if (questionText.trim().length >= 10) {
                  console.log('Submitting question...');
                  handleQuestionSubmit(questionText.trim());
                } else {
                  console.log('Question too short:', questionText.trim().length);
                }
              }}
              onTouchStart={() => {
                console.log('Submit button touch start');
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg
                       hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200
                       cursor-pointer"
            >
              提交問題
            </button>

            <p className="text-xs text-center text-gray-400 mt-4">
              AI 分析僅供參考，不構成法律意見
            </p>
          </div>
        )}

        {/* Loading State */}
        {step === 'loading' && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">AI 分析中，請稍候...</h3>
              <p className="text-gray-500">正在分析你的問題，通常需要 10-20 秒</p>
            </div>
            <div className="bg-blue-50 rounded-xl px-4 py-2">
              <p className="text-sm text-blue-600">⚠️ 如等待超過 30 秒，將自動提示錯誤</p>
            </div>
          </div>
        )}

        {/* AI Result */}
        {step === 'result' && (
          <div className="space-y-4">
            {/* Back Button */}
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </button>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* AI Analysis Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">AI 分析結果</h3>
                  <p className="text-xs text-gray-400">AI 智能分析</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">📋 情況分析</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {aiResult?.analysis || '載入中...'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">⚖️ 相關法例</h4>
                  <div className="space-y-2">
                    {(aiResult?.relevant_laws || []).map((law, index) => (
                      <div key={index} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                        <span className="text-blue-500 mt-0.5">§</span>
                        <span className="text-sm text-gray-700">{law}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">🔮 可能結果</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {aiResult?.possible_outcomes || '載入中...'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">💡 建議下一步</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {aiResult?.recommendation || '載入中...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Lawyer Referral CTA */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">需要專業律師協助？</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    我們可以為你轉介合適的律師，免費初步諮詢
                  </p>
                  <button
                    onClick={handleRequestReferral}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold
                             hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-200"
                  >
                    申請律師轉介
                  </button>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong>免責聲明：</strong>{aiResult?.disclaimer || DISCLAIMER_TEXT}
              </p>
            </div>

            {/* New Query Button */}
            <button
              onClick={handleNewQuery}
              className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              重新開始新諮詢
            </button>
          </div>
        )}

        {/* Lawyer Referral Form */}
        {step === 'referral' && (
          <div className="space-y-5">
            {/* Header */}
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
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
                  id="referralAgree"
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
                  id="referralName"
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
                  id="referralContact"
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
              onClick={() => {
                const nameInput = document.getElementById('referralName') as HTMLInputElement;
                const contactInput = document.getElementById('referralContact') as HTMLInputElement;
                const agreeCheckbox = document.getElementById('referralAgree') as HTMLInputElement;
                
                if (nameInput?.value && contactInput?.value && agreeCheckbox?.checked) {
                  handleReferralSubmit({
                    name: nameInput.value,
                    contact: contactInput.value,
                  });
                }
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg
                       hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
            >
              確認提交
            </button>

            {/* Privacy Note */}
            <p className="text-xs text-center text-gray-400">
              提交後代表你同意我們的隱私政策
            </p>
          </div>
        )}

        {/* Thank You Page */}
        {step === 'thankyou' && (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="text-center space-y-6 max-w-sm mx-auto">
              {/* Success Animation */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full 
                                flex items-center justify-center shadow-lg shadow-green-200">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-800">提交成功！</h1>
                <p className="text-gray-500">
                  律師團隊會在 24 小時內透過你提供的聯絡方式與你聯繫
                </p>
              </div>

              {/* Info Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left">
                <h3 className="font-medium text-gray-700 mb-3">📋 之後會發生什麼？</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    律師會審閱你的案件資料
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    如需要進一步資料，會主動聯絡你
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    初步諮詢通常免費
                  </li>
                </ul>
              </div>

              {/* New Query Button */}
              <button
                onClick={handleNewQuery}
                className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-medium
                         hover:bg-gray-200 active:scale-[0.98] transition-all"
              >
                返回首頁
              </button>
            </div>
          </div>
        )}
      </main>

      {/* PWA Install Prompt (Hidden by default) */}
      <div id="pwa-install-prompt" className="hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">安裝 1分鐘律師 App</p>
            <p className="text-xs text-gray-500">更快捷地訪問法律諮詢服務</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
            安裝
          </button>
        </div>
      </div>
    </div>
  );
}

// Disclaimer text constant
const DISCLAIMER_TEXT = '此為AI分析，不構成法律意見。如有需要，請諮詢合資格律師。';
