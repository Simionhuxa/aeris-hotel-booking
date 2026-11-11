import { chromium } from '@playwright/test';
import fs from 'node:fs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
await page.goto('http://127.0.0.1:5174/');
await page.evaluate(async () => { document.querySelectorAll('img').forEach(img => img.loading = 'eager'); await document.fonts.ready; await Promise.all(Array.from(document.images).map(image => image.decode().catch(() => {}))); });
await page.waitForFunction(() => Array.from(document.images).every(img => img.complete));
const data = await page.evaluate(() => ({
  images: Array.from(document.images).filter(img => img.classList.contains('editorial-image')).map(img => ({ src: img.src, rect: img.getBoundingClientRect().toJSON(), css: { visibility: getComputedStyle(img).visibility, opacity: getComputedStyle(img).opacity, display: getComputedStyle(img).display }, parent: img.parentElement.dataset.name, parentOpacity: getComputedStyle(img.parentElement).opacity })),
  sections: Array.from(document.querySelectorAll('main > .design-node > section')).map(section => ({ name: section.dataset.name, y: section.offsetTop, height: section.offsetHeight })),
  fonts: Array.from(document.fonts).map(font => ({ family: font.family, status: font.status })),
}));
fs.writeFileSync('design/qa/visual-audit.json', JSON.stringify(data, null, 2));
console.log(JSON.stringify(data));
await page.screenshot({ path: 'design/qa/home-hero-1440.png', clip: { x: 0, y: 0, width: 1440, height: 1000 } });
await browser.close();
