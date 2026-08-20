import { defineSchema, section } from "@classytic/formkit/server";
import type { IdentificationValues } from "../../_lib/return-input";
import { fieldsFor } from "../fields";
import { CORP_TYPES, PROVINCE_OPTIONS } from "../options";
import { defineSchedule } from "./define";

const f = fieldsFor<IdentificationValues>();

export const identification = defineSchedule({
  key: "identification",
  num: "200",
  label: "Identification (T2 jacket)",
  hint: "Corporation type & filing triggers",
  schema: defineSchema({
    sections: [
      section(
        "corp",
        "Corporation",
        [
          // formkit `required` drives client-side validation; the server diagnostics
          // engine is the authoritative line-level check (line 040 / Schedule 5).
          f.select("corpType", "Type of corporation (line 040)", CORP_TYPES, { required: true }),
          f.select("province", "Province of permanent establishment", PROVINCE_OPTIONS, {
            required: true,
            description: "Drives Schedule 5 provincial tax (AB & QC file separately)",
          }),
          f.text("quebecId", "Québec enterprise number (NEQ)", {
            description: "CO-17 filing identifier, Revenu Québec / NEQ. Leave blank for a federal-only return.",
          }),
        ],
        { variant: "card", cols: 2 },
      ),
      section(
        "triggers",
        "Filing triggers",
        [
          f.switch("acquisitionOfControl", "Acquisition of control since year start (s.249(4))"),
          f.switch("deemedYearEnd", "Deemed tax year-end (s.249(3.1))"),
          f.switch("professionalCorp", "Professional corporation in a partnership"),
          f.switch("inactive", "Inactive / nil return"),
        ],
        {
          variant: "card",
          cols: 1,
          description: "The yes/no questions that surface the schedules a return needs.",
        },
      ),
      section(
        "status",
        "T2 jacket status questions",
        [
          f.switch("addressChanged", "Has the mailing address changed since the last return? (line 063)"),
          f.switch("firstReturn", "Is this the first year of filing after incorporation? (line 067)"),
          f.switch("nonResident", "Is the corporation a non-resident? (line 071)"),
          f.switch("amalgamation", "Is this the first return after an amalgamation? (line 072)"),
          f.switch("windUp", "Was there a wind-up of a subsidiary (s.88(1))? (line 076)"),
          f.switch("finalReturn", "Is this the final return before dissolution?"),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "The remaining T2 jacket yes/no questions. The rest (donations, dividends, losses, capital gains, SR&ED, foreign credits, associations) are answered automatically from your schedule data. No need to re-enter them.",
        },
      ),
      section(
        "foreign",
        "Foreign reporting (information returns)",
        [
          f.switch("foreignAffiliates", "Did the corporation own shares in a foreign affiliate? (T1134)"),
          f.switch("foreignPropertyOver100k", "Foreign property with total cost over CAD $100,000? (T1135)"),
          f.switch("nonArmsLengthNonResidentTransactions", "Non-arm's-length transactions with non-residents? (T106)"),
          f.switch("relatedCorporations", "Is the corporation related to any other corporations? (Schedule 9)"),
        ],
        {
          variant: "card",
          cols: 1,
          description: "These trigger separate CRA information returns. Answer them explicitly.",
        },
      ),
    ],
  }),
});
