
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { ReportStatus, BidangKerja, Report, Program, Kegiatan, SubKegiatan } from '../types';
import { Save, Upload, X, ChevronRight } from 'lucide-react';

export const ReportForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  // Master Data Lists
  const [programs, setPrograms] = useState<Program[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [subKegiatanList, setSubKegiatanList] = useState<SubKegiatan[]>([]);
  
  // Filtered Lists based on selection
  const [filteredKegiatan, setFilteredKegiatan] = useState<Kegiatan[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<SubKegiatan[]>([]);

  const [formData, setFormData] = useState({
    programId: '',
    kegiatanId: '',
    subKegiatanId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '16:00',
    bidang: BidangKerja.PERPUSTAKAAN,
    lokasi: '',
    output: '',
    description: '',
  });

  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    // Load Master Data
    const loadMasterData = async () => {
      setPrograms(await storageService.getPrograms());
      setKegiatanList(await storageService.getKegiatan());
      setSubKegiatanList(await storageService.getSubKegiatan());
    };
    loadMasterData();
  }, []);

  // Filter Kegiatan when Program changes
  useEffect(() => {
    if (formData.programId) {
      const k = kegiatanList.filter(item => item.programId === formData.programId);
      setFilteredKegiatan(k);
      
      // Reset Logic if program changes
      const currentKeg = kegiatanList.find(item => item.id === formData.kegiatanId);
      if (currentKeg && currentKeg.programId !== formData.programId) {
        setFormData(prev => ({ ...prev, kegiatanId: '', subKegiatanId: '' }));
      }
    } else {
      setFilteredKegiatan([]);
      setFilteredSubs([]);
    }
  }, [formData.programId, kegiatanList, formData.kegiatanId]);

  // Filter Sub Kegiatan when Kegiatan changes
  useEffect(() => {
    if (formData.kegiatanId) {
        const s = subKegiatanList.filter(item => item.kegiatanId === formData.kegiatanId);
        setFilteredSubs(s);

        // Reset Logic
        const currentSub = subKegiatanList.find(item => item.id === formData.subKegiatanId);
        if (currentSub && currentSub.kegiatanId !== formData.kegiatanId) {
            setFormData(prev => ({ ...prev, subKegiatanId: '' }));
        }
    } else {
        setFilteredSubs([]);
    }
  }, [formData.kegiatanId, subKegiatanList, formData.subKegiatanId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    // Find related master data names for easy display later
    const selectedProgram = programs.find(p => p.id === formData.programId);
    const selectedKegiatan = kegiatanList.find(k => k.id === formData.kegiatanId);
    const selectedSub = subKegiatanList.find(s => s.id === formData.subKegiatanId);

    // Mock File Upload - Convert to Dummy URL
    const mockPhotos = files.map((f, idx) => ({
      id: `temp-${Date.now()}-${idx}`,
      url: URL.createObjectURL(f), // In real app, this comes from S3/Server
      caption: f.name
    }));

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      creatorId: user.id,
      creatorName: user.name,
      
      programId: formData.programId,
      programName: selectedProgram?.nama,
      kegiatanId: formData.kegiatanId,
      kegiatanName: selectedKegiatan?.nama,
      subKegiatanId: formData.subKegiatanId,
      subKegiatanName: selectedSub?.nama,

      title: formData.title,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      bidang: formData.bidang as BidangKerja,
      lokasi: formData.lokasi,
      output: formData.output,
      description: formData.description,
      status: ReportStatus.SUBMITTED, // Auto submit for demo
      photos: mockPhotos,
      createdAt: new Date().toISOString(),
    };

    await storageService.delay(800);
    await storageService.createReport(newReport);
    setSubmitting(false);
    navigate('/my-reports');
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Input Kegiatan</h1>
        <p className="text-slate-500">Laporkan pelaksanaan kegiatan berdasarkan DPA Dinas.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {/* Section: Referensi Program */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
            <ChevronRight size={16} /> Referensi Program & Kegiatan (DPA)
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {/* PROGRAM */}
            <div>
              <label className="block text-xs font-medium text-blue-900 mb-1">1. Program</label>
              <select
                name="programId"
                required
                value={formData.programId}
                onChange={handleChange}
                className="w-full rounded-lg border-blue-200 border p-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Pilih Program --</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.kode} - {p.nama}</option>
                ))}
              </select>
            </div>

            {/* KEGIATAN */}
            <div>
              <label className="block text-xs font-medium text-blue-900 mb-1">2. Kegiatan</label>
              <select
                name="kegiatanId"
                required
                value={formData.kegiatanId}
                onChange={handleChange}
                disabled={!formData.programId}
                className="w-full rounded-lg border-blue-200 border p-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">-- Pilih Kegiatan --</option>
                {filteredKegiatan.map(k => (
                  <option key={k.id} value={k.id}>{k.kode} - {k.nama}</option>
                ))}
              </select>
            </div>

            {/* SUB KEGIATAN */}
            <div>
              <label className="block text-xs font-medium text-blue-900 mb-1">3. Sub Kegiatan</label>
              <select
                name="subKegiatanId"
                required
                value={formData.subKegiatanId}
                onChange={handleChange}
                disabled={!formData.kegiatanId}
                className="w-full rounded-lg border-blue-200 border p-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">-- Pilih Sub Kegiatan --</option>
                {filteredSubs.map(s => (
                  <option key={s.id} value={s.id}>{s.kode} - {s.nama}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Judul Laporan / Aktivitas Spesifik</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Contoh: Kunjungan ke SD N 1 untuk dongeng (Detail dari Sub Kegiatan)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Kegiatan</label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bidang Pelaksana</label>
            <select
              name="bidang"
              value={formData.bidang}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {Object.values(BidangKerja).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Mulai</label>
               <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2.5 text-sm"/>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Selesai</label>
               <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2.5 text-sm"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
            <input
              type="text"
              name="lokasi"
              required
              value={formData.lokasi}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Nama Gedung / Ruangan / Desa"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Output / Hasil Kegiatan</label>
            <input
              type="text"
              name="output"
              required
              value={formData.output}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Contoh: 50 Peserta, 1 Dokumen MoU, dsb."
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Uraian Kegiatan</label>
            <textarea
              name="description"
              rows={5}
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Jelaskan secara rinci jalannya kegiatan..."
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Dokumentasi Foto</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center text-slate-500">
                <Upload className="mb-2" size={24} />
                <p className="text-sm font-medium">Klik untuk upload atau drag & drop</p>
                <p className="text-xs">PNG, JPG up to 5MB</p>
              </div>
            </div>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 text-sm">
                    <span className="truncate">{f.name}</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : (
              <>
                <Save size={18} />
                Simpan Laporan
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};