import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  
  const { data, count } = await db.from("songs").select("*", { count: "exact" });
  console.log(`Songs in Supabase: ${count}`);
  
  const { data: puzzles, count: pCount } = await db.from("daily_puzzles").select("*", { count: "exact" });
  console.log(`Puzzles in Supabase: ${pCount}`);
}

main().catch(console.error);
