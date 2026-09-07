ALTER TABLE public.leaderboard_entries ADD CONSTRAINT leaderboard_entries_user_id_fkey_profiles FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_stats ADD CONSTRAINT user_stats_user_id_fkey_profiles FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.game_sessions ADD CONSTRAINT game_sessions_user_id_fkey_profiles FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
