# scrollcraft engine (vendored)

From https://github.com/nateherkai/scroll-craft (MIT, © 2026 Nate Herk), skill version 0.3.1, commit 75d81f7.
`scrollcraft.js` and `scrollcraft.css` are copied unmodified — the engine is the mechanism and is not edited per project.

How TIGI uses it:
- `scrollcraft.css` is imported into its own lowest-priority cascade layer (`@layer scrollcraft`, see `src/app/globals.css`),
  so its reset never overrides the site's base styles; TIGI's colour and font tokens override `--sc-*` in globals.css.
- `src/components/motion/scrollcraft-stage.tsx` loads the engine on the client and mounts it on a page root
  (`ScrollCraft.mount(el)`), re-lays out when the content resizes, and calls `destroy()` on route change.
- Pages mark up their own HTML with `data-sc-*` attributes (act, stage, cue, kinetic, count, reveal, pan, parallax, in).
