require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: cats } = await supabase.from('categories').select('*');
  console.log('Categories:', cats);
  const { data: puzzles } = await supabase.from('daily_puzzles').select('*');
  console.log('Puzzles:', puzzles);
}
run();
