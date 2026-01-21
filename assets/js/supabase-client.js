import { createClient } from "@supabase/supabase-js";

// TODO: Replace with your actual Supabase Project URL and Anon Key
const SUPABASE_URL = "https://hcpfeklegfbgtzascdhb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_V2CocIie4WgpfPYCN9aKMQ_hHz26Ble";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return data.session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.replace("/login.html");
    return null;
  }
  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getSession();
  if (session) {
    window.location.replace("/dashboard.html");
  }
}
