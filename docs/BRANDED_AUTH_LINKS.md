# Smoke Less – förstapartslänkar i Supabase-mejl

## Viktigt
Detta använder **inte** en betald anpassad Supabase Auth-domän. Mejlets knapp öppnar wolfyslayer.online. Supabase Auth används fortfarande för verifiering bakom kulisserna.

### Authentication → URL Configuration
Site URL: `https://wolfyslayer.online`

Lägg till i Redirect URLs:
- `https://wolfyslayer.online/confirmemail`
- `https://wolfyslayer.online/recoverpassword`
- `https://wolfyslayer.online/resetpassword`
- `https://wolfyslayer.online/beta`
- `https://wolfyslayer.online/admin`

### Authentication → Email Templates
Behåll din befintliga snygga HTML-design. Ändra **bara länken på knappen**:

**Confirm signup**
```html
<a href="https://wolfyslayer.online/confirmemail?token_hash={{ .TokenHash }}&amp;type=signup">Bekräfta e-postadress</a>
```

**Reset Password**
```html
<a href="https://wolfyslayer.online/recoverpassword?token_hash={{ .TokenHash }}&amp;type=recovery">Återställ lösenord</a>
```

Övriga Supabase-mallar (Invite, Magic Link, Change Email, Reauthentication) ska **inte** få dessa länkar utan motsvarande verifieringsflöde. Behåll deras ursprungliga fungerande verifieringslänkar tills vi bygger och testar respektive flöde. För dessa mejl kan Supabase-projektets URL därför fortfarande synas.

**Testa båda mallarna** med engångslänkar på den publicerade webbplatsen. PR-grenen är ännu inte driftsatt. Publicera inte malländringarna före driftsättning och verifiering, eftersom länkarna annars kan ge 404.

### GitHub Pages
Build-skriptet skapar separata `index.html`-entrypoints för rena URL:er; inga server-rewrites behövs. Vite använder absoluta asset-URL:er. GitHub Pages kan normalisera `/resetpassword` till `/resetpassword/`. Kontrollera båda varianterna på mobil och dator.

### Säkerhet
- Länken använder Supabases tidsbegränsade engångs-`TokenHash`, inte användarens lösenord.
- Webbplatsen anropar `verifyOtp` och rensar token ur webbläsarens adressfält.
- Återställningsformuläret kräver verifierad återställningslänk.
- Varken publicera service-role-nycklar eller lägg till extern spårning på verifieringssidorna.
- Kontrollera att Supabase Auths e-postbegränsningar och SMTP-leverans fungerar för riktiga testare.
