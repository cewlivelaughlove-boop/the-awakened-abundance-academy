import { createFileRoute } from "@tanstack/react-router";
import { eventPage } from "@/content/event-page";
import { approvedDocument, approvedHead } from "@/lib/approved-website";

export const Route = createFileRoute("/join.html")({
  head: () => approvedHead("Stay connected with Carla · Voidwalker Academy", "Join Carla’s email list for updates and news about her upcoming free reflection guide."),
  server: { handlers: { GET: () => approvedDocument(eventPage) } },
});
