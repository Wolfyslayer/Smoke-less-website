# Wolfyslayer – project hub and Smoke Less

Det här repot är den enda GitHub Pages-källan för https://wolfyslayer.online/.

## Webbadresser

- https://wolfyslayer.online/ – gemensam projektöversikt (svenska / engelska; mörkt/ljust).
- https://wolfyslayer.online/smoke-less/ – Smoke Less och tidigare Preview-flöde.
- https://wolfyslayer.online/vape-calculator/ – Vape Calculator, nikotinkalkylatorer och DIY-recept.

Alla tre publiceras i en GitHub Pages-artifact. Ingen ny subdomän, Cloudflare-worker eller DNS-ändring krävs.

## Utveckling och CI

Node.js 22, React 19, TypeScript, Vite.

    npm install
    npm run dev
    npm run verify

Vite bygger nav / projektöversikt och Smoke Less. scripts/bundle-multi-site.mjs skapar dist/smoke-less/index.html och bygger apps/vape-calculator med egen Vite-config till dist/vape-calculator. Den befintliga Preview-signaturkontrollen är kvar och dist/updates/preview.json fortsätter att fungera i samma sökväg som tidigare.

## Projektkällor

Smoke Less-webbplatsen och huvuddomänen byggs här. Vape Calculator har primär källkod i Wolfyslayer/vape-calculator och speglas i apps/vape-calculator/ i detta repo. När kalkylatorn utvecklas behöver spegeln synkroniseras. GitHub Pages kan inte publicera båda repona separat under samma domän utan en gemensam bygg- och publiceringspunkt.

## Navigation och språk

Gemensam hamburger-meny och språk-dropdown Svenska / English på projektöversikten och Smoke Less. Stänger vid sidval, Escape och klick på överlägg. En egen matchande meny finns i Vape Calculator. Alla tre använder samma språknyckel wolfyslayer:language i localStorage. Kalkylatorn är tvåspråkig; återstående specialtexter i Smoke Less kräver kompletterande språkgranskning.

## Varning om publicering

Endast merge till main publicerar automatiskt. Den här PR:en bygger/testar men publicerar ingenting. Håll Preview-appens APK-nedladdning avstängd tills manifest och signerad APK verifierats. Integritetstext och kontoradering återstår före offentlig Smoke Less-release.

## Supabase-webbkonton och molnrecept

Se [docs/SUPABASE_WEBSITE_AUTH_RECIPES.md](docs/SUPABASE_WEBSITE_AUTH_RECIPES.md) för kod, enskild privat Storage-bucket med användarisolering, manuellt migrationssteg, e-postmallar, testplan och integritetskrav. Webbplatsens Supabase-konto är skilt från Android-appens Firebase-konto. Inget i denna PR aktiverar offentlig APK-nedladdning.

## Smoke Less beta och skyddad admin

Samma Supabase-webbkonto används på alla tre sektionerna. Smoke Less visar betastatus enbart på `/smoke-less/account/`; skyddad admin finns enbart på `/smoke-less/admin/` och betaprogrammet på `/smoke-less/beta/`. Tidigare `/admin/` och `/beta/` omdirigeras. Vape Calculator-behållna receptlänkar återupptas efter inloggning med säkert `returnTo`. Se [integrations- och säkerhetsguiden](docs/BETA_PORTAL_INTEGRATION.md) för Supabase-migreringar, manuell adminstart och testkrav. Ingen privat APK-nedladdning aktiveras av detta arbete.
