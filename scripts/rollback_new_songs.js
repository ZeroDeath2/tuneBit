require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log("Fetching all songs...");
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, soundcloud_id');
    
  if (error) {
    console.error('Error fetching songs:', error);
    return;
  }

  const toDelete = songs.filter(s => !s.soundcloud_id.startsWith('local_song_'));

  console.log(`Found ${toDelete.length} new records to delete.`);

  if (toDelete.length === 0) {
    console.log("Nothing to delete.");
    return;
  }

  // Delete in batches of 100
  let deletedCount = 0;
  for (let i = 0; i < toDelete.length; i += 100) {
    const batch = toDelete.slice(i, i + 100).map(s => s.id);
    const { error: delError } = await supabase
      .from('songs')
      .delete()
      .in('id', batch);
      
    if (delError) {
      console.error(`Error deleting batch ${i}:`, delError);
    } else {
      deletedCount += batch.length;
      console.log(`Deleted ${deletedCount}/${toDelete.length}...`);
    }
  }

  console.log(`Successfully rolled back ${deletedCount} new songs!`);
}

run();
