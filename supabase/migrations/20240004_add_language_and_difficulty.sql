ALTER TABLE public.songs ADD COLUMN language text DEFAULT 'english';

UPDATE public.songs
SET language = 'malayalam'
WHERE genre = 'malayalam';

DELETE FROM public.categories WHERE slug = 'malayalam';

ALTER TABLE public.game_sessions ADD COLUMN language text DEFAULT 'all';
ALTER TABLE public.game_sessions ADD COLUMN difficulty text DEFAULT 'normal';
