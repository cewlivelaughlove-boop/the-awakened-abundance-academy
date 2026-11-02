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

- Keep the existing TanStack/React tooling and serve approved standalone documents through minimal GET handlers without React/CSS interference: this preserves document scripts, framing and same-origin navigation.
- Keep approved source documents unchanged in src/approved/v23 and retain the previous React pages: source fidelity and safe preservation take priority over converting the approved experience to components.
- Serve the supplied media parts as public static bytes and let the supplied browser loader reconstruct Blob URLs: this preserves original media without oversized repository files or external hosting.
