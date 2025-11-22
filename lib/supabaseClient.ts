
import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase
const SUPABASE_URL = 'https://fczxfemxqqxpdjybhaok.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RLlQqIvHawyPERLPrw0EXw_w3rbcLA4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);