import { createFileRoute } from "@tanstack/react-router";
import html from "@/approved/v23/index.html?raw";
import { approvedDocument, approvedHead } from "@/lib/approved-website";

export const Route = createFileRoute("/")({
  head: () => approvedHead("Awakened Abundance Academy \u2014 Sanctuary", "Explore the Awakened Abundance Academy sanctuary, its library and adjoining boutique."),
  server: { handlers: { GET: () => approvedDocument(html) } },
});
