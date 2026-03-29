'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users, Building, Briefcase, AlertTriangle, Shield, ArrowLeft, Scale, FileText, CheckCircle, ChevronRight, Sparkles, Clock, Phone, Mail } from 'lucide-react';

// Types
interface AIResult {
  analysis: string;
  relevant_laws: string[];
  possible_outcomes: string;
  recommendation: string;
  disclaimer: string;
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

type Step = 'category' | 'subcategory' | 'question' | 'loading' | 'result' | 'referral' | 'thankyou';

const STEPS = ['category', 'subcategory', 'question', 'loading', 'result', 'referral', 'thankyou'];

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Logo Component
function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="23" fill="#FF6B35" fillOpacity="0.1"/>
      <circle cx="24" cy="24" r="20" stroke="#FF6B35" strokeWidth="2" fill="none"/>
      <rect x="22" y="10" width="4" height="16" rx="2" fill="#FF6B35"/>
      <rect x="16" y="26" width="16" height="3" rx="1.5" fill="#FF6B35"/>
      <rect x="8" y="12" width="32" height="3" rx="1.5" fill="#FF6B35"/>
      <line x1="12" y1="15" x2="12" y2="20" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="15" x2="36" y2="20" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="12" cy="21" rx="5" ry="2" fill="#FF6B35"/>
      <ellipse cx="36" cy="21" rx="5" ry="2" fill="#FF6B35"/>
      <circle cx="24" cy="7" r="3" fill="#FF6B35"/>
    </svg>
  );
}

// Progress Indicator Component
function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            index < currentStep 
              ? 'bg-[#FF6B35] w-6' 
              : index === currentStep 
                ? 'bg-[#FF6B35] w-8' 
                : 'bg-gray-200 w-4'
          }`}
          initial={false}
          animate={{
            width: index < currentStep ? 24 : index === currentStep ? 32 : 16,
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

// Category Card Component
function CategoryCard({ category, onClick, index }: { category: typeof CATEGORIES[0]; onClick: () => void; index: number }) {
  const Icon = category.icon;
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-5 shadow-md hover:shadow-xl 
               border border-gray-100 hover:border-[#FF6B35]/30
               flex flex-col items-center justify-center gap-3 min-h-[140px]
               overflow-hidden"
      style={{ transition: 'box-shadow 0.3s ease, border-color 0.3s ease' }}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/5 to-[#FF8F5E]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
      
      <motion.div 
        className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B35]/10 to-[#FF6B35]/20 
                  flex items-center justify-center group-hover:from-[#FF6B35]/20 group-hover:to-[#FF6B35]/30"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-7 h-7 text-[#FF6B35]" strokeWidth={1.8} />
      </motion.div>
      
      <div className="relative z-10 text-center">
        <p className="font-semibold text-gray-800 text-base">{category.titleZh}</p>
        <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">{category.titleEn}</p>
      </div>
      
      <motion.div 
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
      >
        <ChevronRight className="w-5 h-5 text-[#FF6B35]" />
      </motion.div>
    </motion.button>
  );
}

// Subcategory Button Component
function SubcategoryButton({ sub, onClick, index }: { sub: string; onClick: () => void; index: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100
               hover:shadow-md hover:border-[#FF6B35]/30 transition-all duration-200
               flex items-center justify-between group"
    >
      <span className="text-gray-700 font-medium">{sub}</span>
      <div className="w-8 h-8 rounded-full bg-[#FF6B35]/10 flex items-center justify-center
                    group-hover:bg-[#FF6B35]/20 transition-colors">
        <ChevronRight className="w-4 h-4 text-[#FF6B35]" />
      </div>
    </motion.button>
  );
}

// Loading Spinner Component
function LoadingSpinner({ message = 'AI 分析中...' }: { message?: string }) {
  return (
    <motion.div 
      className="min-h-[60vh] flex flex-col items-center justify-center space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-28 h-28"
        animate={{ 
          rotate: 360,
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <Logo size={112} />
      </motion.div>
      
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-[#FF6B35]"
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      
      <motion.div 
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold text-gray-800">{message}</h3>
        <p className="text-gray-500 text-sm">通常需要 10-20 秒，請耐心等候</p>
      </motion.div>
      
      <motion.div 
        className="bg-[#FF6B35]/10 rounded-full px-4 py-2"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-sm text-[#FF6B35]">⚠️ 如等待超過 1 分鐘將自動提示</p>
      </motion.div>
    </motion.div>
  );
}

// Result Section Component
function ResultSection({ title, content, icon: Icon, delay = 0 }: { title: string; content: string; icon: any; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-gray-50 rounded-2xl p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#FF6B35]" />
        </div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
      </div>
      <p className="text-gray-600 leading-relaxed pl-13">{content}</p>
    </motion.div>
  );
}

// Footer Component
function Footer() {
  return (
    <motion.footer 
      className="mt-12 py-8 border-t border-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="max-w-lg mx-auto px-4 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Logo size={24} />
          <span className="font-semibold text-gray-700">1分鐘律師</span>
        </div>
        <p className="text-xs text-gray-400">
          AI 分析僅供參考，不構成法律意見
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            24小時內回覆
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            資料保密
          </span>
        </div>
      </div>
    </motion.footer>
  );
}

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
  const [charCountAnimated, setCharCountAnimated] = useState(false);

  const isQuestionStep = step === 'question' || step === 'subcategory' || step === 'result';

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

    const timeoutId = setTimeout(() => {
      setError('AI 分析時間過長，請稍後再試。如問題緊急，建議直接聯絡律師。');
      setStep('result');
      setIsLoading(false);
    }, 60000);

    try {
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
    setQuestionText('');
    setCharCount(0);
  };

  useEffect(() => {
    if (charCount > 0) {
      setCharCountAnimated(true);
      const timer = setTimeout(() => setCharCountAnimated(false), 200);
      return () => clearTimeout(timer);
    }
  }, [charCount]);

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {step !== 'category' ? (
              <motion.button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-[#FF6B35] transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">返回</span>
              </motion.button>
            ) : (
              <div />
            )}
            
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Logo size={32} />
              <h1 className="text-lg font-bold text-gray-800">
                1分鐘律師
              </h1>
            </motion.div>
            
            <div className="w-16" />
          </div>
          
          <AnimatePresence>
            {isQuestionStep && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between py-2 px-1">
                  <span className="text-xs text-gray-400">
                    {step === 'subcategory' && '選擇類別'}
                    {step === 'question' && selectedCategory && ` ${getCategoryTitle(selectedCategory)}`}
                    {step === 'result' && '分析結果'}
                  </span>
                  <span className="text-xs text-[#FF6B35] font-medium">
                    {step === 'subcategory' && '2/5'}
                    {step === 'question' && '3/5'}
                    {step === 'result' && '4/5'}
                  </span>
                </div>
                <ProgressIndicator 
                  currentStep={step === 'subcategory' ? 1 : step === 'question' ? 2 : 3}
                  totalSteps={5}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Category Selection */}
          {step === 'category' && (
            <motion.div
              key="category"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <motion.div 
                className="text-center space-y-3 mb-8"
              >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B35]/10 to-[#FF8F5E]/20 
                                flex items-center justify-center">
                    <Logo size={64} />
                  </div>
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-gray-800">
                  你好，歡迎使用
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-gray-500">
                  選擇你想咨詢的法律類別
                </motion.p>
              </motion.div>

              <motion.div 
                className="grid grid-cols-2 gap-3"
              >
                {CATEGORIES.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => handleCategorySelect(category.id)}
                    index={index}
                  />
                ))}
              </motion.div>

              <motion.p 
                className="text-xs text-center text-gray-400 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                AI 分析僅供參考，不構成法律意見
              </motion.p>
            </motion.div>
          )}

          {/* Subcategory Selection */}
          {step === 'subcategory' && selectedCategory && (
            <motion.div
              key="subcategory"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <motion.div 
                className="text-center mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-gray-500 mb-1">你選擇了</p>
                <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
                    {(() => {
                      const cat = CATEGORIES.find(c => c.id === selectedCategory);
                      const Icon = cat?.icon || Scale;
                      return <Icon className="w-4 h-4 text-[#FF6B35]" />;
                    })()}
                  </span>
                  {getCategoryTitle(selectedCategory)}
                </h2>
              </motion.div>

              <motion.div 
                className="space-y-2"
              >
                {SUBCATEGORIES[selectedCategory]?.map((sub, index) => (
                  <SubcategoryButton
                    key={sub}
                    sub={sub}
                    onClick={() => handleSubcategorySelect(sub)}
                    index={index}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Question Input */}
          {step === 'question' && (
            <motion.div
              key="question"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <motion.div 
                className="flex items-center gap-2 text-sm mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="px-3 py-1.5 bg-[#FF6B35]/10 text-[#FF6B35] rounded-lg font-medium text-sm">
                  {getCategoryTitle(selectedCategory!)}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 font-medium">{selectedSubcategory}</span>
              </motion.div>

              <motion.div 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#FF6B35]" />
                  請描述您的法律問題
                </label>
                <textarea
                  placeholder="例如：我同男朋友分手，佢要我搬走，但我已經係呢度住咗兩年，請問我是否有權繼續住？"
                  className="w-full h-44 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 
                           focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10 outline-none
                           text-gray-700 placeholder-gray-400 resize-none transition-all text-base"
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
                <motion.div 
                  className="flex justify-end mt-3"
                  animate={charCountAnimated ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <span className={`text-sm transition-colors ${
                    charCount > 900 ? 'text-red-500' : charCount > 700 ? 'text-amber-500' : 'text-gray-400'
                  }`}>
                    {charCount}/1000
                  </span>
                </motion.div>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm text-amber-800 font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  小提示
                </p>
                <ul className="text-sm text-amber-700 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>盡量詳細描述事情經過</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>包含重要日期和金額（如適用）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>說明你希望達到的結果</span>
                  </li>
                </ul>
              </motion.div>

              <motion.button
                id="submitBtn"
                onClick={() => {
                  if (questionText.trim().length >= 10) {
                    handleQuestionSubmit(questionText.trim());
                  }
                }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg
                         ${questionText.trim().length >= 10 
                           ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white hover:shadow-xl' 
                           : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                         }`}
                style={{
                  boxShadow: questionText.trim().length >= 10 ? '0 4px 14px 0 rgba(255, 107, 53, 0.35)' : 'none'
                }}
              >
                提交問題
              </motion.button>

              {questionText.trim().length > 0 && questionText.trim().length < 10 && (
                <motion.p 
                  className="text-sm text-amber-500 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  請輸入至少10個字
                </motion.p>
              )}

              <p className="text-xs text-center text-gray-400 mt-4">
                AI 分析僅供參考，不構成法律意見
              </p>
            </motion.div>
          )}

          {/* Loading State */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner />
            </motion.div>
          )}

          {/* AI Result */}
          {step === 'result' && (
            <motion.div
              key="result"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <motion.button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-[#FF6B35] transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回修改問題</span>
              </motion.button>

              {error && (
                <motion.div 
                  className="bg-red-50 rounded-2xl p-4 border border-red-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}

              <motion.div 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8F5E] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">AI 分析結果</h3>
                    <p className="text-xs text-gray-400">智能法律分析</p>
                  </div>
                </div>

                <motion.div 
                  className="space-y-4"
                >
                  <ResultSection 
                    title="情況分析" 
                    content={aiResult?.analysis || '載入中...'} 
                    icon={FileText}
                    delay={0.2}
                  />
                  
                  {aiResult?.relevant_laws && aiResult.relevant_laws.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.5 }}
                      className="bg-gray-50 rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0D7377]/10 flex items-center justify-center">
                          <Scale className="w-5 h-5 text-[#0D7377]" />
                        </div>
                        <h4 className="font-semibold text-gray-800">相關法例</h4>
                      </div>
                      <div className="space-y-2">
                        {aiResult.relevant_laws.map((law, index) => (
                          <div key={index} className="flex items-start gap-2 bg-white rounded-xl p-3 shadow-sm">
                            <span className="text-[#0D7377] font-bold mt-0.5">§</span>
                            <span className="text-sm text-gray-700">{law}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <ResultSection 
                    title="可能結果" 
                    content={aiResult?.possible_outcomes || '載入中...'} 
                    icon={AlertTriangle}
                    delay={0.5}
                  />
                  
                  <ResultSection 
                    title="建議下一步" 
                    content={aiResult?.recommendation || '載入中...'} 
                    icon={CheckCircle}
                    delay={0.65}
                  />
                </motion.div>
              </motion.div>

              {/* Lawyer Referral CTA */}
              <motion.div 
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">需要專業律師協助？</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      我們可以為你轉介合適的律師，免費初步諮詢
                    </p>
                    <motion.button
                      onClick={handleRequestReferral}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold
                               hover:shadow-lg shadow-green-200 transition-all"
                    >
                      申請律師轉介
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Disclaimer */}
              <motion.div 
                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong>免責聲明：</strong>{aiResult?.disclaimer || '此為AI分析，不構成法律意見。如有需要，請諮詢合資格律師。'}
                </p>
              </motion.div>

              {/* New Query Button */}
              <motion.button
                onClick={handleNewQuery}
                className="w-full py-3 text-gray-500 hover:text-[#FF6B35] transition-colors text-sm"
                whileTap={{ scale: 0.98 }}
              >
                重新開始新諮詢
              </motion.button>
            </motion.div>
          )}

          {/* Lawyer Referral Form */}
          {step === 'referral' && (
            <motion.div
              key="referral"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <motion.button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-[#FF6B35] transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回</span>
              </motion.button>

              <motion.div 
                className="text-center mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-2">律師轉介服務</h2>
                <p className="text-gray-500 text-sm">填寫以下資料，我們會盡快為你聯繫</p>
              </motion.div>

              {/* Declaration */}
              <motion.div 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#0D7377]" />
                  聲明及注意事項
                </h3>
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
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <span className="text-gray-600 text-sm">
                    我已閱讀並同意上述聲明（細則以英文版為準）
                  </span>
                </label>
              </motion.div>

              {/* Contact Form */}
              <motion.div 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div>
                  <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    你的姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="referralName"
                    placeholder="請輸入姓名"
                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 
                             focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10 outline-none
                             text-gray-700 placeholder-gray-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    聯絡方式 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="referralContact"
                    placeholder="電話號碼或電郵"
                    className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 
                             focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10 outline-none
                             text-gray-700 placeholder-gray-400 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    我們只會使用此資料聯絡你，不會用作其他用途
                  </p>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
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
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white rounded-2xl font-semibold text-lg
                         hover:shadow-xl transition-all shadow-lg"
                style={{ boxShadow: '0 4px 14px 0 rgba(255, 107, 53, 0.35)' }}
              >
                確認提交
              </motion.button>

              <p className="text-xs text-center text-gray-400">
                提交後代表你同意我們的隱私政策
              </p>
            </motion.div>
          )}

          {/* Thank You Page */}
          {step === 'thankyou' && (
            <motion.div
              key="thankyou"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="min-h-[70vh] flex items-center justify-center"
            >
              <div className="text-center space-y-6 max-w-sm mx-auto">
                {/* Success Animation */}
                <motion.div 
                  className="relative mx-auto w-24 h-24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full 
                                  flex items-center justify-center shadow-lg shadow-green-200">
                    <motion.svg 
                      className="w-12 h-12 text-white" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor"
                      strokeWidth={2.5}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </motion.svg>
                  </div>
                </motion.div>

                {/* Text */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-2xl font-bold text-gray-800">提交成功！</h1>
                  <p className="text-gray-500">
                    律師團隊會在 24 小時內透過你提供的聯絡方式與你聯繫
                  </p>
                </motion.div>

                {/* Info Card */}
                <motion.div 
                  className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#FF6B35]" />
                    之後會發生什麼？
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      律師會審閱你的案件資料
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      如需要進一步資料，會主動聯絡你
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      初步諮詢通常免費
                    </li>
                  </ul>
                </motion.div>

                {/* New Query Button */}
                <motion.button
                  onClick={handleNewQuery}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-medium
                           hover:bg-gray-200 transition-all"
                >
                  返回首頁
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* PWA Install Prompt (Hidden by default) */}
      <div id="pwa-install-prompt" className="hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">安裝 1分鐘律師 App</p>
            <p className="text-xs text-gray-500">更快捷地訪問法律諮詢服務</p>
          </div>
          <button className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-medium">
            安裝
          </button>
        </div>
      </div>
    </div>
  );
}