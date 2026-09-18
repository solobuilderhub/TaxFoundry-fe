import { describe, expect, it } from "vitest";
import { buildJacket } from "../app/dashboard/engagements/[id]/return/_lib/jacket-model";

/**
 * The jacket's "balance owing or refund" block — the figure a preparer reads
 * off the summary and acts on.
 *
 * Two things were wrong, and both made the jacket disagree with the return it
 * summarizes:
 *
 *   1. **Federal line refs on every program.** An Alberta preparer was shown
 *      770 / 840 / 590 / 784, none of which appears anywhere on the AT1. The
 *      AT1's own lines are 080, 082 and 090 — and 090 is a single SIGNED line
 *      rather than a balance/refund pair.
 *   2. **The AT1 arithmetic was incomplete.** Line 090 subtracts the
 *      Innovation Employment Grant as well as instalments
 *      (`albertaBalanceUnpaid` in ca-tax). Netting only instalments meant the
 *      jacket and the transmitted 090 stated different amounts owing for any
 *      corporation claiming the grant.
 *
 * The federal behaviour is pinned too, because the fix threads a program
 * conditional through shared code and the T2 side must not move.
 */

const base = {
	status: "draft" as const,
	returnInput: {},
	identity: { corporation: "Test Ltd.", businessNumber: "123456782" },
};

const field = (line: string, value: number) => ({
	line,
	value,
	provenance: "engine" as const,
});

/** `totalOwing` is carried in CENTS at the obligation boundary. */
const owing = (dollars: number) => field("totalOwing", dollars * 100);

const settlementOf = (doc: ReturnType<typeof buildJacket>) =>
	doc.sections.find((s) => s.id === "settlement")?.lines ?? [];
const byRef = (doc: ReturnType<typeof buildJacket>, ref: string) =>
	settlementOf(doc).find((l) => l.ref === ref);

describe("AT1 jacket settlement", () => {
	const at1 = (opts: { tax: number; instalments?: number; ieg?: number }) =>
		buildJacket({
			...base,
			program: "AT1",
			fields: [
				owing(opts.tax),
				...(opts.ieg === undefined
					? []
					: [field("innovationEmploymentGrant", opts.ieg)]),
			],
			returnInput:
				opts.instalments === undefined
					? {}
					: { payments: { instalmentsPaid: opts.instalments } },
		});

	it("labels the figures with Alberta's own line numbers", () => {
		const doc = at1({ tax: 8_000, instalments: 5_000 });
		expect(byRef(doc, "080")?.label).toBe("Alberta tax payable");
		expect(byRef(doc, "082")?.label).toBe("Instalments and other payments");
		expect(byRef(doc, "090")).toBeDefined();
	});

	it("shows no federal line numbers at all", () => {
		const refs = settlementOf(at1({ tax: 8_000, instalments: 5_000 })).map(
			(l) => l.ref,
		);
		for (const federal of ["770", "840", "590", "784"]) {
			expect(
				refs,
				`${federal} is a federal line and has no place on an AT1`,
			).not.toContain(federal);
		}
	});

	it("subtracts the instalments from the balance", () => {
		// The case from the QA run: $8,000 tax, $5,000 paid → $3,000 owing.
		expect(byRef(at1({ tax: 8_000, instalments: 5_000 }), "090")?.value).toBe(
			3_000,
		);
	});

	it("reports an overpayment, not a negative balance owing", () => {
		const doc = at1({ tax: 2_000, instalments: 5_000 });
		const line = byRef(doc, "090");
		expect(line?.label).toBe("Overpayment");
		// Shown as a positive overpayment rather than a negative amount owing —
		// 090 is signed on the wire, but "Overpayment −3,000" reads as a debt.
		expect(line?.value).toBe(3_000);
	});

	it("also subtracts the Innovation Employment Grant, as line 090 does", () => {
		// This is what made the jacket disagree with the filed return: the grant
		// is in `albertaBalanceUnpaid`, and the jacket was ignoring it.
		const doc = at1({ tax: 10_000, instalments: 2_000, ieg: 3_000 });
		expect(byRef(doc, "129")?.value).toBe(3_000);
		expect(byRef(doc, "090")?.value).toBe(5_000); // 10,000 − 2,000 − 3,000
	});

	it("omits the grant row when nothing is claimed", () => {
		expect(byRef(at1({ tax: 8_000, ieg: 0 }), "129")).toBeUndefined();
	});

	/**
	 * Case A02 — Aurora Grid Analytics Inc., an $18M-grind IEG claim, checked
	 * against AuraTax and an independent master model.
	 *
	 * Real reference figures from a differential run, kept because they are an
	 * OUTSIDE check: every other case here asserts our arithmetic against our
	 * own reasoning, and this one against two implementations that share none of
	 * our code.
	 *
	 *   080 tax payable            66,000
	 *   129 IEG                   105,600
	 *   082 instalments           100,000
	 *   090 balance       66,000 − (105,600 + 100,000) = −139,600
	 *
	 * The jacket reported "784 Refund $34,000" — short by exactly the IEG,
	 * because it netted the instalments and not the grant. The federal ref in
	 * that output is the other half of the same bug: an Alberta return labelled
	 * with federal line numbers.
	 */
	it("matches the A02 reference case against AuraTax and the master model", () => {
		const doc = at1({ tax: 66_000, instalments: 100_000, ieg: 105_600 });
		expect(byRef(doc, "090")?.label).toBe("Overpayment");
		expect(byRef(doc, "090")?.value).toBe(139_600);
		// Not $34,000, which is what netting only the instalments produced.
		expect(byRef(doc, "090")?.value).not.toBe(34_000);
	});
});

describe("federal jacket settlement is unchanged", () => {
	const t2 = buildJacket({
		...base,
		program: "T2",
		fields: [owing(9_000)],
		returnInput: { payments: { instalmentsPaid: 4_000 } },
	});

	it("keeps the federal line numbers", () => {
		expect(byRef(t2, "770")?.label).toBe("Total tax payable");
		expect(byRef(t2, "840")?.label).toBe("Tax paid by instalments");
		expect(byRef(t2, "590")?.value).toBe(5_000);
	});

	it("does not net an Innovation Employment Grant — that is an Alberta credit", () => {
		const withIeg = buildJacket({
			...base,
			program: "T2",
			fields: [owing(9_000), field("innovationEmploymentGrant", 3_000)],
			returnInput: { payments: { instalmentsPaid: 4_000 } },
		});
		expect(byRef(withIeg, "590")?.value).toBe(5_000);
	});

	it("still reports a federal refund on its own line", () => {
		const refund = buildJacket({
			...base,
			program: "T2",
			fields: [owing(1_000)],
			returnInput: { payments: { instalmentsPaid: 4_000 } },
		});
		expect(byRef(refund, "784")?.label).toBe("Refund");
		expect(byRef(refund, "784")?.value).toBe(3_000);
	});
});
