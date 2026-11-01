import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, HandCoins, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import heroImg from "@/assets/celestial-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "The Awakened Abundance Academy — Awaken to who you are",
      },
      {
        name: "description",
        content:
          "Begin with self-discovery. Spiritual courses, tarot and intuitive guidance, and abundance resources guided by Carla Welch.",
      },
      {
        property: "og:title",
        content: "The Awakened Abundance Academy — Awaken to who you are",
      },
      {
        property: "og:description",
        content:
          "Begin with self-discovery. Spiritual courses, tarot and intuitive guidance, and abundance resources guided by Carla Welch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const PILLARS = [
  {
    icon: Sparkles,
    title: "Know Yourself",
    body: "Every path here begins inward. Through reflection, ritual, and honest self-inquiry, you uncover who you truly are beneath the noise.",
  },
  {
    icon: HandCoins,
    title: "Trust Your Intuition",
    body: "Your inner voice is wiser than it gets credit for. You'll learn to hear it, test it, and let it guide your choices.",
  },
  {
    icon: BookOpen,
    title: "Live from Abundance",
    body: "When you are aligned with yourself, abundance follows as a natural extension of your teaching and your life.",
  },
];

const OFFERINGS = [
  {
    to: "/courses",
    title: "Spiritual Courses",
    body: "Guided journeys in intuition, moon work, and sacred everyday practice.",
  },
  {
    to: "/tarot",
    title: "Tarot & Intuitive Guidance",
    body: "Readings that hold up a mirror — clarity for the questions you carry.",
  },
  {
    to: "/abundance",
    title: "Abundance Resources",
    body: "Practices, prompts, and reading to keep your alignment alive daily.",
  },
];

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden">
        <img
          src={heroImg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            A sanctuary for the seeking soul
          </p>
          <h1 className="mt-6 font-display text-5xl leading-tight text-foreground sm:text-6xl">
            The Awakened Abundance Academy
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-foreground/80">
            Guided by Carla Welch, this is a place to awaken to who you are —
            and to discover that abundance is what follows when you live in
            truth.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/courses">Explore Courses</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/tarot">Book a Reading</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.3em] text-primary">
          The path
        </p>
        <h2 className="mt-4 text-center font-display text-3xl sm:text-4xl">
          A journey of self-discovery
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <Card key={pillar.title} className="bg-card/70">
              <CardHeader>
                <pillar.icon className="size-6 text-primary" aria-hidden />
                <CardTitle className="font-display text-2xl">
                  {pillar.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {pillar.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Offerings */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-center text-xs font-medium uppercase tracking-[0.3em] text-primary">
            What awaits you
          </p>
          <h2 className="mt-4 text-center font-display text-3xl sm:text-4xl">
            Three doors into the academy
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {OFFERINGS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <h3 className="font-display text-2xl text-foreground transition-colors group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
                <p className="mt-4 text-sm text-primary">Step through →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <Users className="mx-auto size-7 text-primary" aria-hidden />
        <h2 className="mt-5 font-display text-3xl sm:text-4xl">
          You don't have to walk alone
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
          The academy community gathers kindred spirits to share the journey —
          in circle, in study, and in celebration of every awakening.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/community">Join the Circle</Link>
        </Button>
      </section>
    </div>
  );
}
