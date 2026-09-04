import { defineConfig } from "vitest/config";

/**
 * The forms-drift + line-citation checks. Vitest defaults are enough — both
 * suites import `describe`/`expect`/`it` explicitly and read files directly
 * with `node:fs`, so no globals, environment, or setup files needed.
 *
 * This file exists to STOP config inheritance, not to configure anything.
 * Vitest searches upward for a config, so without one here a run started
 * from this directory picks up the repo-root config and tries to resolve
 * its project list relative to THIS directory instead of its own.
 */
export default defineConfig({
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
	},
});
