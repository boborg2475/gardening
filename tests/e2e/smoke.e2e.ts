/**
 * Story 1.3: Property Creation (E2E smoke)
 *
 * Traceability:
 * AC#1 (FR1) → 'home page loads and shows property creation form' — onboarding form renders when no property exists
 */

import { expect, test } from '@playwright/test';

test('home page loads and shows property creation form (Story 1.3 AC#1, FR1)', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: /create your property/i })).toBeVisible();
	await expect(page.getByLabel(/property name/i)).toBeVisible();
	await expect(page.getByRole('button', { name: /create property/i })).toBeVisible();
});
