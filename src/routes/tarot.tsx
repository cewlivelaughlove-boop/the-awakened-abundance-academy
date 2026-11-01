import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, KeyRound, MoonStar, MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/tarot")({
  head: () => ({
    meta: [
      { title: "Tarot & Intuitive Guidance — The Awakened Abundance Academy" },
      {
        name: "description",
        content:
          "Tarot and intuitive readings with Carla Welch — clarity for the questions you carry, offered as a mirror rather than a verdict.",
      },
      {
        property: "og:title",
        content: "Tarot & Intuitive Guidance — The Awakened Abundance Academy",
      },
      {
        property: "og:description",
        content:
          "Tarot and intuitive readings with Carla Welch — clarity for the questions you carry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tarot,
});

const READINGS = [
  {
    icon: MessageCircleHeart,
    title: "Single Question Reading",
    description:
      "One question, answered with care. A focused reading for the decision or crossroads sitting closest to your heart.",
  },
  {
    icon: Eye,
    title: "Full Life Reading",
    description:
      "A broader look at where you are and what's asking to grow — covering love, work, purpose, and the season of life you're in.",
  },
  {
    icon: KeyRound,
    title: "Intuitive Guidance Session",
    description:
      "Less about the cards, more about the conversation. Carla reads the cards as a doorway into the guidance you already carry.",
  },
  {
    icon: MoonStar,
    title: "Monthly Moon Reading",
    description:
      "A recurring reading at each new moon — a gentle check-in to set intentions and walk the month with intention.",
  },
];

function Tarot() {
  return (
    <div>
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            Readings
          </p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">
            Tarot &amp; Intuitive Guidance
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            A reading with Carla is not a fortune told — it is a mirror held
            up. The cards open the conversation; your own knowing does the
            guiding.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {READINGS.map((reading) => (
            <Card key={reading.title} className="bg-card/70">
              <CardHeader>
                <reading.icon className="size-7 text-primary" aria-hidden />
                <CardTitle className="font-display text-2xl">
                  {reading.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {reading.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-card/60 p-8 text-center">
          <h2 className="font-display text-2xl">Booking opens soon</h2>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-muted-foreground">
            The reading calendar is being prepared. In the meantime, explore
            the courses or say hello in the community — you'll be the first
            to know when bookings open.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/community">Visit the Community</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
