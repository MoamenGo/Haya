# Turning on sync (one-time setup)

The app works fully on one device without any of this. These steps connect it to a free Supabase
project so the phone and the computer share the same data.

## 1. Create the Supabase project

1. Sign up at supabase.com (free plan) and create a project. Pick a region close to Egypt
   (e.g. Frankfurt) and save the database password somewhere safe.
2. Create the tables. The easy way is automatic: add the GitHub secret `SUPABASE_DB_URL`
   (see "GitHub Actions" below), then run **Actions → Apply database migrations → Run
   workflow** once. From then on, every merge that adds a file to `supabase/migrations/` applies
   it by itself, so the app never asks for a table the database doesn't have.
   By hand instead: **SQL Editor → New query**, paste each file in `supabase/migrations/`,
   oldest first, and run it. Files already run by hand are fine; the Action recognises them.

## 2. Sign-in email

1. **Authentication → Email Templates → Magic Link**: paste `supabase/templates/magic_link.html`
   (subject: `كود الدخول لحياة`). It adds a 6-digit code to the email. On iPhone the installed app
   can only sign in with the code, because a link opens Safari instead.
2. **Authentication → URL Configuration**: set **Site URL** to the app's address
   (e.g. `https://haya-xxx.pages.dev`) and add the same address to **Redirect URLs**.

## 3. Point the app at it

**Project Settings → API**: copy the **Project URL** and the **anon public** key. In Cloudflare,
open the project and add them as **build** variables (Vite bakes them in at build time):

- Workers (the current deploy, `wrangler.jsonc`): **Settings → Build → Variables and secrets**
- Pages: **Settings → Environment variables**
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

## Keep-alive and weekly backups (optional but recommended)

Three GitHub Actions do nothing until their secrets exist (GitHub → the Haya repo → **Settings →
Secrets and variables → Actions**):

- **Apply database migrations** (`migrate.yml`, after each merge that adds a migration):
  `SUPABASE_DB_URL`. In Supabase press **Connect** (top of the dashboard) → **Session pooler** →
  copy the URI and put your database password in place of `[YOUR-PASSWORD]`. Use the session
  pooler, not the direct connection: GitHub's machines can't reach the direct one. The script
  (`supabase/apply-migrations.sh`) keeps a list of applied files in `haya_meta.applied_migrations`
  and runs each new file in a transaction, so a failing file changes nothing.
- **Keep-alive** (`keepalive.yml`, daily): `SUPABASE_URL`, `SUPABASE_ANON_KEY`. Free projects pause
  after 7 quiet days; this prevents it.
- **Backup** (`backup.yml`, Fridays): an encrypted dump committed to a separate private repository.
  1. Create a **private** repository, e.g. `haya-backups`.
  2. On your computer, install `age` and run `age-keygen -o haya-backup-key.txt`. Keep that file
     safe and **off GitHub** (a USB stick and a password manager). It prints a public key `age1…`.
  3. Add secrets: `AGE_RECIPIENT` (the `age1…` key), `BACKUP_REPO` (`MoamenGo/haya-backups`),
     `BACKUP_REPO_TOKEN` (fine-grained token, only that repo, Contents read & write),
     and `SUPABASE_DB_URL` (the same one as above).
  4. Run it once by hand: Actions → Weekly encrypted backup → Run workflow.

To read a backup: `age --decrypt -i haya-backup-key.txt FILE.sql.gz.age | gunzip > backup.sql`.
It is data only, for the same project (rows carry your account id); to restore, empty the tables
and run it in the SQL Editor. To move to a brand-new project, use the in-app JSON export instead
(Settings → Data), which doesn't depend on account ids.
