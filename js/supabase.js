// supabase.js — Supabase Client
const SUPABASE_URL = 'https://zplzvnahovqsqobrjsem.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DfmXk2iXBtvtTR0pD9wR6A_q4DdVEvi';

// Import Supabase từ CDN
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Storage base URLs
const STORAGE_URL = SUPABASE_URL + '/storage/v1/object/public/';
const AUDIO_URL = STORAGE_URL + 'audio/';
const IMAGES_URL = STORAGE_URL + 'images/';

// UID duy nhất được phép quản lý bài hát (khớp với RLS policy trên Supabase)
const ADMIN_UID = 'aac649af-f48f-45fc-8fc2-15a28f250b4f';