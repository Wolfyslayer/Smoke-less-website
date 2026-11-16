# Privat nedladdningsförhandsvisning – driftsättning och säkerhetsgrind

## Status
Denna PR skapar **endast** en designförhandsvisning. Den är inte en autentiserad adminsida i sig. Ingen hosting eller Cloudflare Access är ännu konfigurerad. Merga inte i tron att ett dolt URL-sökvägsnamn ger skydd.

## Säker arkitektur
- Produktionswebbplatsen fortsätter på GitHub Pages, wolfyslayer.online, med normal `npm run build`. Den privata routen byggs **inte** utan `VITE_PRIVATE_DOWNLOAD_PREVIEW=true`.
- Skapa ett **separat Cloudflare Pages-projekt** för förhandsvisningen från denna webbgren. Byggkommando `npm run build`, output `dist`, environment variable `VITE_PRIVATE_DOWNLOAD_PREVIEW=true`. Använd en egen skyddad hostname/projektdomän; ändra inte befintlig DNS för wolfyslayer.online.
- Aktivera **Cloudflare Access för hela förhandsvisningens hostname**, inte enbart `/#/download-preview`. Fragment efter # skickas aldrig till servern och kan inte skyddas med en server-side path-policy. Använd One-time PIN till en uttryckligen tillåten e-postadress eller en befintlig IdP med allowlist. Blockera alla andra användare. Om Pages-projektet har flera domäner/alias, skydda eller inaktivera samtliga alternativa origins, inklusive *.pages.dev och deployment-/preview-URL:er. En offentlig alternativ URL skulle kringgå Access.
- Kontrollera i inkognitofönster att **varje** tillgänglig host kräver Access-inloggning innan något HTML/JS/CSS visas. Kontrollera att felaktig e-post nekas, rätt e-post får åtkomst och att inga andra hostnames kringgår skyddet.
- Testa därefter `/#/download-preview` på dator och telefon. Välj mellan Tillgänglig, Ingen release, Laddar och Fel. Den simulerade knappen är avstängd och ingen verklig APK-länk finns på sidan.
- Låt `public/updates/preview.json` på produktion vara `available:false`. Publicera inte GitHub Release-utkastet och aktivera inte webbmanifestet. Denna PR lägger inte till någon administrativ endpoint eller hemlighet.

## Gränser
Vite-buildvariabeln är **inte** ett säkerhetsskydd; endast Cloudflare Access framför en isolerad deployment är åtkomstkontrollen. Cloudflare Pages kan kräva en egen anslutning, domän och Access-policy som kontoägaren måste godkänna. Sidan får inte användas som skydd för verklig hälsodata, konton eller hemliga APK:er. Detta är simulerad metadata från en redan känd testbuild.

## Godkännandekriterier
- `npm run verify` grönt på PR.
- Vanlig produktionsbuild saknar routen /download-preview.
- Separat Preview-build visar routen, scenarioväljaren och inaktiv nedladdningsknapp.
- Cloudflare Access faktiskt konfigurerad och **verifierad från utloggad webbläsare på alla hostnames** innan preview-länken delas.
- Ingen förändring av produktionsmanifest, APK-release eller Android-app.
