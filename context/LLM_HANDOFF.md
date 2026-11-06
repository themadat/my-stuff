# Current state

Build 0.0.1.119 is prepared, verified, and uncommitted. Foldable iPhone UI batch: compact unfolded toolbars wrap actions without the desktop minimum width; phone editor fields, Notes, tag controls and copy locations reflow; touch inputs retain 16px minimum text; short screens scroll past filters; item dialogs use dynamic viewport height and safe-area padding. Narrow screens group Checklists/Lifetime above ownership and actions. No data/storage changes.

Verification: all 193 non-browser tests and 14 selected Chromium browser checks passed, including desktop/mobile Settings, enlarged text, toolbar ownership toggles, copies, bulk entry, editor tags/Lifetime, service-worker offline reload, and four new resize/draft/save cases (320, 466, 626, 890px). Screenshots reviewed for unfolded toolbar and phone editor. `git diff --check` passed. Version/cache surfaces aligned once with `scripts/release.mjs`. No commit or push performed. Preview server stopped.

Limits: no physical Duo/Safari validation; WebKit engine is not installed. Viewports cover display proportions, not confirmed Safari CSS dimensions. An extra historical test, “copy controls clear shared overrides, tags align with Notes, and Command Enter saves,” fails its old tags/Notes alignment assertion with the original HEAD CSS too; it assumes Notes still shares the Tags row. This unrelated test was left unchanged. Final selected release checks all passed.

# Constraints and pointers

Static local-first app; no runtime dependencies or required build. Preserve storage, recovery/import, optional GitHub Sync and PWA behavior. Follow AGENTS.md. Do not commit/push without explicit request.

Responsive changes: final section of `assets/css/app.css`. Regression tests: end of `tests/browser.test.mjs`. Version/identity and notes: `assets/js/config.js`. Release workflow: `docs/DEVELOPMENT.md`.

Node: `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`. Playwright: `/Users/stripes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs`. Browser checks need local preview on port 8765 and escalation for localhost/Chromium in this environment. Final browser log: `/tmp/duo-release-browser.log`.

No unfinished implementation work.
