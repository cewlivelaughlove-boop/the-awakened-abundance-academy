import { Link } from "@tanstack/react-router";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Carla" },
  { to: "/courses", label: "Spiritual Courses" },
  { to: "/tarot", label: "Tarot & Guidance" },
  { to: "/abundance", label: "Abundance" },
  { to: "/community", label: "Community" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Sparkles className="size-5 text-primary" aria-hidden />
          <span className="font-display text-lg tracking-wide text-foreground sm:text-xl">
            Awakened Abundance
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-primary" }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background">
            <SheetHeader>
              <SheetTitle className="font-display text-xl">
                Awakened Abundance
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile">
              {NAV.map((item) => (
                <SheetClose asChild key={item.to}>
                  <Link
                    to={item.to}
                    activeProps={{ className: "text-primary" }}
                    className="rounded-md px-3 py-3 text-base text-foreground transition-colors hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
