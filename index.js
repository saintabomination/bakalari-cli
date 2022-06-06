const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('https://www.seznam.cz/');
  await page.screenshot({
    path: 'test.png',
  });
  await browser.close();
})();
