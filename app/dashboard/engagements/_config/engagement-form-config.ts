import { defineSchema, field, section } from "@classytic/formkit";
import { ENGAGEMENT_PROGRAMS } from "@/api/engagements";

export type EngagementFormValues = {
  clientId: string;
  program: (typeof ENGAGEMENT_PROGRAMS)[number];
  firstReturn?: boolean;
  taxYearStart: string;
  taxYearEnd: string;
  /** The engagement this one amends (TRA AT1 EDI071/EDI073). Leave blank for an ordinary filing. */
  amendsEngagementYearId?: string;
  /** EDI073 — required once amendsEngagementYearId is set (enforced at Net File time). */
  amendmentDescription?: string;
};

const PROGRAM_OPTIONS = [
  { value: "T2", label: "T2: Federal corporate return" },
  { value: "AT1", label: "AT1: Alberta corporate return" },
  { value: "CO17", label: "CO-17: Québec corporate return" },
];

type SelectOption = { value: string; label: string };

/**
 * Engagement form schema. `clientOptions` are injected at render time from the
 * live clients list (formkit config is a pure function; the caller supplies the
 * dynamic option set). Dates are plain date fields; the caller converts them to
 * full ISO date-time on submit (the arc create schema requires `date-time`).
 *
 * `amendableOptions` are OTHER engagements a new one could amend — deliberately
 * NOT filtered to "same client/program/tax year end" here, since the form has
 * no live reactivity on the client/program fields the picker would need to
 * filter by. The server enforces that relationship at Net File preparation
 * time (`assertValidAmendmentTarget`) and refuses a mismatched target there —
 * a permissive picker here is safe because nothing downstream trusts it blindly.
 */
export function getEngagementFormSchema(
  clientOptions: SelectOption[],
  amendableOptions: SelectOption[] = [],
) {
  return defineSchema<EngagementFormValues>({
    sections: [
      section<EngagementFormValues>("engagement", "Engagement", [
        field.select<EngagementFormValues>("clientId", "Client", clientOptions, {
          required: true,
          fullWidth: true,
        }),
        field.select<EngagementFormValues>("program", "Program", PROGRAM_OPTIONS, {
          required: true,
        }),
        field.switch<EngagementFormValues>("firstReturn", "First return"),
      ]),
      section<EngagementFormValues>("period", "Tax year", [
        field.date<EngagementFormValues>("taxYearStart", "Year start", {
          required: true,
        }),
        field.date<EngagementFormValues>("taxYearEnd", "Year end", {
          required: true,
        }),
      ]),
      section<EngagementFormValues>(
        "amendment",
        "Amended return",
        [
          field.select<EngagementFormValues>(
            "amendsEngagementYearId",
            "Amends a prior engagement",
            amendableOptions,
            { fullWidth: true },
          ),
          field.text<EngagementFormValues>("amendmentDescription", "Description of changes", {
            fullWidth: true,
          }),
        ],
        {
          description:
            "Leave both blank for an ordinary filing. Set only when this return corrects a return already filed for the SAME client, program and tax year end — a description is required once a prior engagement is selected.",
        },
      ),
    ],
  });
}
