'use client';

interface ThankYouProps {
  onNewQuery: () => void;
}

export default function ThankYou({ onNewQuery }: ThankYouProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
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
          onClick={onNewQuery}
          className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-medium
                   hover:bg-gray-200 active:scale-[0.98] transition-all"
        >
          返回首頁
        </button>
      </div>
    </div>
  );
}
