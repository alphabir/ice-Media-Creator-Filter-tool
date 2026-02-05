
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
    const handleRegex = /@[\w.]+/g;
    const matches = text.match(handleRegex);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const handleAnalysis = async (inputText: string, imageData?: { data: string, mimeType: string }[]) => {
    if (!inputText && (!imageData || imageData.length === 0)) {
      setError("Please provide a list of creators or a screenshot.");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStage('Establishing Graph API session...');

    try {
      const handles = extractHandles(inputText);
      let enrichedInput = inputText;

      if (handles.length > 0) {
        setLoadingStage(`Fetching live signals for ${handles.length} creators...`);
        // Fetch real data for up to the first 5 handles to maintain prompt efficiency
        const metadataResults: InstagramMetadata[] = await Promise.all(
          handles.slice(0, 5).map(handle => fetchCreatorSignals(handle))
        );

        const metadataString = metadataResults
          .filter(m => !m.error)
          .map(m => `
            LIVE DATA [${m.handle}]:
            - Name: ${m.name}
            - Bio: ${m.biography}
            - Followers: ${m.followers_count}
            - Posts: ${m.media_count}
            - Recent Themes: ${m.recent_captions?.join(' | ')}
          `).join('\n');

        enrichedInput = `${inputText}\n\n[GRAPH_API_SIGNALS]\n${metadataString}\n[/GRAPH_API_SIGNALS]`;
      }

      setLoadingStage('Running Ice Media probabilistic analysis...');
      const response = await analyzeCreators(enrichedInput, imageData);
      setResults(response);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
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
          <div className="flex flex-col space-y-12 mt-12">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center max-w-2xl">
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Ice Media Intel Suite</h2>
                <p className="text-slate-600 text-lg font-medium">
                  Upload rosters or paste handles to generate agency-grade demographic and performance estimations.
                </p>
              </div>
              <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-8">
                <FileUploader onAnalyze={handleAnalysis} />
              </div>
            </div>

            <MethodologySection />
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-6 mt-24">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">{loadingStage || 'Processing Labs Intelligence...'}</h3>
              <p className="text-slate-500 mt-2 font-medium">Ice Media Labs is synthesizing Meta signals with Gemini 3 Pro.</p>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-4 animate-pulse">Running demographic estimation models...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mt-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl relative shadow-sm" role="alert">
            <strong className="font-black text-xs uppercase tracking-widest block mb-1">System Alert</strong>
            <span className="block text-sm font-medium">{error}</span>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Intelligence Report</h2>
                <p className="text-slate-500 font-medium">Validated by Ice Media Labs AI Engine</p>
              </div>
              <button 
                onClick={reset}
                className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                Reset Dashboard
              </button>
            </div>

            <SummaryView summary={results.summary} />
            
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
              <CreatorTable data={results.creators} />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">IM</span>
            </div>
            <span className="text-slate-900 font-black text-xs uppercase tracking-widest">Ice Media Labs</span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Ice Media Labs - Agency Intelligence Suite. 
            <br className="md:hidden" />
            <span className="hidden md:inline mx-2">•</span> 
            Live signals via Meta Graph API
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
