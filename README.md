# PRISM Scoring v1.2.1

Unified scoring engine and **tokenized results access**.

- Public results links require a `?t=<share_token>` parameter.
- Owners can view their own results without a token when authenticated.
- Roll back by redeploying prior edge functions and restoring previous RLS.

---

## Rotation Smoke

Validate token rotation end-to-end:

```sh
SUPABASE_URL=... SUPABASE_ANON_KEY=... SESSION_ID=... USER_JWT=... SHARE_TOKEN=... npm run smoke:results:rotate
```

Required env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SESSION_ID`, `USER_JWT`, `SHARE_TOKEN` (old token).

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/de95f929-2a16-4b73-9441-1460cd22bde1

## How can I edit this code?

There are several ways of editing your application.

### Use Lovable

Visit the [Lovable Project](https://lovable.dev/projects/de95f929-2a16-4b73-9441-1460cd22bde1) and start prompting.  
Changes made via Lovable will be committed automatically to this repo.

### Use your preferred IDE

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev

## GitHub Actions smoke tests

Set the following repository secrets to enable smoke tests in CI:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SESSION_ID`
- `SHARE_TOKEN`
- `USER_JWT` (for owner path) **or** `AUTH_EMAIL` + `AUTH_PASSWORD`

For the owner and rotation smokes, you can either:

1. Provide `USER_JWT` directly as a secret; or
2. Provide `AUTH_EMAIL` and `AUTH_PASSWORD` secrets and the workflow will fetch a JWT automatically.

Add these under **Settings → Actions → Secrets**.
