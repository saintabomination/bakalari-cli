import puppeteer from 'puppeteer';

import { url, username, password } from './settings.mjs';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto(url);
  await page.type('#username', username);
  await page.type('#password', password);
  await page.click('#loginButton');

  // await browser.close();
})();
