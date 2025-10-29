const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

// === CONFIG ===
const TARGET_URL = 'https://antoireachtas.ie/imeachtai/'; // <-- your target website
const VIEWPORT = { width: 1920, height: 1080 }; // adjust to your screens
const INTERVAL_MINUTES = 0.5; // 0.5 min = 30 seconds
// ===============

async function captureAndUpload() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  console.log(`[${new Date().toLocaleTimeString()}] Capturing ${TARGET_URL} ...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.screenshot({
  path: 'screenshot.png',
  clip: { x: 0, y: 0, width: 1920, height: 970 } // crop bottom 110px
});
  await browser.close();
  console.log('✅ Screenshot saved.');

  try {
    execSync('git add screenshot.png', { stdio: 'inherit' });
    execSync('git commit -m "Auto update screenshot" || echo "no changes"', { stdio: 'inherit', shell: true });
    execSync('git push', { stdio: 'inherit' });
    console.log('✅ Uploaded to GitHub Pages.');
  } catch (err) {
    console.error('⚠️ Git push failed or no changes:', err.message);
  }
}

async function runForever() {
  while (true) {
    await captureAndUpload();
    console.log(`⏳ Waiting ${INTERVAL_MINUTES * 60} seconds before next capture...`);
    await new Promise(r => setTimeout(r, INTERVAL_MINUTES * 60 * 1000));
  }
}

runForever();
