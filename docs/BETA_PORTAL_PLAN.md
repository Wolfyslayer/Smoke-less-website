# Integrationsnotering 2026-11-19
Denna plan hämtades från betaportal-PR #23. I den samlade webbplatsen är de faktiska rutterna `/smoke-less/beta/`, `/smoke-less/admin/`, `/smoke-less/account/` och gemensam återställning `/recoverpassword/`. Delade Supabase-konton sköts av `src/auth/`; föråldrade hänvisningar till `/admin`, `/beta` och en egen inloggning i nedanstående historiska plan gäller inte längre. Betamigreringarna måste installeras manuellt och testas innan behörigheter kan användas. Ingen privat APK-nedladdning är aktiverad.

---

# Smoke Less – beta portal (W1 architecture audit)

Status: planning only. No beta access, public download, or release activation.

## Existing main
- React 19 / TypeScript / Vite static site; React Router HashRouter, hosted with GitHub Pages according to README. Confirm actual deployment provider before changing deployment.
- `src/App.tsx` currently implements `/#/download` and loads `/updates/preview.json`.
- The existing preview manifest is validated for a **public GitHub Releases APK URL**. This is not an access-control mechanism.
- `/#/privacy` explicitly remains an unfinished privacy policy; support is `contact@wolfyslayer.online`.
- Existing private download preview PR #22 is separate; reuse its layout only after checking differences against main.

## Desired user-facing behavior
- Public website and application form remain reachable.
- Modes: `closed`, `beta`, `release`; defaults to `closed` on missing/invalid configuration or backend failure.
- In `beta` mode, verified applicants can sign in, but **only explicitly approved testers** may request a download.
- Admin can review applications, approve/reject/revoke users, select an approved APK candidate, edit release notes, and switch the site's mode.
- `release` mode is **not** a bypass: it requires an independently verified app release approval, exact signed APK artifact metadata and an explicit admin confirmation.
- Changes to settings live in Supabase and do not require commits or redeploys; `main` remains the source of site code.
- App's existing Firebase Authentication/Firestore and user health-related data are unaffected.

## Security design
- Supabase Auth for email verification and sessions; restrict administrative privilege with server-controlled authorization and MFA where supported.
- Database tables for applicants, membership/approval, release candidates, and settings, with RLS and explicit server-side admin checks. Users may only see their own application/status; admin privilege must not be self-assignable.
- Store APK in a **private** bucket. An authenticated Edge Function checks membership, mode, active artifact and release gates on every download request before issuing a short-lived signed URL. Never expose a service-role key to the browser.
- No permanent public GitHub asset link for beta; avoid static `preview.json` containing a public beta APK URL. Existing GitHub release automation must be reviewed before modifying it.
- A signed URL may be shared during its short validity; revoking a tester blocks new URLs, not already downloaded APKs. Add rate limits, audit events, file-size/cost checks and clear retention.
- Validate uploaded artifact SHA-256, Android package, versionCode, signing certificate, provenance and candidate approval before enabling download. Never auto-publish when CI passes.
- Fail closed if Supabase is unavailable, settings are missing, or approval is not verified.
- Avoid collecting smoking/health details in beta application forms.

## Incremental delivery plan
- [x] W1. Audit current main and document architecture and migration constraints.
- [ ] W2. Supabase schema, RLS, email auth, admin authorization and tests.
- [ ] W3. Public beta application + verification and admin approval flow.
- [ ] W4. Private APK storage, validated candidate metadata and gated download function.
- [ ] W5. Admin-controlled closed/beta/release modes with independent release gate.
- [ ] W6. Approved tester portal and version/update UX.
- [ ] W7. Accessibility, abuse/security tests, failure modes, privacy/retention and end-to-end QA.
- [ ] W8. Review/merge to main only after checks and explicit approval.

## Decisions and dependencies
- Confirm Supabase project credentials and site deployment environment before integration. Do not commit secrets.
- Check APK size against Supabase plan file-size limits and egress/storage costs before choosing Storage.
- Coordinate app PR #173 (security) and #181 (APK provenance/publishing); neither is automatically approved by this website PR.
- Keep public download disabled; do not remove Cloudflare Access from the existing private preview until replacement access controls have been verified.
