import puppeteer from 'puppeteer';

import { url, username, password } from './settings.mjs';

const dayNames = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek'];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.goto(`${url}/login`);
  await page.type('#username', username);
  await page.type('#password', password);
  await page.click('#loginButton');
  await page.goto(`${url}/next/rozvrh.aspx`);

  const getSubjects = await page.evaluate(() => {
    const dayRows = document.querySelectorAll('#schedule .day-row'); // OK
    const subjects = [];

    dayRows.forEach(
      day => {
        const dayItems = [];
        const subjectElements = day.querySelectorAll('.day-item');

        subjectElements.forEach(
          element => {
            const subjectName = element.querySelector('.middle');
            subjectName
              ? dayItems.push(subjectName.innerText)
              : dayItems.push('Pauza');
          }
        );

        subjects.push(dayItems);
      }
    );

    return subjects;
  });

  getSubjects.forEach(
    (day, index) => {
      let row = `${dayNames[index]}: `;
      day.forEach(subject => row += `${subject} `);
      console.log(row);
    }
  );

  await browser.close();
})();
