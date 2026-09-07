const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1];
const SUPABASE_KEY = env.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.+)/)[1];
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1];

async function insertPuzzle() {
  const date = new Date().toISOString().split('T')[0];
  const res = await fetch(`${SUPABASE_URL}/rest/v1/daily_puzzles`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      puzzle_date: date,
      song_id: '9cc1c932-efb3-4d77-a3fd-27545fda451a',
      category_id: 'b09ad8a7-ddb1-4a08-9281-bfa4acb6f13f'
    })
  });
  console.log(await res.text());
}
insertPuzzle();
