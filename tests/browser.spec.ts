import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

fs.mkdirSync('design/qa', { recursive: true });
async function ready(page: Page) {
  await page.evaluate(async () => { document.querySelectorAll<HTMLImageElement>('img').forEach(img => { img.loading = 'eager'; }); await document.fonts.ready; await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => {}))); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
  await expect.poll(() => page.evaluate(() => Array.from(document.images).every(image => image.complete)), { timeout: 15000 }).toBe(true);
  const broken = await page.evaluate(() => Array.from(document.images).filter(image => image.naturalWidth === 0).map(image => image.src));
  expect(broken).toEqual([]);
}
test('documented pages load at all five widths without overflow or missing images', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.clock.setFixedTime(new Date('2026-10-28T12:00:00Z'));
  for (const width of [1440, 1024, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/rooms', '/rooms/forest-suite', '/experiences', '/about', '/contact', '/booking', '/booking/details']) {
      await page.goto(route); await ready(page);
      const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, offenders: Array.from(document.querySelectorAll<HTMLElement>('main *')).filter(element => { const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.right > innerWidth + 1; }).slice(0, 8).map(element => ({ name: element.dataset.name, tag: element.tagName, right: Math.round(element.getBoundingClientRect().right) })) }));
      expect(overflow.scroll, JSON.stringify({ route, width, ...overflow })).toBeLessThanOrEqual(width + 1);
      if (width === 1440 || width === 390) await page.screenshot({ path: `design/qa/${route.replaceAll('/', '_') || 'home'}-${width}.png`, fullPage: true });
    }
  }
  expect(errors).toEqual([]);
});
test('room filtering, sorting, galleries, and mobile navigation work', async ({ page }) => {
  await page.goto('/rooms');
  await page.getByRole('button', { name: '4 guests', exact: true }).click();
  await expect(page.locator('[data-name="Room listing"]')).toHaveCount(1);
  await expect(page.locator('[data-name="Room listing"]')).toContainText('Summit Residence');
  await page.getByRole('button', { name: 'All rooms (3)', exact: true }).click();
  const sort = page.getByRole('combobox', { name: 'Sort rooms by price' });
  await sort.click();
  await expect(page.getByRole('option', { name: 'Price, low to high', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('option', { name: 'Price, high to low', exact: true }).click();
  await expect(sort).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-name="Room listing"]').first()).toContainText('Summit Residence');
  await sort.focus();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-name="Room listing"]').first()).toContainText('Forest Suite');
  await page.keyboard.press('Enter');
  await page.keyboard.press('End');
  await page.keyboard.press('Escape');
  await expect(sort).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-name="Room listing"]').first()).toContainText('Forest Suite');
  await sort.click();
  await page.getByRole('heading', { name: 'Stay close to what matters.' }).click();
  await expect(sort).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Open Summit Residence photos' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/); await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('booking validates capacity and guest details, calculates totals, and creates a local demo', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-28T12:00:00Z'));
  await page.goto('/booking');
  await expect(page.locator('.summary-total')).toContainText('$555');
  await expect(page.getByRole('button', { name: 'Add children' })).toBeDisabled();
  await page.getByRole('radio', { name: /Summit Residence/ }).check();
  await page.getByRole('button', { name: 'Add children' }).click();
  await expect(page.locator('.summary-total')).toContainText('$1,260');
  await page.getByRole('radio', { name: /Forest Suite/ }).check();
  await page.getByRole('button', { name: 'Continue to your details' }).click();
  await expect(page.getByRole('alert')).toContainText('maximum of 2 guests');
  await page.getByRole('button', { name: 'Remove children' }).click();
  await page.getByRole('button', { name: 'Continue to your details' }).click();
  await expect(page).toHaveURL(/\/booking\/details$/);
  await page.getByRole('button', { name: 'Review your stay' }).click(); await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('First name *', { exact: true }).fill('Mara');
  await page.getByLabel('Last name *', { exact: true }).fill('Ackermann');
  await page.getByLabel('Email address *', { exact: true }).fill('mara@');
  await page.getByLabel('Country / region *').selectOption('Switzerland');
  await page.getByLabel('Phone number (optional)').fill('+41 79 555 01 26');
  await page.getByLabel('Anything we should know? (optional)').fill('We would love a quiet room and vegetarian breakfast options.');
  await page.getByRole('button', { name: 'Review your stay' }).click();
  await expect(page.getByRole('alert')).toContainText('Two things need your attention.');
  for (const width of [1440, 390]) { await page.setViewportSize({ width, height: 1000 }); await ready(page); await page.screenshot({ path: `design/qa/details-errors-${width}.png`, fullPage: true }); }
  await page.getByLabel('Email address *', { exact: true }).fill('mara.ackermann@example.com');
  await page.getByLabel(/I accept the demo booking terms/).check();
  await page.getByRole('button', { name: 'Review your stay' }).click();
  await expect(page).toHaveURL(/\/booking\/review$/);
  for (const width of [1440, 390]) { await page.setViewportSize({ width, height: 1000 }); await ready(page); await page.screenshot({ path: `design/qa/review-${width}.png`, fullPage: true }); }
  await page.getByRole('button', { name: 'Create demo confirmation' }).click();
  await expect(page).toHaveURL(/\/booking\/confirmation$/);
  await expect(page.locator('.confirmation-banner')).toContainText('NOT A REAL RESERVATION');
  await expect(page.locator('.reservation-reference')).toContainText(/DEMO-AER261116-[A-F0-9]{6}/);
  for (const width of [1440, 390]) { await page.setViewportSize({ width, height: 1000 }); await ready(page); await page.screenshot({ path: `design/qa/confirmation-${width}.png`, fullPage: true }); }
  const storage = await page.evaluate(() => JSON.stringify(localStorage));
  expect(storage).not.toContain('mara.ackermann@example.com'); expect(storage).not.toContain('Ackermann');
  await page.reload(); await expect(page.locator('.confirmation-banner')).toBeVisible();
  await page.goto('/booking/review'); await expect(page).toHaveURL(/\/booking\/details$/);
});
test('calendar dates update the summary and persist without storing guest details', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-28T12:00:00Z'));
  await page.goto('/booking');
  await expect(page.getByRole('button', { name: /Tuesday,? 27 October 2026/ })).toBeDisabled();
  await page.getByRole('button', { name: /Friday,? 20 November 2026/ }).click();
  await page.getByRole('button', { name: /Tuesday,? 24 November 2026/ }).click();
  await expect(page.locator('.summary-total')).toContainText('$740');
  await page.reload(); await expect(page.locator('.summary-total')).toContainText('$740');
});
test('contact form validates required fields and reports a local demo success', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send your note' }).click();
  await expect(page.locator('input[name="firstName"]')).toBeFocused();
  await page.getByLabel('First name *', { exact: true }).fill('Demo');
  await page.getByLabel('Last name *', { exact: true }).fill('Guest');
  await page.getByLabel('Email address *', { exact: true }).fill('demo@example.com');
  await page.getByLabel('Your message *', { exact: true }).fill('This is a local demonstration.');
  await page.getByLabel(/I agree to the privacy policy/).check();
  await page.getByRole('button', { name: 'Send your note' }).click();
  await expect(page.getByRole('status')).toContainText('No message was sent');
});
test('normal-motion navigation remains usable and the unknown route has a home action', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/'); await ready(page);
  await expect(page.getByRole('link', { name: 'Discover the retreat' })).toBeVisible();
  await page.getByRole('link', { name: 'Discover the retreat' }).click();
  await expect(page.locator('#retreat')).toBeInViewport();
  await page.goto('/unknown-route'); await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Back to the mountains' }).click(); await expect(page).toHaveURL(/\/$/);
  expect(errors).toEqual([]);
});
