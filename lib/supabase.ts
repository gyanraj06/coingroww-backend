import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

import { Database } from "@/types/supabase";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function isSupabaseConfigured() {
  return !!supabaseUrl && !!supabaseAnonKey;
}
