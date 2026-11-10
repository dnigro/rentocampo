# RentoCampo — engineering maintenance standards

## One source of truth

- The public homepage is rendered by `LandingPageContent` → `LandingFigmaHome` → `SimpleMapChatHero` → `HomePremiumHero`. The Lite variant remains in `SimpleMapChatHero(lite=true)`.
- The approved public desktop hero lives in `styles/home-premium.css`. Prefer editing existing selectors in their current responsive scope rather than appending a new override.
- FAQ (`.rcf-faq*`) rules were extracted from the retired mixed hero bundle into `styles/landing-faq.css`; the unused `.rcf-hero*` rules were removed.
- Shared header/footer rules live in `styles/shared-site-shell.css`. Check web, mobile and Lite when changing them.
- `app/globals.css` currently applies `html { zoom: .8 }` on wide viewports; the public landing overrides it. Removing it is a **visual redesign**, not a safe cleanup: review all internal routes and screenshots before attempting it.

## Safe change sequence

1. Create a feature branch. Do not modify `main` while exploring.
2. Keep each refactor behavior-preserving, with a narrow diff and clear rationale.
3. Run `npm ci`, `npm run lint`, `npm run test`, and `npm run build`.
4. Review the Vercel preview on desktop, mobile, Lite and ES/PT/EN; check both 701px and 1024px breakpoints.
5. Merge only after CI succeeds. Confirm the production deployment separately.

## Guardrails

- Keep RLS, authorization, public/private keys, and regional routing unchanged during visual refactors.
- No blanket deletion of CSS by filename, no global search-and-replace of `!important`, no automatic `npm audit fix --force`.
- Unit tests must assert current product behavior and visible copy, not obsolete snapshots or incidental comments.
- Any new `*.test.mjs` is automatically included in `npm run test` and the Quality workflow.
- Security audit results are tracked independently; a successful reporting job does **not** mean zero vulnerabilities.

## Follow-up debt (requires visual verification)

- Gradually split the old mixed hero/FAQ stylesheet into explicitly owned modules.
- Consolidate older page-level overrides in `site-theme.css` and `shared-site-shell.css`.
- Replace the global desktop `zoom` rule with component-level spacing after visual baselines are approved.
- Review `npm audit` findings individually, prioritizing reachable production dependencies and avoiding breaking upgrades.
