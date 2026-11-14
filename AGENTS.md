<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- No own database: every quote, service request, engineer sign-up, upload and rating is forwarded server-side to the ACTES CRM through `src/lib/crm.server.ts` (calls the CRM's `acts.functions.ts` server functions by id) — the CRM is the single store and staff dashboard. If those CRM exports are renamed or moved, refresh the ids in `CRM_FN`.
- `src/lib/sizing.ts` + `src/lib/bot-presets.ts` are a literal port of the CRM QuoteBuilder rules (tiers, day/night shift); change them together with the CRM so app, CRM and WhatsApp bot recommend the same systems.
- Specialty, service and governorate values in `src/lib/acts-data.ts` must equal the CRM's stored values so CRM filters and admin screens match; only display labels may differ.
- Sample engineer profiles (`src/lib/sample-engineers.ts`) render only while the CRM returns zero approved engineers, and requests from them go to staff without an engineer id.
- Installable app is manifest-only (no service worker) so previews never serve stale builds.
