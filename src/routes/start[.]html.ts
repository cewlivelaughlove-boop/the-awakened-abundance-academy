import { createFileRoute } from "@tanstack/react-router";
import html from "@/approved/v23/start.html?raw";
import { approvedDocument, approvedHead } from "@/lib/approved-website";

export const Route = createFileRoute("/start.html")({
  head: () => approvedHead("Start Here: Make Room for Your Own Voice · Voidwalker Academy", "A quiet 3–5-minute practice: notice one belief, imagine another possibility, and choose one helpful action."),
  server: { handlers: { GET: () => approvedDocument(html) } },
});