import { createClient } from "@supabase/supabase-js";

// Keys from user configuration
const SUPABASE_URL = "https://hcpfeklegfbgtzascdhb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_V2CocIie4WgpfPYCN9aKMQ_hHz26Ble";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getSession() {
  // First, try to get current session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("Session Error:", sessionError);
    return null;
  }

  // If no session, return null
  if (!sessionData.session) {
    return null;
  }

  // Validate session by calling getUser (this will auto-refresh if token is expired)
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    // If JWT is invalid/expired and couldn't be refreshed, sign out
    if (userError.message?.includes('JWT') || userError.message?.includes('expired') || userError.message?.includes('invalid')) {
      console.warn("Session expired, signing out...");
      await supabase.auth.signOut();
      return null;
    }
    console.error("User validation error:", userError);
    return null;
  }

  // Return the refreshed session
  const { data: refreshedSession } = await supabase.auth.getSession();
  return refreshedSession.session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    // Redirect to login if no session
    window.location.replace("login.html");
    return null;
  }
  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getSession();
  if (session) {
    // Redirect to dashboard if already logged in
    window.location.replace("dashboard.html");
  }
}
