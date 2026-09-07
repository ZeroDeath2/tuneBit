require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log("Fetching files from Supabase Storage 'audio' bucket...");
  let bucketFiles = [];
  let nextToken = null;

  do {
    const { data, error } = await supabase.storage.from('audio').list('', { 
      limit: 1000, 
      offset: nextToken ? nextToken : 0 
    });
    if (error) {
      console.error('Error listing bucket:', error);
      return;
    }
    if (data && data.length > 0) {
      bucketFiles = bucketFiles.concat(data.map(f => f.name).filter(n => n !== '.emptyFolderPlaceholder'));
      nextToken = nextToken ? nextToken + data.length : data.length;
      if (data.length < 1000) nextToken = null;
    } else {
      nextToken = null;
    }
  } while (nextToken);

  const { data: songs, error: dbError } = await supabase.from('songs').select('id, soundcloud_id');
  if (dbError) {
    console.error('Error fetching songs from DB:', dbError);
    return;
  }

  const registryRaw = fs.readFileSync('./public/audio/registry.json', 'utf8');
  const registry = JSON.parse(registryRaw);

  const missingIds = [];
  
  for (const song of songs) {
    let expectedFilename = song.soundcloud_id;
    if (registry[song.soundcloud_id]) {
      expectedFilename = registry[song.soundcloud_id].file;
    }
    
    if (!bucketFiles.includes(expectedFilename)) {
      missingIds.push(song.id);
    }
  }

  console.log(`Found ${missingIds.length} songs to delete from database.`);

  if (missingIds.length > 0) {
    // Also delete references in daily_puzzles before deleting songs
    const { error: dpError } = await supabase.from('daily_puzzles').delete().in('song_id', missingIds);
    if (dpError) {
        console.error('Error cleaning daily puzzles:', dpError);
    }

    const { error: delError } = await supabase
      .from('songs')
      .delete()
      .in('id', missingIds);
      
    if (delError) {
      console.error('Error deleting missing songs:', delError);
    } else {
      console.log(`✅ Successfully deleted ${missingIds.length} songs from the database!`);
    }
  }

  // Also remove from registry
  let registryChanged = false;
  const newRegistry = { ...registry };
  for (const key in newRegistry) {
    if (!bucketFiles.includes(newRegistry[key].file)) {
      delete newRegistry[key];
      registryChanged = true;
    }
  }
  
  if (registryChanged) {
    fs.writeFileSync('./public/audio/registry.json', JSON.stringify(newRegistry, null, 2));
    console.log("✅ Removed missing files from local registry.json");
  }
}

run();
