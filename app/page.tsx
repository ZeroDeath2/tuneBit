import { HomeTiles } from "@/components/home/HomeTiles";
import { createServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  return <HomeTiles isSignedIn={!!session} />;
}
