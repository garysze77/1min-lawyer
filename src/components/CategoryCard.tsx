'use client';

import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  icon: LucideIcon;
  titleZh: string;
  titleEn: string;
  onClick: () => void;
  delay?: number;
}

export default function CategoryCard({ 
  icon: Icon, 
  titleZh, 
  titleEn, 
  onClick,
  delay = 0 
}: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 
                 hover:shadow-md hover:border-blue-200 transition-all duration-300 ease-out
                 active:scale-95 min-h-[140px] flex flex-col items-center justify-center gap-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon Container */}
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 
                      flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
        <Icon className="w-7 h-7 text-blue-600" strokeWidth={1.8} />
      </div>
      
      {/* Text */}
      <div className="text-center space-y-1">
        <p className="font-semibold text-gray-800 text-lg leading-tight">{titleZh}</p>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{titleEn}</p>
      </div>

      {/* Hover indicator */}
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
