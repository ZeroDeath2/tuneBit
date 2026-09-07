import type { Metadata } from "next";
import { StatsView } from "@/components/stats/StatsView";

export const metadata: Metadata = {
  title: "Statistics",
  description: "Your TuneBit game statistics and streaks.",
};

export default function StatsPage() {
  return <StatsView />;
}
