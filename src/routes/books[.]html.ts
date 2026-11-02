import { createFileRoute } from "@tanstack/react-router";
import html from "@/approved/v23/books.html?raw";
import { approvedDocument, approvedHead } from "@/lib/approved-website";

export const Route = createFileRoute("/books.html")({
  head: () => approvedHead("Beyond the Script \u00b7 Voidwalker Academy", "A free spiritual reflection guide about imagination, meaningful creation and helping one another. Explore the book. Signup coming soon."),
  server: { handlers: { GET: () => approvedDocument(html) } },
});
