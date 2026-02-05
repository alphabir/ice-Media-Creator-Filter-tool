
import React, { useState } from 'react';
import { AnalysisResult, BrandSafety, ReachCategory, KPICategory } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CreatorTableProps {
  data: AnalysisResult[];
}

const CreatorTable: React.FC<CreatorTableProps> = ({ data }) => {
  const [selectedCreator, setSelectedCreator] = useState<AnalysisResult | null>(null);

  const getSafetyColor = (level: BrandSafety) => {
    switch (level) {
      case BrandSafety.LOW: return 'text-green-600 bg-green-50';
      case BrandSafety.MEDIUM: return 'text-amber-600 bg-amber-50';
      case BrandSafety.HIGH: return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getTierColor = (tier: KPICategory) => {
    switch (tier) {
      case KPICategory.GOOD: return 'text-green-700 bg-green-100 border-green-200';
      case KPICategory.AVERAGE: return 'text-amber-700 bg-amber-100 border-amber-200';
      case KPICategory.LOW: return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getReachColor = (reach: ReachCategory) => {
    switch (reach) {
      case ReachCategory.VIRAL: return 'text-purple-600 bg-purple-50';
      case ReachCategory.HIGH: return 'text-indigo-600 bg-indigo-50';
      case ReachCategory.STABLE: return 'text-blue-600 bg-blue-50';
      case ReachCategory.LOW: return 'text-slate-500 bg-slate-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Creator</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">KPI Tier</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Region Analysis</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reach</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {data.map((creator, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {creator.handle.substring(1, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-bold text-slate-900">{creator.handle}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">{creator.contentIntelligence.primaryNiche}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border ${getTierColor(creator.kpiAnalysis.overallTier)}`}>
                  {creator.kpiAnalysis.overallTier.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900 font-medium">{creator.regions.primary.name}</div>
                <div className="text-[10px] text-slate-500">{creator.regions.primary.percentage}% Density</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full ${getReachColor(creator.reachEstimation.category)} uppercase tracking-tighter`}>
                  {creator.reachEstimation.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-bold text-slate-900">{creator.campaignFit.score}/10</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => setSelectedCreator(creator)}
                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-4 py-1.5 rounded-lg transition-all text-xs font-bold"
                >
                  FULL ANALYSIS
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCreator && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-20">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-100">
                  {selectedCreator.handle.substring(1, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedCreator.handle}</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierColor(selectedCreator.kpiAnalysis.overallTier)}`}>
                      OVERALL: {selectedCreator.kpiAnalysis.overallTier.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium tracking-wide">• INFERRED DATASET</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCreator(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 space-y-12 bg-slate-50/30">
              
              {/* KPI pillar section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm mr-2.5"></span>
                    Performance KPI Verification
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Benchmarked by Niche</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Brand Awareness', data: selectedCreator.kpiAnalysis.awareness, icon: '👁️' },
                    { label: 'Engagement', data: selectedCreator.kpiAnalysis.engagement, icon: '💬' },
                    { label: 'Conversions', data: selectedCreator.kpiAnalysis.conversions, icon: '📈' },
                    { label: 'ROI & EMV', data: selectedCreator.kpiAnalysis.roi, icon: '💰' }
                  ].map((pill, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xl">{pill.icon}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getTierColor(pill.data.category)}`}>
                          {pill.data.category}
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-800 mb-1">{pill.label}</h5>
                      <div className="flex items-baseline space-x-1 mb-3">
                        <span className="text-2xl font-black text-slate-900">{pill.data.score}</span>
                        <span className="text-[10px] font-bold text-slate-400">/ 100</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        {pill.data.insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Regional State Density */}
                <div className="lg:col-span-2 space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center mb-4">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-sm mr-2.5"></span>
                    Audience State & UT Density
                  </h4>
                  
                  {selectedCreator.stateBreakdown && selectedCreator.stateBreakdown.length > 0 ? (
                    <div className="flex-grow overflow-y-auto pr-2" style={{ maxHeight: '600px' }}>
                      <div style={{ height: `${Math.max(selectedCreator.stateBreakdown.length * 35, 400)}px`, minWidth: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            layout="vertical" 
                            data={selectedCreator.stateBreakdown.sort((a,b) => b.percentage - a.percentage)}
                            margin={{ left: 40, right: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} unit="%" />
                            <YAxis 
                              dataKey="state" 
                              type="category" 
                              fontSize={10} 
                              axisLine={false} 
                              tickLine={false} 
                              width={140} 
                              tick={{fill: '#475569', fontWeight: 600}} 
                            />
                            <Tooltip 
                              cursor={{fill: '#f8fafc'}}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} 
                            />
                            <Bar dataKey="percentage" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-400 text-sm font-medium italic">State-level data not applicable or detected.</p>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-4 italic">Including 28 States and 8 Union Territories</p>
                </div>

                {/* Demographics Card */}
                <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm mr-2.5"></span>
                    Demographics
                  </h4>
                  
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedCreator.demographics.ageGroups}>
                        <XAxis dataKey="range" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        />
                        <Bar dataKey="percentage" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Gender Skew</span>
                      <span className="text-xs font-black text-slate-800">M:{selectedCreator.demographics.genderSkew.male}% F:{selectedCreator.demographics.genderSkew.female}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Urban Split</span>
                      <span className="text-xs font-black text-slate-800">Metro:{selectedCreator.demographics.metroSplit.metro}% Tier 2/3:{selectedCreator.demographics.metroSplit.tier2_3}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
                 {/* Campaigns */}
                 <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm mr-2.5"></span>
                      Strategy & Brand Fit
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedCreator.campaignFit.recommendedCategories.map((cat, i) => (
                        <span key={i} className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-black rounded-lg border border-indigo-100 uppercase tracking-tight">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                      <h5 className="text-[10px] font-black text-amber-700 uppercase mb-2">Campaign Risks / Mismatches</h5>
                      <div className="space-y-1.5">
                        {selectedCreator.campaignFit.riskFlags.length > 0 ? selectedCreator.campaignFit.riskFlags.map((risk, i) => (
                          <div key={i} className="text-[11px] text-amber-900 flex items-start font-semibold">
                            <span className="mr-2">⚠️</span> {risk}
                          </div>
                        )) : <div className="text-[11px] text-slate-400 font-medium">No significant risks detected.</div>}
                      </div>
                    </div>
                 </div>

                 {/* Reasoning */}
                 <div className="space-y-6">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm mr-2.5"></span>
                      Analysis Rationale
                    </h4>
                    <div className="bg-white p-8 rounded-3xl text-[13px] text-slate-600 leading-relaxed border border-slate-200 shadow-sm">
                      <p className="mb-4"><strong>Data Signal Reasoning:</strong> {selectedCreator.demographics.reasoning}</p>
                      <p><strong>Reach Categorization:</strong> {selectedCreator.reachEstimation.reasoning}</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-2xl text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Agency Intelligence Verification • AI-Estimated Metrics • Probabilistic Reasoning applied
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorTable;
