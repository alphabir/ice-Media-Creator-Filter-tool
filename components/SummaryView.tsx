
import React from 'react';

interface SummaryViewProps {
  summary: string;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary }) => {
  return (
    <div className="bg-indigo-600 rounded-xl p-8 shadow-lg shadow-indigo-100 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      </div>
      <div className="relative z-10">
        <h3 className="text-indigo-100 font-bold text-xs uppercase tracking-widest mb-2">Executive Summary</h3>
        <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-4xl">
          {summary}
        </p>
      </div>
    </div>
  );
};

export default SummaryView;
