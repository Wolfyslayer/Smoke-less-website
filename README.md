# Smoke Less – officiell webbplats

Statisk, responsiv webbplats för **https://wolfyslayer.online**. Hostas kostnadsfritt på GitHub Pages.

## Publicera

1. Gå till **Settings → Pages** i detta repo och välj **GitHub Actions** som källa.
2. Kontrollera att Pages-workflowen blir grön och att den temporära github.io-adressen fungerar.
3. Kontrollera gamla DNS-poster hos Namecheap innan du ändrar något. Apex-domänen kan peka på GitHub Pages A-poster (se aktuell GitHub-dokumentation); rör inte MX/TXT-poster för e-post.
4. Ange `wolfyslayer.online` som custom domain i Pages. Filen `CNAME` finns redan.
5. Vänta på domänverifiering och certifikat och aktivera **Enforce HTTPS**.

## Viktigt före offentlig lansering

- Integritetssidan är **inte** en färdig juridisk policy. Färdigställ och granska den innan publikt släpp.
- Support och kontoradering behöver en verifierad kontaktväg och ett fungerande raderingsflöde.
- `updates/preview.json` har `available: false` tills en signerad APK verifierats.
- Länkar till APK ska endast komma från verifierade GitHub Releases. Lägg aldrig hemligheter i statiska filer.
- Webbplatsens telefonillustration är en mockup, inte en riktig skärmbild.
- EAS Update hanterar OTA separat; denna webbplats är endast för native-versionsinformation och publik webb.

## Lokal förhandsvisning

`python -m http.server 8000` och öppna `http://localhost:8000`.
