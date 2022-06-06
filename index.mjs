import puppeteer from 'puppeteer';

import { url, username, password } from './settings.mjs';
import { loadCache, updateCache } from './cache.mjs';

const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá'];

const formatTable = (dayData, maxSubjectNameLength) => {
  let hourRow = '   ';
  for (let i = 0; i < 11; i++) {
    hourRow += String(i).padEnd(maxSubjectNameLength + 1, ' ');
  }
  console.log(hourRow);

  dayData.forEach(
    (day, index) => {
      let row = `${dayNames[index]} `;
      day.forEach(subject => {
        subject.length
          ? row += subject.padEnd(maxSubjectNameLength + 1, ' ')
          : row += ' '.repeat(maxSubjectNameLength + 1);
      });
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

  const getDays = await page.evaluate(() => {
    const dayRows = document.querySelectorAll('#schedule .day-row');
    const subjects = [];
    let maxSubjectNameLength = 0;

    dayRows.forEach(
      day => {
        const dayItems = [];
        const subjectElements = day.querySelectorAll('.day-item');

        // Finding the longest subject name
        subjectElements.forEach(
          element => {
            const subjectName = element.querySelector('.middle');
            if (subjectName && subjectName.innerHTML.length > maxSubjectNameLength) {
              maxSubjectNameLength = subjectName.innerHTML.length;
            }
          }
        );

        subjectElements.forEach(
          element => {
            const subjectName = element.querySelector('.middle');
            subjectName
              ? dayItems.push(subjectName.innerText)
              : dayItems.push('');
          }
        );

        subjects.push(dayItems);
      }
    );

    return {
      data: subjects,
      maxSubjectNameLength,
    };
  });

  const cacheData = loadCache();
  let days = {
    data: [],
    maxSubjectNameLength: 0,
  };

  if (Object.keys(cacheData).length) {
    console.log(cacheData);
    days = cacheData.days;
  } else {
    days = getDays;
    updateCache({
      days,
    });
  }

  formatTable(days.data, days.maxSubjectNameLength);

  await browser.close();
})();
