# Smoke Less beta och admin – integrerad webbportal

## Integrering av tidigare PR #23
Funktionerna i den tidigare, separata betaportal-PR:en har lagts på den gemensamma webbplatsen utan att ersätta befintlig startsida, Vape Calculator, molnrecept, eller Smoke Less Preview-kontraktet.

| Funktion i äldre PR | Integrerad lösning |
| --- | --- |
| Egen beta-inloggning/registrering | Samma Supabase-webbkonto via `/account/` eller `/smoke-less/account/` |
| EmailCallback/PasswordReset | Delade säkra verifierings- och återställningssidor `/confirmemail/` och `/recoverpassword/` |
| `/beta/` | `/smoke-less/beta/` (äldre adress omdirigeras) |
| `/admin/` | `/smoke-less/admin/` (äldre adress omdirigeras) |
| Adminstatus och betaansökan | Smoke-specifik kontovy och skyddad adminvy |
| Betaläge och ansökningsstatus | Supabase-tabeller med Row Level Security |
| Release-lås | Server-side trigger bevarad |
| Äldre byggscript och egen authklient | Gemensamt Pages-samlingsbygge och en delad authklient |
| Beta CSS | Isolerat Smoke Less-tema i `src/beta/beta.css` |

## Webbadresser och användarflöden
- `/account/`: Gemensamt konto, ingen Smoke Less-beta-information.
- `/smoke-less/account/`: Samma konto, dessutom betastatus och en **adminlänk endast om rollen har verifierats via Supabase**.
- `/smoke-less/beta/`: Betaansökan och egen status; ingen tillgång ges automatiskt.
- `/smoke-less/admin/`: Skyddad adminpanel. Inloggad icke-admin får nekad åtkomst. RLS och SQL-triggers är den verkliga behörighetsgränsen.
- `/vape-calculator/#/recipes`: Länken till inloggning bär en tillåtelserestrikterad `returnTo`-destination. Lyckad inloggning skickar användaren tillbaka till recepten i stället för projektöversikten.
- Den redan publicerade Android-appen har fortfarande separat Firebase-konto.

## Måste göras i Supabase innan betasidan fungerar
1. Öppna rätt Supabase-projekt med id `twbwxvtazortlxzxdvtt`. Bekräfta att detta är projektet för wolfyslayer.online.
2. Kör `supabase/migrations/202611170001_beta_portal.sql` i SQL Editor **om den inte redan har körts**. Kör därefter `supabase/migrations/202611170002_release_lock.sql`. Dessa migreringar är inte avsedda att köras om utan kontroll.
3. Registrera/verifiera ditt vanliga **webbplatskonto** via `/smoke-less/account/`. I Supabase Authentication → Users, kopiera dess user UUID och lägg till adminrollen *endast via SQL Editor*:

```sql
insert into public.beta_admins(user_id)
values ('DIN_VERIFIERADE_SUPABASE_AUTH_UUID')
on conflict (user_id) do nothing;
```

4. Kontrollera URL Configuration med Site URL `https://wolfyslayer.online`, och tillåt `https://wolfyslayer.online/confirmemail/`, `https://wolfyslayer.online/recoverpassword/`, `https://wolfyslayer.online/account/` och `https://wolfyslayer.online/smoke-less/account/`. Existerande e-postmallar för TokenHash/OTP bör behållas.
5. Om du vill kunna hantera molnrecept krävs också *separata* migrationsfilen `202611190001_private_vape_recipe_bucket.sql` från huvudprojektet. Blanda inte ihop denna privata JSON-bucket med framtida privat APK-lagring.

## Säkerhet och test
- Om SQL eller RLS saknas är beta och admin **stängda**; koden skapar inga nya behörigheter eller publika Storage-policys.
- Testa konton A och B: A som administratör, B som vanlig användare. Bekräfta att B inte kan läsa andra ansökningar, uppdatera godkännanden, ändra portalinställningar eller lägga till sig själv i adminlistan.
- Godkänn B i adminpanelen och kontrollera att den får status `approved` på **Smoke Less-kontot**, men att denna status inte visas på Wolfyslayers övergripande kontosida eller i Vape Calculator.
- Testa att `/admin/` leder vidare till `/smoke-less/admin/`, att icke-admin ser åtkomst nekad, och att inloggning från `/vape-calculator/#/recipes` återgår till recepten.
- Publicering och nedladdning av APK:er är **inte aktiverade**. De kräver senare säker Edge Function, signerad artefakt och fristående releasegrind. Den gamla publik-URL-baserade Preview-funktionen är ännu inte en betaskyddad nedladdning.
- GitHub CI verifierar kod och statiska kontrakt, **inte** live-Supabase-migreringarna eller verklig RLS-isolering.
