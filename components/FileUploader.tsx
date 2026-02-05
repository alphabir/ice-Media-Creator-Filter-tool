
import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onAnalyze: (text: string, images?: { data: string; mimeType: string }[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onAnalyze }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fix: Explicitly type 'file' as File to prevent 'unknown' type inference and associated errors
    Array.from(files).forEach((file: File) => {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
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
  };

  const handleSubmit = () => {
    onAnalyze(text, images.map(img => ({ data: img.data, mimeType: img.mimeType })));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Creator Handles or Data (CSV format supported)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="@creator_handle, 500k followers, Fashion niche..."
          className="w-full h-40 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Screenshots / Insight Exports (Optional)</label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept=".csv,image/*" 
            className="hidden" 
          />
          <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-slate-600 font-medium">Click to upload CSV or Screenshots</p>
          <p className="text-xs text-slate-400 mt-1">Images used for OCR and additional signal detection</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img src={`data:${img.mimeType};base64,${img.data}`} className="w-full h-24 object-cover rounded-lg border border-slate-200" alt="Preview" />
              <button 
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="text-[10px] text-slate-500 mt-1 truncate">{img.name}</div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
      >
        Run Intelligence Analysis
      </button>
    </div>
  );
};

export default FileUploader;
