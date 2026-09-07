require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log("Fetching all songs from 'songs' table...");
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, soundcloud_id, title, artist, language, genre, streamable');
    
  if (error) {
    console.error('Error fetching songs:', error);
    return;
  }
  
  console.log(`Found ${songs.length} total songs.`);
  
  // Group by title to find duplicates
  const titleGroups = {};
  for (const song of songs) {
    const normTitle = song.title.trim().toLowerCase();
    if (!titleGroups[normTitle]) {
      titleGroups[normTitle] = [];
    }
    titleGroups[normTitle].push(song);
  }
  
  let duplicateCount = 0;
  
  console.log("\n--- Analyzing Duplicates by Title ---");
  for (const [title, group] of Object.entries(titleGroups)) {
    if (group.length > 1) {
      duplicateCount++;
      console.log(`\nDuplicate Title Found: "${group[0].title}" (${group.length} occurrences)`);
      group.forEach((song, i) => {
        console.log(`  ${i+1}. ID: ${song.id}`);
        console.log(`     Filename (soundcloud_id): ${song.soundcloud_id}`);
        console.log(`     Artist: ${song.artist}`);
        console.log(`     Language: ${song.language}, Genre: ${song.genre}`);
      });
      
      // Analyze reasons
      const files = group.map(s => s.soundcloud_id);
      const artists = group.map(s => s.artist);
      const uniqueArtists = new Set(artists).size;
      const hasMalayalamAndEnglish = group.some(s => s.language === 'malayalam') && group.some(s => s.language === 'english');
      
      console.log('  -> Reason Analysis:');
      if (files[0] !== files[1]) {
        console.log(`     Files are different on disk. File 1: "${files[0]}" vs File 2: "${files[1]}"`);
        if (hasMalayalamAndEnglish) {
          console.log(`     These represent two different tracks across different languages sharing the same title.`);
        } else if (uniqueArtists > 1) {
          console.log(`     Different artists produced tracks with the same name.`);
        } else {
          console.log(`     Different filenames (likely alternate versions or rips) uploaded for the exact same track/artist.`);
        }
      }
    }
  }
  
  console.log(`\nFound ${duplicateCount} titles with multiple entries.`);
}

run();
