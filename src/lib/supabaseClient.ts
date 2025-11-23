
import { createClient } from '@supabase/supabase-js';

// Mengambil konfigurasi dari Environment Variables (Vercel / .env)
// Di Vercel, variabel harus diawali dengan VITE_ agar bisa dibaca oleh React
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Peringatan jika kunci belum disetting
  console.error("Supabase URL dan Key belum disetting di Environment Variables.");
}

export const supabase = createClient(
  SUPABASE_URL || '', 
  SUPABASE_ANON_KEY || ''
);
