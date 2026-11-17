# Supabase setup for Smoke Less beta portal

This is **W2 preparation**, not a live beta. The migration creates tables and RLS policies but does not enable downloads, provision admins, configure email authentication or change the website. All existing release flags remain off.

## Create the project
1. Create a new Supabase project for **the website beta portal only**. Keep app Firebase Auth/Firestore separate.
2. In Supabase Authentication, enable email sign-in and email confirmation. Configure the site's production URL and allowed redirect URLs. The website currently uses HashRouter, so verify email redirects in a browser before accepting real testers.
3. Enable MFA for the administrator account when available.
4. Apply `supabase/migrations/202611170001_beta_portal.sql` in the Supabase SQL Editor, after reviewing it.
5. Create your own Supabase Auth user and verify the email. Copy its UUID from the Auth users dashboard.
6. **Only in the Supabase SQL Editor** (never from browser code), bootstrap the admin:
   ```sql
   insert into public.beta_admins(user_id)
   values ('REPLACE_WITH_YOUR_VERIFIED_AUTH_USER_UUID');
   ```
7. Do not send the service_role key or database password in chat or commit them to GitHub. The public project URL and publishable/anon key may later be configured as Vite public environment variables; authorization must rely on RLS and server checks, not secrecy of that key.

## RLS acceptance checks before W2 completion
- Anonymous user cannot read application rows, admin list, artifact rows or settings base table.
- Anonymous user can read only the public mode view (initially `closed`).
- Authenticated applicant can insert **only their own** pending application and read only their own status.
- Applicant cannot change status, assign themselves admin privileges, list other applicants, or read APK metadata.
- Admin can review applications and manage metadata; only privileged SQL/service operation can bootstrap an admin.
- Missing Supabase config and backend errors must fail closed in the frontend.
- Release mode needs an **additional independent, server-enforced app release attestation** before W5 enables any public download. The current migration's `public_release_approved` column is a preliminary gate, not a complete release attestation.
- Audit RLS and test with separate real Supabase test identities before enabling signups.

## APK storage decision (W4)
Confirm APK byte size and plan limits first. Use a private bucket, never a public bucket, and never put a permanent APK URL in `public/updates/preview.json`. A server-side Edge Function should verify auth, application approval, active artifact and independent release attestation before creating a short-lived signed download URL.

## Current status
- W1: done.
- W2: schema drafted and committed; deployment, auth wiring, bootstrap and live RLS tests pending.
- W3–W8: not started.
