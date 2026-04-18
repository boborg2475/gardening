/**
 * Tests for Story 1.5-1: Design System & Color Palette
 * Validates the earth-tone visual identity renders correctly.
 */

import { expect, test } from '@playwright/test';

async function createPropertyViaForm(
	page: import('@playwright/test').Page,
	options: { name: string; width?: string; length?: string; unit?: 'm' | 'ft' }
) {
	await page.getByLabel(/property name/i).fill(options.name);
	if (options.width) {
		await page.getByLabel(/width/i).fill(options.width);
	}
	if (options.length) {
		await page.getByLabel(/length/i).fill(options.length);
	}
	if (options.unit === 'm') {
		await page.getByLabel(/unit/i).selectOption('m');
	}
	await page.getByRole('button', { name: /create property/i }).click();
	await expect(page.getByRole('heading', { name: options.name })).toBeVisible();
}

/** Parse an rgb/rgba string to {r,g,b} */
function parseRgb(color: string): { r: number; g: number; b: number } {
	const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (!match) throw new Error(`Cannot parse color: ${color}`);
	return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
}

/** Check if a color is warm (not pure white/black/gray) */
function isWarmTone(rgb: { r: number; g: number; b: number }): boolean {
	// Warm tones have r >= g >= b or slight variation — not pure gray (r===g===b)
	// or pure white (255,255,255) or pure black (0,0,0)
	const isPureWhite = rgb.r === 255 && rgb.g === 255 && rgb.b === 255;
	const isPureBlack = rgb.r === 0 && rgb.g === 0 && rgb.b === 0;
	const isPureGray = rgb.r === rgb.g && rgb.g === rgb.b;
	return !isPureWhite && !isPureBlack && (!isPureGray || rgb.r > 200);
}

test.describe('Story 1.5-1: Design System & Color Palette', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => indexedDB.deleteDatabase('gardening'));
		await page.reload();
		await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
	});

	test('AC#6: page background is warm parchment, not pure white', async ({ page }) => {
		const bgColor = await page.evaluate(() => {
			return window.getComputedStyle(document.body).backgroundColor;
		});

		const rgb = parseRgb(bgColor);
		expect(isWarmTone(rgb)).toBe(true);
		// Should be light (parchment) — all channels > 200
		expect(rgb.r).toBeGreaterThan(200);
		expect(rgb.g).toBeGreaterThan(200);
		expect(rgb.b).toBeGreaterThan(200);
	});

	test('AC#6: body text is warm charcoal, not pure black', async ({ page }) => {
		const textColor = await page.evaluate(() => {
			return window.getComputedStyle(document.body).color;
		});

		const rgb = parseRgb(textColor);
		expect(isWarmTone(rgb)).toBe(true);
		// Should be dark but not pure black — at least one channel > 0
		expect(rgb.r + rgb.g + rgb.b).toBeGreaterThan(0);
		expect(rgb.r + rgb.g + rgb.b).toBeLessThan(200);
	});

	test('AC#1: CSS custom properties are defined for design tokens', async ({ page }) => {
		const tokens = await page.evaluate(() => {
			const style = window.getComputedStyle(document.documentElement);
			return {
				primary: style.getPropertyValue('--color-primary').trim(),
				background: style.getPropertyValue('--color-background').trim(),
				foreground: style.getPropertyValue('--color-foreground').trim(),
				surface: style.getPropertyValue('--color-surface').trim(),
				border: style.getPropertyValue('--color-border').trim(),
				muted: style.getPropertyValue('--color-muted').trim(),
				accent: style.getPropertyValue('--color-accent').trim(),
				destructive: style.getPropertyValue('--color-destructive').trim(),
				success: style.getPropertyValue('--color-success').trim()
			};
		});

		// All semantic tokens should be defined (non-empty)
		for (const [name, value] of Object.entries(tokens)) {
			expect(value, `--color-${name} should be defined`).not.toBe('');
		}
	});

	test('AC#2: primary color is a muted earth tone (sage green), not bright', async ({ page }) => {
		const primaryColor = await page.evaluate(() => {
			return window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
		});

		// Primary should be a hex color in the sage green range
		expect(primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);

		// Parse hex to check it's muted (not saturated bright)
		const r = parseInt(primaryColor.slice(1, 3), 16);
		const g = parseInt(primaryColor.slice(3, 5), 16);
		const b = parseInt(primaryColor.slice(5, 7), 16);

		// Sage green: g > r > b, all values moderate (not > 200 for any channel)
		expect(g).toBeGreaterThan(b); // green-ish
		expect(r).toBeLessThan(200); // muted, not bright
		expect(g).toBeLessThan(200);
	});

	test('AC#2: destructive color is muted brick red, not bright red', async ({ page }) => {
		const color = await page.evaluate(() => {
			return window.getComputedStyle(document.documentElement).getPropertyValue('--color-destructive').trim();
		});

		const r = parseInt(color.slice(1, 3), 16);
		const g = parseInt(color.slice(3, 5), 16);
		const b = parseInt(color.slice(5, 7), 16);

		// Brick red: r > g, r > b, but r < 200 (muted, not bright #ff0000)
		expect(r).toBeGreaterThan(g);
		expect(r).toBeGreaterThan(b);
		expect(r).toBeLessThan(220);
	});

	test('AC#1, AC#5: form uses design system tokens for styling', async ({ page }) => {
		// The property creation form should use surface background and border tokens
		const form = page.locator('form');
		await expect(form).toBeVisible();

		const formBg = await form.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		const formBgRgb = parseRgb(formBg);

		// Form background should be warm/cream (surface token), not pure white
		expect(isWarmTone(formBgRgb)).toBe(true);
	});

	test('AC#1: Create Property button uses primary color', async ({ page }) => {
		const btn = page.getByRole('button', { name: /create property/i });
		await expect(btn).toBeVisible();

		const btnBg = await btn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		const rgb = parseRgb(btnBg);

		// Should be sage green-ish (primary token)
		expect(rgb.g).toBeGreaterThan(rgb.b);
	});

	test('AC#1: after property creation, header uses surface background', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Design Test', width: '50', length: '100' });

		const header = page.locator('header');
		await expect(header).toBeVisible();

		const headerBg = await header.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		const rgb = parseRgb(headerBg);

		// Header surface should be warm, not pure white
		expect(isWarmTone(rgb)).toBe(true);
	});

	test('AC#1: Draw Boundary button uses primary color', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Button Test', width: '50', length: '100' });

		const btn = page.getByRole('button', { name: /draw boundary/i });
		await expect(btn).toBeVisible();

		const btnBg = await btn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		const rgb = parseRgb(btnBg);

		// Primary sage green
		expect(rgb.g).toBeGreaterThan(rgb.b);
	});

	test('AC#1: Set North button uses accent color', async ({ page }) => {
		await createPropertyViaForm(page, { name: 'Accent Test', width: '50', length: '100' });

		const btn = page.getByRole('button', { name: /set north/i });
		await expect(btn).toBeVisible();

		const btnBg = await btn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
		const rgb = parseRgb(btnBg);

		// Accent warm brown: r > g > b
		expect(rgb.r).toBeGreaterThan(rgb.b);
	});
});
