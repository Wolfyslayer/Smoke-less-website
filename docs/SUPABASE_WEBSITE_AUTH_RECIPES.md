# Supabase-inloggning och privata Vape Calculator-recept

## Vad som är byggt
- Wolfyslayer på `/account/`: registrera, logga in, logga ut och begär lösenordsåterställning på svenska och engelska.
- E-postverifiering `/confirmemail/` och återställning `/recoverpassword/` med tidsbegränsad Supabase OTP token_hash, som rensas ur adressfältet innan verifieringen.
- Konto-knapp i menyn på Wolfyslayer, Smoke Less och Vape Calculator.
- Samma Supabase Auth-session används av huvudwebben och kalkylatorn eftersom de ligger på **samma domän**, med samma projekt/publishable key och standard-sessionnyckel. Smoke Less-appens separata Firebase Auth påverkas inte.
- Recept för gäster stannar i webbläsarens localStorage. Inloggade användare får bara sina privata recept från Supabase Storage. Lokala recept förs över enbart vid aktivt val från användaren.
- Varje recept lagras som en separat JSON-fil: `vape-recipes/<user-id>/<recipe-uuid>.json`. Buckets är privata, inga publika URLs eller signed URLs används. Supabase RLS begränsar SELECT, INSERT, UPDATE och DELETE till rätt auth.uid.

## OBLIGATORISK SUPABASE-INSTÄLLNING FÖRE DRIFTSÄTTNING
GitHub-koden skapar **inte automatiskt** en Storage-bucket eller Auth-inställningar i ditt Supabase-konto.

1. Öppna Supabase-projektet `twbwxvtazortlxzxdvtt`, och kontrollera att detta är rätt webbplatsprojekt.
2. Gå till SQL Editor, granska och kör `supabase/migrations/202611190001_private_vape_recipe_bucket.sql` i detta repo. Scriptet skapar bucket `vape-recipes`, `public=false`, 256 KiB max per receptfil, JSON-only och RLS-policys för user-ID-baserad åtkomst. **Skapa inte bucketen som public.**
3. Under Authentication → Providers aktiverar du e-postinloggning och bekräftelsemejl. Konfigurera SMTP om projektet kräver det och granska eventuella e-postbegränsningar.
4. Authentication → URL Configuration → Site URL: `https://wolfyslayer.online`. Tillåt under Redirect URLs:
   - `https://wolfyslayer.online/confirmemail/`
   - `https://wolfyslayer.online/recoverpassword/`
   - `https://wolfyslayer.online/account/`
5. För autentisering med vår egen verifieringssida måste mejlmallarnas länkar använda Supabase TokenHash (inte `ConfirmationURL`):
   - Confirm signup: `https://wolfyslayer.online/confirmemail/?token_hash={{ .TokenHash }}&type=signup`
   - Reset Password: `https://wolfyslayer.online/recoverpassword/?token_hash={{ .TokenHash }}&type=recovery`
   Behåll fungerande standardmallar för andra mejltyper. Ändra **inte** mallarna innan webbplatskoden är publicerad, annars kan nuvarande länkar ge 404.
6. Testa med två *olika* riktiga verifierade konton (A och B):
   - A kan spara ett recept, logga ut och logga in från en annan enhet; samma recept dyker upp.
   - B ser inte A:s recept, kan inte läsa/radera A:s JSON via Storage API och har bara sin egen mapp.
   - Anonym användare kan inte läsa eller lista objekt i `vape-recipes`.
   - Spara, uppdatera, duplicera, exportera, importera och radera recept med konto.
   - Gästrecept stannar kvar lokalt efter utloggning. Importknappen kan kopiera dem till ett inloggat konto; de överförs aldrig automatiskt.
   - Om bucket/RLS/nätverk saknas ska webbplatsen visa fel och INTE hävda att ett molnrecept sparats.
   - Bekräftelselänkar och återställningslänkar ska fungera i publicerad version innan de används i riktiga e-postutskick.

## Säkerhet och begränsningar
- `sb_publishable_...` är en **publik** browsernyckel; behörighet bestäms via Supabase RLS. Lägg ALDRIG service_role eller databaslösenord i frontend, GitHub eller chatten.
- Varken autentisering eller bucket-policys ger adminbehörighet/beta-APK. Det separata beta-adminprojektet/PR #23 har ett eget kontrollerat säkerhetsflöde.
- Flera enheter kan redigera samma recept. En enskild fil uppdateras med senaste sparningen; använd export som backup vid viktiga versioner. Refresh-knappen hämtar de senaste molnversionerna.
- Import av många JSON-recept kan delvis lyckas om nätverket bryts; applikationen laddar då om faktiska molnuppgifter. Importera bara betrodda filer.
- Ingen riktig Supabase live-åtkomst/RLS-integration har verifierats av CI. SQL måste köras och testas i Supabase innan merge/publicering.
- `docs/PHASE_5_PRIVACY_DELETION_REVIEW.md` och webbplatsens integritetspolicy ska uppdateras med kontodata, lagring, retention och faktisk kontoraderingsrutin **innan offentlig kontoregistrering aktiveras**.
