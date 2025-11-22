
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Lock, User, CloudCheck, 
  Library, Archive, FileText, FolderOpen, Layers, FileStack, Database,
  Search, Bookmark, History, Scroll, PenTool, Boxes, FileSearch
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Login gagal. Periksa Email dan Password Anda.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      
      {/* BACKGROUND ILLUSTRATIONS (Modern Monochrome Pattern) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-40">
        {/* Top Left Cluster */}
        <div className="absolute -top-20 -left-20 text-slate-300 opacity-50 transform -rotate-12">
          <Library size={500} strokeWidth={0.5} />
        </div>
        <div className="absolute top-10 left-10 text-slate-400 opacity-30">
           <FileSearch size={80} strokeWidth={1} />
        </div>
        <div className="absolute top-40 left-32 text-slate-300 opacity-40 transform rotate-45">
           <Scroll size={100} strokeWidth={0.8} />
        </div>

        {/* Top Right Cluster */}
        <div className="absolute -top-10 -right-10 text-slate-200 opacity-60 transform rotate-12">
           <Archive size={400} strokeWidth={0.5} />
        </div>
        <div className="absolute top-20 right-40 text-slate-300 opacity-30">
           <History size={90} strokeWidth={0.8} />
        </div>
        <div className="absolute top-60 right-10 text-slate-300 opacity-40 transform -rotate-12">
           <FileStack size={120} strokeWidth={0.8} />
        </div>

        {/* Bottom Left Cluster */}
        <div className="absolute -bottom-10 -left-10 text-slate-200 opacity-50 transform rotate-6">
           <Boxes size={350} strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-40 left-20 text-slate-300 opacity-40">
           <Database size={80} strokeWidth={1} />
        </div>
        <div className="absolute bottom-10 left-80 text-slate-300 opacity-30 transform -rotate-45">
           <PenTool size={100} strokeWidth={0.8} />
        </div>

        {/* Bottom Right Cluster */}
        <div className="absolute -bottom-20 -right-20 text-slate-200 opacity-60 transform -rotate-6">
           <FolderOpen size={450} strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-32 right-32 text-slate-300 opacity-40">
           <Layers size={110} strokeWidth={0.8} />
        </div>
        <div className="absolute bottom-10 right-96 text-slate-300 opacity-30">
           <Bookmark size={70} strokeWidth={1} />
        </div>

        {/* Floating Center Elements (Subtle) */}
        <div className="absolute top-1/3 left-1/4 text-slate-200 opacity-30 transform rotate-12">
           <BookOpen size={150} strokeWidth={0.5} />
        </div>
        <div className="absolute top-2/3 right-1/3 text-slate-200 opacity-20 transform -rotate-12">
           <FileText size={180} strokeWidth={0.5} />
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative z-10">
        <div className="bg-gradient-to-r from-green-700 to-green-600 p-8 text-center relative overflow-hidden">
          {/* Subtle pattern on header */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-20px] right-[-20px] transform rotate-12"><BookOpen size={100} /></div>
             <div className="absolute bottom-[-20px] left-[-20px] transform -rotate-12"><Archive size={100} /></div>
          </div>

          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm text-yellow-300 shadow-lg border border-white/10 relative z-10">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white relative z-10 tracking-wide">SIDAP PROLAP</h1>
          <h2 className="text-sm font-bold text-white/90 relative z-10 mt-1 tracking-wide">DINAS ARSIP DAN PERPUSTAKAAN</h2>
          <p className="text-green-100 text-xs mt-2 relative z-10">Sistem Informasi Data &<br/>Pelaporan Kinerja</p>
        </div>
        
        <div className="bg-blue-50 p-3 border-b border-blue-100 flex gap-3 items-start">
          <CloudCheck className="text-blue-600 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Status Online:</strong> Aplikasi terhubung ke Database Cloud (Supabase). Data tersimpan aman dan real-time.
          </p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Dinas</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm bg-white"
                  placeholder="nama@dinas.go.id"
                />
              </div>
            </div>
            
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
               <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Password" 
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm bg-white text-slate-800"
                />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-green-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Memproses...' : 'Masuk Aplikasi'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-400">
              Gunakan email berikut untuk login:<br/>
              <span className="font-mono text-slate-600">pegawai@dinas.go.id</span> (Pass: 123456)<br/>
              <span className="font-mono text-slate-600">admin@dinas.go.id</span> (Pass: admin123)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
