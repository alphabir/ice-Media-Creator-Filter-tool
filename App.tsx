
import React, { useState } from 'react';
import { analyzeCreators } from './geminiService';
import { AnalysisResponse } from './types';
import CreatorTable from './components/CreatorTable';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import SummaryView from './components/SummaryView';
import SettingsModal from './components/SettingsModal';
import MethodologySection from './components/MethodologySection';
import { fetchCreatorSignals, InstagramMetadata } from './instagramService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const extractHandles = (text: string): string[] => {
    // Better regex to catch @handles even in messy CSV/Text
    const handleRegex = /@[\w.]{1,30}/g;
    const matches = text.match(handleRegex);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const handleAnalysis = async (inputText: string, imageData?: { data: string, mimeType: string }[]) => {
    if (!inputText && (!imageData || imageData.length === 0)) {
      setError("Please provide a list of creators or a document.");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStage('Analyzing roster structure...');

    try {
      const handles = extractHandles(inputText);
      let enrichedInput = inputText;

      if (handles.length > 0) {
        setLoadingStage(`Fetching live Meta signals for ${handles.length} creators...`);
        // Limit Meta signals fetch to avoid API rate limits during bulk but give enough context
        const MAX_META_FETCH = 15; 
        const metadataResults: InstagramMetadata[] = await Promise.all(
          handles.slice(0, MAX_META_FETCH).map(handle => fetchCreatorSignals(handle))
        );

        const metadataString = metadataResults
          .filter(m => !m.error)
          .map(m => `
            SIGNAL [${m.handle}]:
            - Bio: ${m.biography}
            - Followers: ${m.followers_count}
            - Recent Themes: ${m.recent_captions?.join(' | ')}
          `).join('\n');

        enrichedInput = `[ROSTER_CONTEXT]\nTotal Creators: ${handles.length}\n${inputText}\n\n[DETAILED_SIGNALS]\n${metadataString}\n[/DETAILED_SIGNALS]`;
      }

      setLoadingStage(`Generating bulk intelligence for ${handles.length || 'uploaded'} profiles...`);
      const response = await analyzeCreators(enrichedInput, imageData);
      setResults(response);
    } catch (err: any) {
      setError(err.message || "An error occurred during bulk analysis.");
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const reset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {!results && !loading && (
          <div className="flex flex-col space-y-12 mt-12 animate-in fade-in duration-500">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center max-w-2xl">
                <div className="inline-flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full mb-6 border border-indigo-100">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Agency Bulk Mode Active</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-tight">
                  Creator Intelligence <br/>& Bulk Discovery
                </h2>
                <p className="text-slate-600 text-lg font-medium leading-relaxed">
                  Upload your rosters, talent lists, or campaign screenshots. <br/>
                  Get proper, agency-grade performance and demographic reports in seconds.
                </p>
              </div>
              <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-200 p-1">
                <div className="bg-slate-50/50 rounded-[22px] p-8">
                  <FileUploader onAnalyze={handleAnalysis} />
                </div>
              </div>
            </div>
            <MethodologySection />
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-8 mt-24">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-indigo-600 rounded-full animate-ping"></div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{loadingStage}</h3>
              <p className="text-slate-500 font-medium">Ice Media Labs is synthesizing multi-channel signals.</p>
              <div className="flex justify-center space-x-1 mt-6">
                <div className="w-1 h-4 bg-indigo-200 animate-bounce delay-75"></div>
                <div className="w-1 h-6 bg-indigo-400 animate-bounce delay-150"></div>
                <div className="w-1 h-4 bg-indigo-600 animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mt-8 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-lg animate-in shake duration-300">
            <strong className="font-black text-xs uppercase tracking-widest block mb-1">Analysis Halted</strong>
            <span className="block text-sm font-medium">{error}</span>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Intelligence Roster</h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{results.creators.length} Profiles Analyzed • Proper Agency View</p>
                </div>
              </div>
              <button 
                onClick={reset}
                className="px-8 py-3 text-xs font-black text-slate-600 hover:text-white border border-slate-300 rounded-2xl bg-white hover:bg-slate-900 transition-all shadow-sm active:scale-95 uppercase tracking-widest"
              >
                New Bulk Analysis
              </button>
            </div>

            <SummaryView summary={results.summary} />
            
            <div className="rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
              <CreatorTable data={results.creators} />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            ICE MEDIA LABS • PROBABILISTIC AUDIENCE INTELLIGENCE • AGENCY ROSTER MODE
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
