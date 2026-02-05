
import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('ICE_LABS_META_TOKEN') || '';
    setToken(savedToken);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (token.trim()) {
      localStorage.setItem('ICE_LABS_META_TOKEN', token.trim());
    } else {
      localStorage.removeItem('ICE_LABS_META_TOKEN');
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  const handleClear = () => {
    setToken('');
    localStorage.removeItem('ICE_LABS_META_TOKEN');
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">API Configuration</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              Meta Graph Access Token
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your Page Access Token here..."
              className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-xs resize-none"
            />
            <p className="mt-2 text-[10px] text-slate-400 leading-tight">
              Leaving this empty will revert to the system default token. Your custom token is stored locally in your browser.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                isSaved ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
              }`}
            >
              {isSaved ? 'Settings Saved' : 'Apply Token'}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 rounded-b-2xl border-t border-slate-100">
          <a 
            href="https://developers.facebook.com/tools/explorer/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-indigo-500 hover:underline uppercase tracking-tight flex items-center justify-center"
          >
            Get Token from Meta Explorer
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
