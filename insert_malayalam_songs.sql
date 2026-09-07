
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

  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_101', 
    'Velmuruka', 
    'M. G. Sreekumar', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_102', 
    'Lajjavathiye', 
    'Jassie Gift, Kaithapram, Raju George', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_103', 
    'Chettikulangara - Version 1', 
    'M. G. Sreekumar', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_104', 
    'Jillam Jillala', 
    'Anwar Sadath, Afsal, Rimi Tomy', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_105', 
    'THULLICHAADU', 
    'Sai Zakaz, Rakz Radiant, Dan Pearson', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_106', 
    'Pistah', 
    'Rajesh Murugesan, Shabareesh Varma', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_107', 
    'Pazhanimala', 
    'M. G. Sreekumar', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_108', 
    'Thattum Muttum', 
    'Jassie Gift, Deepak Dev, Sindhuja Rajaram', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_109', 
    'Sona Sona', 
    'Kalabhavan Mani', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_110', 
    'Karuppinazhaku', 
    'Jyotsna, Rajesh', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_111', 
    'Kannamoochi ReRe', 
    'Sai Zakaz, Arcado', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_112', 
    'Vascodagama - Duet Version', 
    'Afsal, Rimi Tomy', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_113', 
    'Maangalyam - From "Bangalore Days"', 
    'Gopi Sundar, Vijay Yesudas, Sachin Warrier, Divya S Menon, Santhosh Varma', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_114', 
    'Chingamasam', 
    'Shankar Mahadevan, Rimi Tomy', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_115', 
    'Entammede Jimikki Kammal', 
    'Vineeth Sreenivasan, Renjith Unni', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_116', 
    'Chilamboli Katte', 
    'Udit Narayan, Sujatha', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_117', 
    'Dhum Dhum Dhum Dhum', 
    'K. S. Chithra, Sujatha', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_118', 
    'Alare Govinda', 
    'Nikhil', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_119', 
    'Raftaara - From "Lucifer"', 
    'Deepak Dev, Jyotsna', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_120', 
    'Kappa Kappa', 
    'C. J. Kuttappan, Sunil Mathai, Resmi Satheesh, Sri Charan', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_121', 
    'Kuttanadan', 
    'Madhu Balakrishnan, Kalabhavan Mani', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_122', 
    'Kesu', 
    'Vineeth Sreenivasan, Shweta Mohan', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_123', 
    'Oru Vallam Ponnum', 
    'M. G. Sreekumar, Sujatha', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_124', 
    'Kanne Kanne Veesathe', 
    'Swetha Ashok, Narayani Gopan, Nanda J Devan', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_125', 
    'Oru Madhura Kinavin - Retro Mix', 
    'Vijay Yesudas, Shaan Rahman', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_126', 
    'Penne En Penne', 
    'Afsal, Shalini Singh', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_127', 
    'Raara Venu', 
    'Kalyani Menon, K. S. Chithra', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_128', 
    'Pynapple Penne', 
    'FRANCO, Jyotsna', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_129', 
    'Freak Penne - From "Oru Adaar Love"', 
    'Sathyajith, Neethu Naduvathettu, Shaan Rahman', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_130', 
    'Sarike Ninne', 
    'K. S. Chithra, Sujatha', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_131', 
    'Chandhamama', 
    'Vidyasagar, Anitha Karthikeyan, RIJA', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_132', 
    'Dhil Dhil Salam Salam', 
    'M G Sreekumar', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_133', 
    'En Karalil - Version 1', 
    'Afsal, Franko', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_134', 
    'Kokkokko - Remix Version', 
    'Vineeth Sreenivasan', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_135', 
    'Karthaave', 
    'Shankar Mahadevan, Rimi Tomy', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_136', 
    'Punjirikku', 
    'Benny Dayal, Rimi Tomy', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_137', 
    'Madhumasam', 
    'M. G. Sreekumar, K. S. Chithra', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_138', 
    'Chandhanamani', 
    'M. G. Sreekumar', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_139', 
    'Thakilu Pukilu', 
    'M. G. Sreekumar, Prabhakaran, Mohanlal, Sujatha, Radhika Thilak', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_140', 
    'Ole Ole', 
    'Jassie Gift, Anitha Karthikeyan', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_141', 
    'Paandimelam - From "Rajamanikkam"', 
    'Pradeep Palluruthy, Alex Paul', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_142', 
    'Ninte Mizhimuna', 
    'Jassie Gift, Jyotsna Radhakrishnan, Kaithapram', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_143', 
    'Chirichukollunna Vande', 
    'Yuvan Shankar Raja, Jassie Gift, Sangeetha', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_144', 
    'Chakkaramaavinte - Version, 1', 
    'M. Jayachandran, Alex, Kaithapram', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_145', 
    'Rab Rab Rab', 
    'Shankar Mahadevan, Suchismitha, Sithara Krishnakumar', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_146', 
    'Awwa Awwaa', 
    'Vidyasagar, Mano, Swarnalatha', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_147', 
    'Confusion', 
    'M. G. Sreekumar', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_148', 
    'Chundathu', 
    'K. S. Chithra, Chitra Iyer', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_149', 
    'Kadukittu Varuthuru - Duet Version', 
    'K. S. Chithra', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_150', 
    'Ayalathe Veettile - From “Matinee”', 
    'Rashmi Satheesh', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_151', 
    'Vennakkallil', 
    'Vidhu Prathap, Biju Narayanan, Radhika Thilak', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_152', 
    'Jil Jil Jil', 
    'Vishnu Vijay, Varsha Renjith, Meera Prakash, Mu.Ri', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_153', 
    'Thinkale Poonthinkale', 
    'M. G. Sreekumar, Afsal', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_154', 
    'Manassil Midhuna (Duet)', 
    'M.G. Sreekumar,Radhika Thilak', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_155', 
    'Themma Themma Themmadikkatte - Version, 01', 
    'Jassie Gift, Jyotsna Radhakrishnan, Karthika, Kaithapram', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_156', 
    'Oottippattanam', 
    'K. S. Chithra', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_157', 
    'Markazhiye Mallikaye (From “Megham”)', 
    'M. G. Sreekumar, Srinivas, K. S. Chithra', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_158', 
    'Aaha Manoranjini', 
    'M. G. Sreekumar', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_159', 
    'Maliniyude Theerangal', 
    'M. G. Sreekumar, Sujatha', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_160', 
    'Ollulleru', 
    'Justin Varghese, Praseetha Chalakudy', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_161', 
    'Aadeda Aattam Nee', 
    'Shaan Rahman', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_162', 
    'Kalapakkaara (From "King of Kotha")', 
    'Jakes Bejoy, Shreya Ghoshal, Benny Dayal, Fejo, Joe Paul', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_163', 
    'Prayam Nammil', 
    'Vidyasagar, P. Jayachandran, Sujatha', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_164', 
    'Visile Visile', 
    'Ganga, Alex', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_165', 
    'Maattupetti Koyilile', 
    'Afsal, Chitra Iyer', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;
  INSERT INTO public.songs (
    soundcloud_id, 
    title, 
    artist, 
    artwork_url, 
    streamable, 
    category_id
  ) VALUES (
    'local_song_166', 
    'Nandalala Hey Nandalala (From "Independence")', 
    'Swarnalatha, Suresh Peters', 
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop', 
    true, 
    v_category_id
  ) ON CONFLICT (soundcloud_id) DO UPDATE SET
    title = EXCLUDED.title,
    artist = EXCLUDED.artist,
    category_id = EXCLUDED.category_id;

END $$;
