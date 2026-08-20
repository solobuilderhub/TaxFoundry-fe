# @tax-foundry/web

Preparer-facing web application for TaxFoundry: the CRA-numbered schedule tree,
the return editor, review queue, printable return and T183 authorisation.

Next.js (App Router) · React 19 · Tailwind v4.

## Documentation

System documentation lives in [`../docs`](../docs):

- [System overview](../docs/01-system-overview.md) — architecture and the design
  decisions that constrain it
- [Coverage](../docs/02-coverage.md) — the schedule inventory
- [Standard operating procedures](../docs/05-sop.md) — the prepare → review →
  file workflow this interface implements

## Running

```bash
npm install
npm run dev          # development server
npm run build        # production build
npm run typecheck    # type check
npm run check:contrast   # WCAG AA gate over the design tokens
```

Configuration is documented in `.env.example`. `NEXT_PUBLIC_API_URL` must point
at the application server.

## Structure

```
app/
  page.tsx                  public landing page (server-rendered)
  _marketing/               landing sections + copy, as data
  dashboard/
    _nav/                   sidebar configuration
    clients/                client records
    engagements/            one engagement per client tax year
      [id]/
        return/             the return editor
          _config/          schedule form definitions + registry
          _lib/             persisted return shape, live previews
        review/  print/  t183/  export/
components/                 shared UI, form field adapters
hooks/query/                server-state hooks
```

## Conventions

- **Schedule forms are data.** A schedule is one file under
  `return/_config/schedules/` exporting its number, label and form schema.
  Adding one means adding that file and one line in `_config/registry.ts`; the
  navigation tree, the key union and the schema lookup all derive from that
  registry.
- **Money is whole dollars** in the return shape (the statutory convention), and
  converted at the input boundary for display.
- **Colour is never the only signal.** Status is carried by text and icon as
  well. `npm run check:contrast` gates every token pairing at WCAG AA and fails
  on any colour that falls outside the displayable gamut.
