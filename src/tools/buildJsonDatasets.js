var fs = require('fs');

fs.readFile('cardDb.csv', (err, buff) => {
  const csv = buff.toString();
  let headers = [];
  let data = {};
  const [headings, ...rest] = csv.split('\n')
  headings.split(',').forEach(heading => {
    headers.push(heading);
  });

  rest.sort((a, b) => {
    const aSplit = a.split(',');
    const bSplit = b.split(',');

    return aSplit[0] > bSplit[0] ? 1 : -1
  }).forEach((line) => {
    const splitLine = line.split(',')
    if (splitLine.length > 1) {
      const newData = {}
      splitLine.forEach((dataPoint, idx) => {
        if (headers[idx] && headers[idx] !== '\r') {
          const numberData = +dataPoint;
          newData[headers[idx]] = !isNaN(numberData) ? numberData : dataPoint;
        }
      });
      data[splitLine[1]] = newData;
    }
  })
  // console.log(data);
  // console.log(Object.keys(data).length);
  fs.writeFile('cardDb.json', JSON.stringify(data), null, () => {});
});
