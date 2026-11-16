# Smoke Less – React-webbplats

Officiell webbplats för https://wolfyslayer.online.

## Teknik
React 19, TypeScript, Vite, Motion for React, React Router och CSS. Publiceras gratis via GitHub Pages.

## Lokal utveckling
```sh
npm install
npm run dev
npm run build
```

## Navigering
HashRouter används för att GitHub Pages saknar SPA-rewrites. Länkarna är `/#/download`, `/#/support`, `/#/privacy` och `/#/changelog`. Vi kan senare välja förgenererade sidor för rena URL:er och bättre SEO.

## Publicering
GitHub Actions bygger React till `dist/` och publicerar enbart byggresultatet på main. PR:er bygger men publicerar inte. `public/CNAME` bevarar domänen. Ingen ändring av Namecheap-DNS behövs för migreringen.

## APK och integritet
`public/updates/preview.json` kopieras till `/updates/preview.json`. `available: false` tills en signerad Preview APK verifierats. Integritetspolicyn är ett utkast; support och kontoradering behöver färdigställas före offentlig lansering.

## Kvar att göra
- Lägg till låst package-lock.json och byt till npm ci.
- Granska mobil/desktop, tangentbord och reduced motion.
- Byt illustrerad telefon mot verifierade appskärmbilder.
- SEO/prerendering och rena URL:er.

## Verifierad koppling till appens APK-release

Appens fas 29 publicerar preview.json och website-preview.json tillsammans med APK och SHA-256-fil. Webbplatsens manuella flöde kräver ett redan publicerat Preview-prerelease-taggnamn preview-build-N, oberoende verifierad APK-SHA-256 och faktisk Android-versionCode N.

Synkskriptet läser det publicerade appmanifestet, kontrollerar paket/projekt/kanal/runtime/version/certifikatformat, matchande tagg/filnamn, GitHubs asset-digest och den nedladdade APK-filens SHA-256. Därefter måste website-preview.json överensstämma i samtliga fält. Först då skrivs public/updates/preview.json. Äldre eller lika versionCode ersätts inte. Hämtning har tids-/storleksgränser; saknad, felaktig eller ofullständig release avbryter före filskrivning.

Detta startar inget appbygge och skickar inga tokens till appen. Inga manifest/länkar aktiveras av denna PR. Befintligt available:false behålls. Merge till main kan driftsätta webbplatskod via dess befintliga Pages-workflow och ska därför invänta uttryckligt beslut. Draft-PR:s CI bygger/testar utan deploy.

Tester: npm test och npm run verify. Verklig publicerad APK, nedladdning/uppgradering på Android, färdig integritetspolicy och bevakad support-/raderingsväg är fortsatt lanseringsgrindar. Driftansvarig är användaren; offentligt namn och supportretention behöver bekräftas. Den här ändringen påstår inte att kontoradering eller policy redan är slutgodkänd.
