const puppeteer = require('puppeteer-core');

require('dotenv').config();
const chromePath = process.env.CHROME_PATH;

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
    chromePath,
    headless: false
  });
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'example.png' });

  await browser.close();
})();