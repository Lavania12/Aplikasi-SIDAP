
import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { Program, Kegiatan, SubKegiatan } from '../types';
import { Trash2, Folder, ChevronRight, Layers, FileText } from 'lucide-react';

export const MasterProgram: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [subKegiatanList, setSubKegiatanList] = useState<SubKegiatan[]>([]);
  
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<string | null>(null);
  
  const [newProg, setNewProg] = useState({ kode: '', nama: '' });
  const [newKeg, setNewKeg] = useState({ kode: '', nama: '' });
  const [newSub, setNewSub] = useState({ kode: '', nama: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [p, k, s] = await Promise.all([
        storageService.getPrograms(),
        storageService.getKegiatan(),
        storageService.getSubKegiatan()
    ]);
    setPrograms(p);
    setKegiatanList(k);
    setSubKegiatanList(s);
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProg.kode || !newProg.nama) return;
    await storageService.createProgram(newProg);
    setNewProg({ kode: '', nama: '' });
    loadData();
  };

  const handleDeleteProgram = async (id: string) => {
    if (confirm('Hapus program ini?')) {
      await storageService.deleteProgram(id);
      if (selectedProgramId === id) {
        setSelectedProgramId(null);
        setSelectedKegiatanId(null);
      }
      loadData();
    }
  };

  const handleAddKegiatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId || !newKeg.kode || !newKeg.nama) return;
    await storageService.createKegiatan({
      programId: selectedProgramId,
      kode: newKeg.kode,
      nama: newKeg.nama
    });
    setNewKeg({ kode: '', nama: '' });
    loadData();
  };

  const handleDeleteKegiatan = async (id: string) => {
    if (confirm('Hapus Kegiatan ini?')) {
      await storageService.deleteKegiatan(id);
      if (selectedKegiatanId === id) setSelectedKegiatanId(null);
      loadData();
    }
  };

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKegiatanId || !newSub.kode || !newSub.nama) return;
    await storageService.createSubKegiatan({
      kegiatanId: selectedKegiatanId,
      kode: newSub.kode,
      nama: newSub.nama
    });
    setNewSub({ kode: '', nama: '' });
    loadData();
  };

  const handleDeleteSub = async (id: string) => {
    if (confirm('Hapus sub kegiatan ini?')) {
      await storageService.deleteSubKegiatan(id);
      loadData();
    }
  };

  const filteredKegiatan = selectedProgramId 
    ? kegiatanList.filter(k => k.programId === selectedProgramId) 
    : [];

  const filteredSub = selectedKegiatanId 
    ? subKegiatanList.filter(s => s.kegiatanId === selectedKegiatanId) 
    : [];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Layers className="text-blue-600" />
          Data Master Program & Kegiatan
        </h1>
        <p className="text-slate-500">Struktur Hierarki: Program &rarr; Kegiatan &rarr; Sub Kegiatan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        
        {/* COLUMN 1: PROGRAM */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Folder size={18} /> 1. Program
            </h2>
          </div>
          <div className="p-4 border-b border-slate-100">
             <form onSubmit={handleAddProgram} className="space-y-2">
                <input className="w-full text-sm p-2 border rounded" placeholder="Kode" value={newProg.kode} onChange={e => setNewProg({...newProg, kode: e.target.value})} />
                <input className="w-full text-sm p-2 border rounded" placeholder="Nama Program" value={newProg.nama} onChange={e => setNewProg({...newProg, nama: e.target.value})} />
                <button type="submit" className="w-full bg-blue-600 text-white text-xs font-medium py-2 rounded hover:bg-blue-700">+ Tambah Program</button>
             </form>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
             {programs.map(prog => (
                <div key={prog.id} onClick={() => { setSelectedProgramId(prog.id); setSelectedKegiatanId(null); }} className={`p-3 rounded-lg border cursor-pointer transition-all group relative ${selectedProgramId === prog.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                   <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <span className="text-xs font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{prog.kode}</span>
                      <p className="text-xs font-medium text-slate-800 mt-1 leading-tight">{prog.nama}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteProgram(prog.id); }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
             ))}
          </div>
        </div>

        {/* COLUMN 2: KEGIATAN */}
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full ${!selectedProgramId ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
             <h2 className="font-bold text-slate-800 flex items-center gap-2"><FileText size={18} /> 2. Kegiatan</h2>
          </div>
           <div className="p-4 border-b border-slate-100">
             <form onSubmit={handleAddKegiatan} className="space-y-2">
                <input className="w-full text-sm p-2 border rounded" placeholder="Kode" value={newKeg.kode} onChange={e => setNewKeg({...newKeg, kode: e.target.value})} />
                <input className="w-full text-sm p-2 border rounded" placeholder="Nama Kegiatan" value={newKeg.nama} onChange={e => setNewKeg({...newKeg, nama: e.target.value})} />
                <button type="submit" className="w-full bg-indigo-600 text-white text-xs font-medium py-2 rounded hover:bg-indigo-700">+ Tambah Kegiatan</button>
             </form>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredKegiatan.map(keg => (
                <div key={keg.id} onClick={() => setSelectedKegiatanId(keg.id)} className={`p-3 rounded-lg border cursor-pointer ${selectedKegiatanId === keg.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
                   <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <span className="text-xs font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{keg.kode}</span>
                      <p className="text-xs font-medium text-slate-800 mt-1 leading-tight">{keg.nama}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteKegiatan(keg.id); }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
             ))}
          </div>
        </div>

        {/* COLUMN 3: SUB */}
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full ${!selectedKegiatanId ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
             <h2 className="font-bold text-slate-800 flex items-center gap-2"><ChevronRight size={18} /> 3. Sub Kegiatan</h2>
          </div>
           <div className="p-4 border-b border-slate-100">
             <form onSubmit={handleAddSub} className="space-y-2">
                <input className="w-full text-sm p-2 border rounded" placeholder="Kode" value={newSub.kode} onChange={e => setNewSub({...newSub, kode: e.target.value})} />
                <input className="w-full text-sm p-2 border rounded" placeholder="Nama Sub" value={newSub.nama} onChange={e => setNewSub({...newSub, nama: e.target.value})} />
                <button type="submit" className="w-full bg-green-600 text-white text-xs font-medium py-2 rounded hover:bg-green-700">+ Tambah Sub</button>
             </form>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
             {filteredSub.map(sub => (
                <div key={sub.id} className="p-3 rounded-lg border bg-white border-slate-200">
                   <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <span className="text-xs font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{sub.kode}</span>
                      <p className="text-xs font-medium text-slate-800 mt-1 leading-tight">{sub.nama}</p>
                    </div>
                    <button onClick={() => handleDeleteSub(sub.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};