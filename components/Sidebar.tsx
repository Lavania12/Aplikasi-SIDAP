
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon,
  Database,
  Wifi,
  FolderTree,
  BarChart2,
  CalendarRange,
  Presentation,
  BrainCircuit
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1
    ${isActive(path) 
      ? 'bg-yellow-400 text-green-900 shadow-md font-medium' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-green-700'}
  `;

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-slate-200 flex flex-col z-20 hidden md:flex">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-green-800 font-bold border border-yellow-500">
            S
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">SIDAP</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Dinas Arsip & Perpustakaan</p>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav>
          {/* GROUP 1: MENU UTAMA */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">Menu Utama</div>
          
          <Link to="/" className={linkClass('/')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          {/* GROUP 2: STATISTIK & DATA */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-4">Statistik & Data</div>
          
          <Link to="/statistics/dashboard" className={linkClass('/statistics/dashboard')}>
            <BarChart2 size={20} />
            <span>Dashboard Statistik</span>
          </Link>
          
          <Link to="/statistics/annual" className={linkClass('/statistics/annual')}>
            <CalendarRange size={20} />
            <span>Statistik Tahunan</span>
          </Link>
          
          <Link to="/statistics/visualization" className={linkClass('/statistics/visualization')}>
            <Presentation size={20} />
            <span>Visualisasi Grafik</span>
          </Link>

          <Link to="/statistics/ai-analysis" className={linkClass('/statistics/ai-analysis')}>
            <BrainCircuit size={20} />
            <span>Analisa AI</span>
          </Link>

          {/* GROUP 3: ADMINISTRASI (Only for Admin/Kadis) */}
          {(user?.role === UserRole.ADMIN || user?.role === UserRole.KEPALA_DINAS) && (
            <>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-4">Administrasi</div>
              <Link to="/master-data" className={linkClass('/master-data')}>
                <FolderTree size={20} />
                <span>Data Master</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Database size={12} className="text-blue-600" />
          <span className="font-medium text-blue-700">Data: Cloud Server</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Wifi size={12} className="text-green-500" />
          <span className="font-medium">Status: Online</span>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <UserIcon size={20} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role.replace('_', ' ').toLowerCase()}</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};