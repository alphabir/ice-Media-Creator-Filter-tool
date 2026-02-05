
import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onAnalyze: (text: string, images?: { data: string; mimeType: string }[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onAnalyze }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  const [fileCount, setFileCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setFileCount(prev => prev + files.length);

    Array.from(files).forEach((file: File) => {
      if (file.type === 'text/csv' || file.type === 'text/plain' || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setText(prev => prev + '\n' + content);
        };
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = (event.target?.result as string).split(',')[1];
          setImages(prev => [...prev, { data: base64, mimeType: file.type, name: file.name }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setFileCount(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = () => {
    onAnalyze(text, images.map(img => ({ data: img.data, mimeType: img.mimeType })));
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
            Bulk Handle Input / Roster Data
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste handles like @creator1, @creator2... or upload a CSV roster."
              className="w-full h-48 px-6 py-5 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none font-mono text-sm shadow-inner bg-white/50 backdrop-blur-sm"
            />
            {text && (
              <button 
                onClick={() => setText('')}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
            Roster Uploads (CSV / Screenshots)
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-48 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-indigo-400 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer flex flex-col items-center justify-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              multiple 
              accept=".csv,.txt,image/*" 
              className="hidden" 
            />
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Drop Roster or Click</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">CSV • TXT • JPG • PNG</p>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Attached Evidence / Screenshots ({images.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-square overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                <img src={`data:${img.mimeType};base64,${img.data}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Preview" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    className="bg-white/20 hover:bg-red-500 backdrop-blur-md text-white rounded-full p-2 transition-all active:scale-90"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!text && images.length === 0}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black py-5 rounded-3xl shadow-2xl shadow-slate-900/20 transition-all transform hover:-translate-y-1 active:scale-95 text-xs uppercase tracking-[0.3em]"
      >
        Run Proper Bulk Analysis
      </button>
      
      <div className="flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Validated for Roster Extraction</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Proper CSV Output Format</span>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
