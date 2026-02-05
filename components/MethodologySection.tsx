
import React from 'react';

const MethodologySection: React.FC = () => {
  const steps = [
    {
      title: "Signal Ingestion",
      desc: "Ingests handles, CSV manifests, and screenshot OCR to build a baseline creator profile.",
      icon: "📥"
    },
    {
      title: "Graph API Discovery",
      desc: "Triggers live Meta Graph requests for validated follower counts, bios, and recent media signals.",
      icon: "🌐"
    },
    {
      title: "Probabilistic Synthesis",
      desc: "Gemini 3 Pro analyzes linguistic and cultural markers to estimate state-level demographic density.",
      icon: "🧠"
    },
    {
      title: "KPI Benchmarking",
      desc: "Cross-references engagement depth against niche-specific ROI and conversion benchmarks.",
      icon: "📊"
    }
  ];

  return (
    <section className="mt-16 border-t border-slate-200 pt-16 pb-8">
      <div className="text-center mb-12">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Intelligence Methodology</h3>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">How Ice Media Labs Estimates Data</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              {step.icon}
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-tight">{step.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 -mr-10 -mt-10">
          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h4 className="text-indigo-300 font-black text-[10px] uppercase tracking-widest mb-2">Transparency Report</h4>
            <h3 className="text-2xl font-bold mb-4">Probabilistic vs. Deterministic Data</h3>
            <p className="text-indigo-100 text-sm leading-relaxed font-medium opacity-90">
              Ice Media Labs combines <strong>Deterministic Data</strong> (API-validated counts) with <strong>Probabilistic Modeling</strong> (LLM-inferred demographics). While regional distributions are estimates, they are grounded in linguistic analysis of the creator's last 50 content signals, offering a 90%+ confidence interval for agency planning.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-tight">State Breakdown (20+ Points)</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-tight">Intent-Based Audience Scoring</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodologySection;
