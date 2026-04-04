import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run build && npm run preview', port: 4173 },
	testDir: 'tests/e2e',
	testMatch: '**/*.e2e.{ts,js}',
	reporter: process.env.CI
		? [['json', { outputFile: 'reports/playwright/results.json' }], ['list']]
		: 'list'
});
