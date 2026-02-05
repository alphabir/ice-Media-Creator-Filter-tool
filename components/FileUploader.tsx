
import React, { useState, useRef } from 'react';

interface FileAttachment {
  data: string;
  mimeType: string;
  name: string;
  type: 'image' | 'document';
}

interface FileUploaderProps {
  onAnalyze: (
    text: string, 
    images?: { data: string; mimeType: string }[], 
    documents?: { data: string; mimeType: string }[]
  ) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onAnalyze }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      
      // Basic text extraction for CSV/TXT
      if (file.type === 'text/csv' || file.type === 'text/plain' || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setText(prev => prev + '\n' + content);
        };
        reader.readAsText(file);
        return;
      }

      // Handle multi-modal files (Images, Excel, PDF, Word)
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const isImage = file.type.startsWith('image/');
        
        setAttachments(prev => [...prev, {
          data: base64,
          mimeType: file.type || getFallbackMimeType(file.name),
          name: file.name,
          type: isImage ? 'image' : 'document'
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const getFallbackMimeType = (fileName: string): string => {
    if (fileName.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (fileName.endsWith('.xls')) return 'application/vnd.ms-excel';
    if (fileName.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (fileName.endsWith('.doc')) return 'application/msword';
    if (fileName.endsWith('.pdf')) return 'application/pdf';
    return 'application/octet-stream';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const images = attachments.filter(a => a.type === 'image').map(a => ({ data: a.data, mimeType: a.mimeType }));
    const documents = attachments.filter(a => a.type === 'document').map(a => ({ data: a.data, mimeType: a.mimeType }));
    onAnalyze(text, images, documents);
  };

  const images = attachments.filter(a => a.type === 'image');
  const docs = attachments.filter(a => a.type === 'document');

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
              placeholder="Paste handles like @creator1, @creator2... or we'll extract them from your attached rosters."
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
            Roster Uploads (Excel / PDF / Screenshots)
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
              accept=".csv,.txt,.pdf,.docx,.doc,.xlsx,.xls,image/*" 
              className="hidden" 
            />
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Drop Excel/Doc or Click</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">XLSX • PDF • DOCX • CSV • IMG</p>
          </div>
        </div>
      </div>

      {/* Attachments Display */}
      {(images.length > 0 || docs.length > 0) && (
        <div className="space-y-6">
          {images.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Screenshot Evidence ({images.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                    <img src={`data:${img.mimeType};base64,${img.data}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Preview" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeAttachment(attachments.indexOf(img)); }}
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

          {docs.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Attached Rosters ({docs.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 flex-shrink-0 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                        {doc.name.split('.').pop()?.toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{doc.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ready for analysis</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeAttachment(attachments.indexOf(doc))}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!text && attachments.length === 0}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black py-5 rounded-3xl shadow-2xl shadow-slate-900/20 transition-all transform hover:-translate-y-1 active:scale-95 text-xs uppercase tracking-[0.3em]"
      >
        Run Multi-Modal Roster Analysis
      </button>
      
      <div className="flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Excel & PDF Parsing Active</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Proper Agency View Output</span>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
