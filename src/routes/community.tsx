import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleDot, MoonStar, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — The Awakened Abundance Academy" },
      {
        name: "description",
        content:
          "The Awakened Abundance Academy community — a circle of kindred spirits gathering to share the journey of self-discovery.",
      },
      {
        property: "og:title",
        content: "Community — The Awakened Abundance Academy",
      },
      {
        property: "og:description",
        content:
          "A circle of kindred spirits gathering to share the journey of self-discovery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Community,
});

const GATHERINGS = [
  {
    icon: MessagesSquare,
    title: "The Circle",
    description:
      "An ongoing conversation where students and seekers share insights, questions, and encouragement — moderated to stay kind and safe.",
  },
  {
    icon: MoonStar,
    title: "Full Moon Gatherings",
    description:
      "A live gathering each full moon with Carla — reflection, release, and intention-setting together.",
  },
  {
    icon: CircleDot,
    title: "Study Pods",
    description:
      "Small groups walking the same course together, so no one studies alone unless they choose to.",
  },
];

function Community() {
  return (
    <div>
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            Walk together
          </p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">
            Community
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            Awakening is personal, but no one should have to do it alone. The
            academy community is a circle of kindred spirits — sharing the
            journey in study, in ritual, and in celebration.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {GATHERINGS.map((gathering) => (
            <Card key={gathering.title} className="bg-card/70">
              <CardHeader>
                <gathering.icon className="size-7 text-primary" aria-hidden />
                <CardTitle className="font-display text-2xl">
                  {gathering.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {gathering.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-primary/30 bg-card/60 p-10 text-center">
          <h2 className="font-display text-3xl">The circle opens soon</h2>
          <p className="mx-auto mt-4 max-w-lg leading-relaxed text-muted-foreground">
            The community is being lovingly prepared. Until the doors open,
            the best way to be ready is to begin your study — the courses are
            where every circle begins.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link to="/courses">Start with a Course</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
