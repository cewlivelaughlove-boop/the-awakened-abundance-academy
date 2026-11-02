import { createFileRoute } from "@tanstack/react-router";
import html from "@/approved/v23/boutique.html?raw";
import { approvedDocument, approvedHead } from "@/lib/approved-website";

export const Route = createFileRoute("/boutique.html")({
  head: () => approvedHead("The Voidwalker Boutique \u00b7 Academy", "Explore The Voidwalker Boutique, a concept room connected to Awakened Abundance Academy."),
  server: { handlers: { GET: () => approvedDocument(html) } },
});
