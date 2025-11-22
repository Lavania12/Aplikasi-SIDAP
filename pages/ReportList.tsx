
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Report, ReportStatus, UserRole } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const ReportList: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Determine context: 'my-reports', 'verify', or 'archives'
  const isVerifyPage = location.pathname === '/verify';
  const isArchivePage = location.pathname === '/archives';
  const isMyReports = location.pathname === '/my-reports';

  useEffect(() => {
    const loadData = async () => {
      await storageService.delay(200);
      let data = await storageService.getReports();
      
      if (isMyReports && user) {
        data = data.filter(r => r.creatorId === user.id);
      } else if (isVerifyPage) {
        // Only show items needing verification or recently verified
        data = data.filter(r => r.status === ReportStatus.SUBMITTED || r.status === ReportStatus.REVISION);
      }
      // Archive shows all verified by default, unless searched

      setReports(data);
      setFilteredReports(data);
    };
    loadData();
  }, [user, isMyReports, isVerifyPage]);

  useEffect(() => {
    let result = reports;
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.creatorName.toLowerCase().includes(q) ||
        r.bidang.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(r => r.status === statusFilter);
    }

    setFilteredReports(result);
  }, [search, statusFilter, reports]);

  const handleExport = () => {
    // Mock Export
    alert("Mengekspor data ke Excel...");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isVerifyPage ? 'Verifikasi Laporan Masuk' : isArchivePage ? 'Arsip & Pencarian' : 'Riwayat Laporan Saya'}
          </h1>
          <p className="text-slate-500">
            {isVerifyPage 
              ? 'Periksa dan validasi laporan kegiatan pegawai.' 
              : 'Kelola dan cari data laporan kegiatan terdahulu.'}
          </p>
        </div>
        {isArchivePage && (
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm shadow-sm"
          >
            <Download size={18} />
            Export Excel
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari judul, pegawai, atau bidang..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          {!isVerifyPage && (
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
              >
                <option value="ALL">Semua Status</option>
                <option value={ReportStatus.SUBMITTED}>Menunggu</option>
                <option value={ReportStatus.VERIFIED}>Diterima</option>
                <option value={ReportStatus.REVISION}>Revisi</option>
                <option value={ReportStatus.REJECTED}>Ditolak</option>
              </select>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Judul Kegiatan</th>
                <th className="px-6 py-4">Pegawai</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Bidang</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{report.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{report.lokasi}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{report.creatorName}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(report.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{report.bidang}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/reports/${report.id}`} 
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium text-xs"
                    >
                      <Eye size={14} />
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada laporan yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};