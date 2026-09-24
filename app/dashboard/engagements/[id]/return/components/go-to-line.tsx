"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { findLines } from "../_config/line-index";

/**
 * "Go to line" — type a line number (062), a schedule and line (1 031), or
 * words from the caption (taxable income), and open that form at that line.
 *
 * Every tax package has one, and the AT1 has fifteen forms: a preparer with a
 * TRA notice citing "Schedule 12 line 080" should not have to know which
 * sidebar entry holds it. Ctrl/⌘+K opens it from anywhere on the return.
 */
export function GoToLine({
	onGo,
}: {
	onGo: (formId: string, lineId: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const hits = findLines(query);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setOpen((v) => !v);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex w-full items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent"
			>
				<Search className="size-3.5" />
				<span className="flex-1">Go to line…</span>
				<Kbd>Ctrl K</Kbd>
			</button>
			{/* Mounted only while open: its (visually hidden) title is a heading,
			    and a closed palette should not add one to every return page. */}
			{open && (
				<CommandDialog
					open={open}
					onOpenChange={(o) => {
						setOpen(o);
						if (!o) setQuery("");
					}}
					title="Go to line"
					description="A line number, a schedule and line, or words from the caption"
				>
					{/* The index does its own matching; cmdk's fuzzy filter would re-rank it. */}
					<Command shouldFilter={false}>
						<CommandInput
							value={query}
							onValueChange={setQuery}
							placeholder="062 · 1 031 · taxable income"
						/>
						<CommandList>
							{query.trim() !== "" && (
								<CommandEmpty>No line matches “{query}”.</CommandEmpty>
							)}
							{hits.map((h) => (
								<CommandItem
									key={`${h.formId}-${h.lineId}`}
									value={`${h.formId}-${h.lineId}`}
									onSelect={() => {
										onGo(h.formId, h.lineId);
										setOpen(false);
										setQuery("");
									}}
								>
									<span className="w-9 shrink-0 rounded bg-muted px-1 py-0.5 text-center font-mono text-[11px] text-muted-foreground">
										{h.num}
									</span>
									<span className="w-9 shrink-0 font-mono text-xs">
										{h.line}
									</span>
									<span className="min-w-0 flex-1 truncate">{h.caption}</span>
								</CommandItem>
							))}
						</CommandList>
					</Command>
				</CommandDialog>
			)}
		</>
	);
}
