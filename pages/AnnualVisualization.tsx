import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { StatisticIndicator, StatisticYearlyValue, StatCategory } from '../types';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { Download, Filter, Layers, PieChart as PieIcon, TrendingUp, Activity, Grid, BarChart as BarIcon } from 'lucide-react';

type ChartType = 'LINE' | 'BAR' | 'STACKED' | 'PIE' | 'AREA' | 'HEATMAP' | 'RADAR' | 'COMPOSED';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#6366f1'];

export const AnnualVisualization: React.FC = () => {
  // --- STATE ---
  const [activeCategory, setActiveCategory] = useState<StatCategory>('Perpustakaan');
  const [chartType, setChartType] = useState<ChartType>('LINE');
  
  const [allIndicators, setAllIndicators] = useState<StatisticIndicator[]>([]);
  const [allValues, setAllValues] = useState<StatisticYearlyValue[]>([]);
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]); // IDs

  // --- LOADING DATA ---
  useEffect(() => {
    const load = async () => {
        const inds = await storageService.getIndicators();
        const vals = await storageService.getAllYearlyValues();
        
        setAllIndicators(inds);
        setAllValues(vals);
        
        // Default selection: select first 3 indicators of active category
        const catInds = inds.filter(i => i.category === activeCategory);
        setSelectedIndicators(catInds.slice(0, 3).map(i => i.id));
    }
    load();
  }, []);

  // Update selection when category changes
  useEffect(() => {
    const catInds = allIndicators.filter(i => i.category === activeCategory);
    setSelectedIndicators(catInds.slice(0, 3).map(i => i.id));
  }, [activeCategory, allIndicators]);

  // --- DATA TRANSFORMATION ---
  
  // 1. Pivot Data for Time Series (Line, Area, Stacked, Composed)
  // Format: [{ year: 2020, 'Indikator A': 10, 'Indikator B': 20 }, ...]
  const getPivotData = () => {
    const availableYears = Array.from(new Set(allValues.map(v => v.year))).sort();
    
    return availableYears.map(year => {
      const row: any = { name: year.toString() };
      selectedIndicators.forEach(indId => {
        const ind = allIndicators.find(i => i.id === indId);
        const val = allValues.find(v => v.year === year && v.indicatorId === indId);
        if (ind) {
          row[ind.name] = val ? Number(val.value) : 0;
        }
      });
      return row;
    });
  };

  // 2. Data for Single Year (Bar, Pie, Radar)
  // Format: [{ name: 'Indikator A', value: 10 }, ...]
  const getSingleYearData = () => {
    return selectedIndicators.map(indId => {
      const ind = allIndicators.find(i => i.id === indId);
      const val = allValues.find(v => v.year === selectedYear && v.indicatorId === indId);
      return {
        name: ind?.name || 'Unknown',
        value: val ? Number(val.value) : 0,
        fullMark: 100 // For Radar
      };
    });
  };

  // 3. Heatmap Data (Grid)
  // Format: Rows = Indicators, Cols = Years
  const getHeatmapData = () => {
    const years = Array.from(new Set(allValues.map(v => v.year))).sort().slice(-5); // Last 5 years
    return selectedIndicators.map(indId => {
      const ind = allIndicators.find(i => i.id === indId);
      const row: any = { name: ind?.name };
      
      // Calculate max value for this indicator to normalize color
      const indValues = allValues.filter(v => v.indicatorId === indId).map(v => Number(v.value));
      const max = Math.max(...indValues, 1);

      years.forEach(year => {
        const val = allValues.find(v => v.year === year && v.indicatorId === indId);
        const numVal = val ? Number(val.value) : 0;
        row[year as number] = {
          value: numVal,
          opacity: numVal / max
        };
      });
      return row;
    });
  };

  const pivotData = getPivotData();
  const singleYearData = getSingleYearData();
  const heatmapData = getHeatmapData();
  const heatmapYears = Array.from(new Set(allValues.map(v => v.year))).sort().slice(-5);

  // --- HELPERS ---
  
  const toggleIndicator = (id: string) => {
    setSelectedIndicators(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getCategoryColor = () => {
    switch (activeCategory) {
      case 'Perpustakaan': return 'bg-blue-600 text-white';
      case 'Kearsipan': return 'bg-green-600 text-white';
      case 'Umum': return 'bg-slate-700 text-white';
    }
  };

  // --- RENDER CHARTS ---

  const renderChart = () => {
    if (selectedIndicators.length === 0) {
      return <div className="h-80 flex items-center justify-center text-slate-400">Pilih indikator terlebih dahulu</div>;
    }

    switch (chartType) {
      case 'LINE':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pivotData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              {selectedIndicators.map((id, idx) => {
                const ind = allIndicators.find(i => i.id === id);
                return (
                  <Line 
                    key={id} 
                    type="monotone" 
                    dataKey={ind?.name} 
                    stroke={COLORS[idx % COLORS.length]} 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'AREA':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pivotData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedIndicators.map((id, idx) => {
                const ind = allIndicators.find(i => i.id === id);
                return (
                  <Area 
                    key={id} 
                    type="monotone" 
                    dataKey={ind?.name} 
                    stackId="1" 
                    stroke={COLORS[idx % COLORS.length]} 
                    fill={COLORS[idx % COLORS.length]} 
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'BAR':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={singleYearData} layout="vertical" margin={{left: 40}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {singleYearData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'STACKED':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pivotData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedIndicators.map((id, idx) => {
                const ind = allIndicators.find(i => i.id === id);
                return (
                  <Bar 
                    key={id} 
                    dataKey={ind?.name} 
                    stackId="a" 
                    fill={COLORS[idx % COLORS.length]} 
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'PIE':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={singleYearData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
              >
                {singleYearData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'RADAR':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={singleYearData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar name="Kinerja" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'COMPOSED':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={pivotData}>
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedIndicators.map((id, idx) => {
                const ind = allIndicators.find(i => i.id === id);
                // Alternate between Bar and Line for demo
                if (idx % 2 === 0) {
                  return <Bar key={id} dataKey={ind?.name} barSize={20} fill={COLORS[idx % COLORS.length]} />;
                } else {
                  return <Line key={id} type="monotone" dataKey={ind?.name} stroke={COLORS[idx % COLORS.length]} />;
                }
              })}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'HEATMAP':
        return (
          <div className="h-full overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-slate-500 border-b">Indikator</th>
                  {heatmapYears.map(y => (
                    <th key={y as number} className="p-2 text-center text-slate-500 border-b">{y as number}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row: any, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-medium text-slate-700 border-b">{row.name}</td>
                    {heatmapYears.map(year => {
                      const cell = row[year as number] || { value: 0, opacity: 0 };
                      return (
                        <td key={year as number} className="p-1 border-b">
                          <div 
                            className="w-full h-10 rounded flex items-center justify-center text-xs font-bold text-slate-800 transition-all hover:scale-105"
                            style={{ 
                              backgroundColor: `rgba(59, 130, 246, ${0.1 + (cell.opacity * 0.9)})` // Blue base
                            }}
                            title={`Nilai: ${cell.value}`}
                          >
                            {cell.value}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            Visualisasi Statistik Tahunan
          </h1>
          <p className="text-slate-500">Analisis data kinerja multi-tahun dengan berbagai model grafik.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">
          <Download size={16} /> Export Grafik
        </button>
      </div>

      {/* CONTROLS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* SIDEBAR CONTROLS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
            <Filter size={18} /> Konfigurasi
          </div>
          
          <div className="p-4 space-y-6 flex-1 overflow-y-auto">
            {/* 1. Category Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Kategori</label>
              <div className="flex flex-col gap-2">
                {(['Perpustakaan', 'Kearsipan', 'Umum'] as StatCategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-2 rounded text-left text-sm font-medium transition-colors flex justify-between items-center ${
                      activeCategory === cat 
                        ? 'bg-white text-green-700 border border-green-500 shadow-sm ring-1 ring-green-500' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Year Selector (Only for single year charts) */}
            {(chartType === 'BAR' || chartType === 'PIE' || chartType === 'RADAR') && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tahun Data</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded p-2 text-sm"
                >
                  {Array.from(new Set(allValues.map(v => v.year))).sort().reverse().map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Indicator Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Pilih Indikator</label>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {allIndicators.filter(i => i.category === activeCategory).map(ind => (
                  <div key={ind.id} className="flex items-start gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      id={`chk-${ind.id}`} 
                      checked={selectedIndicators.includes(ind.id)}
                      onChange={() => toggleIndicator(ind.id)}
                      className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`chk-${ind.id}`} className="text-slate-700 cursor-pointer leading-tight">
                      {ind.name} <span className="text-xs text-slate-400">({ind.unit || '-'})</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CHART AREA */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
          
          {/* Chart Type Tabs */}
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
             <button onClick={() => setChartType('LINE')} className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-colors ${chartType === 'LINE' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                <TrendingUp size={16} /> Line Trend
             </button>
             <button onClick={() => setChartType('BAR')} className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-colors ${chartType === 'BAR' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                <BarIcon size={16} /> Bar Comparison
             </button>
             <button onClick={() => setChartType('STACKED')} className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-colors ${chartType === 'STACKED' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                <Layers size={16} /> Stacked
             </button>
             <button onClick={() => setChartType('PIE')} className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-colors ${chartType === 'PIE' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                <PieIcon size={16} /> Proportion
             </button>
             <button onClick={() => setChartType('AREA')} className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-colors ${chartType === 'AREA' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                <Activity size={16} /> Area Cumulative
             </button>
             <button onClick={() => setChartType('HEATMAP')} className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-colors ${chartType === 'HEATMAP' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                <Grid size={16} /> Heatmap
             </button>
             <button onClick={() => setChartType('RADAR')} className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-colors ${chartType === 'RADAR' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                <Activity size={16} /> Radar Profile
             </button>
             <button onClick={() => setChartType('COMPOSED')} className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-colors ${chartType === 'COMPOSED' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                <TrendingUp size={16} /> Mixed
             </button>
          </div>

          {/* Chart Canvas */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 min-h-0 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {chartType === 'LINE' && 'Tren Tahunan per Indikator'}
              {chartType === 'BAR' && `Perbandingan Indikator (Tahun ${selectedYear})`}
              {chartType === 'STACKED' && 'Kontribusi Sub-Indikator per Tahun'}
              {chartType === 'PIE' && `Proporsi Indikator (Tahun ${selectedYear})`}
              {chartType === 'AREA' && 'Akumulasi Tren Tahunan'}
              {chartType === 'HEATMAP' && 'Intensitas Aktivitas Tahunan'}
              {chartType === 'RADAR' && `Profil Kinerja (Tahun ${selectedYear})`}
              {chartType === 'COMPOSED' && 'Analisis Komparatif (Bar vs Line)'}
            </h3>
            
            <div className="flex-1 min-h-0 w-full">
               {renderChart()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};