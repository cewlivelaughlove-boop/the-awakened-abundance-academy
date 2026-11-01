import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/celestial-hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Carla — The Awakened Abundance Academy" },
      {
        name: "description",
        content:
          "Meet Carla Welch — teacher, guide, and founder of The Awakened Abundance Academy, walking beside you on the path of self-discovery.",
      },
      { property: "og:title", content: "About Carla — The Awakened Abundance Academy" },
      {
        property: "og:description",
        content:
          "Meet Carla Welch — teacher, guide, and founder of The Awakened Abundance Academy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const GUIDING_LIGHTS = [
  {
    title: "Presence over performance",
    body: "Teaching that meets you where you are, not where a syllabus says you should be.",
  },
  {
    title: "Intuition as a compass",
    body: "Every lesson strengthens your ability to hear and trust your own inner knowing.",
  },
  {
    title: "Abundance as alignment",
    body: "We never chase wealth as a goal — we align with ourselves and watch what flows.",
  },
];

function About() {
  return (
    <div>
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            Your guide
          </p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">
            About Carla
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[3fr_2fr]">
        <div className="space-y-6 leading-relaxed text-muted-foreground">
          <p className="text-lg text-foreground">
            Carla Welch is a teacher and intuitive guide who believes that the
            most important journey anyone can take is the one inward.
          </p>
          <p>
            For years she has walked beside seekers — through spiritual study,
            tarot, and quiet one-to-one conversations — helping them uncover
            who they are beneath expectation and noise. Her teaching is not
            about becoming someone new; it is about remembering what was
            always yours.
          </p>
          <p>
            The Awakened Abundance Academy was born from a simple conviction:
            when you truly know yourself, your intuition sharpens, your
            purpose clarifies, and abundance stops being something you chase.
            It becomes the natural extension of a life lived in truth.
          </p>
          <p className="border-l-2 border-primary/50 pl-4 font-display text-lg italic text-foreground">
            "I am not here to promise you wealth. I am here to walk with you
            until you recognize your own light — everything else follows."
          </p>
          <div className="pt-4">
            <Button asChild>
              <Link to="/courses">Explore the Courses</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <img
            src={heroImg}
            alt="A golden crescent moon over a starlit sky"
            className="w-full rounded-lg border border-border object-cover"
          />
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-xl">What guides the work</h2>
            <ul className="mt-4 space-y-4">
              {GUIDING_LIGHTS.map((light) => (
                <li key={light.title}>
                  <p className="font-medium text-foreground">{light.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {light.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
