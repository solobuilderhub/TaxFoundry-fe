import { defineSchema, section } from "@classytic/formkit/server";
import type { GifiNotesValues } from "../../_lib/return-input";
import { fieldsFor } from "../fields";
import { defineSchedule } from "./define";

const f = fieldsFor<GifiNotesValues>();

export const gifiNotes = defineSchedule({
  key: "gifiNotes",
  num: "141",
  label: "GIFI Notes Checklist",
  hint: "Financial-statement notes",
  schema: defineSchema({
    sections: [
      section(
        "notes",
        "Notes checklist (S141)",
        [
          f.switch("financialStatementsIncluded", "Financial statements are included / attached"),
          f.switch("preparedByAccountant", "Prepared by an external accountant"),
          f.switch("reviewEngagement", "Review engagement report"),
          f.switch("auditEngagement", "Audit engagement report"),
        ],
        {
          variant: "card",
          cols: 1,
          description: "Mandatory even when empty. Declares who prepared the statements.",
        },
      ),
    ],
  }),
});
