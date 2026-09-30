# Claude Code prompt: DealCon workshop "Start here" + GitHub step

Run this from the dealcon-workshop app's source folder (the Worker behind https://dealcon-workshop.jordan-691.workers.dev).

```bash
cd /Users/supabowl/<dealcon-workshop-source-folder>
claude --dangerously-skip-permissions
```

Paste:

```
First, apply the Organized Codebase agent templates to this repo (use the organized-codebase-applicator skill) so we have CLAUDE.md, the agent templates and a verification checklist. Then make these changes to the DealCon Agent Workshop app. Keep the existing hash routes working exactly as they are: #home, #intake, #recommendation, #settings and each track id.

Context: a CEO opened #home and didn't know what to do next. The audience is 7-9 figure business owners, not engineers. They will build with Lovable and their own Supabase project.

1. One obvious first step on #home
   - Make "Find my starting point" the single primary button in the hero, labeled "Start here: find my starting point". Every other button on the hero becomes secondary.
   - Directly under the hero, add a 3-step strip:
     1) "Set up" -> links to https://talk.organizedai.vip/dealcon/setup/ ; show a check when the user is signed in to their workshop account.
     2) "Find my starting point" -> #intake
     3) "Build it in Lovable" -> the chosen track (disabled until a track is chosen; remember the last track in localStorage with try/catch)
   - Move the full track grid under a heading "Or choose a track directly".

2. Plain words, everywhere a new user sees these names
   - Lovable: "Where you build your app by describing it in plain English."
   - Supabase: "Where your agent keeps its data. It's your own account, so what you build stays yours."
   - Show these as one-line helper text next to the first mention on #home, #settings and each track page. Remove "Postgres", "key-value", "edge functions" and "backend" from attendee-facing copy (keep them in facilitator-only text).

3. New "Find a proven agent first" step on every track page, before "Build in Lovable"
   - Title: "Start from something proven".
   - Body: "Before you build, look for an agent or skill someone already built for this job on GitHub. Thousands of people may already use it."
   - A 4-item vetting checklist: stars and forks; commits in recent months; who maintains it (a company or a known builder); open issues answered. Plus: never paste your keys into someone else's code.
   - A "Search GitHub for this track" button that opens a GitHub search for the track's job (e.g. https://github.com/search?q=<track keywords>+agent&type=repositories&s=stars).
   - An optional text field "Paste the repo you found" that gets appended to the copied Lovable prompt as "Use this project as a reference: <url>".

4. Don't break anything else
   - Supabase auth, the fictional sample run, saved drafts, "Download Claude Code / Web continuation prompt" and the facilitator QA notice must behave exactly as before.
   - Mobile first: check #home at 390px wide with no horizontal scroll.

5. Verify, then deploy
   - Run the build and any tests. Walk #home -> #intake -> a track -> Build in Lovable in a headless browser at 390px and 1280px and save screenshots to ./qa/.
   - Deploy with `npx wrangler deploy` to the existing dealcon-workshop Worker. Do not change the Worker name, routes, or Supabase project settings.
   - Commit on a branch named start-here-flow and open a PR to the Organized-AI GitHub org.
```

## Environment variables for Claude Code Web

Only needed if you run this in Claude Code on the web instead of your Mac:

| Variable | What it's for |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Deploying the Worker with wrangler (Workers edit permission on the account) |
| `CLOUDFLARE_ACCOUNT_ID` | `691fe25d377abac03627d6a88d3eeac9` |
| `VITE_SUPABASE_URL` | The workshop's existing Supabase project URL (copy from the current build env) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The workshop's existing publishable (anon) key; never a service role key |

Use the same variable names the repo already uses if they differ from these.
