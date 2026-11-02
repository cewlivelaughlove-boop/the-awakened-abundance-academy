import { createFileRoute } from "@tanstack/react-router";
import html from "@/approved/v23/library.html?raw";
import { approvedDocument, approvedHead } from "@/lib/approved-website";

export const Route = createFileRoute("/library.html")({
  head: () => approvedHead("The Library \u00b7 Voidwalker Academy", "A quiet collection for reflection, imagination and meaningful creation. Begin with Beyond the Script."),
  server: { handlers: { GET: () => approvedDocument(html) } },
});
