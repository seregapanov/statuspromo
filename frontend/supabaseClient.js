// supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// 🔧 Замените на свои данные из Supabase
const supabaseUrl = 'https://hezxfkeflzupndlbkshi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlenhma2VmbHp1cG5kbGJrc2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzU5MDEsImV4cCI6MjA3MjY1MTkwMX0.qJYyJinI27Zx4bvYBv9d70cs-J3QPrFcwBLNAxz91eg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;