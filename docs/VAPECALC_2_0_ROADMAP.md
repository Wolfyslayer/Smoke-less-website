# Vape Calculator 2.0 — one PR, six implementation phases

Scope: `apps/vape-calculator/` and strictly necessary integration scripts. No changes to Smoke Less admin, beta, Supabase roles or database migrations.

- [x] **1 — Stability/mobile:** localization of calculator validation errors, accurate count/status labels, number input spacing.
- [x] **2 — Recipe library:** search, nicotine/VG filters, recent/name sorting, favorites stored as optional `favorite` field in each user-owned recipe JSON.
- [x] **3 — Scaling and drafts:** preview/recalculate volumes, save a new scaled copy without changing the original, per-user/guest autosaved drafts stored only on the device.
- [x] **4 — Prices:** optional SEK/ml inputs for VG/PG, nicotine shots and concentrates; prices stored in optional recipe properties. No vendor integration.
- [x] **5 — Share/print:** opt-in recipe card with native Android share/copy and browser print/PDF. No automatic upload or public recipe links.
- [x] **6 — PWA:** install manifest and PNG icons, offline shell/JS/CSS cache scoped to `/vape-calculator/`. Signed-in cloud recipes still require network.

## Compatibility & safety

- Older recipes without `favorite`, `costs` or `pricePerMl` remain valid. Imports/exports remain in the current `vapecalc-recipes` version 1 format.
- The same signed-in Supabase Storage paths continue to be used, with no RLS changes or public access.
- Favorites and costs, when added, are part of user-owned recipe JSON; guest recipes remain locally stored.
- Drafts never leave local device storage and use separate keys per verified user ID or `guest`.
- Offline service worker **does not** cache `/vape-calculator/account/`, other site paths, Supabase traffic, private recipe responses, or authentication data.
- Printing uses the device browser's print-to-PDF functionality; no PDF server/dependency.
- No automatic migration or deletion of existing user recipes.

## Checks for manual review before merge

1. Guest + signed-in create/edit/save, favorite toggle, search/filter, import/export, delete and cross-device reload.
2. Scale a 60 ml recipe to 120 ml and verify doubled ingredient amounts; original remains unchanged.
3. Start a draft, reload, switch account, verify isolation, save and confirm local draft is cleared.
4. Set per-ml costs, test 0 mg/ml and PG/VG constraints, share via Android and print/save as PDF.
5. Test dark/light and Swedish/English mobile layouts; ensure error messages follow language.
6. Install PWA in Android browser, load it once online, then test calculators offline. Test signed-in cloud recipes offline fail safely and return on reconnection.
7. Verify Smoke Less login/beta/admin, homepage and the GitHub Pages deployment are unaffected.
