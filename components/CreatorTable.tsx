
import React, { useState } from 'react';
import { AnalysisResult, BrandSafety, ReachCategory, KPICategory } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface CreatorTableProps {
  data: AnalysisResult[];
}

const CreatorTable: React.FC<CreatorTableProps> = ({ data }) => {
  const [selectedCreator, setSelectedCreator] = useState<AnalysisResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(creator => 
    creator.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.contentIntelligence.primaryNiche.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierColor = (tier: string) => {
    const t = tier as KPICategory;
    switch (t) {
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

  const downloadCSV = () => {
    const headers = ['Handle', 'Primary Niche', 'Overall Tier', 'Primary Region', 'Density %', 'Reach', 'Campaign Score', 'Brand Summary'];
    const rows = data.map(c => [
      c.handle,
      c.contentIntelligence.primaryNiche,
      c.kpiAnalysis.overallTier,
      c.regions.primary.name,
      c.regions.primary.percentage,
      c.reachEstimation.category,
      c.campaignFit.score,
      `"${c.brandSummary.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "IceMediaLabs_BulkReport.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const biharData = selectedCreator?.stateBreakdown?.find(s => s.state.toLowerCase() === 'bihar');
  const patnaData = selectedCreator?.cityBreakdown?.find(c => c.city.toLowerCase() === 'patna');

  return (
    <div className="bg-white">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
        <div className="relative flex-grow max-w-md">
          <input 
            type="text" 
            placeholder="Search roster by handle or niche..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <button 
          onClick={downloadCSV}
          className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-all text-xs font-black uppercase tracking-widest border border-indigo-100 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span>Export Agency CSV</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Creator</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">KPI Tier</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Regional Focus</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reach Cat.</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Strategy</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filteredData.map((creator, idx) => (
              <tr key={idx} className="group hover:bg-slate-50/80 transition-all duration-200">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                      {creator.handle.substring(1, 2).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-black text-slate-900">{creator.handle}</div>
                      <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{creator.contentIntelligence.primaryNiche}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`px-3 py-1 text-[9px] font-black rounded-lg border ${getTierColor(creator.kpiAnalysis.overallTier)} uppercase tracking-widest`}>
                    {creator.kpiAnalysis.overallTier}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm text-slate-900 font-bold">{creator.regions.primary.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{creator.regions.primary.percentage}% Density</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-[9px] font-black rounded-lg ${getReachColor(creator.reachEstimation.category)} uppercase tracking-widest`}>
                    {creator.reachEstimation.category}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <span className="text-xs font-black text-slate-900">{creator.campaignFit.score}/10</span>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => setSelectedCreator(creator)}
                    className="text-white hover:bg-indigo-700 bg-indigo-600 px-5 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCreator && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-slate-200 flex flex-col animate-in zoom-in fade-in duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-20">
              <div className="flex items-center space-x-6">
                <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-slate-200">
                  {selectedCreator.handle.substring(1, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{selectedCreator.handle}</h3>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-xl border ${getTierColor(selectedCreator.kpiAnalysis.overallTier)} uppercase tracking-[0.2em]`}>
                      {selectedCreator.kpiAnalysis.overallTier}
                    </span>
                    <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">• {selectedCreator.contentIntelligence.primaryNiche} Expert</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCreator(null)}
                className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-10 space-y-12 bg-slate-50/30">
              {/* Bihar & Patna Spotlight Section */}
              {biharData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50/50 p-8 rounded-[40px] border-2 border-orange-100 shadow-xl shadow-orange-100/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                    <svg className="w-32 h-32 text-orange-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  </div>
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 bg-orange-600 px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Priority Roster Focus: Bihar</span>
                    </div>
                    <div>
                      <h4 className="text-4xl font-black text-orange-950 tracking-tighter uppercase mb-1">Bihar Intelligence</h4>
                      <p className="text-sm font-bold text-orange-800 leading-relaxed opacity-80">
                        This creator demonstrates high resonance within the Bihar belt. 
                        Targeting this segment offers significant local ROI potential.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[32px] border border-orange-200 shadow-sm flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Bihar State Density</span>
                      <div className="text-4xl font-black text-orange-600">{biharData.percentage}%</div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-orange-200 shadow-sm flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Patna City Focus</span>
                      <div className="text-4xl font-black text-orange-800">{patnaData?.percentage || 'Low'}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Brand Summary Section */}
              <div className="bg-white p-8 rounded-[32px] border-l-8 border-indigo-600 shadow-sm">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-3">Brand & Niche Summary</h4>
                <p className="text-lg font-bold text-slate-800 leading-relaxed italic">
                  "{selectedCreator.brandSummary}"
                </p>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                  Performance KPI Rationale
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Awareness', data: selectedCreator.kpiAnalysis.awareness, icon: '👁️' },
                    { label: 'Engagement', data: selectedCreator.kpiAnalysis.engagement, icon: '💬' },
                    { label: 'Conversions', data: selectedCreator.kpiAnalysis.conversions, icon: '🛒' },
                    { label: 'ROI Potential', data: selectedCreator.kpiAnalysis.roi, icon: '💎' }
                  ].map((pill, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-2xl group-hover:scale-125 transition-transform">{pill.icon}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${getTierColor(pill.data.category)} uppercase tracking-widest`}>
                          {pill.data.category}
                        </span>
                      </div>
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{pill.label}</h5>
                      <div className="flex items-baseline space-x-1 mb-4">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{pill.data.score}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase">/ 100</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-bold italic">
                        "{pill.data.insight}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center mb-4">
                    Full State Distribution
                  </h4>
                  {selectedCreator.stateBreakdown && (
                    <div className="flex-grow overflow-y-auto pr-4" style={{ maxHeight: '500px' }}>
                      <div style={{ height: `${selectedCreator.stateBreakdown.length * 35}px` }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={selectedCreator.stateBreakdown.sort((a,b) => b.percentage - a.percentage)}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} unit="%" />
                            <YAxis dataKey="state" type="category" fontSize={10} axisLine={false} tickLine={false} width={140} tick={{fill: '#475569', fontWeight: 800}} />
                            <Tooltip 
                              cursor={{fill: '#f8fafc'}} 
                              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }} 
                            />
                            <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={16}>
                              {selectedCreator.stateBreakdown.sort((a,b) => b.percentage - a.percentage).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.state.toLowerCase() === 'bihar' ? '#ea580c' : '#10b981'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-8 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                    Audience Demographics
                  </h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedCreator.demographics.ageGroups}>
                        <XAxis dataKey="range" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                        <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="percentage" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Metro Focus</span>
                      <div className="text-sm font-black text-slate-900">{selectedCreator.demographics.metroSplit.metro}%</div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Gender Skew</span>
                      <div className="text-sm font-black text-pink-500">F:{selectedCreator.demographics.genderSkew.female}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 rounded-b-[40px] text-center">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">ICE MEDIA LABS • BIHAR & PATNA PRIORITY INTELLIGENCE • AGENCY MODE</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorTable;
