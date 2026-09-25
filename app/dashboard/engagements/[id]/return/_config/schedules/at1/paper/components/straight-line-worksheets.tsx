"use client";

import type { Control, FieldValues } from "react-hook-form";
import { PaperSection } from "./paper-primitives";
import { WorksheetMoneyField, WorksheetTable } from "./worksheet-table";

/**
 * The class 13 and class 14 worksheets — the two straight-line CCA classes,
 * which are not rows of the declining-balance grid.
 *
 * Shared by the federal Schedule 8 and AT1 Schedule 13, whose slices use the
 * same field names for them. The one difference is what a blank means: on
 * AT1 Schedule 13 a blank opening UCC or claim takes the federal figure; on
 * Schedule 8 there is nothing behind it — a blank claim is the maximum the
 * layers allow.
 */
export function StraightLineWorksheets<T extends FieldValues>({
	control,
	disabled,
	blankMeans,
	class13Description,
}: {
	control: Control<T>;
	disabled?: boolean;
	/** The placeholder a blank opening UCC or claim shows — "Federal" on the AT1, "Maximum" on the T2. */
	blankMeans: { opening: string; claim: string };
	class13Description: string;
}) {
	const header = (opening: string, claim: string, claimLabel: string) => (
		<div className="pt-1">
			<WorksheetMoneyField
				control={control}
				name={opening}
				label="Opening UCC"
				placeholder={blankMeans.opening}
				disabled={disabled}
			/>
			<WorksheetMoneyField
				control={control}
				name={claim}
				label={claimLabel}
				placeholder={blankMeans.claim}
				disabled={disabled}
			/>
		</div>
	);
	const claimLabel = blankMeans.claim === "Federal" ? "Alberta claim" : "Claim";
	return (
		<>
			<PaperSection
				title="Class 13 worksheet — leasehold interests"
				description={class13Description}
			>
				{header("class13OpeningUCC", "class13Claim", claimLabel)}
				<WorksheetTable
					control={control}
					name="class13Layers"
					disabled={disabled}
					addLabel="+ Add a leasehold layer"
					emptyText="No layers added this year."
					columns={[
						{ name: "description", label: "Description", kind: "text" },
						{ name: "capitalCost", label: "Capital cost", kind: "money" },
						{
							name: "leaseEnd",
							label: "Lease end",
							kind: "date",
							hint: "The 12-month period count is derived from this and the tax year start.",
						},
						{
							name: "firstRenewalEnd",
							label: "First renewal end",
							kind: "date",
							hint: "Where the lease grants renewal rights — replaces the lease end for the period count.",
						},
						{
							name: "claimedToDate",
							label: "CCA claimed in prior years",
							kind: "money",
						},
						{ name: "proceeds", label: "Disposition proceeds", kind: "money" },
						{ name: "isFirstYear", label: "First tax year", kind: "bool" },
						{ name: "aiip", label: "AIIP", kind: "bool" },
					]}
				/>
			</PaperSection>
			<PaperSection
				title="Class 14 worksheet — limited-life intangibles"
				description="Straight-line, prorated per property by the life it had left when acquired."
			>
				{header("class14OpeningUCC", "class14Claim", claimLabel)}
				<WorksheetTable
					control={control}
					name="class14Properties"
					disabled={disabled}
					addLabel="+ Add a property"
					emptyText="No properties added this year."
					columns={[
						{ name: "description", label: "Description", kind: "text" },
						{ name: "capitalCost", label: "Capital cost", kind: "money" },
						{
							name: "lifeDaysAtAcquisition",
							label: "Days of life remaining at acquisition",
							kind: "number",
							hint: "Days the property had REMAINING when the cost was incurred — not its total life.",
						},
					]}
				/>
			</PaperSection>
		</>
	);
}
