
import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { StatisticIndicator, StatisticYearlyValue, StatCategory } from '../types';
import { CalendarRange, Settings, Plus, Save, Trash2, X, Book, Archive, Building2, Edit2, Check, FileSpreadsheet, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// --- TOAST COMPONENT ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all animate-in fade-in slide-in-from-bottom-4 ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export const AnnualStatistics: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [activeTab, setActiveTab] = useState<StatCategory>('Perpustakaan');
  
  const [indicators, setIndicators] = useState<StatisticIndicator[]>([]);
  const [filteredIndicators, setFilteredIndicators] = useState<StatisticIndicator[]>([]);
  const [values, setValues] = useState<StatisticYearlyValue[]>([]);
  
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States for New Indicator
  const [newInd, setNewInd] = useState({ 
    name: '', 
    type: 'number', 
    unit: '',
    category: 'Perpustakaan' as StatCategory 
  });

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<StatisticIndicator | null>(null);

  // Input buffer
  const [inputBuffer, setInputBuffer] = useState<Record<string, { value: string | number, note: string }>>({});

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    loadIndicators();
  }, []);

  useEffect(() => {
    loadValues();
  }, [selectedYear]);

  // Filter indicators
  useEffect(() => {
    setFilteredIndicators(indicators.filter(i => i.category === activeTab));
  }, [indicators, activeTab]);

  // Update default modal category
  useEffect(() => {
    setNewInd(prev => ({...prev, category: activeTab}));
  }, [activeTab]);

  const loadIndicators = async () => {
    setLoading(true);
    const data = await storageService.getIndicators();
    setIndicators(data);
    setLoading(false);
  };

  const loadValues = async () => {
    const vals = await storageService.getYearlyValues(selectedYear);
    setValues(vals);
    
    const allInds = await storageService.getIndicators(); 
    
    const buf: Record<string, any> = {};
    allInds.forEach(ind => {
      const existing = vals.find(v => v.indicatorId === ind.id);
      buf[ind.id] = {
        value: existing ? existing.value : '',
        note: existing?.note || ''
      };
    });
    setInputBuffer(buf);
  };

  const handleBufferChange = (indicatorId: string, field: 'value' | 'note', val: string) => {
    setInputBuffer(prev => ({
      ...prev,
      [indicatorId]: {
        ...(prev[indicatorId] || { value: '', note: '' }), // Ensure object exists
        [field]: val
      }
    }));
  };

  const handleSaveValue = async (indicatorId: string) => {
    const data = inputBuffer[indicatorId];
    
    if (!data || data.value === undefined || data.value === '') {
        showToast("Nilai tidak boleh kosong", 'error');
        return;
    }

    const newVal = {
      indicatorId,
      year: selectedYear,
      value: data.value,
      note: data.note || ''
    };
    
    try {
        await storageService.upsertYearlyValue(newVal);
        showToast('Data berhasil disimpan!', 'success');
        loadValues(); 
    } catch (error) {
        console.error("Failed to save:", error);
        showToast("Gagal menyimpan data", 'error');
    }
  };

  const handleAddIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInd.name) return;

    try {
      await storageService.addIndicator({
        name: newInd.name,
        category: newInd.category,
        type: newInd.type as any,
        unit: newInd.unit
      });
      setNewInd({ name: '', type: 'number', unit: '', category: activeTab });
      
      await loadIndicators(); // Wait for reload
      showToast('Indikator berhasil ditambahkan', 'success');
    } catch (error) {
      showToast('Gagal menambah indikator', 'error');
    }
  };

  const handleStartEdit = (ind: StatisticIndicator) => {
    setEditingId(ind.id);
    setEditForm({ ...ind });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
    if (!editForm || !editForm.name) return;
    try {
      await storageService.updateIndicator(editForm);
      setEditingId(null);
      setEditForm(null);
      await loadIndicators();
      showToast('Indikator berhasil diperbarui', 'success');
    } catch(e) {
      showToast('Gagal memperbarui indikator', 'error');
    }
  };

  const handleDeleteIndicator = async (id: string) => {
    if (!confirm('Hapus indikator ini? Data terkait juga akan dihapus.')) return;

    // 1. UI Update Langsung (Optimistic Update)
    const prevIndicators = [...indicators];
    setIndicators(prev => prev.filter(i => i.id !== id));

    try {
      // 2. Call API
      await storageService.deleteIndicator(id);
      showToast('Indikator berhasil dihapus', 'success');
    } catch (error) {
      // 3. Rollback jika error
      console.error("Delete failed:", error);
      setIndicators(prevIndicators);
      showToast('Gagal menghapus (Error Database)', 'error');
    }
  };

  // --- EXPORT LOGIC ---
  const prepareExportData = async () => {
    const allVals = await storageService.getAllYearlyValues();
    const categoryIndicators = indicators.filter(i => i.category === activeTab);
    
    const years = Array.from(new Set(allVals.map(v => v.year))).sort((a, b) => a - b);
    if (years.length === 0) years.push(currentYear); 

    const header = ['No', 'Nama Indikator', 'Satuan', ...years.map(y => y.toString())];
    
    const rows = categoryIndicators.map((ind, idx) => {
      const rowData: any[] = [idx + 1, ind.name, ind.unit || '-'];
      years.forEach(year => {
        const val = allVals.find(v => v.indicatorId === ind.id && v.year === year);
        rowData.push(val ? val.value : '-');
      });
      return rowData;
    });

    return { header, rows, years };
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
        const { header, rows } = await prepareExportData();
        const doc = new jsPDF('l', 'mm', 'a4');

        doc.setFontSize(16);
        doc.text(`Laporan Statistik Tahunan: ${activeTab}`, 14, 15);
        doc.setFontSize(10);
        doc.text(`Dinas Arsip dan Perpustakaan - Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

        (doc as any).autoTable({
          head: [header],
          body: rows,
          startY: 28,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        doc.save(`Statistik_${activeTab}_AllYears.pdf`);
        showToast('Export PDF Berhasil', 'success');
    } catch (error) {
        console.error(error);
        showToast("Gagal ekspor PDF", 'error');
    }
    setIsExporting(false);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
        const { header, rows } = await prepareExportData();
        const wsData = [header, ...rows];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        const wscols = header.map(h => ({ wch: Math.max(15, h.length + 5) }));
        wscols[1] = { wch: 40 };
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, `Statistik ${activeTab}`);
        XLSX.writeFile(wb, `Statistik_${activeTab}_AllYears.xlsx`);
        showToast('Export Excel Berhasil', 'success');
    } catch (error) {
        console.error(error);
        showToast("Gagal ekspor Excel", 'error');
    }
    setIsExporting(false);
  };

  const getTabStyle = (category: StatCategory) => {
    if (activeTab === category) {
      switch (category) {
        case 'Perpustakaan': return 'bg-blue-600 text-white shadow-md';
        case 'Kearsipan': return 'bg-green-600 text-white shadow-md';
        case 'Umum': return 'bg-slate-600 text-white shadow-md';
      }
    }
    return 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200';
  };

  const getHeaderColor = () => {
    switch (activeTab) {
      case 'Perpustakaan': return 'bg-blue-50 border-blue-100 text-blue-900';
      case 'Kearsipan': return 'bg-green-50 border-green-100 text-green-900';
      case 'Umum': return 'bg-slate-100 border-slate-200 text-slate-900';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarRange className="text-yellow-500" />
            Statistik Tahunan
          </h1>
          <p className="text-slate-500">Input dan kelola data kinerja dinas per tahun.</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-bold"
          >
            {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map(y => (
              <option key={y} value={y}>Tahun {y}</option>
            ))}
          </select>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Settings size={16} />
            Kelola Indikator
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('Perpustakaan')} className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${getTabStyle('Perpustakaan')}`}><Book size={18} /> Perpustakaan</button>
        <button onClick={() => setActiveTab('Kearsipan')} className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${getTabStyle('Kearsipan')}`}><Archive size={18} /> Kearsipan</button>
        <button onClick={() => setActiveTab('Umum')} className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${getTabStyle('Umum')}`}><Building2 size={18} /> Umum / Pegawai</button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className={`p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 transition-colors ${getHeaderColor()}`}>
          <div className="flex flex-col">
             <h2 className="font-bold text-lg">Kategori {activeTab}</h2>
             <span className="text-xs opacity-70">Input Data: Tahun {selectedYear}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-md text-xs font-medium hover:bg-red-50 shadow-sm disabled:opacity-50"><FileText size={14} /> PDF (Semua Tahun)</button>
            <button onClick={handleExportExcel} disabled={isExporting} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-md text-xs font-medium hover:bg-green-50 shadow-sm disabled:opacity-50"><FileSpreadsheet size={14} /> Excel (Semua Tahun)</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-1/3">Nama Indikator</th>
                <th className="px-6 py-4 w-1/4">Nilai</th>
                <th className="px-6 py-4">Satuan</th>
                <th className="px-6 py-4 w-1/3">Catatan</th>
                <th className="px-6 py-4 w-20 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center">Memuat data...</td></tr>
              ) : filteredIndicators.map(ind => (
                <tr key={ind.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{ind.name}</td>
                  <td className="px-6 py-4">
                    <input 
                      type={ind.type === 'number' || ind.type === 'percentage' ? 'number' : 'text'}
                      value={inputBuffer[ind.id]?.value ?? ''}
                      onChange={(e) => handleBufferChange(ind.id, 'value', e.target.value)}
                      placeholder={ind.type === 'percentage' ? '0-100' : '0'}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-500">{ind.unit || '-'}</td>
                  <td className="px-6 py-4">
                    <input 
                      type="text"
                      value={inputBuffer[ind.id]?.note || ''}
                      onChange={(e) => handleBufferChange(ind.id, 'note', e.target.value)}
                      placeholder="Keterangan..."
                      className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleSaveValue(ind.id)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="Simpan Baris Ini"><Save size={16} /></button>
                  </td>
                </tr>
              ))}
              {!loading && filteredIndicators.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada indikator di kategori {activeTab}.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Kelola Indikator Statistik</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <div className="p-6 bg-slate-50 border-b border-slate-100">
              <form onSubmit={handleAddIndicator} className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <select className="p-2 border rounded text-sm w-1/3 bg-white" value={newInd.category} onChange={e => setNewInd({...newInd, category: e.target.value as StatCategory})}>
                    <option value="Perpustakaan">Perpustakaan</option>
                    <option value="Kearsipan">Kearsipan</option>
                    <option value="Umum">Umum</option>
                  </select>
                  <input className="flex-1 p-2 border rounded text-sm bg-white" placeholder="Nama Indikator" value={newInd.name} onChange={e => setNewInd({...newInd, name: e.target.value})} required />
                </div>
                <div className="flex gap-3">
                  <select className="p-2 border rounded text-sm flex-1 bg-white" value={newInd.type} onChange={e => setNewInd({...newInd, type: e.target.value})}>
                    <option value="number">Angka</option>
                    <option value="text">Teks</option>
                    <option value="percentage">Persentase</option>
                  </select>
                  <input className="w-1/3 p-2 border rounded text-sm bg-white" placeholder="Satuan" value={newInd.unit} onChange={e => setNewInd({...newInd, unit: e.target.value})} />
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 flex items-center gap-2"><Plus size={16} /> Tambah</button>
                </div>
              </form>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-2">
                {indicators.map(ind => (
                  <div key={ind.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm flex justify-between items-center">
                     <div>
                       <p className="font-medium text-slate-800 text-sm">{ind.name}</p>
                       <span className="text-xs text-slate-500">{ind.category} | {ind.unit || '-'}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       {editingId === ind.id ? (
                         <div className="flex gap-2">
                           <input value={editForm?.name} onChange={e => setEditForm({...editForm!, name: e.target.value})} className="border rounded p-1 text-xs" />
                           <button onClick={handleSaveEdit} className="text-green-500"><Check size={16}/></button>
                           <button onClick={handleCancelEdit} className="text-red-500"><X size={16}/></button>
                         </div>
                       ) : (
                         <>
                           <button onClick={() => handleStartEdit(ind)} className="text-blue-400 hover:text-blue-600"><Edit2 size={16} /></button>
                           <button onClick={() => handleDeleteIndicator(ind.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                         </>
                       )}
                     </div>
                  </div>
                ))}
                </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-100">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
