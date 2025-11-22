
export enum UserRole {
  PEGAWAI = 'PEGAWAI',
  ADMIN = 'ADMIN',
  KEPALA_DINAS = 'KEPALA_DINAS',
}

export interface User {
  id: string;
  nip: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string;
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED', // Menunggu Verifikasi
  VERIFIED = 'VERIFIED',   // Diterima
  REVISION = 'REVISION',   // Perlu Revisi
  REJECTED = 'REJECTED',   // Ditolak
}

export enum BidangKerja {
  PERPUSTAKAAN = 'Perpustakaan',
  KEARSIPAN = 'Kearsipan',
  SEKRETARIAT = 'Sekretariat',
  PENGEMBANGAN = 'Pengembangan',
}

export interface Program {
  id: string;
  kode: string; // Contoh: 2.23.01
  nama: string; // Contoh: Program Penunjang Urusan Pemerintahan
}

export interface Kegiatan {
  id: string;
  programId: string; // Relasi ke Program
  kode: string; // Contoh: 2.23.01.2.01
  nama: string; // Contoh: Perencanaan, Penganggaran, dan Evaluasi Kinerja
}

export interface SubKegiatan {
  id: string;
  kegiatanId: string; // Relasi ke Kegiatan
  kode: string; // Contoh: 2.23.01.2.01.01
  nama: string; // Contoh: Penyusunan Dokumen Perencanaan
}

export interface ReportPhoto {
  id: string;
  url: string;
  caption: string;
}

export interface Report {
  id: string;
  creatorId: string;
  creatorName: string;
  
  // Relation to Master Data
  programId?: string;
  programName?: string;
  kegiatanId?: string;
  kegiatanName?: string;
  subKegiatanId?: string;
  subKegiatanName?: string;

  title: string; // Judul spesifik laporan
  description: string; // HTML/Rich text string
  date: string; // ISO Date string YYYY-MM-DD
  startTime: string;
  endTime: string;
  bidang: BidangKerja;
  lokasi: string;
  output: string;
  status: ReportStatus;
  photos: ReportPhoto[];
  verifierNote?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface DashboardStats {
  total: number;
  pending: number;
  verified: number;
  revision: number;
}

// --- STATISTICS (DAILY/MONTHLY INPUT) ---

export enum StatisticCategory {
  PENGUNJUNG_PERPUS = 'Pengunjung Perpustakaan',
  LAYANAN_ARSIP = 'Layanan Arsip',
  PEMINJAMAN_BUKU = 'Peminjaman Buku',
  DIGITALISASI_ARSIP = 'Digitalisasi Arsip',
  IKM = 'Indeks Kepuasan Masyarakat',
  KEGIATAN_PEMBINAAN = 'Kegiatan Pembinaan'
}

export interface Statistic {
  id: string;
  category: StatisticCategory;
  value: number; // Nilai kuantitatif
  date: string; // YYYY-MM-DD
  note?: string;
  creatorId?: string;
  createdAt: string;
}

// --- ANNUAL STATISTICS (CUSTOMIZABLE INDICATORS) ---

export type StatCategory = 'Perpustakaan' | 'Kearsipan' | 'Umum';

export interface StatisticIndicator {
  id: string;
  category: StatCategory; // Grouping
  name: string;
  type: 'number' | 'text' | 'percentage';
  unit?: string;
}

export interface StatisticYearlyValue {
  id: string;
  indicatorId: string;
  year: number;
  value: string | number;
  note?: string;
}

// --- AI ANALYSIS TYPES ---

export interface AIInsight {
  type: 'TREND_UP' | 'TREND_DOWN' | 'ANOMALY' | 'STABLE';
  indicatorName: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AIPrediction {
  year: number;
  // Dynamic keys for graph (e.g., "Jumlah Buku": 100)
  [key: string]: number | string; 
}

export interface AIRecommendation {
  category: string;
  title: string;
  description: string;
  expectedImpact: string; // NEW: Dampak yang diharapkan
  actionType: 'URGENT' | 'SUGGESTION' | 'LONG_TERM';
}

export interface AIIndicatorBreakdown {
  id: string;
  name: string;
  lastValue: number;
  growth: number;
  status: 'NAIK' | 'TURUN' | 'STABIL';
  trend3Years: number[];
  unit: string;
}

export interface AISwot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface AIAnalysisResult {
  insights: AIInsight[];
  predictions: AIPrediction[];
  recommendations: AIRecommendation[];
  indicatorBreakdown: AIIndicatorBreakdown[];
  summary: string;
  swot: AISwot; // NEW: Analisa SWOT
  score: number; // 0-100 Health Score
  scoreFactors: string[];
}
