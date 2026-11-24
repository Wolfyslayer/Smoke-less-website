# ShadowSlayers website integration

## Public routes

- Landing page: `https://wolfyslayer.online/shadow-slayers/`
- Dashboard: `https://wolfyslayer.online/shadow-slayers/dashboard/`
- Trusted API origin: `https://shadowslayers-api-vloo4dmzfa-ez.a.run.app`
- Discord OAuth callback: `https://shadowslayers-api-vloo4dmzfa-ez.a.run.app/auth/callback`

The dashboard is built from `Wolfyslayer/ShadowSlayers-Bot` during the website build. The website repository's GitHub Actions workflow passes the `SHADOWSLAYERS_REPO_TOKEN` Actions secret to the build; the token must be a fine-grained token scoped only to `ShadowSlayers-Bot` with `Contents: Read-only`. `scripts/build-shadow-slayers-dashboard.mjs` checks out the bot repository's `main` branch, installs its lockfile dependencies, builds Vite with `VITE_BASE_PATH=/shadow-slayers/dashboard/` and the production API origin, then copies the result into the website's `public/shadow-slayers/dashboard/` directory. Vite copies that directory into the Pages output.

This keeps the dashboard source of truth in the bot repository; do not edit generated dashboard files in the website repository. Every website build uses the latest bot `main`, so a bot dashboard change can affect the next website build. Pin the bot checkout to a reviewed commit if reproducible releases are required.

## OAuth and API requirements

- The dashboard calls the trusted API directly; the dashboard path is not an API origin.
- Keep `ALLOWED_ORIGINS` set to the website origin `https://wolfyslayer.online` (no path).
- Register `https://shadowslayers-api-vloo4dmzfa-ez.a.run.app/auth/callback` in the Discord Developer Portal.
- Keep all Discord client secrets, bot tokens, session secrets, Firebase credentials, and bot-control secrets on trusted server infrastructure. Only the API origin is embedded in the public dashboard build.
- A successful static build does not prove that Discord OAuth, Firestore, or live bot actions work. Verify the complete flow against the deployed services before launch.

## Language preference

The public website and ShadowSlayers dashboard share `localStorage['wolfyslayer:language']`. English is the default when no preference exists; selecting Swedish or English persists across the Wolfyslayer hub, project pages, and dashboard on the same browser and origin. The dashboard also writes its legacy `shadowslayers-dashboard-locale` key for compatibility.

## Remaining launch configuration

- The GitHub Actions secret `SHADOWSLAYERS_REPO_TOKEN` is configured in the website repository. Keep it scoped to `ShadowSlayers-Bot` with `Contents: Read-only`; never commit the token or print it in build logs.
- The public Install Bot CTA uses the verified Discord application URL: `https://discord.com/oauth2/authorize?client_id=1574014471930781696`. Keep the Discord Developer Portal's installation scopes and permissions aligned with the bot's actual requirements.
- Terms of Service and Privacy Policy pages must be completed with the operator's confirmed legal identity, contact details, hosting/processor details, and reviewed retention/deletion statements before adding public legal links or submitting URLs in Discord Developer Portal.
- GitHub Pages is the website hosting and deployment target. Cloudflare Pages is not required for the website or dashboard deployment.
