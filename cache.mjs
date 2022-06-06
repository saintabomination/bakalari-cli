import fs from 'fs';

const dataDir = './data';

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

export const updateCache = newData => {
  const writtenData = JSON.stringify(newData);

  fs.writeFile('data/data.json', writtenData, 'utf8', err => {
    if (err) console.log(err);
  });
}
