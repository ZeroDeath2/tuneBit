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

  // Paginate through bucket to get all files
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
      if (data.length < 1000) nextToken = null; // No more pages
    } else {
      nextToken = null;
    }
  } while (nextToken);
  
  console.log(`Found ${bucketFiles.length} files in bucket.`);

  console.log("Fetching songs from 'songs' table...");
  const { data: songs, error: dbError } = await supabase
    .from('songs')
    .select('id, soundcloud_id, title');
    
  if (dbError) {
    console.error('Error fetching songs from DB:', dbError);
    return;
  }
  
  console.log(`Found ${songs.length} songs in DB.`);

  // Load the registry so we can map local_song_X to the actual filename
  const registryRaw = fs.readFileSync('./public/audio/registry.json', 'utf8');
  const registry = JSON.parse(registryRaw);

  let missingInBucket = [];
  let missingInDB = [];

  // 1. Check which DB songs are missing from the bucket
  for (const song of songs) {
    // If it's a local_song_X, map it to the actual filename using the registry
    let expectedFilename = song.soundcloud_id;
    if (registry[song.soundcloud_id]) {
      expectedFilename = registry[song.soundcloud_id].file;
    }

    if (!bucketFiles.includes(expectedFilename)) {
      missingInBucket.push({ ...song, expectedFilename });
    }
  }

  // 2. Check which Bucket files are missing from the DB
  // Create an array of all expected filenames from the DB
  const expectedFilenamesInDB = songs.map(s => {
    if (registry[s.soundcloud_id]) return registry[s.soundcloud_id].file;
    return s.soundcloud_id;
  });

  for (const file of bucketFiles) {
    if (!expectedFilenamesInDB.includes(file)) {
      missingInDB.push(file);
    }
  }

  console.log("\n--- Verification Results ---");
  if (missingInBucket.length > 0) {
    console.log(`⚠️  ${missingInBucket.length} songs in the database are MISSING from the storage bucket:`);
    missingInBucket.forEach(s => console.log(`  - DB ID: ${s.soundcloud_id} | Expected File: "${s.expectedFilename}" (${s.title})`));
  } else {
    console.log("✅ All songs in the database have a corresponding file in the storage bucket.");
  }

  if (missingInDB.length > 0) {
    console.log(`\n⚠️  ${missingInDB.length} files in the storage bucket are MISSING from the database:`);
    missingInDB.forEach(f => console.log(`  - ${f}`));
  } else {
    console.log("\n✅ All files in the storage bucket are mapped in the database.");
  }
}

run();
