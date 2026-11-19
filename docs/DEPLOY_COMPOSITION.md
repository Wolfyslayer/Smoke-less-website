# Wolfyslayer – en domän, tre statiska ingångar

## URL:er
- https://wolfyslayer.online/ — gemensam startsida
- https://wolfyslayer.online/smoke-less/ — Smoke Less, med undersidor på /smoke-less/#/download m.fl.
- https://wolfyslayer.online/vape-calculator/ — VapeCalc, med undersidor via hash

## Utan Cloudflare, extra domän eller betald hosting
Enbart Wolfyslayer/Smoke-less-website publicerar wolfyslayer.online via GitHub Pages och dess befintliga public/CNAME. En enda Actions-körning bygger två fristående React/Vite-appar och en portal:
- Vite multi-page ger dist/index.html, dist/smoke-less/index.html och delade JS-/CSS-filer.
- En vendorerad VapeCalc-kopia i apps/vape byggs separat och kopieras till dist/vape-calculator.
- APK-manifestet finns kvar som /updates/preview.json och skyddas av existerande verifieringslogik.
- Gamla /#/download, /#/support, /#/privacy och /#/changelog omdirigeras till /smoke-less/#/… så äldre länkar fungerar.

## Två repo och synkronisering
Wolfyslayer/vape-calculator är huvudrepo för kalkylatorn. En kopia av dess källkod, versionerad i apps/vape, används för publicering från den offentliga webbplatsen. Det undviker PAT, hemligheter och åtkomst till privata GitHub-repon från Actions. Vid nya ändringar i VapeCalc krävs att apps/vape uppdateras i en webbplats-PR. Ingen automatisk synk är ännu konfigurerad.

## Godkännande före merge
1. Både VapeCalc PR och webbplatsens PR ska ha grön CI.
2. Kontrollera SV/EN, mörkt/ljust tema, hamburgermeny/drawer och tangentbord på mobil och desktop.
3. Kontrollera direktlänkar, äldre hash-länkar, robots/sitemap och korrekt CNAME.
4. Kontrollera att APK-manifestets spärrar inte har ändrats.
5. Merge till main i publicerar-repot driftsätter allt automatiskt – gör det först efter acceptanstest.
