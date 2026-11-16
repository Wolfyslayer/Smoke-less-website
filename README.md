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
