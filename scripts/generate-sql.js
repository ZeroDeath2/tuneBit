const fs = require('fs');
const path = require('path');

const registryPath = path.join(process.cwd(), "public/audio/registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

const songs = Object.values(registry).filter(s => s.genre === "malayalam");

let sql = `
-- 1. Ensure the malayalam category exists
INSERT INTO public.categories (label, slug, description) 
VALUES ('Malayalam', 'malayalam', 'Malayalam Dance Hits') 
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert the songs
DO $$
DECLARE
  v_category_id uuid;
BEGIN
  SELECT id INTO v_category_id FROM public.categories WHERE slug = 'malayalam';

`;

for (const s of songs) {
  const normTitle = s.title.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normArtist = s.artist.toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeTitle = s.title.replace(/'/g, "''");
  const safeArtist = s.artist.replace(/'/g, "''");
  
  sql += `  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    '${s.id}', 
    '${safeTitle}', 
    '${safeArtist}', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    ${s.streamable !== false ? 'true' : 'false'}, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
`;
}

sql += `
END $$;
`;

fs.writeFileSync('insert_malayalam_songs.sql', sql);
console.log("SQL script successfully generated! Open 'insert_malayalam_songs.sql' to copy the SQL.");
