// ==========================================================
// Configuração da conexão com o Supabase.
// Preencha as duas linhas abaixo com os dados do SEU projeto:
// Painel do Supabase > Project Settings > API
// ==========================================================
const SUPABASE_URL = "https://ybosshiqdcyxdaixnhvf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlib3NzaGlxZGN5eGRhaXhuaHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzAxMDAsImV4cCI6MjEwNTcwNjEwMH0.5byo44bhmFUZR2h7gU-gfhxeQJj1pfTBJ1pIAyUYhrk";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
