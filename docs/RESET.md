# Reset a copied foundation

The one-word `reset` workflow turns a copied application into a clean foundation for a different product. It intentionally removes product-specific features while retaining the reusable local-first shell.

## Preflight

1. Check `git status --short`, the repository path, and `git remote -v`.
2. Never transform the canonical source checkout or remote without explicit confirmation.
3. Require a clean tree unless all pending changes belong to the reset.
4. Resolve the new name, short name, slug, description, repository/support URL, and unique storage namespace.
5. Record exact deletion paths before removal; never touch `.git` or use an unresolved broad target.

## Keep

- Static dependency-free HTML, CSS, and JavaScript.
- Header, centered support search, blank semantic workspace, and one plain-text Notes modal.
- Vertical Settings, appearance, Help, What’s New, empty Roadmap, shortcuts, and Developer diagnostics.
- Local persistence, recovery, JSON portability, optional GitHub Sync, PWA/offline behavior, accessibility, responsive layout, install assets, and Pages deployment.
- The small inline interface-symbol helper and workflow contracts.

## Remove

- Product-specific data, generators, interfaces, state, migrations, storage payloads, shortcuts, styles, Help, releases, Roadmap entries, tests, samples, and documentation.
- Obsolete wish and plan documents.

## Rewrite

- Start application/build/cache/deployment versions at `0.0.1.1`.
- Apply the new identity everywhere and use unique state, secret, recovery, install, and sync identifiers.
- Keep Notes blank, the Roadmap empty, and What’s New limited to one dated initial release.
- Reset `context/WISHES.md` to `WISH-001` and rewrite public and agent documentation around the actual retained surface.
- Leave application artwork documented as a placeholder unless replacements were supplied.

## Boundaries and checks

Do not rewrite history, change remotes, create repositories, commit, push, or deploy without a separate request. Confirm removed product identifiers are absent, no unintended large file remains, all identity/version surfaces agree, scripts and manifests parse, references exist, layout works at desktop/mobile widths, Notes and Settings work, PWA offline reload succeeds, and the local server is stopped.
