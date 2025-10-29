const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

// ==== CONFIGURATION ====
const TARGET_URL = 'https://antoireachtas.ie/imeachtai/'; // <--- your target website
const VIEWPORT = { width: 1920, height: 1080 }; // screen resolution
const INTERVAL_MINUTES = 1; // how often to refresh screenshot
// ========================

async function captureAndUpload() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  console.log(`\n[${new Date().toLocaleTimeString()}] Capturing ${TARGET_URL} ...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });

  await page.screenshot({ path: 'screenshot.png', fullPage: false });
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
    console.log(`⏳ Waiting ${INTERVAL_MINUTES} minutes before next capture...`);
    await new Promise(r => setTimeout(r, INTERVAL_MINUTES * 60 * 1000));
  }
}

runForever();
