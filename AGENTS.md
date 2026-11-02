<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Serve owner-approved standalone HTML through TanStack GET handlers with raw build-time imports, and keep its media in public/assets: this preserves document scripts, framing and same-origin navigation without replacing the existing React tooling.
- Keep approved source documents unchanged in src/approved/v23 and retain the previous React pages: source fidelity and safe preservation take priority over converting the approved experience to components.
