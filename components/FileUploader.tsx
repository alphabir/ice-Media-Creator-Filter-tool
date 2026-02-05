
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

interface FileAttachment {
  data: string;
  mimeType: string;
  name: string;
  type: 'image' | 'pdf';
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
  const [extractedRosterData, setExtractedRosterData] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsParsing(true);
    const newAttachments: FileAttachment[] = [];
    const newExtractedData: string[] = [];

    for (const file of Array.from(files)) {
      const fileName = file.name.toLowerCase();
      const mimeType = file.type.toLowerCase();

      // 1. Handle Excel (.xlsx, .xls) - Parse to Text (Gemini doesn't support binary xlsx)
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || mimeType.includes('spreadsheetml') || mimeType.includes('excel')) {
        try {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          let excelContent = `--- ROSTER EXCEL: ${file.name} ---\n`;
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            excelContent += `Sheet: ${sheetName}\n${csv}\n`;
          });
          newExtractedData.push(excelContent);
        } catch (err) {
          console.error("Excel Parsing Error:", err);
        }
      }
      // 2. Handle Word (.docx, .doc) - Parse to Text (Gemini doesn't support binary docx)
      else if (fileName.endsWith('.docx') || fileName.endsWith('.doc') || mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
        try {
          const buffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer: buffer });
          newExtractedData.push(`--- ROSTER WORD: ${file.name} ---\n${result.value}`);
        } catch (err) {
          console.error("Word Parsing Error:", err);
        }
      }
      // 3. Handle PDF (Native Multi-modal support)
      else if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
        const base64 = await fileToBase64(file);
        newAttachments.push({
          data: base64,
          mimeType: 'application/pdf',
          name: file.name,
          type: 'pdf'
        });
      }
      // 4. Handle Images (Native Multi-modal support)
      else if (mimeType.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        newAttachments.push({
          data: base64,
          mimeType: mimeType,
          name: file.name,
          type: 'image'
        });
      } 
      // 5. Handle Text/CSV
      else if (mimeType === 'text/plain' || mimeType === 'text/csv' || fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
        const content = await file.text();
        newExtractedData.push(`--- ROSTER TEXT: ${file.name} ---\n${content}`);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    setExtractedRosterData(prev => [...prev, ...newExtractedData]);
    setIsParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExtractedData = (index: number) => {
    setExtractedRosterData(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const images = attachments.filter(a => a.type === 'image').map(a => ({ data: a.data, mimeType: a.mimeType }));
    const pdfs = attachments.filter(a => a.type === 'pdf').map(a => ({ data: a.data, mimeType: a.mimeType }));
    
    const combinedInput = `
      ${text}
      
      [EXTRACTED_ROSTER_FILE_DATA]
      ${extractedRosterData.join('\n\n')}
      [/EXTRACTED_ROSTER_FILE_DATA]
    `.trim();

    onAnalyze(combinedInput, images, pdfs);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
            Bulk Handle Input / Quick Paste
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste handles like @creator1, @creator2... or drop your files on the right."
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
            Roster Document Center
          </label>
          <div 
            onClick={() => !isParsing && fileInputRef.current?.click()}
            className={`h-48 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-indigo-400 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer flex flex-col items-center justify-center group relative overflow-hidden ${isParsing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            
            {isParsing ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Parsing Documents...</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Drop Excel / Word / PDF</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">XLSX • DOCX • PDF • CSV • PNG/JPG</p>
              </>
            )}
          </div>
        </div>
      </div>

      {(attachments.length > 0 || extractedRosterData.length > 0) && (
        <div className="space-y-6">
          {attachments.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Multi-Modal Attachments ({attachments.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {attachments.map((att, idx) => (
                  <div key={idx} className="relative group aspect-square overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-slate-50">
                    {att.type === 'image' ? (
                      <img src={`data:${att.mimeType};base64,${att.data}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Preview" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                        <svg className="w-10 h-10 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        <span className="text-[8px] font-black uppercase text-slate-600 truncate w-full px-2">{att.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }}
                        className="bg-red-500 text-white rounded-full p-2 transition-all active:scale-90"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {extractedRosterData.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Extracted Roster Data ({extractedRosterData.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {extractedRosterData.map((data, idx) => {
                  const fileNameMatch = data.match(/ROSTER [A-Z]+: (.*) ---/);
                  const fileName = fileNameMatch ? fileNameMatch[1] : `Parsed File ${idx + 1}`;
                  const type = data.includes('EXCEL') ? 'XLSX' : data.includes('WORD') ? 'DOCX' : 'TEXT';
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 group">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-black text-[10px] text-white shadow-sm ${
                          type === 'XLSX' ? 'bg-green-600' : type === 'DOCX' ? 'bg-blue-600' : 'bg-slate-700'
                        }`}>
                          {type}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{fileName}</p>
                          <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">Text Extracted</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeExtractedData(idx)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!text && attachments.length === 0 && extractedRosterData.length === 0}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black py-5 rounded-3xl shadow-2xl shadow-slate-900/20 transition-all transform hover:-translate-y-1 active:scale-95 text-xs uppercase tracking-[0.3em]"
      >
        Run Intelligence Analysis
      </button>
    </div>
  );
};

export default FileUploader;
