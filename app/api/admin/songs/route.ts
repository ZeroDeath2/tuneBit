import { NextResponse } from "next/server";
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { z } from "zod";

const AddSongSchema = z.object({
  soundcloudId: z.string().min(1),
  title: z.string().min(1).max(200),
  artist: z.string().min(1).max(200),
  album: z.string().max(200).optional(),
  artworkUrl: z.string().url().optional(),
  genre: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json() as unknown;
  const parsed = AddSongSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const serviceClient = createServiceRoleClient();

  const { data, error } = await serviceClient
    .from("songs")
    .upsert({
      soundcloud_id: parsed.data.soundcloudId,
      title: parsed.data.title,
      artist: parsed.data.artist,
      album: parsed.data.album ?? null,
      artwork_url: parsed.data.artworkUrl ?? null,
      genre: parsed.data.genre ?? null,
      streamable: true,
    }, { onConflict: "soundcloud_id" })
    .select("id")
    .single();

  if (error) {
    console.error("[/api/admin/songs] upsert error:", error);
    return NextResponse.json({ error: "Failed to add song" }, { status: 500 });
  }

  return NextResponse.json({ id: data?.id }, { status: 201 });
}

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceClient = createServiceRoleClient();
  const { data: songs, error } = await serviceClient
    .from("songs")
    .select("id, soundcloud_id, title, artist, artwork_url, streamable, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }

  return NextResponse.json({ songs: songs ?? [] });
}
