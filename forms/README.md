# Form definitions

What a CRA or TRA form *is*, as data: its sections, its numbered boxes, the
caption printed beside each one, and where each figure comes from.

Everything the return editor shows a preparer is derived from here — the guided
form schemas, the paper Form Views, the `(line 410)` citations. The registry is
the app's promise that the number beside a box is the number on the printed
form, which is why these files are worth owning.

## Migration status — 2 of 42 vendored

These definitions are moving out of `@classytic/ca-tax` and into this repo, one
form at a time. `index.ts` is a hybrid: a vendored definition wins, and anything
not yet vendored is re-exported from the package. Consumers import `@/forms` and
can't tell which is which, so migrating a form touches nothing downstream.

| Form | Status |
|---|---|
| `AT1SCH12` | Vendored, corrected against TRA11732 Rev. 2026-03 |
| `AT1SCH21` | Vendored, corrected against TRA11741 Rev. 2026-03 |
| the other 40 | Still from `@classytic/ca-tax` |

The package stays a `devDependency` until the last form lands. It is build-time
only — the emitter and these tests — and never reaches the browser bundle.

## The maintenance model

**`definitions/*.ts` are generated once, then hand-maintained.** This is the
opposite of `app/…/paper/generated/`, which is re-emitted on every
`npm run generate:forms` and must never be hand-edited.

Corrections against the published form belong in the definition file. The
extractor refuses to overwrite an existing definition without `--force`,
because re-running it would restore the upstream text and silently undo them.

```bash
npx tsx scripts/vendor-form.ts --list        # what's available, what's vendored
npx tsx scripts/vendor-form.ts AT1SCH12      # writes definitions/at1sch12.ts
```

Then add it to `VENDORED` in `index.ts` and re-export its constant. After any
change here, regenerate and check the diff is what you meant:

```bash
npm run generate:forms && npm test && npm run typecheck
```

## Captions are copied, not improved

Copy the caption as the form prints it, including instructions stated inside it:

> `Line 001 - line 013: (if positive, enter "0")`
> `Deduct: ITA section 110.5 … Carry forward to Schedule 12, line 082`

Those parentheticals are how the form states its own arithmetic. Paraphrasing
them to read better is how line 015's floor rule and line 017's carry-forward
target got lost. Our own guidance goes in `note`, which is a separate field.

## Provenance — which definitions to trust

Every definition records the document it came from. Treat that as a trust
signal: 35 of 42 trace to the published PDF or to TRA's Chapter 3 specification.
**Seven trace to hand-written field maps** and carry a documented risk of
paraphrased captions and missing lines — the defect class found in Schedule 21,
which was missing 30 of the official form's 88 numbered lines.

| Form | Fields | Source | Reviewed against the form? |
|---|---|---|---|
| ~~`AT1SCH12`~~ | 74 | **TRA11732 Rev. 2026-03** | Yes — all 74 lines |
| ~~`AT1SCH21`~~ | 88 | **TRA11741 Rev. 2026-03** | Yes — all 88 lines |
| `AT1SCH18` | 50 | `at1-schedule-18-dispositions.md` | No |
| `AT1SCH20` | 36 | `README.md` | No |
| `AT1SCH17` | 28 | `at1-schedules-16-17.md` | No |
| `AT1SCH13` | 23 | `at1-schedule-13-cca.md` | No |
| `AT1SCH16` | 12 | `at1-schedules-16-17.md` | No |

### AT1SCH12 — status

All 74 numbered lines are modelled. The extracted version was missing **14**, and
not at the margins — the whole back half of Area B, including line **090**
("Taxable Income for Alberta purposes"), which is what the schedule exists to
produce and which the form directs onto AT1 page 2 line 062. Line 106, which
feeds the Alberta SBD via Schedule 1 line 003, was also absent.

Every source annotation the form prints inside its boxes is now a `from`
reference (or a `note` where the form gives a sum or a choice). That is the
substance of this schedule — it reconciles a federal figure against an Alberta
one, and the annotations say where each side comes from.

`AT1_SCHEDULE_12_PAIRS` moved in alongside it, gaining the three pairs upstream
was missing (079|078, 141|140, 083|082).

Outstanding: the engine still derives all of it, so nothing here is entered —
that is correct for a reconciliation, but it means the 14 restored lines are
displayed and not yet computed.

### AT1SCH21 — status

**All 88 of the form's numbered lines are now registry fields**, across all five
pages. That includes the repeating tables: limited partnership (131–141) and both
by-year-of-origin ledgers (151–169, 181–187), which previously rendered from
hand-written components with line numbers nothing checked.

Repeating tables fit the flat field model without any special case, because AT1's
`SSSFFFOOO` line id already encodes the row as its third triplet. Each **column**
is one field at occurrence `001`; the rows are further occurrences. So a column
gets a caption, a role, a formula and line-number checking like any other line.

Still outstanding — behaviour, not shape:

- **Page 5 (RIFE, 200–350) displays but is not collected.** `AlbertaContinuityValues`
  has no RIFE fields and the engine has no RIFE calculation, so those lines render
  read-only and empty. The form's rule that *line 240 must not exceed line 350* is
  recorded but enforced nowhere.
- **The current-year row on page 3** is enterable now, but nothing reconciles it
  against the schedule's own line 021 and carry-back, which the form implies it
  must equal.

## Layout follows the printed page

Where the form prints separate blocks, the app renders separate tables.
Schedule 21's continuity is three blocks — non-capital | capital (page 1),
farm | restricted farm (page 2), listed personal property (page 2) — not one
five-column grid. `AT1_SCHEDULE_21_BLOCKS` in `definitions/at1sch21.pools.ts`
declares them.

This is not cosmetic. A grid spanning every pool has to manufacture a cell for
every (pool, row) pair, and the form doesn't print most of them: capital losses
have no expiry row, a farm loss is never applied against a capital gain. Those
became placeholder dashes — 23 of 70 cells — and buried the real content. Split
by block it's 7 of 54, and each table can be read against the paper line by line.

A row is emitted for a block only when one of that block's own columns has it,
so this stays true automatically as lines are added.

## Calculation references

Where the form prints how a line is derived, that arithmetic is captured as
structured `formula` data rather than left inside the caption:

```ts
{
  line: "021350001",
  caption: "RIFE deductible under paragraph 111(1)(a.1) of ITA for the year. (Lesser of line 310 and line 340)",
  role: "computed",
  formula: {
    expression: "Lesser of line 310 and line 340",   // the form's own words
    inputs: ["021310001", "021340001"],              // checkable line references
  },
}
```

The paper Form View renders `expression` as a hint beside the caption, so a
reviewer sees the same rule on screen and on paper. `inputs` exists so a broken
reference fails a test instead of misleading someone — `forms-registry.test.ts`
checks that every input is a real line on the same form, that no formula cites
itself, and that formulas never land on a field the preparer types into.

**Only record what the form actually prints.** Line 250 (closing RIFE balance) is
plainly `200 + 210 - 220 + 230 - 240`, but the form does not say so, so it
carries a `note` instead. An inferred formula reads as authoritative while being
nobody's stated rule.

Vendoring one of these is the cheap half; re-deriving it against the real PDF is
the work. Update the row and the file's `provenance` when you do.

## What's checked automatically

`tests/forms-registry.test.ts` holds the invariants that survive the migration —
fields referencing real sections, unique line numbers, well-formed AT1 composite
ids, cross-references resolving, footnote markers in range.

No test can tell you a caption matches the printed form. That is what
`provenance` and the table above are for.

### Known defect: AT1 schedule id padding

AT1 ids are inconsistently zero-padded upstream — `AT1SCH1`/`AT1SCH2` unpadded,
`AT1SCH03`–`AT1SCH09` padded — and the AT1 jacket cross-references the
single-digit ones *unpadded*. `FORM_ID_TO_SCHEDULE_KEY` in `return-editor.tsx`
is keyed on the padded spelling, so four badges on the jacket (lines `000064001`,
`000072001`, `000076001`, `000081001` → Schedules 5, 4, 3, 9) fail their lookup
and render inert instead of navigating.

Settle on the padded spelling when the jacket is vendored, then delete
`KNOWN_ID_PADDING_DEFECTS` from the test.
