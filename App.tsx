
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MasterProgram } from './pages/MasterProgram';
import { StatisticsDashboard } from './pages/StatisticsDashboard';
import { StatisticsInput } from './pages/StatisticsInput';
import { AnnualStatistics } from './pages/AnnualStatistics';
import { AnnualVisualization } from './pages/AnnualVisualization';
import { AIAnalysis } from './pages/AIAnalysis';
import { Menu } from 'lucide-react';

const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      {/* Mobile Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-20 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
         <Sidebar />
      </div>

      <div className="flex-1 md:ml-64 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <div className="bg-white p-4 border-b border-slate-200 md:hidden flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-8 h-8 bg-yellow-400 rounded text-green-800 flex items-center justify-center border border-yellow-500">S</span>
              SIDAP
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
              <Menu size={24} />
            </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            
            {/* Statistics & Data Routes */}
            <Route path="/statistics/dashboard" element={<StatisticsDashboard />} />
            {/* Note: /statistics/input kept if manual input needed, but hidden from sidebar per request */}
            <Route path="/statistics/input" element={<StatisticsInput />} /> 
            <Route path="/statistics/annual" element={<AnnualStatistics />} />
            <Route path="/statistics/visualization" element={<AnnualVisualization />} />
            <Route path="/statistics/ai-analysis" element={<AIAnalysis />} />

            {/* Administration */}
            <Route path="/master-data" element={<MasterProgram />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;