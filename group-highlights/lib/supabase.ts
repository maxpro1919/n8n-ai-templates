import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Highlight {
  id: string;
  content: string;
  source: string | null;
  tag: string;
  note: string | null;
  submitted_by: string | null;
  created_at: string;
  sender_name: string | null;
  raw_timestamp: string | null;
  source_type: string | null; // 'mark' or 'batch'
  uploaded_by: string | null;
}
