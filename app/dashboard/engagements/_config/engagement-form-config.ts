import { defineSchema, field, section } from "@classytic/formkit";
import { ENGAGEMENT_PROGRAMS } from "@/api/engagements";

export type EngagementFormValues = {
  clientId: string;
  program: (typeof ENGAGEMENT_PROGRAMS)[number];
  firstReturn?: boolean;
  taxYearStart: string;
  taxYearEnd: string;
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
 */
export function getEngagementFormSchema(clientOptions: SelectOption[]) {
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
    ],
  });
}
