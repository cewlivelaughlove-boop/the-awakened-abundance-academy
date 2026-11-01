import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenText, Feather, NotebookPen, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/abundance")({
  head: () => ({
    meta: [
      { title: "Abundance Resources — The Awakened Abundance Academy" },
      {
        name: "description",
        content:
          "Practices, prompts, and reading from The Awakened Abundance Academy — daily ways to keep your alignment and abundance alive.",
      },
      {
        property: "og:title",
        content: "Abundance Resources — The Awakened Abundance Academy",
      },
      {
        property: "og:description",
        content:
          "Practices, prompts, and reading to keep your alignment and abundance alive.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Abundance,
});

const RESOURCES = [
  {
    icon: NotebookPen,
    title: "Journaling Prompts",
    description:
      "A rotating set of questions for self-inquiry — written to be answered honestly, not perfectly.",
    items: [
      "What would I do today if I trusted myself completely?",
      "Where in my life am I settling for enough, when more alignment is available?",
      "What does abundance look like for me — in time, in love, in peace?",
    ],
  },
  {
    icon: Wind,
    title: "Breath & Stillness Practice",
    description:
      "A five-minute practice for the start or end of any day — no experience needed, no apparatus required.",
    items: [
      "Four counts in, six counts out — ten rounds",
      "Name three things present with you right now",
      "Ask one honest question and simply listen",
    ],
  },
  {
    icon: BookOpenText,
    title: "The Reading List",
    description:
      "Books that shaped the academy's teaching — on intuition, alignment, and a life of enough.",
    items: [
      "Foundational texts on intuitive development",
      "Classics of abundance as inner work, not outer chase",
      "Poetry and reflection for the seeking seasons",
    ],
  },
  {
    icon: Feather,
    title: "Daily Devotions",
    description:
      "Small acts of attention that turn an ordinary day into a devotional one.",
    items: [
      "A morning intention before any screen",
      "An evening gratitude of three specifics",
      "A weekly walk taken without a destination",
    ],
  },
];

function Abundance() {
  return (
    <div>
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            Keep the practice alive
          </p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">
            Abundance Resources
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            Abundance is not a finish line — it is a way of moving through a
            day. These free practices keep the academy's teaching in your
            hands between courses and readings.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {RESOURCES.map((resource) => (
            <Card key={resource.title} className="bg-card/70">
              <CardHeader>
                <resource.icon className="size-7 text-primary" aria-hidden />
                <CardTitle className="font-display text-2xl">
                  {resource.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {resource.description}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-foreground/90">
                  {resource.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-primary" aria-hidden>
                        ✦
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-card/60 p-8 text-center">
          <h2 className="font-display text-2xl">Go deeper</h2>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-muted-foreground">
            The Abundant Spirit course is where these practices become a full
            journey — purpose, worth, and provision aligned.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/courses">See the Courses</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
