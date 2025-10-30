const puppeteer = require('puppeteer');
const fs = require('fs');
const { execSync } = require('child_process');
const express = require('express');

// ===== CONFIG =====
const TARGET_URL = 'https://antoireachtas.ie/imeachtai/';     // webpage you want
const VIEWPORT = { width: 1920, height: 1080 };
const CROP_HEIGHT = 1;                      // crop bottom 100px
const UPDATE_INTERVAL_MS = 15000;             // 15 seconds
const PORT = 8080;
// ==================

const app = express();
app.use(express.static('docs')); // serve your /docs folder
app.listen(PORT, () =>
  console.log(`✅ Local server running: http://localhost:${PORT}`)
);

async function captureAndPush() {
  console.log(`[${new Date().toLocaleTimeString()}] Capturing ${TARGET_URL} ...`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.screenshot({
    path: 'docs/screenshot.png',
    clip: { x: 0, y: 0, width: 1920, height: CROP_HEIGHT }
  });
  await browser.close();
  console.log('📸 Screenshot saved locally.');

  try {
    execSync('git add docs/screenshot.png');
    execSync(`git commit -m "Update screenshot at ${new Date().toISOString()}"`);
    execSync('git push origin main');
    console.log('⬆️  Pushed to GitHub.');
  } catch (err) {
    console.warn('⚠️  Git push skipped or failed (likely no changes).');
  }
}

(async function loop() {
  while (true) {
    await captureAndPush();
    await new Promise(r => setTimeout(r, UPDATE_INTERVAL_MS));
  }
})();
