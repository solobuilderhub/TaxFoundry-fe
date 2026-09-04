import { defineSchema, section } from "@classytic/formkit/server";
import { createElement } from "react";
import type { IdentificationValues } from "../../../_lib/return-input";
import { fieldsFor } from "../../fields";
import { PROVINCE_OPTIONS } from "../../options";
import { defineSchedule } from "../shared/define";
import { IdentificationFormView } from "./paper/identification-form-view";

const f = fieldsFor<IdentificationValues>();

export const identification = defineSchedule({
  key: "identification",
  num: "200",
  label: "Identification (T2 jacket)",
  hint: "Corporation type & filing triggers",
  formView: (props) => createElement(IdentificationFormView, props),
  schema: defineSchema({
    sections: [
      section(
        "corp",
        "Corporation",
        [
          f.select("province", "Province of permanent establishment", PROVINCE_OPTIONS, {
            required: true,
            description: "Drives Schedule 5 provincial tax (AB & QC file separately)",
          }),
          f.text("quebecId", "Québec enterprise number (NEQ)", {
            description: "CO-17 filing identifier, Revenu Québec / NEQ. Leave blank for a federal-only return.",
          }),
        ],
        {
          variant: "card",
          cols: 2,
          description:
            "Type of corporation (line 040) is set on the CLIENT record, not here — it's a trust-boundary fact (drives SBD/CCPC eligibility), so this app derives it authoritatively from the client and never lets a return input override it. Edit it from the client's own page.",
        },
      ),
      section(
        "triggers",
        "Filing triggers",
        [
          f.switch("acquisitionOfControl", "Acquisition of control since year start (s.249(4)) (line 063)"),
          f.switch("deemedYearEnd", "Deemed tax year-end (s.249(3.1)) (line 066)"),
          f.switch("professionalCorp", "Professional corporation in a partnership (line 067)"),
          f.switch("inactive", "Inactive / nil return"),
        ],
        {
          variant: "card",
          cols: 1,
          description:
            "The yes/no questions that surface the schedules a return needs, and answer the matching T2 jacket lines in the filed CIF payload. NOT wired to any computed dollar figure — acquisitionOfControl/deemedYearEnd genuinely can trigger a short tax year with its own proration, which this app does not yet model. See research/findings/federal/T2-identification-schedule-is-inert.md.",
        },
      ),
      section(
        "status",
        "T2 jacket status questions",
        [
          // Line citations corrected 2026-09 against the rendered PDF
          // (research/sources/cra-forms/pdf/T2-jacket.pdf, pages 1-2) — every
          // one of the five below cited the WRONG line number before this fix
          // (063/067/071/072 respectively, each shifted onto a DIFFERENT real
          // question). Now wired into the filed CIF questionnaire's Yes/No
          // lines (apps/server's t2-cif.service.ts) — still no computed
          // dollar-figure consequence for any of them.
          f.switch("addressChanged", "Has an address changed since the last return? (lines 010/020/030 — head office, mailing, or books-and-records; this app asks it as one combined question)"),
          f.switch("firstReturn", "Is this the first year of filing after incorporation? (line 070)"),
          f.switch("nonResident", "Is the corporation a non-resident? (line 080 asks the OPPOSITE — 'Is the corporation a resident of Canada?')"),
          f.switch("amalgamation", "Is this the first return after an amalgamation? (line 071)"),
          f.switch("windUp", "Was there a wind-up of a subsidiary (s.88(1))? (line 072)"),
          f.switch("finalReturn", "Is this the final return up to dissolution? (line 078)"),
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
