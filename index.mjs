import puppeteer from 'puppeteer';
import promptSync from 'prompt-sync';

import { url, username, password } from './settings.mjs';
import { loadCache, updateCache, deleteCache } from './cache.mjs';

const prompt = promptSync({
  sigint: true,
});

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
        subject.name.length
          ? row += subject.name.padEnd(maxSubjectNameLength + 1, ' ')
          : row += ' '.repeat(maxSubjectNameLength + 1);
      });
      console.log(row);
    }
  );
}

const getData = async () => {
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
            const subjectInfo = element.querySelector('.day-item-hover');

            dayItems.push({
              name: subjectName ? subjectName.innerText : '',
              info: subjectInfo ? JSON.parse(subjectInfo.getAttribute('data-detail')) : '',
            });
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

  let days = {
    data: [],
    maxSubjectNameLength: 0,
  };

  days = getDays;
  updateCache({
    days,
  });

  await browser.close();
};

const cacheData = loadCache();
let days = {
  data: [],
  maxSubjectNameLength: 0,
};

if (Object.keys(cacheData).length) {
  days = cacheData.days;
} else {
  await getData();
  days = loadCache().days;
}

let isInputting = true;
while (isInputting) {
  const input = prompt('> ');
  const splitInput = input.split(' ');

  switch (splitInput[0]) {
    case 'rmcache':
      deleteCache();
      break;

    case 'rozvrh':
      formatTable(days.data, days.maxSubjectNameLength);
      break;

    case 'exit':
      isInputting = false;
      break;

    case 'pocethodin':
      if (splitInput.length < 2 || splitInput[1] === '') {
        console.log('Nebyla zadána žádná hodina.');
        console.log('Nápověda: pocethodin [HODINA]');
        break;
      }

      const selectedSubject = splitInput[1];
      let totalCount = 0;

      days.data.forEach(
        day =>
        totalCount += day.filter(subject => subject.name === selectedSubject.toUpperCase()).length
      );

      console.log(`Celkový počet hodin ${splitInput[1].toUpperCase()} v týdnu: ${totalCount}`);
      break;

    case 'ucitele':
      if (splitInput.length < 2 || splitInput[1] === '') {
        console.log('Tento den nebyl nalezen.');
        console.log('Nápověda: ucitele [DEN]');
        break;
      }
    
      const selectedDay = Number(splitInput[1] - 1);
      let filteredTeachers = [];

      if (days.data[selectedDay]) {
        days.data[selectedDay].forEach(
          subject => {
            if (!filteredTeachers.includes(subject.info.teacher)) {
              filteredTeachers.push(subject.info.teacher);
            }
          }
        );
      }

      filteredTeachers.forEach(
        teacher =>
        teacher && console.log(teacher)
      );
      break;
  }
}
