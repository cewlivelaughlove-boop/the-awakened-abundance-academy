import { createFileRoute, Link } from "@tanstack/react-router";
import { Moon, Flame, Sunrise, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Spiritual Courses — The Awakened Abundance Academy" },
      {
        name: "description",
        content:
          "Guided spiritual courses in intuition, moon work, and sacred everyday practice — journeys of self-discovery with Carla Welch.",
      },
      {
        property: "og:title",
        content: "Spiritual Courses — The Awakened Abundance Academy",
      },
      {
        property: "og:description",
        content:
          "Guided spiritual courses in intuition, moon work, and sacred everyday practice with Carla Welch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Courses,
});

const COURSES = [
  {
    icon: Compass,
    title: "Awakening the Inner Voice",
    length: "6 weeks",
    level: "All levels",
    description:
      "The foundation journey. Learn to quiet the noise, hear your intuition, and tell the difference between fear and inner knowing.",
  },
  {
    icon: Moon,
    title: "Moon Cycles & Manifestation",
    length: "4 weeks",
    level: "All levels",
    description:
      "Work with the lunar rhythm — setting intentions at the new moon, releasing at the full moon, and aligning your goals with natural cycles.",
  },
  {
    icon: Flame,
    title: "The Abundant Spirit",
    length: "8 weeks",
    level: "For graduates of Awakening the Inner Voice",
    description:
      "The academy's signature course. Align purpose, worth, and provision — so abundance becomes an extension of your teaching, not a chase.",
  },
  {
    icon: Sunrise,
    title: "Sacred Rituals for Everyday Life",
    length: "Self-paced",
    level: "All levels",
    description:
      "Small, doable rituals for morning, work, and rest that keep you anchored in yourself through an ordinary week.",
  },
];

function Courses() {
  return (
    <div>
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            Study with Carla
          </p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">
            Spiritual Courses
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            Each course is a guided journey inward — taught live, kept small,
            and rooted in the conviction that self-discovery comes first and
            abundance follows.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {COURSES.map((course) => (
            <Card key={course.title} className="bg-card/70">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <course.icon className="size-7 text-primary" aria-hidden />
                  <Badge variant="secondary">{course.length}</Badge>
                </div>
                <CardTitle className="font-display text-2xl">
                  {course.title}
                </CardTitle>
                <CardDescription>{course.level}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {course.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-card/60 p-8 text-center">
          <h2 className="font-display text-2xl">Not sure where to begin?</h2>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-muted-foreground">
            Most students start with Awakening the Inner Voice. If you'd like
            a feel for Carla's teaching first, a single reading is a gentle
            doorway in.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/tarot">Explore Readings</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
