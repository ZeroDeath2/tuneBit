import { DailyGame } from "@/components/game/DailyGame";

export default async function PlayLanguagePage({ params }: { params: Promise<{ language: string }> }) {
  const { language } = await params;
  return <DailyGame language={language} />;
}
