import { createFileRoute } from "@tanstack/react-router";
import html from "@/site/academy.html?raw";
import { approvedDocument, approvedHead } from "@/lib/approved-website";

export const Route = createFileRoute("/academy.html")({
  head: () =>
    approvedHead(
      "The Awakened Academy · Self-Discovery with Carla Welch",
      "A welcoming home for self-discovery founded by Carla Welch: The Resiliency of the Human Spirit, Curiosity Café, and The Voidwalker Experience."
    ),
  server: { handlers: { GET: () => approvedDocument(html) } },
});
