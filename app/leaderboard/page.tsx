import type { Metadata } from "next";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "See who solved today's TuneBit gauntlet with the fewest attempts.",
};

export default function LeaderboardPage() {
  return <LeaderboardView />;
}
