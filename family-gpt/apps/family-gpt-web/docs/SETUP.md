# Owner machine setup

The public site is already deployed at `https://family-gpt-web.vercel.app`.

The owner machine only needs the private starter file issued separately. Both Mac and Windows starters:

1. install `uv` if needed;
2. create an isolated Python 3.11 environment;
3. install the pinned ChatGPT-Web2API build;
4. launch the dedicated Chrome profile used by ChatGPT-Web2API;
5. download the latest `worker.py` from the production Vercel site (`/worker.py`), so the launcher does not depend on a GitHub raw URL;
6. start the outbound worker against the production Vercel site.

## Family access code (required)

Every family-facing endpoint that spends the owner's ChatGPT/Codex quota or reads answers (`POST /api/chat`, `GET /api/job`, `POST /api/codex`) requires a shared family access code. Vercel stores only its SHA-256 hash:

| Env var | Value |
| --- | --- |
| `FAMILY_ACCESS_CODE_SHA256` | lowercase hex SHA-256 of the UTF-8 code (64 chars) |
| `FAMILY_DAILY_LIMIT` (optional) | global daily cap on GPT Web jobs + Codex calls, default `200` (best effort, KST day) |

Set it once (example uses Node to hash; the code itself is never stored in Vercel):

```bash
node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" 'family-code-here'
vercel env add FAMILY_ACCESS_CODE_SHA256 production   # paste the hex digest
# then redeploy (Git push or `vercel --prod`) so the functions see the new value
```

If the variable is missing or malformed, these endpoints fail closed with `503`. A missing or wrong code returns `401`. The browser sends the code in the `x-family-code` header as `encodeURIComponent(code)` (identical to the plain code for letters and digits), e.g.:

```bash
curl -i -H "x-family-code: family-code-here" "https://family-gpt-web.vercel.app/api/job?id=00000000-0000-0000-0000-000000000000"
# 404 Job not found = code accepted, 401 = wrong code, 503 = env var not set
```

Family members open the site, type the code into the **가족 접속 코드** prompt and press **확인**. The code is kept in that browser's `localStorage`; if it is rejected later (for example after the owner changes the code), the prompt appears again. Worker endpoints keep using the worker token, and `/api/health` stays public.

## Mac mini / macOS

The generic launcher is `bridge/scripts/start-worker.command`. Its local application data lives under:

```text
~/Library/Application Support/Family-GPT-Web
```

If macOS blocks a downloaded private `.command` launcher on first run, right-click it and choose **Open**. If the executable bit was stripped during download, run `chmod +x START-FAMILY-GPT.command` once from Terminal.

### Optional Codex mode

GPT Web is the default mode. Codex is only a secondary/fallback mode in the same site.

After the normal Mac worker has been installed, the owner can connect the shared Codex session with:

```bash
chmod +x bridge/scripts/connect-codex.command
FAMILY_GPT_WORKER_TOKEN="<private-worker-token>" bridge/scripts/connect-codex.command
```

The script opens the official Codex device-login page, prints the one-time code, and polls the same `family-gpt-web.vercel.app` project until the session is connected. The browser UI itself cannot create or replace the shared Codex session because the auth mutation requires the private worker bearer token.

After connection, choose **Codex** from the Family GPT sidebar. No second Vercel project or domain is needed.

Note: once connected, Codex mode stores the shared session's OAuth access and refresh tokens (and account id) in Vercel Runtime Cache for up to 30 days, refreshing them as needed. Anyone with access to the Vercel project can therefore reach that session; the public `GET /api/codex-auth` only reports `{ "connected": true|false }`.

## Windows

The generic launcher is `bridge/scripts/start-worker.ps1`. Its local application data lives under `%LOCALAPPDATA%\\Family-GPT-Web`.

On the first run, complete the normal ChatGPT sign-in in the Chrome window. For GPT Web mode, no ChatGPT password, cookies, or browser profile is stored in GitHub or Vercel; they stay in the local Chrome profile. (Optional Codex mode is different: see above, its OAuth tokens live in Vercel Runtime Cache.)

The worker makes outbound HTTPS requests only. No router configuration, public home IP, Cloudflare Tunnel, ngrok, Supabase, or Neon is required.

Keep the worker Terminal/PowerShell window open while Family GPT should answer questions. Closing it makes `/api/health` report the worker as offline within roughly 20 seconds. While a long answer is generating, the worker sends a heartbeat every 10 seconds so the site keeps showing it as online.
