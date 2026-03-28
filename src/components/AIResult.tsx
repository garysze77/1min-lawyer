'use client';

interface AIResultProps {
  analysis: {
    analysis: string;
    relevant_laws: string[];
    possible_outcomes: string;
    recommendation: string;
    disclaimer: string;
  };
  onRequestReferral: () => void;
  onBack: () => void;
}

export default function AIResult({ analysis, onRequestReferral, onBack }: AIResultProps) {
  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

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

        {/* Analysis Section */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">📋 情況分析</h4>
            <p className="text-gray-700 leading-relaxed">{analysis.analysis}</p>
          </div>

          {/* Relevant Laws */}
          {analysis.relevant_laws && analysis.relevant_laws.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">⚖️ 相關法例</h4>
              <div className="space-y-2">
                {analysis.relevant_laws.map((law, index) => (
                  <div key={index} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                    <span className="text-blue-500 mt-0.5">§</span>
                    <span className="text-sm text-gray-700">{law}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Possible Outcomes */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">🔮 可能結果</h4>
            <p className="text-gray-700 leading-relaxed">{analysis.possible_outcomes}</p>
          </div>

          {/* Recommendation */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">💡 建議下一步</h4>
            <p className="text-gray-700 leading-relaxed">{analysis.recommendation}</p>
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
              onClick={onRequestReferral}
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
          <strong>免責聲明：</strong>{analysis.disclaimer}
        </p>
      </div>

      {/* New Query Button */}
      <button
        onClick={() => window.location.reload()}
        className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors text-sm"
      >
        重新開始新諮詢
      </button>
    </div>
  );
}
