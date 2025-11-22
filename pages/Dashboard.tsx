
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { StatisticIndicator, StatisticYearlyValue, StatCategory } from '../types';
import { 
  AreaChart, Area, ResponsiveContainer 
} from 'recharts';
import { 
  Book, Archive, Building2, TrendingUp, Sparkles, AlertTriangle, 
  Activity, Clock, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  
  // State
  const [indicators, setIndicators] = useState<StatisticIndicator[]>([]);
  const [values, setValues] = useState<StatisticYearlyValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        const [inds, vals] = await Promise.all([
            storageService.getIndicators(),
            storageService.getAllYearlyValues()
        ]);
        
        setIndicators(inds);
        setValues(vals);
        calculateSummaries(inds, vals);
    } catch (error) {
        console.error("Gagal memuat data dashboard", error);
    } finally {
        setLoading(false);
    }
  };

  const calculateSummaries = (inds: StatisticIndicator[], vals: StatisticYearlyValue[]) => {
    const categories: StatCategory[] = ['Perpustakaan', 'Kearsipan', 'Umum'];
    const res: any = {};

    categories.forEach(cat => {
      const catInds = inds.filter(i => i.category === cat);
      
      // Calculate Completion for Current Year
      const filledCount = catInds.filter(i => 
        vals.some(v => v.indicatorId === i.id && v.year === currentYear)
      ).length;
      const completionRate = catInds.length > 0 ? (filledCount / catInds.length) * 100 : 0;

      // Calculate Trend (Last Year vs 2 Years Ago)
      const valsCurr = vals.filter(v => v.year === currentYear - 1 && catInds.find(i => i.id === v.indicatorId));
      const valsPrev = vals.filter(v => v.year === currentYear - 2 && catInds.find(i => i.id === v.indicatorId));
      
      const sumCurr = valsCurr.reduce((a, b) => a + Number(b.value), 0);
      const sumPrev = valsPrev.reduce((a, b) => a + Number(b.value), 0);
      
      let trend = 0;
      if (sumPrev > 0) trend = ((sumCurr - sumPrev) / sumPrev) * 100;

      // Mini Chart Data (Last 3 years)
      const chartData = [currentYear - 2, currentYear - 1, currentYear].map(y => {
        const yVals = vals.filter(v => v.year === y && catInds.find(i => i.id === v.indicatorId));
        const avg = yVals.length > 0 ? yVals.reduce((a,b) => a + Number(b.value), 0) / yVals.length : 0;
        return { year: y, value: avg };
      });

      res[cat] = {
        totalIndicators: catInds.length,
        completionRate,
        trend,
        chartData
      };
    });

    setSummary(res);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat Ringkasan Data...</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Halo, {user?.name} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Berikut adalah ringkasan kinerja data dan statistik Dinas Arsip & Perpustakaan.
          </p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2">
          <Clock size={16} />
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* MAIN STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Perpustakaan */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Book size={24} />
            </div>
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${summary['Perpustakaan'].trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <TrendingUp size={14} className="mr-1" />
              {Math.abs(summary['Perpustakaan'].trend).toFixed(1)}%
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Perpustakaan</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{summary['Perpustakaan'].totalIndicators} <span className="text-sm text-slate-400 font-normal">Indikator Kinerja</span></h3>
          </div>
          <div className="h-16 mt-4 -mx-4 -mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={summary['Perpustakaan'].chartData}>
                 <defs>
                   <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBlue)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Card: Kearsipan */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Archive size={24} />
            </div>
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${summary['Kearsipan'].trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <TrendingUp size={14} className="mr-1" />
              {Math.abs(summary['Kearsipan'].trend).toFixed(1)}%
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Kearsipan</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{summary['Kearsipan'].totalIndicators} <span className="text-sm text-slate-400 font-normal">Indikator Kinerja</span></h3>
          </div>
          <div className="h-16 mt-4 -mx-4 -mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={summary['Kearsipan'].chartData}>
                 <defs>
                   <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorGreen)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Card: Umum */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
              <Building2 size={24} />
            </div>
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${summary['Umum'].trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <TrendingUp size={14} className="mr-1" />
              {Math.abs(summary['Umum'].trend).toFixed(1)}%
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Umum / Kepegawaian</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{summary['Umum'].totalIndicators} <span className="text-sm text-slate-400 font-normal">Indikator Kinerja</span></h3>
          </div>
          <div className="h-16 mt-4 -mx-4 -mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={summary['Umum'].chartData}>
                 <defs>
                   <linearGradient id="colorSlate" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="value" stroke="#64748b" fillOpacity={1} fill="url(#colorSlate)" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: AI INSIGHT & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* AI HIGHLIGHTS */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Sparkles size={120} />
           </div>
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-4">
               <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                 <Sparkles className="text-yellow-300" size={20} />
               </div>
               <h3 className="font-bold text-lg">AI Smart Insight</h3>
             </div>
             
             <div className="space-y-4">
               <p className="text-indigo-100 leading-relaxed">
                 Berdasarkan analisis awal, tren <strong>Kearsipan</strong> menunjukkan peningkatan konsisten sebesar <strong>{summary['Kearsipan'].trend.toFixed(1)}%</strong> dalam dua tahun terakhir. 
                 Fokuskan program digitalisasi untuk mempertahankan momentum ini.
               </p>
               
               {summary['Perpustakaan'].trend < 0 && (
                 <div className="bg-white/10 rounded-lg p-3 border border-white/20 flex items-start gap-3">
                   <AlertTriangle className="text-orange-300 shrink-0 mt-0.5" size={18} />
                   <div className="text-sm">
                     <p className="font-bold text-orange-200">Perhatian Diperlukan</p>
                     <p className="text-indigo-100 opacity-80">Indikator Perpustakaan mengalami sedikit penurunan. Cek detail di menu Analisa AI.</p>
                   </div>
                 </div>
               )}

               <div className="pt-2">
                 <Link to="/statistics/ai-analysis" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm">
                   Buka Analisa Lengkap <ChevronRight size={16} />
                 </Link>
               </div>
             </div>
           </div>
        </div>

        {/* STATUS DATA & ACTIVITY */}
        <div className="space-y-6">
          {/* Data Completeness Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Activity size={18} className="text-slate-500" /> Status Data {currentYear}
             </h3>
             <div className="space-y-4">
                {['Perpustakaan', 'Kearsipan', 'Umum'].map((cat: any) => (
                   <div key={cat}>
                     <div className="flex justify-between text-xs mb-1">
                       <span className="font-medium text-slate-600">{cat}</span>
                       <span className="text-slate-400">{summary[cat]?.completionRate.toFixed(0)}% Lengkap</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-2">
                       <div 
                         className={`h-2 rounded-full transition-all duration-500 ${
                           summary[cat]?.completionRate >= 80 ? 'bg-green-500' : 
                           summary[cat]?.completionRate >= 50 ? 'bg-yellow-500' : 'bg-slate-300'
                         }`}
                         style={{ width: `${summary[cat]?.completionRate}%` }}
                       ></div>
                     </div>
                   </div>
                ))}
             </div>
             <div className="mt-4 pt-4 border-t border-slate-100 text-center">
               <Link to="/statistics/annual" className="text-sm text-blue-600 font-medium hover:underline">
                 Lengkapi Data Statistik &rarr;
               </Link>
             </div>
          </div>

          {/* Recent Activity (Static Mock for demo) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
             <h3 className="font-bold text-slate-800 mb-4 text-sm">Aktivitas Terakhir</h3>
             <div className="space-y-4">
               <div className="flex gap-3 items-start">
                 <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 shrink-0"></div>
                 <div>
                   <p className="text-xs text-slate-800 font-medium">Update Data Statistik Kearsipan</p>
                   <p className="text-[10px] text-slate-400">Baru saja oleh Admin</p>
                 </div>
               </div>
               <div className="flex gap-3 items-start">
                 <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
                 <div>
                   <p className="text-xs text-slate-800 font-medium">Penambahan Indikator Baru</p>
                   <p className="text-[10px] text-slate-400">2 jam yang lalu</p>
                 </div>
               </div>
             </div>
          </div>
        </div>

      </div>

    </div>
  );
};