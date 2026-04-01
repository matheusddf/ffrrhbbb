import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') : null;
  const savedKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_key') : null;

  return {
    url: savedUrl || import.meta.env.VITE_SUPABASE_URL || 'https://ucnhtzgwzhzupbrgitlr.supabase.co',
    key: savedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
  };
};

const config = getSupabaseConfig();

export const supabase = createClient(config.url, config.key);

export const updateSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  window.location.reload();
};
