
import React from 'react';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const hasCustomToken = typeof window !== 'undefined' && !!localStorage.getItem('ICE_LABS_META_TOKEN');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
            <span className="text-white font-black text-lg">IM</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ice Media <span className="text-indigo-600">Labs</span>
          </h1>
        </div>
        <nav className="hidden lg:flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 border rounded-full transition-colors ${
            hasCustomToken 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
              : 'bg-green-50 text-green-700 border-green-100'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasCustomToken ? 'bg-indigo-400' : 'bg-green-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${hasCustomToken ? 'bg-indigo-500' : 'bg-green-500'}`}></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tight">
              {hasCustomToken ? 'Custom Token Active' : 'System Sync Active'}
            </span>
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          
          <button 
            onClick={onOpenSettings}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-all flex items-center space-x-2 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-bold uppercase tracking-widest text-[10px]">Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
