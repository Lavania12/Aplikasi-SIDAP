
import { supabase } from '../lib/supabaseClient';
import { User, Program, Kegiatan, SubKegiatan, StatisticIndicator, StatisticYearlyValue, Report, Statistic } from '../types';

// Helper untuk mengubah format snake_case (Database) ke camelCase (Aplikasi)
const mapUser = (data: any): User => ({
  id: data.id,
  nip: data.nip,
  name: data.name,
  email: data.email,
  role: data.role,
  avatar: data.avatar,
  password: data.password // Map password field
});

const mapIndicator = (data: any): StatisticIndicator => ({
  id: data.id,
  category: data.category,
  name: data.name,
  type: data.type,
  unit: data.unit
});

const mapYearlyValue = (data: any): StatisticYearlyValue => ({
  id: data.id,
  indicatorId: data.indicator_id,
  year: data.year,
  value: data.value,
  note: data.note
});

const mapProgram = (data: any): Program => ({
  id: data.id,
  kode: data.kode,
  nama: data.nama
});

const mapKegiatan = (data: any): Kegiatan => ({
  id: data.id,
  programId: data.program_id,
  kode: data.kode,
  nama: data.nama
});

const mapSubKegiatan = (data: any): SubKegiatan => ({
  id: data.id,
  kegiatanId: data.kegiatan_id,
  kode: data.kode,
  nama: data.nama
});

const mapReport = (data: any): Report => ({
    id: data.id,
    creatorId: data.creator_id,
    creatorName: data.creator_name,
    programId: data.program_id,
    programName: data.program_name,
    kegiatanId: data.kegiatan_id,
    kegiatanName: data.kegiatan_name,
    subKegiatanId: data.sub_kegiatan_id,
    subKegiatanName: data.sub_kegiatan_name,
    title: data.title,
    description: data.description,
    date: data.date,
    startTime: data.start_time,
    endTime: data.end_time,
    bidang: data.bidang,
    lokasi: data.lokasi,
    output: data.output,
    status: data.status,
    photos: data.photos || [],
    verifierNote: data.verifier_note,
    createdAt: data.created_at,
});

const mapStatistic = (data: any): Statistic => ({
    id: data.id,
    category: data.category,
    value: data.value,
    date: data.date,
    note: data.note,
    creatorId: data.creator_id,
    createdAt: data.created_at
});

// Helper to generate random ID for TEXT primary keys
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const storageService = {
  
  // --- USERS ---
  getUserByEmail: async (email: string): Promise<User | undefined> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return undefined;
    return mapUser(data);
  },

  // --- MASTER DATA: PROGRAMS ---
  getPrograms: async (): Promise<Program[]> => {
    const { data } = await supabase.from('programs').select('*').order('kode', { ascending: true });
    return (data || []).map(mapProgram);
  },

  createProgram: async (program: Partial<Program>): Promise<void> => {
    await supabase.from('programs').insert({ 
        id: generateId('prog'),
        kode: program.kode, 
        nama: program.nama 
    });
  },

  deleteProgram: async (id: string): Promise<void> => {
    await supabase.from('programs').delete().eq('id', id);
  },

  // --- MASTER DATA: KEGIATAN ---
  getKegiatan: async (): Promise<Kegiatan[]> => {
    const { data } = await supabase.from('kegiatan').select('*').order('kode', { ascending: true });
    return (data || []).map(mapKegiatan);
  },

  createKegiatan: async (kegiatan: Partial<Kegiatan>): Promise<void> => {
    await supabase.from('kegiatan').insert({ 
      id: generateId('keg'),
      program_id: kegiatan.programId, 
      kode: kegiatan.kode, 
      nama: kegiatan.nama 
    });
  },

  deleteKegiatan: async (id: string): Promise<void> => {
    await supabase.from('kegiatan').delete().eq('id', id);
  },

  // --- MASTER DATA: SUB KEGIATAN ---
  getSubKegiatan: async (): Promise<SubKegiatan[]> => {
    const { data } = await supabase.from('sub_kegiatan').select('*').order('kode', { ascending: true });
    return (data || []).map(mapSubKegiatan);
  },

  createSubKegiatan: async (sub: Partial<SubKegiatan>): Promise<void> => {
    await supabase.from('sub_kegiatan').insert({
      id: generateId('sub'),
      kegiatan_id: sub.kegiatanId,
      kode: sub.kode,
      nama: sub.nama
    });
  },

  deleteSubKegiatan: async (id: string): Promise<void> => {
    await supabase.from('sub_kegiatan').delete().eq('id', id);
  },

  // --- REPORTS ---
  getReports: async (): Promise<Report[]> => {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      return (data || []).map(mapReport);
  },

  getReportById: async (id: string): Promise<Report | undefined> => {
      const { data } = await supabase.from('reports').select('*').eq('id', id).single();
      if (!data) return undefined;
      return mapReport(data);
  },

  createReport: async (report: Report): Promise<void> => {
      const dbData = {
          id: report.id,
          creator_id: report.creatorId,
          creator_name: report.creatorName,
          program_id: report.programId,
          program_name: report.programName,
          kegiatan_id: report.kegiatanId,
          kegiatan_name: report.kegiatanName,
          sub_kegiatan_id: report.subKegiatanId,
          sub_kegiatan_name: report.subKegiatanName,
          title: report.title,
          description: report.description,
          date: report.date,
          start_time: report.startTime,
          end_time: report.endTime,
          bidang: report.bidang,
          lokasi: report.lokasi,
          output: report.output,
          status: report.status,
          photos: report.photos, // ensure jsonb handling in supabase
          created_at: report.createdAt
      };
      const { error } = await supabase.from('reports').insert(dbData);
      if (error) console.error("Error creating report:", error);
  },

  updateReport: async (report: Report): Promise<void> => {
      const dbData = {
          status: report.status,
          verifier_note: report.verifierNote
      };
      const { error } = await supabase.from('reports').update(dbData).eq('id', report.id);
      if (error) console.error("Error updating report:", error);
  },

  // --- STATISTICS ---
  getStatistics: async (): Promise<Statistic[]> => {
      const { data } = await supabase.from('statistics').select('*').order('date', { ascending: false });
      return (data || []).map(mapStatistic);
  },

  addStatistic: async (stat: Statistic): Promise<void> => {
      const dbData = {
          id: stat.id,
          category: stat.category,
          value: stat.value,
          date: stat.date,
          note: stat.note,
          creator_id: stat.creatorId,
          created_at: stat.createdAt
      };
      await supabase.from('statistics').insert(dbData);
  },

  deleteStatistic: async (id: string): Promise<void> => {
      await supabase.from('statistics').delete().eq('id', id);
  },

  // --- ANNUAL STATISTICS INDICATORS ---
  getIndicators: async (): Promise<StatisticIndicator[]> => {
    const { data } = await supabase
      .from('statistic_indicators')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    return (data || []).map(mapIndicator);
  },

  addIndicator: async (ind: Partial<StatisticIndicator>): Promise<void> => {
    const { error } = await supabase.from('statistic_indicators').insert({
      id: generateId('ind'),
      category: ind.category,
      name: ind.name,
      type: ind.type,
      unit: ind.unit
    });
    if (error) throw error;
  },

  updateIndicator: async (ind: StatisticIndicator): Promise<void> => {
    const { error } = await supabase.from('statistic_indicators').update({
      category: ind.category,
      name: ind.name,
      type: ind.type,
      unit: ind.unit
    }).eq('id', ind.id);
    if (error) throw error;
  },

  deleteIndicator: async (id: string): Promise<void> => {
    // 1. MANUAL CASCADE: Hapus data child (Nilai Tahunan) terlebih dahulu
    // Ini penting jika database tidak diset ON DELETE CASCADE
    const { error: childError } = await supabase
        .from('statistic_yearly_values')
        .delete()
        .eq('indicator_id', id);
    
    if (childError) {
        console.warn("Warning: Gagal membersihkan data nilai tahunan:", childError.message);
        // Kita lanjut coba hapus parent, siapa tahu database menghandle-nya
    }

    // 2. DELETE PARENT (Indikator)
    const { error } = await supabase
        .from('statistic_indicators')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error("Error deleting indicator:", error);
        throw error;
    }
  },

  // --- ANNUAL STATISTICS VALUES ---
  getAllYearlyValues: async (): Promise<StatisticYearlyValue[]> => {
    const { data } = await supabase.from('statistic_yearly_values').select('*');
    return (data || []).map(mapYearlyValue);
  },

  getYearlyValues: async (year: number): Promise<StatisticYearlyValue[]> => {
    const { data } = await supabase
      .from('statistic_yearly_values')
      .select('*')
      .eq('year', year);
    return (data || []).map(mapYearlyValue);
  },

  upsertYearlyValue: async (val: Partial<StatisticYearlyValue>): Promise<void> => {
    try {
        const { data: existing, error: fetchError } = await supabase
        .from('statistic_yearly_values')
        .select('id')
        .eq('indicator_id', val.indicatorId)
        .eq('year', val.year)
        .maybeSingle(); 

        if (fetchError) throw fetchError;

        if (existing) {
            // UPDATE
            const { error: updateError } = await supabase.from('statistic_yearly_values').update({
                value: val.value,
                note: val.note
            }).eq('id', existing.id);

            if (updateError) throw updateError;
        } else {
            // INSERT
            const { error: insertError } = await supabase.from('statistic_yearly_values').insert({
                id: generateId('val'),
                indicator_id: val.indicatorId,
                year: val.year,
                value: val.value,
                note: val.note
            });

            if (insertError) throw insertError;
        }
    } catch (err) {
        console.error("CRITICAL ERROR in upsertYearlyValue:", err);
        throw err;
    }
  },

  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};
