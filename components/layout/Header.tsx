"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music2, BarChart3, Trophy, User } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Daily", icon: Music2 },
  { href: "/play", label: "Practice", icon: Music2, hideIcon: true },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 font-bold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          aria-label="TuneBit – go to home"
        >
          <Music2 className="w-5 h-5 text-primary" aria-hidden />
          <span>TuneBit</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                pathname === href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <AuthButton />
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t flex"
        aria-label="Mobile navigation"
      >
        {[
          { href: "/", label: "Daily", Icon: Music2 },
          { href: "/play", label: "Practice", Icon: Music2 },
          { href: "/leaderboard", label: "Board", Icon: Trophy },
          { href: "/stats", label: "Stats", Icon: BarChart3 },
          { href: "/profile", label: "Profile", Icon: User },
        ].map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              pathname === href
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
