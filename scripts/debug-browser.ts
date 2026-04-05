/**
 * Opens the app in a visible browser and streams console logs to the terminal.
 * Usage: npx playwright test scripts/debug-browser.ts --headed
 * Or:    npx tsx scripts/debug-browser.ts
 */
import { chromium } from 'playwright';

const APP_URL = 'http://localhost:5173/';

async function main() {
	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();

	// Stream all console messages to terminal
	page.on('console', (msg) => {
		const type = msg.type().padEnd(5);
		const text = msg.text();
		console.log(`[browser:${type}] ${text}`);
	});

	// Stream errors
	page.on('pageerror', (err) => {
		console.error(`[browser:ERROR] ${err.message}`);
	});

	console.log(`Opening ${APP_URL} — logs will stream below. Press Ctrl+C to stop.\n`);
	await page.goto(APP_URL);

	// Keep the browser open until Ctrl+C
	await new Promise(() => {});
}

main().catch(console.error);
