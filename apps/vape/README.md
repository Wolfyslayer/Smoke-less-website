# VapeCalc — React e-liquid calculator

Svensk/engelsk React-webbplats med orange accentfärg, mörkt/ljust tema, mobilanpassad animerad hamburger-meny och språk-dropdown.

## URL och arkitektur

Webbplatsen ska visas under **https://wolfyslayer.online/vape-calculator/**. Den gemensamma domänen och GitHub Pages-publiceringen ägs av \`Wolfyslayer/Smoke-less-website\`. **Den här källkodsrepon ska inte själv sätta ett CNAME eller skriva över publiceringen.** Smoke Less ligger under \`/smoke-less/\` och hubben under \`/\`.

För närvarande speglas calculator-källan i \`Smoke-less-website/apps/vape-calculator\` och byggs tillsammans med hubben. Ändringar här måste synkroniseras till spegelmappen innan de syns på huvuddomänen.

## Funktioner

- Nikotinstyrka: befintlig nikotinfri e-juice + antal shots, shotvolym och shotstyrka.
- Shotplanerare: målstyrka för befintlig bas **eller** fast slutvolym; skiljer exakt använd shotvolym från antal hela flaskor att ha tillgängliga.
- DIY-studio: färdig totalvolym, målstyrka, shotsens VG-halt, önskad PG/VG, upp till 20 aromer med egna PG/VG-halter och aromprocent.
- Recept: skapa, redigera, kopiera, ta bort, exportera/importera versionerad JSON. \`localStorage\` per webbläsare, ingen molnserver.
- Språkval: svenska / engelska, sparas lokalt.
- Tillgänglighet: etiketter för fält, tangentbordsnavigerbar sidomeny, stäng via Escape eller bakgrund, fokusfälla och reduced-motion.
- Design: responsiva kort, orange accenter, mörkt/ljust tema.

## Utveckling

Node 22+. Kör:

    npm install
    npm run dev
    npm test
    npm run build

Fristående lokal utveckling fungerar, men Vite använder basen \`/vape-calculator/\` för produktionsfiler. Förhandsgranska produktion med \`npm run preview\`.

## Beräkningar

Låt B vara nikotinfri basvolym (ml), S shotvolym (ml), N antal shots, C shotstyrka (mg/ml), T målstyrka (mg/ml) och V slutvolym (ml).

- Slutstyrka efter N shots: \`N × S × C / (B + N × S)\`.
- Shots till bibehållen nikotinfri bas: \`T × B / (C − T)\` (kräver C > T).
- Shots till exakt slutvolym: \`T × V / C\`.
- DIY: arom och shotvolym dras från V. Deras VG/PG bidrag beaktas innan resterande bas fördelas i ren VG och PG. Om valt förhållande är omöjligt varnas du utan negativa ingrediensmängder.

Beräkningarna antar additiva vätskevolymer och är uppskattningar. Resultaten avrundas bara vid visning.

## Säkerhet

Nikotin är beroendeframkallande och kan orsaka förgiftning. Använd skydd och lämplig mätutrustning, läs ingrediensers etiketter, märk och förvara blandningar utom räckhåll för barn och husdjur. Verktyget använder gränserna 20 mg/ml och 10 ml per shotflaska enligt svenska produktkrav för nikotinhaltiga påfyllningsbehållare, inte en allmän rekommendation att använda nikotin.

[Referens: Folkhälsomyndigheten](https://www.folkhalsomyndigheten.se/regler-och-tillsyn/tobak-och-nikotinprodukter-regler-for-tillverkning-handel-och-hantering/elektroniska-cigaretter-och-pafyllningsbehallare-sa-foljer-du-reglerna/tillverkning-och-import-av-e-cigaretter-och-pafyllningsbehallare/)
