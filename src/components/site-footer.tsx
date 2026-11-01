import { Link } from "@tanstack/react-router";
import { MoonStar } from "lucide-react";

const NAV = [
  { to: "/about", label: "About Carla" },
  { to: "/courses", label: "Spiritual Courses" },
  { to: "/tarot", label: "Tarot & Guidance" },
  { to: "/abundance", label: "Abundance" },
  { to: "/community", label: "Community" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <MoonStar className="size-5 text-primary" aria-hidden />
            <span className="font-display text-xl tracking-wide">
              The Awakened Abundance Academy
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            A sanctuary for the seeking soul — courses, readings, and
            resources that begin with self-discovery and let abundance
            follow naturally.
          </p>
          <p className="mt-6 font-display text-sm italic text-primary/80">
            Abundance is a byproduct of alignment, never a promise of wealth.
          </p>
        </div>
        <nav className="flex flex-col gap-3" aria-label="Footer">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} The Awakened Abundance Academy. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
}
