
import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { Statistic, StatisticCategory } from '../types';
import { Trash2, Plus, Save } from 'lucide-react';

export const StatisticsInput: React.FC = () => {
  const [stats, setStats] = useState<Statistic[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: StatisticCategory.PENGUNJUNG_PERPUS,
    value: '',
    note: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setStats(await storageService.getStatistics());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.value) return;

    const newStat: Statistic = {
      id: `stat-${Date.now()}`,
      date: formData.date,
      category: formData.category,
      value: parseInt(formData.value),
      note: formData.note,
      createdAt: new Date().toISOString()
    };

    await storageService.addStatistic(newStat);
    setFormData({ ...formData, value: '', note: '' }); // Reset value only
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus data statistik ini?')) {
      await storageService.deleteStatistic(id);
      loadData();
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Input Data Statistik Manual</h1>
        <p className="text-slate-500">Masukkan data kuantitatif harian (Pengunjung, Arsip, Buku, dll).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INPUT FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-blue-600" /> Form Input
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Pencatatan</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Data</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as StatisticCategory})}
                className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {Object.values(StatisticCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nilai (Angka)</label>
              <input
                type="number"
                min="0"
                required
                placeholder="Contoh: 45"
                value={formData.value}
                onChange={e => setFormData({...formData, value: e.target.value})}
                className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catatan (Opsional)</label>
              <textarea
                rows={3}
                placeholder="Keterangan tambahan..."
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
                className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">
              <Save size={18} />
              Simpan Data
            </button>
          </form>
        </div>

        {/* DATA TABLE */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Riwayat Input Data</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{stats.length} Records</span>
          </div>
          <div className="overflow-auto flex-1 max-h-[600px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Nilai</th>
                  <th className="px-6 py-3">Catatan</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {item.category}
                    </td>
                    <td className="px-6 py-3 text-blue-600 font-bold">
                      {item.value}
                    </td>
                    <td className="px-6 py-3 text-slate-500 italic truncate max-w-xs">
                      {item.note || '-'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {stats.length === 0 && (
                   <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};