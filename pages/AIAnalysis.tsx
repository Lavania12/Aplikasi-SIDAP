import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { StatCategory, AIAnalysisResult, AIInsight, AIPrediction, AIRecommendation, AIIndicatorBreakdown, AISwot } from '../types';
import { 
  BrainCircuit, Sparkles, TrendingUp, AlertTriangle, CheckCircle, 
  Zap, Layers, FileText, Info, Activity, Target, ShieldAlert, Telescope, BarChart3
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const AIAnalysis: React.FC = () => {
  // --- STATE ---
  const [selectedCategory, setSelectedCategory] = useState<StatCategory>('Perpustakaan');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  
  // --- AI ENGINE (LOCAL LOGIC) ---
  
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setResult(null);
    
    // Simulate Processing Time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fetch Async Data
    const allIndicators = await storageService.getIndicators();
    const allValues = await storageService.getAllYearlyValues();

    // 1. STRICT FILTERING
    const categoryIndicators = allIndicators.filter(i => i.category === selectedCategory);
    
    if (categoryIndicators.length === 0) {
        alert("Belum ada indikator untuk kategori ini.");
        setIsAnalyzing(false);
        return;
    }

    // 2. Processing Containers
    const insights: AIInsight[] = [];
    const recommendations: AIRecommendation[] = [];
    const breakdown: AIIndicatorBreakdown[] = [];
    const swot: AISwot = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
    
    let risingCount = 0;
    let fallingCount = 0;
    let stableCount = 0;
    let totalGrowth = 0;
    let anomalyCount = 0;

    let topGainer = { name: '', val: -Infinity };
    let topLoser = { name: '', val: Infinity };

    // 3. Analyze Each Indicator strictly within category
    categoryIndicators.forEach(ind => {
      // Get values sorted by year
      const indValues = allValues
        .filter(v => v.indicatorId === ind.id)
        .sort((a, b) => a.year - b.year);

      // Need at least current and previous year to analyze trend
      const latestValObj = indValues[indValues.length - 1];
      const prevValObj = indValues[indValues.length - 2];
      
      let growth = 0;
      let currentVal = 0;
      const trend3Years = indValues.slice(-3).map(v => Number(v.value));

      if (latestValObj && prevValObj) {
         currentVal = Number(latestValObj.value);
         const prevVal = Number(prevValObj.value);
         
         if (prevVal > 0) {
            growth = ((currentVal - prevVal) / prevVal) * 100;
         }
      } else if (latestValObj) {
          currentVal = Number(latestValObj.value);
      }

      // A. Classification
      let status: 'NAIK' | 'TURUN' | 'STABIL' = 'STABIL';
      if (growth > 5) {
          status = 'NAIK';
          risingCount++;
      } else if (growth < -5) {
          status = 'TURUN';
          fallingCount++;
      } else {
          stableCount++;
      }

      totalGrowth += growth;

      // B. Track Extremes
      if (growth > topGainer.val) topGainer = { name: ind.name, val: growth };
      if (growth < topLoser.val) topLoser = { name: ind.name, val: growth };

      // C. SWOT & Insights Generation
      if (growth > 15) {
          swot.strengths.push(`Pertumbuhan ${ind.name} sangat positif (+${growth.toFixed(1)}%)`);
      } else if (growth < -10) {
          swot.weaknesses.push(`Penurunan kinerja pada ${ind.name} (${growth.toFixed(1)}%)`);
      }

      // D. Anomaly Detection (Spike > 30% or Drop < -20%)
      if (growth > 30) {
        insights.push({
          type: 'ANOMALY',
          indicatorName: ind.name,
          message: `Lonjakan signifikan ${growth.toFixed(1)}% terdeteksi. Pastikan validitas data.`,
          severity: 'MEDIUM'
        });
        anomalyCount++;
        swot.opportunities.push(`Momentum pertumbuhan ${ind.name} dapat dimaksimalkan.`);
      } else if (growth < -20) {
        insights.push({
          type: 'TREND_DOWN',
          indicatorName: ind.name,
          message: `Penurunan tajam ${Math.abs(growth).toFixed(1)}%. Perlu investigasi penyebab.`,
          severity: 'HIGH'
        });
        swot.threats.push(`Risiko stagnasi jangka panjang pada ${ind.name}.`);
      }

      // E. Add to Breakdown
      breakdown.push({
        id: ind.id,
        name: ind.name,
        lastValue: currentVal,
        growth: growth,
        status: status,
        trend3Years: trend3Years,
        unit: ind.unit || ''
      });
    });

    // 4. Summarize Logic
    const avgGrowth = totalGrowth / (categoryIndicators.length || 1);
    
    // 5. Generate Recommendations
    if (fallingCount > risingCount) {
        recommendations.push({
            category: 'Strategi Pemulihan',
            title: 'Evaluasi Program',
            description: `Mayoritas indikator (${fallingCount}) mengalami penurunan. Lakukan evaluasi mendalam pada program kerja terkait ${selectedCategory}.`,
            expectedImpact: 'Menghentikan tren penurunan dan menstabilkan kinerja.',
            actionType: 'URGENT'
        });
    } else {
        recommendations.push({
            category: 'Pengembangan',
            title: 'Ekspansi Program Unggulan',
            description: `Indikator seperti ${topGainer.name} tumbuh pesat. Alokasikan sumber daya tambahan untuk mempertahankan momentum.`,
            expectedImpact: 'Akselerasi pencapaian target tahun depan.',
            actionType: 'SUGGESTION'
        });
    }

    if (swot.threats.length > 0) {
         recommendations.push({
            category: 'Mitigasi Risiko',
            title: 'Penanganan Indikator Kritis',
            description: `Terdapat ${swot.threats.length} ancaman kinerja yang terdeteksi. Segera susun rencana tindak lanjut.`,
            expectedImpact: 'Mencegah kegagalan pencapaian target strategis.',
            actionType: 'URGENT'
        });
    }

    // 6. Generate Predictions (Simple Linear Regression Mock)
    const predictions: AIPrediction[] = [];
    const futureYears = [1, 2, 3];
    futureYears.forEach(offset => {
       const year = new Date().getFullYear() + offset;
       const predObj: AIPrediction = { year };
       breakdown.forEach(item => {
          // Simple compound growth based on last growth rate (dampened)
          const growthRate = item.growth / 100;
          const predictedVal = item.lastValue * Math.pow(1 + (growthRate * 0.8), offset); // 0.8 damping factor
          predObj[item.name] = Math.round(predictedVal);
       });
       predictions.push(predObj);
    });

    // 7. Calculate Health Score (0-100)
    let baseScore = 70;
    baseScore += (avgGrowth * 2); // Growth adds points
    baseScore -= (anomalyCount * 5); // Anomalies deduct points
    baseScore = Math.min(100, Math.max(0, Math.round(baseScore)));

    const summaryText = `Analisis AI untuk kategori ${selectedCategory} menunjukkan skor kesehatan ${baseScore}/100. Tren rata-rata pertumbuhan adalah ${avgGrowth.toFixed(1)}%. Ditemukan ${risingCount} indikator naik dan ${fallingCount} indikator turun.`;

    setResult({
        insights,
        predictions,
        recommendations,
        indicatorBreakdown: breakdown,
        summary: summaryText,
        swot,
        score: baseScore,
        scoreFactors: [
            `Pertumbuhan rata-rata: ${avgGrowth.toFixed(1)}%`,
            `Anomali terdeteksi: ${anomalyCount}`,
            `Rasio Naik/Turun: ${risingCount}/${fallingCount}`
        ]
    });
    
    setIsAnalyzing(false);
  };

  const handleExportReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Laporan Analisis AI: ${selectedCategory}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Tanggal Generate: ${new Date().toLocaleDateString()}`, 14, 28);
    
    doc.setFontSize(12);
    doc.text('Ringkasan Eksekutif:', 14, 40);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(result.summary, 180), 14, 46);

    // SWOT Table
    const swotData = [];
    const maxRows = Math.max(result.swot.strengths.length, result.swot.weaknesses.length, result.swot.opportunities.length, result.swot.threats.length);
    for(let i=0; i<maxRows; i++) {
        swotData.push([
            result.swot.strengths[i] || '-',
            result.swot.weaknesses[i] || '-',
            result.swot.opportunities[i] || '-',
            result.swot.threats[i] || '-'
        ]);
    }
    
    (doc as any).autoTable({
        startY: 60,
        head: [['Strengths', 'Weaknesses', 'Opportunities', 'Threats']],
        body: swotData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`AI_Analysis_${selectedCategory}.pdf`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <BrainCircuit className="text-violet-600" />
             Analisa Cerdas AI
           </h1>
           <p className="text-slate-500">Dapatkan wawasan mendalam, prediksi, dan rekomendasi berbasis data.</p>
        </div>
        <div className="flex items-center gap-3">
            <select 
               value={selectedCategory} 
               onChange={(e) => setSelectedCategory(e.target.value as StatCategory)}
               className="bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-bold min-w-[200px]"
            >
                <option value="Perpustakaan">Perpustakaan</option>
                <option value="Kearsipan">Kearsipan</option>
                <option value="Umum">Umum / Kepegawaian</option>
            </select>
            <button 
               onClick={runAIAnalysis}
               disabled={isAnalyzing}
               className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-sm shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
               {isAnalyzing ? (
                 <><Sparkles className="animate-spin" size={18} /> Menganalisis...</>
               ) : (
                 <><Zap size={18} /> Jalankan Analisis</>
               )}
            </button>
        </div>
      </div>

      {!result && !isAnalyzing && (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
           <BrainCircuit size={64} className="mx-auto text-slate-300 mb-4" />
           <h3 className="text-lg font-bold text-slate-600">Siap Menganalisis Data</h3>
           <p className="text-slate-400 max-w-md mx-auto mt-2">Pilih kategori dan klik "Jalankan Analisis" untuk memproses data statistik menggunakan algoritma cerdas.</p>
        </div>
      )}
      
      {isAnalyzing && (
         <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
           <div className="relative w-24 h-24 mx-auto mb-6">
             <div className="absolute inset-0 border-4 border-violet-100 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
             <BrainCircuit className="absolute inset-0 m-auto text-violet-600" size={32} />
           </div>
           <h3 className="text-lg font-bold text-slate-800">Sedang Memproses Data...</h3>
           <p className="text-slate-500">Mengidentifikasi pola, anomali, dan menghitung prediksi masa depan.</p>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. EXECUTIVE SUMMARY & SCORE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 bg-gradient-to-br from-violet-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <BrainCircuit size={180} />
                  </div>
                  <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Executive Summary</span>
                     </div>
                     <h2 className="text-2xl font-bold mb-4 leading-tight">Hasil Analisis Kinerja: {selectedCategory}</h2>
                     <p className="text-indigo-100 text-lg leading-relaxed mb-6">
                        {result.summary}
                     </p>
                     
                     <div className="flex gap-4">
                        <button onClick={handleExportReport} className="px-4 py-2 bg-white text-indigo-900 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2">
                            <FileText size={16} /> Download Laporan PDF
                        </button>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                   <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Skor Kesehatan Kinerja</h3>
                   <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                         <circle 
                           cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                           className={`${result.score >= 80 ? 'text-green-500' : result.score >= 60 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                           strokeDasharray={440}
                           strokeDashoffset={440 - (440 * result.score) / 100}
                         />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-4xl font-black text-slate-800">{result.score}</span>
                         <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                   </div>
                   <div className="w-full space-y-2">
                      {result.scoreFactors.map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg w-full">
                              <CheckCircle size={12} className="text-green-500" /> {factor}
                          </div>
                      ))}
                   </div>
               </div>
            </div>

            {/* 2. SWOT ANALYSIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
                        <h3 className="font-bold text-blue-800 flex items-center gap-2"><Target size={18} /> Strengths (Kekuatan)</h3>
                        <span className="bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">{result.swot.strengths.length}</span>
                    </div>
                    <div className="p-5 space-y-3">
                        {result.swot.strengths.length > 0 ? result.swot.strengths.map((s, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                {s}
                            </div>
                        )) : <p className="text-slate-400 text-sm italic">Tidak ada kekuatan signifikan teridentifikasi.</p>}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-orange-50 px-5 py-3 border-b border-orange-100 flex justify-between items-center">
                        <h3 className="font-bold text-orange-800 flex items-center gap-2"><AlertTriangle size={18} /> Weaknesses (Kelemahan)</h3>
                        <span className="bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full font-bold">{result.swot.weaknesses.length}</span>
                    </div>
                    <div className="p-5 space-y-3">
                        {result.swot.weaknesses.length > 0 ? result.swot.weaknesses.map((s, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></div>
                                {s}
                            </div>
                        )) : <p className="text-slate-400 text-sm italic">Tidak ada kelemahan signifikan teridentifikasi.</p>}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-green-50 px-5 py-3 border-b border-green-100 flex justify-between items-center">
                        <h3 className="font-bold text-green-800 flex items-center gap-2"><Telescope size={18} /> Opportunities (Peluang)</h3>
                        <span className="bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold">{result.swot.opportunities.length}</span>
                    </div>
                    <div className="p-5 space-y-3">
                         {result.swot.opportunities.length > 0 ? result.swot.opportunities.map((s, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                                {s}
                            </div>
                        )) : <p className="text-slate-400 text-sm italic">Tidak ada peluang signifikan teridentifikasi.</p>}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-red-50 px-5 py-3 border-b border-red-100 flex justify-between items-center">
                        <h3 className="font-bold text-red-800 flex items-center gap-2"><ShieldAlert size={18} /> Threats (Ancaman)</h3>
                        <span className="bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold">{result.swot.threats.length}</span>
                    </div>
                    <div className="p-5 space-y-3">
                         {result.swot.threats.length > 0 ? result.swot.threats.map((s, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                                {s}
                            </div>
                        )) : <p className="text-slate-400 text-sm italic">Tidak ada ancaman signifikan teridentifikasi.</p>}
                    </div>
                </div>
            </div>

            {/* 3. INSIGHTS & RECOMMENDATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* INSIGHTS */}
               <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Info size={20} className="text-blue-500"/> Wawasan Kunci (Key Insights)</h3>
                  <div className="space-y-4">
                     {result.insights.map((insight, idx) => (
                        <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                           insight.type === 'TREND_UP' ? 'bg-green-50 border-green-500' :
                           insight.type === 'TREND_DOWN' ? 'bg-red-50 border-red-500' :
                           insight.type === 'ANOMALY' ? 'bg-yellow-50 border-yellow-500' : 'bg-slate-50 border-slate-400'
                        }`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{insight.type.replace('_', ' ')}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                   insight.severity === 'HIGH' ? 'bg-red-200 text-red-800' : 
                                   insight.severity === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
                                }`}>{insight.severity}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm">{insight.indicatorName}</h4>
                            <p className="text-sm text-slate-600 mt-1">{insight.message}</p>
                        </div>
                     ))}
                     {result.insights.length === 0 && <p className="text-slate-400 italic">Tidak ada insight krusial.</p>}
                  </div>
               </div>

               {/* RECOMMENDATIONS */}
               <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Zap size={20} className="text-yellow-500"/> Rekomendasi Tindakan</h3>
                  <div className="space-y-4">
                     {result.recommendations.map((rec, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{rec.category}</span>
                              {rec.actionType === 'URGENT' && <AlertTriangle size={16} className="text-red-500" />}
                           </div>
                           <h4 className="font-bold text-slate-800">{rec.title}</h4>
                           <p className="text-sm text-slate-600 mt-1 mb-2">{rec.description}</p>
                           <div className="text-xs bg-slate-50 p-2 rounded text-slate-500 border border-slate-100">
                              <strong>Dampak:</strong> {rec.expectedImpact}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* 4. PREDICTION CHART */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={20} className="text-teal-500"/> Proyeksi Masa Depan (3 Tahun)</h3>
               <div className="h-80 w-full">
                  <ResponsiveContainer>
                     <ComposedChart data={result.predictions}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {Object.keys(result.predictions[0] || {}).filter(k => k !== 'year').slice(0, 5).map((key, i) => (
                           <Line 
                              key={key} 
                              type="monotone" 
                              dataKey={key} 
                              stroke={`hsl(${i * 60}, 70%, 50%)`} 
                              strokeWidth={3}
                              dot={{r: 4}}
                           />
                        ))}
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>
               <p className="text-xs text-slate-400 mt-2 text-center">*Proyeksi menggunakan regresi linear sederhana berdasarkan tren historis.</p>
            </div>

        </div>
      )}
    </div>
  );
};
