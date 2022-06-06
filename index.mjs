import puppeteer from 'puppeteer';

import { url, username, password } from './settings.mjs';

const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá'];

const formatTable = dayData => {
  let hourRow = '   ';
  for (let i = 0; i < 11; i++) {
    hourRow += String(i).padEnd(5, ' ');
  }
  console.log(hourRow);

  dayData.forEach(
    (day, index) => {
      let row = `${dayNames[index]} `;
      day.forEach(subject => row += `${subject} `);
      console.log(row);
    }
  );
}

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
    const dayRows = document.querySelectorAll('#schedule .day-row');
    const subjects = [];

    dayRows.forEach(
      day => {
        const dayItems = [];
        const subjectElements = day.querySelectorAll('.day-item');

        subjectElements.forEach(
          element => {
            const subjectName = element.querySelector('.middle');
            subjectName
              ? dayItems.push(subjectName.innerText.padEnd(4, ' '))
              : dayItems.push('    ');
          }
        );

        subjects.push(dayItems);
      }
    );

    return subjects;
  });

  formatTable(getSubjects);

  await browser.close();
})();
