# Fas 5.1 – Integritet och kontoradering: kodgranskning

## Granskat i Smoke-less-app/main
- `src/screens/AccountScreen.tsx`: e-post/lösenord, Google-inloggning och synkstatus. Ingen aktiverad kontoraderingsknapp i den granskade skärmen.
- `src/screens/BackupScreen.tsx`: gästhistorik kan rensas lokalt med bekräftelse; inloggade användare hänvisas till kontohantering.
- `src/components/AccountSettingsRoutes.tsx`: konto- och gästflöden är kopplade, men inget synligt anrop för att radera inloggat konto.
- `firestore.rules`: data separeras per användar-ID; serverägd raderingsspärr blockerar skrivningar efter att radering påbörjats.
- `functions/index.js`: `deleteMyAccount` kräver färsk autentisering, sätter spärr, rensar `entries`, `cravings`, `checkins`, `settings` och raderar Firebase Authentication sist. Filen säger uttryckligen att funktionen **inte är driftsatt eller exponerad** före QA.

## Inte verifierat
- Firebase-projektets faktiska konfiguration, datalagringsregion, personuppgiftsbiträden, överföringar, loggar, backup, retention och eventuell analys.
- Driftsättning av Cloud Functions, säker end-to-end-radering, administrativ återhämtning eller identitetskontroll via support.
- Personuppgiftsansvarig och rättslig grund för behandling av potentiellt känsliga hälsouppgifter.

## Blockerare före offentlig lansering
- [ ] Identifiera personuppgiftsansvarig och dokumentera ändamål, rättslig grund, lagringstider, mottagare, överföringar och användarrättigheter.
- [ ] Juridiskt granska och godkänn komplett integritetspolicy.
- [ ] Säkerhetstesta och driftsätt `deleteMyAccount` inklusive Firestore-spärr och återhämtning.
- [ ] Exponera säkert raderingsflöde i Android-appen och verifiera att det fungerar på verkliga konton.
- [ ] Kontrollera eventuell radering av backups och andra personuppgifter utanför de granskade samlingarna.
- [ ] Uppdatera webbplatsen med den **faktiskt verifierade** raderingsprocessen och publicera korrekt policy.

Denna PR ändrar endast webbplatsens information och innebär inte att kontoradering har aktiverats. Ingen ny Android-build krävs.
