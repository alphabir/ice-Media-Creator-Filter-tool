
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            CreatorIntel <span className="text-indigo-600">AI</span>
          </h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tight">Graph API Online</span>
          </div>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Dashboard</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Agency Docs</a>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 rounded-full">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <span className="text-xs font-semibold text-slate-600 uppercase">Agency Tier</span>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
