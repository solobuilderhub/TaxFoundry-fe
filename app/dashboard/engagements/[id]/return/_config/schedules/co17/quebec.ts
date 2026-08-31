import { defineSchema, section } from "@classytic/formkit/server";
import type { QuebecValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { defineSchedule } from "../shared/define";

const f = fieldsFor<QuebecValues>();

/**
 * Québec CO-17 — the Québec-specific inputs the federal schedules don't carry.
 *
 * Québec taxable income and active business income are DERIVED server-side from
 * the same federal return (federal taxable income × the Québec allocation factor
 * from the permanent-establishment schedule), so nothing is re-entered here. Only
 * the Québec small-business eligibility attestation and an optional reduced limit
 * live on this block; both fail closed (no attestation ⇒ general rate).
 */
export const quebec = defineSchedule({
  key: "quebec",
  num: "CO17",
  label: "Québec CO-17",
  hint: "Québec small-business eligibility & limit",
  programs: ["CO17"],
  schema: defineSchema({
    sections: [
      section(
        "sbd",
        "Québec small-business deduction",
        [
          f.switch(
            "sbdEligibleQC",
            "Meets Québec's small-business eligibility (≥5,500 paid hours, or the primary / manufacturing exemption)",
          ),
          f.money("businessLimit", "Québec business limit (line 420c)", {
            description: "Blank = $500,000. Enter the shared limit for an associated group.",
          }),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "Unlike the federal SBD, Québec's rests on a paid-hours test. Fail-closed: the reduced Québec rate (3.2%) applies only when this is checked AND the corporation is a CCPC. Otherwise all Québec income is taxed at the general rate (11.5%). Québec taxable income is the federal taxable income allocated to Québec via the permanent-establishment schedule (S5 Part 1).",
        },
      ),
    ],
  }),
});
