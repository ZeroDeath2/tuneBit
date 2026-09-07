"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogIn, LogOut, User } from "lucide-react";

export function AuthButton() {
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        aria-label="Sign in with Google"
      >
        <LogIn className="w-4 h-4" aria-hidden />
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[140px]">
        {user.email}
      </span>
      <button
        onClick={signOut}
        className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-accent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" aria-hidden />
        <span className="sr-only">Sign out</span>
      </button>
    </div>
  );
}
