# Turning on sync (one-time setup)

The app works fully on one device without any of this. These steps connect it to a free Supabase
project so the phone and the computer share the same data.

## 1. Create the Supabase project
1. Sign up at supabase.com (free plan) and create a project. Pick a region close to Egypt
   (e.g. Frankfurt) and save the database password somewhere safe.
2. **SQL Editor → New query**: paste the whole of
   `supabase/migrations/20261006000000_init.sql` and run it. (Or, with the Supabase CLI:
   `supabase link` then `pnpm db:migrate`.)

## 2. Sign-in email
1. **Authentication → Email Templates → Magic Link**: paste `supabase/templates/magic_link.html`
   (subject: `كود الدخول لحياة`). It adds a 6-digit code to the email. On iPhone the installed app
   can only sign in with the code, because a link opens Safari instead.
2. **Authentication → URL Configuration**: set **Site URL** to the app's address
   (e.g. `https://haya-xxx.pages.dev`) and add the same address to **Redirect URLs**.

## 3. Point the app at it
**Project Settings → API**: copy the **Project URL** and the **anon public** key. In Cloudflare
Pages → the project → **Settings → Environment variables**, add:
- `VITE_SUPABASE_URL` = the Project URL
- `VITE_SUPABASE_ANON_KEY` = the anon key

Then redeploy. Never use the `service_role` key in the app: it bypasses all security.

## 4. Sign in once, then close the door
1. Open the app → Settings → Account & sync, enter your email, type the code.
2. **Authentication → Sign In / Providers**: turn off **Allow new users to sign up**. From now on
   only your account can sign in (CLAUDE.md §7.4).
3. Repeat step 1 on the other device. Each device's starter areas and habits merge into one set.

## Local development
`supabase start` (needs Docker) runs a local copy with the same migrations; emails go to Mailpit at
http://127.0.0.1:54324. Put the local URL and anon key printed by `supabase start` in `.env.local`.
