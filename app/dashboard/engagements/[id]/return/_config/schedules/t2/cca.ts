import { defineSchema, field, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { CcaValues } from "../../../_lib/return-input";
import { fieldsFor, money } from "../../fields";
import { CCA_CLASS_OPTIONS } from "../../options";
import { defineSchedule } from "../shared/define";
import { CcaFormView } from "./paper/cca-form-view";

const f = fieldsFor<CcaValues>();

export const cca = defineSchedule({
  key: "cca",
  num: "008",
  /*
   * Names BOTH forms, because this one entry is where both get filled in and
   * the numbers collide confusingly across jurisdictions: federal Schedule 8
   * is CCA, and so is ALBERTA Schedule 13 — while federal Schedule 13 is
   * Continuity of Reserves, which has its own nav entry at num "013". A
   * preparer looking for "Schedule 13 — CCA" finds a 013 in the nav that is a
   * different form entirely, and nothing at all pointing here.
   *
   * There is no separate AT1 S13 entry by design: its editable Alberta fields
   * (`albertaOpeningUCC`, `albertaClaim`) live in THIS schedule's own `classes`
   * array, so a second entry would be two nav rows writing one slice. It is
   * also why "AT1 only" hides this row — that filter means "schedules the AT1
   * program OWNS", and CCA is a federal schedule the AT1 return consumes.
   */
  label: "Capital Cost Allowance (S8 / AT1 S13)",
  hint: "Depreciable property, by class — Alberta S13 in Form View",
  /*
   * Both grids — federal Schedule 8, and Alberta Schedule 13 for an AT1
   * engagement. This pointed at `Schedule8FormView` alone, so the S13 view was
   * reachable from nowhere even though this very schema collects the Alberta
   * overrides it renders. See `CcaFormView`.
   */
  formView: (props) => createElement(CcaFormView, props),
  schema: defineSchema({
    sections: [
      section(
        "cca",
        "Capital cost allowance",
        [
          f.array("classes", "CCA classes", [
            field.select("ccaClass", "Class (line 200)", CCA_CLASS_OPTIONS, { placeholder: "Select a CCA class" }),
            money("openingUCC", "Opening UCC (line 201)", { description: "Auto-filled from last year on compute" }),
            money("additions", "Additions — cost of acquisitions (line 203)"),
            money("dispositions", "Dispositions — proceeds (line 207)"),
            money("immediateExpensing", "Immediate expensing (DIEP)", {
              description: "100% first year, up to $1.5M",
            }),
            field.switch("aiip", "AIIP (accelerated investment)"),
            field.switch("classEmptied", "Class emptied (no assets left)"),
            money("claim", "CCA claim", { description: "Blank = maximum; 0 = claim nothing" }),
            money("albertaOpeningUCC", "Alberta opening UCC (S13 line 003)", {
              description: "Blank = same as federal",
            }),
            money("albertaClaim", "Alberta CCA claim (S13 line 019)", {
              description: "Blank = same as federal; 0 = claim nothing for Alberta",
            }),
          ]),
        ],
        {
          variant: "card",
          // A card section defaults to a 2-column field grid — cols: 1 so the
          // array's row cards get the section's FULL width instead of being
          // squeezed into one grid cell.
          cols: 1,
          description:
            "Schedule 8. Depreciable property by class. The engine applies the half-year rule (or AIIP/immediate expensing), and computes recapture / terminal loss on dispositions. Closing UCC carries forward automatically.",
        },
      ),
      section(
        "class13",
        "NEW class 13 leasehold improvement(s) added this year",
        [
          f.array("class13Layers", "Leasehold layers", [
            field.text("description", "Description", { placeholder: "e.g. office fit-out" }),
            money("capitalCost", "Capital cost"),
            field.date("leaseEnd", "Lease termination date"),
            field.date("firstRenewalEnd", "First renewal termination date (if the lease grants renewal rights)"),
            field.switch("isFirstYear", "This is the layer's first tax year"),
            field.switch("aiip", "AIIP property"),
            money("claimedToDate", "CCA already claimed on this layer, prior years"),
            money("proceeds", "Disposition proceeds attributed to this layer"),
          ]),
          money("class13OpeningUCC", "Class 13 opening UCC (existing pool + all layers)"),
          money("class13Claim", "Class 13 claim", { description: "Blank = maximum" }),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "The classes array above only draws down an EXISTING class 13 opening balance — it refuses a current-year addition. Use this section for a NEW leasehold improvement instead: the engine derives the Schedule III 5-to-40-year period count from the lease-end date and the tax year start (Schedule III s.2), applies the s.3 constraints (the 5-year floor, the 40-period cap, the layer's own remaining balance), and the Reg 1100(2) half-year UCC-ceiling reduction for a first-year layer. Leave blank if there's no new leasehold improvement this year.",
        },
      ),
      section(
        "class14",
        "NEW class 14 limited-life propert(y/ies) added this year",
        [
          f.array("class14Properties", "Limited-life properties", [
            field.text("description", "Description", { placeholder: "e.g. 15-year patent" }),
            money("capitalCost", "Capital cost"),
            money("lifeDaysAtAcquisition", "Days of life REMAINING when the cost was incurred"),
          ]),
          money("class14OpeningUCC", "Class 14 opening UCC (existing pool + all properties)"),
          money("class14Claim", "Class 14 claim", { description: "Blank = maximum" }),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "Patents, franchises, concessions and licences with a fixed life (not unlimited-life class 14.1). The engine amortises each property over its own remaining life in DAYS (Reg 1100(1)(c)) — 'days of life remaining' is fixed at acquisition, not the property's total life and not the days left today. No half-year rule; the day count already prorates a mid-year acquisition. Leave blank if there's no new limited-life property this year.",
        },
      ),
    ],
  }),
});
