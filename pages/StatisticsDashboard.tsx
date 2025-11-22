
import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { StatisticIndicator, StatisticYearlyValue, StatCategory } from '../types';
import { 
  LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell 
} from 'recharts';
import { 
  Book, Archive, Building2, TrendingUp, TrendingDown, 
  BrainCircuit, Sparkles, RefreshCw, AlertTriangle, Calendar 
} from 'lucide-react';

export const StatisticsDashboard: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [indicators, setIndicators] = useState<StatisticIndicator[]>([]);
  const [yearlyValues, setYearlyValues] = useState<StatisticYearlyValue[]>([]);
  
  // AI State
  const [aiInsight, setAiInsight] = useState<string>('');
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      generateAIInsight();
    }
  }, [selectedYear, loading]);

  const loadData = async () => {
    await storageService.delay(300);
    const [inds, vals] = await Promise.all([
        storageService.getIndicators(),
        storageService.getAllYearlyValues()
    ]);
    setIndicators(inds);
    setYearlyValues(vals);
    setLoading(false);
  };

  // --- HELPER: Get Sparkline Data for a Category ---
  // Returns an array of { year, value } for the aggregate performance (normalized count or sum of key indicators)
  const getSparklineData = (category: StatCategory) => {
    const categoryIndicators = indicators.filter(i => i.category === category);
    const years = Array.from(new Set(yearlyValues.map(v => v.year))).sort();
    
    // Take last 5 years
    return years.slice(-5).map(year => {
      // Calculate average value of indicators in this category for this year (very rough approx for visual)
      // In real app, you might want to track a specific KPI
      const vals = yearlyValues.filter(v => v.year === year && categoryIndicators.find(i => i.id === v.indicatorId));
      const sum = vals.reduce((acc, curr) => acc + Number(curr.value), 0);
      const avg = vals.length > 0 ? sum / vals.length : 0;
      return { year, value: avg };
    });
  };

  // --- HELPER: Get Category Summary ---
  const getCategorySummary = (category: StatCategory) => {
    const catInds = indicators.filter(i => i.category === category);
    const totalIndicators = catInds.length;
    
    // Calculate Trend (Current Year vs Previous Year)
    const currentVals = yearlyValues.filter(v => v.year === selectedYear && catInds.find(i => i.id === v.indicatorId));
    const prevVals = yearlyValues.filter(v => v.year === selectedYear - 1 && catInds.find(i => i.id === v.indicatorId));
    
    let growthSum = 0;
    let growthCount = 0;

    currentVals.forEach(curr => {
      const prev = prevVals.find(p => p.indicatorId === curr.indicatorId);
      if (prev) {
        const cVal = Number(curr.value);
        const pVal = Number(prev.value);
        if (pVal > 0) {
          growthSum += ((cVal - pVal) / pVal) * 100;
          growthCount++;
        }
      }
    });

    const avgGrowth = growthCount > 0 ? growthSum / growthCount : 0;

    return {
      totalIndicators,
      avgGrowth,
      sparkData: getSparklineData(category)
    };
  };

  // --- AI LOGIC ---
  const generateAIInsight = () => {
    setIsGeneratingAI(true);
    setAnomalies([]);

    setTimeout(() => {
      const summaries = {
        Perpustakaan: getCategorySummary('Perpustakaan'),
        Kearsipan: getCategorySummary('Kearsipan'),
        Umum: getCategorySummary('Umum'),
      };

      // Find highest growth category
      const categories = Object.entries(summaries);
      const bestCat = categories.reduce((prev, curr) => prev[1].avgGrowth > curr[1].avgGrowth ? prev : curr);
      const worstCat = categories.reduce((prev, curr) => prev[1].avgGrowth < curr[1].avgGrowth ? prev : curr);

      // Detect specific indicator anomalies (> 20% drop)
      const detectedAnomalies: string[] = [];
      indicators.forEach(ind => {
        const curr = yearlyValues.find(v => v.year === selectedYear && v.indicatorId === ind.id);
        const prev = yearlyValues.find(v => v.year === selectedYear - 1 && v.indicatorId === ind.id);
        
        if (curr && prev) {
          const cVal = Number(curr.value);
          const pVal = Number(prev.value);
          const change = ((cVal - pVal) / pVal) * 100;
          
          if (change < -15) {
            detectedAnomalies.push(`${ind.name} menurun tajam sebesar ${Math.abs(change).toFixed(1)}%`);
          }
        }
      });

      setAnomalies(detectedAnomalies);

      let text = `Berdasarkan data tahun ${selectedYear}, kategori **${bestCat[0]}** menunjukkan kinerja pertumbuhan rata-rata terbaik sebesar ${bestCat[1].avgGrowth.toFixed(1)}%. `;
      
      if (worstCat[1].avgGrowth < 0) {
        text += `Sebaliknya, kategori **${worstCat[0]}** mengalami kontraksi rata-rata ${worstCat[1].avgGrowth.toFixed(1)}% yang mungkin disebabkan oleh penurunan beberapa indikator kunci. `;
      }

      // Prediction Mock
      text += `\n\nPrediksi AI: Jika tren ini berlanjut, kategori ${bestCat[0]} diproyeksikan tumbuh stabil di kisaran ${Math.abs(bestCat[1].avgGrowth * 0.8).toFixed(1)}% pada tahun ${selectedYear + 1}.`;

      setAiInsight(text);
      setIsGeneratingAI(false);
    }, 1000);
  };

  const renderSummaryCard = (title: string, category: StatCategory, icon: React.ReactNode, colorClass: string) => {
    const summary = getCategorySummary(category);
    const isPositive = summary.avgGrowth >= 0;

    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${colorClass}`}>
            {icon}
          </div>
          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {Math.abs(summary.avgGrowth).toFixed(1)}%
          </div>
        </div>
        
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{summary.totalIndicators} <span className="text-sm text-slate-400 font-normal">Indikator</span></h3>
        </div>

        {/* Sparkline */}
        <div className="h-12 mt-4 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.sparkData}>
              <Line type="monotone" dataKey="value" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat Dashboard Statistik...</div>;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Statistik Tahunan</h1>
          <p className="text-slate-500">Ringkasan kinerja dinas berdasarkan indikator tahunan.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-slate-300 shadow-sm">
          <div className="px-3 py-2 flex items-center gap-2 text-slate-600 border-r border-slate-200">
            <Calendar size={18} />
            <span className="text-sm font-bold">Tahun Data:</span>
          </div>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent border-none text-sm font-bold text-slate-800 focus:ring-0 cursor-pointer pr-8"
          >
            {[currentYear, currentYear-1, currentYear-2, currentYear-3].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: STATS & CHARTS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderSummaryCard('Perpustakaan', 'Perpustakaan', <Book size={24} />, 'bg-blue-50 text-blue-600')}
            {renderSummaryCard('Kearsipan', 'Kearsipan', <Archive size={24} />, 'bg-green-50 text-green-600')}
            {renderSummaryCard('Umum / Kepegawaian', 'Umum', <Building2 size={24} />, 'bg-slate-100 text-slate-600')}
          </div>

          {/* Main Chart: Key Indicators Comparison */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Perbandingan Pertumbuhan per Kategori</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Perpustakaan', val: getCategorySummary('Perpustakaan').avgGrowth },
                  { name: 'Kearsipan', val: getCategorySummary('Kearsipan').avgGrowth },
                  { name: 'Umum', val: getCategorySummary('Umum').avgGrowth },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="val" radius={[4, 4, 0, 0]} name="Pertumbuhan Rata-rata">
                    {[
                      getCategorySummary('Perpustakaan').avgGrowth,
                      getCategorySummary('Kearsipan').avgGrowth,
                      getCategorySummary('Umum').avgGrowth
                    ].map((val, idx) => (
                      <Cell key={idx} fill={val >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI INSIGHT BOX */}
        <div className="space-y-6">
          
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-white/10">
              <BrainCircuit size={120} />
            </div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Sparkles size={20} className="text-yellow-300" />
                AI Insight Box
              </div>
              <button 
                onClick={generateAIInsight} 
                disabled={isGeneratingAI}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:animate-spin"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="relative z-10 min-h-[120px]">
              {isGeneratingAI ? (
                <div className="flex flex-col items-center justify-center h-full text-indigo-200 text-sm animate-pulse">
                  <BrainCircuit size={32} className="mb-2" />
                  Menganalisis data tahunan...
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="leading-relaxed whitespace-pre-line text-indigo-50">
                    {aiInsight || "Data belum cukup untuk dianalisis."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Anomalies List */}
          {anomalies.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
              <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center gap-2 text-red-700 font-bold text-sm">
                <AlertTriangle size={16} />
                Perhatian: Penurunan Signifikan
              </div>
              <div className="divide-y divide-slate-100">
                {anomalies.map((alert, idx) => (
                  <div key={idx} className="px-4 py-3 text-sm text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                    {alert}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Helper Info */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 text-sm text-blue-800">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <TrendingUp size={16} /> Tips Optimalisasi
            </h4>
            <p className="opacity-80 leading-relaxed">
              Pastikan data statistik tahun {selectedYear} telah terisi lengkap untuk mendapatkan hasil analisis AI yang akurat. Data yang kosong akan dianggap sebagai nilai 0.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};