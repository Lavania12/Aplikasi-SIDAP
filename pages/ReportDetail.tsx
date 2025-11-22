
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Report, ReportStatus, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Calendar, Clock, MapPin, User, Target, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | undefined>(undefined);
  const [note, setNote] = useState('');
  const [showVerifyActions, setShowVerifyActions] = useState(false);

  useEffect(() => {
    if (id) {
      const loadReport = async () => {
          const data = await storageService.getReportById(id);
          setReport(data);
          if (data && user?.role === UserRole.ADMIN && (data.status === ReportStatus.SUBMITTED || data.status === ReportStatus.REVISION)) {
            setShowVerifyActions(true);
          }
      };
      loadReport();
    }
  }, [id, user]);

  const handleVerification = async (status: ReportStatus) => {
    if (!report) return;

    if (status !== ReportStatus.VERIFIED && !note) {
      alert("Mohon isi catatan verifikator untuk revisi atau penolakan.");
      return;
    }

    const updatedReport = {
      ...report,
      status,
      verifierNote: note,
    };

    await storageService.updateReport(updatedReport);
    setReport(updatedReport);
    setShowVerifyActions(false);
    alert(`Laporan berhasil ${status === ReportStatus.VERIFIED ? 'Diterima' : 'diproses'}`);
    navigate('/verify');
  };

  if (!report) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={18} />
        Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-1 block">{report.bidang}</span>
                <h1 className="text-2xl font-bold text-slate-800 leading-tight">{report.title}</h1>
              </div>
              <StatusBadge status={report.status} />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                {new Date(report.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                {report.startTime} - {report.endTime}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} />
                {report.lokasi}
              </div>
              <div className="flex items-center gap-1.5">
                <User size={16} />
                {report.creatorName}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Uraian Kegiatan</h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                  {report.description}
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Target className="text-blue-600 mt-0.5 shrink-0" size={18} />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Output / Hasil</h4>
                  <p className="text-sm text-slate-600">{report.output}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Photos Gallery */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Dokumentasi</h3>
            {report.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {report.photos.map(photo => (
                  <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video">
                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.caption}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic">Tidak ada dokumentasi foto.</p>
            )}
          </div>
        </div>

        {/* Sidebar Action / Info */}
        <div className="space-y-6">
          {/* Verifier Note Display */}
          {report.verifierNote && (
            <div className={`rounded-xl p-5 border shadow-sm ${report.status === ReportStatus.REVISION ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${report.status === ReportStatus.REVISION ? 'text-orange-800' : 'text-slate-800'}`}>
                <AlertTriangle size={16} />
                Catatan Verifikator
              </h3>
              <p className="text-sm text-slate-700">{report.verifierNote}</p>
            </div>
          )}

          {/* Action Box for Admin */}
          {showVerifyActions && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 sticky top-6">
              <h3 className="font-bold text-slate-800 mb-4">Tindakan Verifikasi</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Catatan (Wajib untuk Revisi/Tolak)</label>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Masukkan alasan..."
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleVerification(ReportStatus.VERIFIED)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                  >
                    <CheckCircle size={18} />
                    Terima Laporan
                  </button>
                  <button 
                    onClick={() => handleVerification(ReportStatus.REVISION)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                  >
                    <AlertTriangle size={18} />
                    Minta Revisi
                  </button>
                   <button 
                    onClick={() => handleVerification(ReportStatus.REJECTED)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                  >
                    <XCircle size={18} />
                    Tolak Laporan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};