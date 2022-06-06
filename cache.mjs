import fs from 'fs';

const dataDir = './data';

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

export const loadCache = () => {
  let cacheData = {};

  if (fs.existsSync(`${dataDir}/data.json`)) {
    const rawData = fs.readFileSync(`${dataDir}/data.json`);
    cacheData = JSON.parse(rawData);
  }

  return cacheData;
}

export const updateCache = newData => {
  const writtenData = JSON.stringify(newData);

  fs.writeFile('data/data.json', writtenData, 'utf8', err => {
    if (err) console.log(err);
  });
}
