# Table 6 setup script

Goal: every attendee leaves the table with a Lovable account, a Supabase project connected to it, a workshop account, and one sample run saved. Aim for under 5 minutes each.

Attendee checklist (phone): https://talk.organizedai.vip/dealcon/setup/
QR: public/dealcon/setup-qr.png

## Opening line

"Let's get you set up so the workshop hour is all building. Open the checklist on your phone and your laptop next to it. Where are you at?"

## The two words to explain (one sentence each)

- **Lovable**: where you build your app by describing it in plain English.
- **Supabase**: where your agent keeps its data. It's your own account, so what you build stays yours.

If they ask more about Supabase: "It's the database behind your app. You won't touch it directly today; Lovable connects to it for you."

## Check, in order

1. **Laptop** charged, Chrome open.
2. **Lovable** signed in with their work email. Check they have build credits.
3. **Supabase** signed in, one project named `dealcon-agent`. Password saved somewhere they control.
4. **Connected**: Lovable's built-in Supabase connection points at `dealcon-agent`.
5. **Workshop account**: https://dealcon-workshop.jordan-691.workers.dev/#settings, signed in, team name added.
6. **Sample run**: Find my starting point, pick a track, run the fictional sample. A saved draft means they're ready.

## Rules at the table

- Never type an attendee's password or keys for them. They type; you point.
- Keys and passwords never go in chat, email, or a shared doc.
- If a step fails twice, move on and mark them "needs finish" so they aren't stuck at the table.

## Triage

| Symptom | Likely cause | Fix |
|---|---|---|
| Lovable asks to upgrade | No build credits on the account | Pair them with a ready attendee during the session; build together |
| Supabase email never arrives | Corporate email filter | Sign up with a personal email for the workshop |
| Supabase not listed in Lovable | Connection not authorized | Re-run the Supabase connection in Lovable and approve access |
| Workshop sign-in loops | Browser blocking third-party cookies or an old session | Open a fresh tab, sign in again; try another browser |
| Sample run shows no draft | Sign-in expired mid-run | Sign in on My workspace, return to the track, run again |

## Close

"You're set. Bring this laptop to the workshop, and pick the one task you'd most like an agent to take off your plate."

Keep a running list of names marked ready vs "needs finish" and check "needs finish" people at the next break.
