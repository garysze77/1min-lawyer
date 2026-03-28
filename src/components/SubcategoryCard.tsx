'use client';

interface SubcategoryCardProps {
  title: string;
  onClick: () => void;
  delay?: number;
}

export default function SubcategoryCard({ 
  title, 
  onClick,
  delay = 0 
}: SubcategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100
                 hover:shadow-md hover:border-blue-200 transition-all duration-200
                 active:scale-[0.98] flex items-center justify-between"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-gray-700 font-medium">{title}</span>
      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" 
           fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
