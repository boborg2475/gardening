/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
	testRunner: 'vitest',
	mutate: [
		'src/lib/data/db.ts',
		'src/lib/data/event-store.ts',
		'src/lib/stores/materialized-state.svelte.ts',
		'src/lib/types/**/*.ts',
		'!src/**/*.test.ts'
	],
	reporters: ['clear-text', 'html', 'json'],
	jsonReporter: {
		fileName: 'reports/mutation/mutation-report.json'
	},
	htmlReporter: {
		fileName: 'reports/mutation/index.html'
	},
	coverageAnalysis: 'perTest',
	thresholds: {
		high: 80,
		low: 60,
		break: 50
	}
};
