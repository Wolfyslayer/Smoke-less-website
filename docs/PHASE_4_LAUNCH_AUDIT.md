# Fas 4.0 – Lanseringsgranskning

Denna PR förbättrar SEO, tangentbordsnavigering, mobil CSS och CI-kontroller. Den publicerar **inte** en APK och innebär **inte** att webbplatsen är juridiskt lanseringsklar.

## Automatiskt verifierat i CI
- `npm run verify`: TypeScript, Vite-build, HTML-metadata, robots, sitemap, favicon, nordiskt bakgrundsmotiv.
- Statiska kontrollpunkter för sidtitlar, fokus vid navigering, märkta förhandsvisningskontroller och uttrycklig integritetsreservation.
- Preview-manifestet kräver giltig paketidentifierare, versionskod, SHA-256 och GitHub Releases-URL om `available=true`; annars måste APK-länken saknas.

## Manuell kontroll före merge
- [ ] Båda CI-kontrollerna gröna.
- [ ] Android: hem, nedladdning, support, integritet och versionshistorik utan horisontell scroll.
- [ ] Kontrollera att landskapet ser likadant ut på startsidan och undersidorna.
- [ ] Tangentbord: hoppa till innehållet, länkar, flikar och FAQ.
- [ ] Skärmläsare: rubrikordning, navigeringslandmärke, status på Preview och tydliga knappar.
- [ ] Kontrollera reducerad rörelse och större text.

## Blockerande innan offentlig lansering
- [ ] Fastställ personuppgiftsansvarig, verifierad supportkontakt och raderingsprocess.
- [ ] Juridiskt granska integritetspolicy (ändamål, rättslig grund, mottagare, retention, rättigheter, internationella överföringar vid behov).
- [ ] Kontrollera faktisk datahantering mot Android-appen/Firebase och godkänn publicering.
- [ ] Publicera och verifiera en separat signerad Preview-APK med rätt paketnamn, SHA-256 och release notes; aktivera först därefter manifestet.
- [ ] Testa verklig installation och uppdatering på Android-enhet.

Denna granskning är en teknisk förberedelse, inte en fullständig tillgänglighetsrevision, prestandamätning eller juridisk granskning.
