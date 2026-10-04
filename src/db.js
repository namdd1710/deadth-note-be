const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong file .env");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function addName(name) {
  const { data, error } = await supabase
    .from("names")
    .insert({ name })
    .select("id, name, created_at")
    .single();

  if (error) throw error;
  return data;
}

async function listNames() {
  const { data, error } = await supabase
    .from("names")
    .select("id, name, created_at")
    .order("id", { ascending: false });

  if (error) throw error;
  return data;
}

module.exports = { addName, listNames };
