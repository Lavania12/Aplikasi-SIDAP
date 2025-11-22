
import { User, UserRole, Report, ReportStatus, BidangKerja, Program, Kegiatan, SubKegiatan, Statistic, StatisticCategory, StatisticIndicator, StatisticYearlyValue } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    nip: '198501012010011001',
    name: 'Budi Santoso',
    email: 'pegawai@dinas.go.id',
    role: UserRole.PEGAWAI,
    avatar: 'https://picsum.photos/id/1012/200/200',
  },
  {
    id: 'u2',
    nip: '198005052005011002',
    name: 'Siti Aminah',
    email: 'admin@dinas.go.id',
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/id/1027/200/200',
  },
  {
    id: 'u3',
    nip: '197512121998031003',
    name: 'Dr. H. Ahmad Fauzi',
    email: 'kadis@dinas.go.id',
    role: UserRole.KEPALA_DINAS,
    avatar: 'https://picsum.photos/id/1005/200/200',
  },
];

export const MOCK_PROGRAMS: Program[] = [
  { id: 'prog1', kode: '2.23.01', nama: 'Program Penunjang Urusan Pemerintahan Daerah Kab/Kota' },
  { id: 'prog2', kode: '2.23.02', nama: 'Program Pelestarian Arsip' },
];

export const MOCK_KEGIATAN: Kegiatan[] = [
  // Milik Program 1
  { id: 'keg1', programId: 'prog1', kode: '2.23.01.2.01', nama: 'Perencanaan, Penganggaran, dan Evaluasi Kinerja' },
  { id: 'keg2', programId: 'prog1', kode: '2.23.01.2.02', nama: 'Administrasi Keuangan Perangkat Daerah' },
  // Milik Program 2
  { id: 'keg3', programId: 'prog2', kode: '2.23.02.2.01', nama: 'Pengelolaan Arsip Dinamis Daerah' },
];

export const MOCK_SUB_KEGIATAN: SubKegiatan[] = [
  // Milik Kegiatan 1 (Perencanaan)
  { id: 'sub1', kegiatanId: 'keg1', kode: '2.23.01.2.01.01', nama: 'Penyusunan Dokumen Perencanaan Perangkat Daerah' },
  { id: 'sub2', kegiatanId: 'keg1', kode: '2.23.01.2.01.02', nama: 'Koordinasi dan Penyusunan Laporan Capaian Kinerja' },
  // Milik Kegiatan 2 (Keuangan)
  { id: 'sub3', kegiatanId: 'keg2', kode: '2.23.01.2.02.01', nama: 'Penyediaan Gaji dan Tunjangan ASN' },
  // Milik Kegiatan 3 (Arsip)
  { id: 'sub4', kegiatanId: 'keg3', kode: '2.23.02.2.01.01', nama: 'Pengelolaan Arsip Inaktif' },
];

export const MOCK_REPORTS: Report[] = [
  {
    id: 'r1',
    creatorId: 'u1',
    creatorName: 'Budi Santoso',
    title: 'Sosialisasi Minat Baca ke SD N 1 Kota',
    description: 'Melakukan kunjungan mobil perpustakaan keliling dan storytelling kepada siswa kelas 1-3.',
    date: '2023-10-25',
    startTime: '08:00',
    endTime: '12:00',
    bidang: BidangKerja.PERPUSTAKAAN,
    lokasi: 'SD N 1 Kota',
    output: '50 Siswa terlayani',
    status: ReportStatus.VERIFIED,
    photos: [
      { id: 'p1', url: 'https://picsum.photos/id/1/400/300', caption: 'Kegiatan Storytelling' }
    ],
    createdAt: '2023-10-25T13:00:00Z',
  },
  {
    id: 'r2',
    creatorId: 'u1',
    creatorName: 'Budi Santoso',
    title: 'Restorasi Arsip Kuno Tahun 1990',
    description: 'Pembersihan dan laminasi dokumen akta kelahiran rusak akibat banjir.',
    date: '2023-10-26',
    startTime: '09:00',
    endTime: '15:00',
    bidang: BidangKerja.KEARSIPAN,
    lokasi: 'Ruang Restorasi',
    output: '10 Dokumen terestorasi',
    status: ReportStatus.SUBMITTED,
    photos: [],
    createdAt: '2023-10-26T16:00:00Z',
  },
  {
    id: 'r3',
    creatorId: 'u1',
    creatorName: 'Budi Santoso',
    title: 'Rapat Koordinasi Anggaran',
    description: 'Membahas rencana belanja modal buku tahun depan.',
    date: '2023-10-27',
    startTime: '13:00',
    endTime: '15:00',
    bidang: BidangKerja.SEKRETARIAT,
    lokasi: 'Ruang Rapat Lt 2',
    output: 'Notulen Rapat',
    status: ReportStatus.REVISION,
    verifierNote: 'Mohon lampirkan daftar hadir peserta rapat.',
    photos: [],
    createdAt: '2023-10-27T15:30:00Z',
  }
];

// Generate Mock Statistics for the last 14 days
const generateStats = (): Statistic[] => {
  const stats: Statistic[] = [];
  const today = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Random data for Visitors
    stats.push({
      id: `st-vis-${i}`,
      category: StatisticCategory.PENGUNJUNG_PERPUS,
      value: Math.floor(Math.random() * 50) + 20,
      date: dateStr,
      createdAt: d.toISOString()
    });

    // Random data for Archive Service
    stats.push({
      id: `st-arc-${i}`,
      category: StatisticCategory.LAYANAN_ARSIP,
      value: Math.floor(Math.random() * 10) + 2,
      date: dateStr,
      createdAt: d.toISOString()
    });

    // Random data for Books
    stats.push({
      id: `st-bk-${i}`,
      category: StatisticCategory.PEMINJAMAN_BUKU,
      value: Math.floor(Math.random() * 30) + 10,
      date: dateStr,
      createdAt: d.toISOString()
    });
  }
  
  // Add one IKM data
  stats.push({
    id: 'st-ikm-1',
    category: StatisticCategory.IKM,
    value: 88.5,
    date: today.toISOString().split('T')[0],
    note: 'Survei Semester 1',
    createdAt: today.toISOString()
  });

  return stats;
};

export const MOCK_STATISTICS: Statistic[] = generateStats();

// --- MOCK ANNUAL STATISTICS (COMPLETE DATASET 2020-2024) ---

export const MOCK_INDICATORS: StatisticIndicator[] = [
  // A. KATEGORI PERPUSTAKAAN
  { id: 'ind-lib-1', category: 'Perpustakaan', name: 'Jumlah Pengunjung Perpustakaan', type: 'number', unit: 'Orang' },
  { id: 'ind-lib-2', category: 'Perpustakaan', name: 'Jumlah Koleksi Buku', type: 'number', unit: 'Eksemplar' },
  { id: 'ind-lib-3', category: 'Perpustakaan', name: 'Akses Layanan E-Book', type: 'number', unit: 'Akses' },
  { id: 'ind-lib-4', category: 'Perpustakaan', name: 'Perpustakaan Desa Binaan', type: 'number', unit: 'Unit' },
  
  // B. KATEGORI KEARSIPAN
  { id: 'ind-arc-1', category: 'Kearsipan', name: 'Jumlah Arsip Tertata', type: 'number', unit: 'Berkas' },
  { id: 'ind-arc-2', category: 'Kearsipan', name: 'Digitalisasi Arsip Vital', type: 'number', unit: 'File PDF' },
  { id: 'ind-arc-3', category: 'Kearsipan', name: 'Layanan Peminjaman Arsip', type: 'number', unit: 'Permintaan' },
  { id: 'ind-arc-4', category: 'Kearsipan', name: 'Pembinaan Kearsipan OPD', type: 'number', unit: 'OPD' },

  // C. KATEGORI UMUM
  { id: 'ind-gen-1', category: 'Umum', name: 'Indeks Kepuasan Masyarakat (IKM)', type: 'percentage', unit: '%' },
  { id: 'ind-gen-2', category: 'Umum', name: 'Realisasi Anggaran', type: 'percentage', unit: '%' },
  { id: 'ind-gen-3', category: 'Umum', name: 'Jumlah Pegawai ASN', type: 'number', unit: 'Orang' },
  { id: 'ind-gen-4', category: 'Umum', name: 'Kegiatan Bimtek Pegawai', type: 'number', unit: 'Kegiatan' },
];

const generateYearlyData = () => {
  const data: StatisticYearlyValue[] = [];
  const years = [2020, 2021, 2022, 2023, 2024];

  // Helper to push data
  const push = (indId: string, y: number, val: number, note: string = '') => {
    data.push({ id: `val-${indId}-${y}`, indicatorId: indId, year: y, value: val, note });
  };

  // 1. Pengunjung Perpus (Recovering from Covid)
  push('ind-lib-1', 2020, 5500, 'Pandemi Covid-19');
  push('ind-lib-1', 2021, 8200, 'Mulai pulih');
  push('ind-lib-1', 2022, 14500, 'Kunjungan sekolah dibuka');
  push('ind-lib-1', 2023, 22400, 'Program Wisata Literasi');
  push('ind-lib-1', 2024, 25600, 'Target terlampaui');

  // 2. Koleksi Buku (Steady Growth)
  push('ind-lib-2', 2020, 12000);
  push('ind-lib-2', 2021, 13500);
  push('ind-lib-2', 2022, 15000);
  push('ind-lib-2', 2023, 16800, 'Pengadaan DAK');
  push('ind-lib-2', 2024, 18200);

  // 3. E-Book (Exponential Growth)
  push('ind-lib-3', 2020, 1500);
  push('ind-lib-3', 2021, 4800, 'Peluncuran Aplikasi');
  push('ind-lib-3', 2022, 12500);
  push('ind-lib-3', 2023, 28000, 'Sosialisasi Masif');
  push('ind-lib-3', 2024, 42000);

  // 4. Perpus Desa (Slow Growth)
  push('ind-lib-4', 2020, 12);
  push('ind-lib-4', 2021, 15);
  push('ind-lib-4', 2022, 18);
  push('ind-lib-4', 2023, 20);
  push('ind-lib-4', 2024, 22);

  // 5. Arsip Tertata (Linear)
  push('ind-arc-1', 2020, 5000);
  push('ind-arc-1', 2021, 7500);
  push('ind-arc-1', 2022, 11000);
  push('ind-arc-1', 2023, 14500);
  push('ind-arc-1', 2024, 18000);

  // 6. Digitalisasi Arsip (Anomaly in 2022 due to server issue mock)
  push('ind-arc-2', 2020, 200);
  push('ind-arc-2', 2021, 1500);
  push('ind-arc-2', 2022, 1800, 'Kendala Scanner Rusak');
  push('ind-arc-2', 2023, 5600, 'Alat Baru');
  push('ind-arc-2', 2024, 9200);

  // 7. Layanan Arsip (Stable)
  push('ind-arc-3', 2020, 120);
  push('ind-arc-3', 2021, 145);
  push('ind-arc-3', 2022, 160);
  push('ind-arc-3', 2023, 155);
  push('ind-arc-3', 2024, 175);

  // 8. Pembinaan OPD
  push('ind-arc-4', 2020, 10);
  push('ind-arc-4', 2021, 15);
  push('ind-arc-4', 2022, 25);
  push('ind-arc-4', 2023, 30);
  push('ind-arc-4', 2024, 35);

  // 9. IKM (Positive Trend)
  push('ind-gen-1', 2020, 78.5, 'Kurang Baik');
  push('ind-gen-1', 2021, 81.2);
  push('ind-gen-1', 2022, 84.5);
  push('ind-gen-1', 2023, 87.8, 'Sangat Baik');
  push('ind-gen-1', 2024, 89.4);

  // 10. Realisasi Anggaran
  push('ind-gen-2', 2020, 88.5);
  push('ind-gen-2', 2021, 91.0);
  push('ind-gen-2', 2022, 92.5);
  push('ind-gen-2', 2023, 95.2);
  push('ind-gen-2', 2024, 94.8); // Slight dip (Forecast/Provisional)

  // 11. Pegawai ASN (Stable)
  push('ind-gen-3', 2020, 45);
  push('ind-gen-3', 2021, 44);
  push('ind-gen-3', 2022, 46);
  push('ind-gen-3', 2023, 46);
  push('ind-gen-3', 2024, 48);

  return data;
};

export const MOCK_YEARLY_VALUES: StatisticYearlyValue[] = generateYearlyData();