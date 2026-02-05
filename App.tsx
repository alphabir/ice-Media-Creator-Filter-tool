
import React, { useState } from 'react';
import { analyzeCreators } from './geminiService';
import { AnalysisResponse } from './types';
import CreatorTable from './components/CreatorTable';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import SummaryView from './components/SummaryView';
import { fetchCreatorSignals, InstagramMetadata } from './instagramService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      setLoadingStage('Running probabilistic audience analysis...');
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {!results && !loading && (
          <div className="flex flex-col items-center justify-center space-y-8 mt-12">
            <div className="text-center max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Audience Intelligence Suite</h2>
              <p className="text-slate-600 text-lg">
                Upload your creator rosters or paste handles to generate professional, AI-estimated demographic and performance insights.
              </p>
            </div>
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <FileUploader onAnalyze={handleAnalysis} />
            </div>
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
              <h3 className="text-xl font-semibold text-slate-800">{loadingStage || 'Processing Intelligence...'}</h3>
              <p className="text-slate-500 mt-2">Gemini is combining live Graph signals with logical inference.</p>
              <p className="text-xs text-indigo-400 mt-4 animate-pulse">Running demographic estimation models...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Analysis Output</h2>
                <p className="text-slate-500">Marked as AI-Estimated with live Graph API signal verification</p>
              </div>
              <button 
                onClick={reset}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors"
              >
                New Analysis
              </button>
            </div>

            <SummaryView summary={results.summary} />
            
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <CreatorTable data={results.creators} />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-400 text-xs">
          © {new Date().getFullYear()} CreatorIntel Media Agency Tool. Live data powered by Meta Graph Explorer.
        </div>
      </footer>
    </div>
  );
};

export default App;
