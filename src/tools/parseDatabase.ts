export interface DBRowData {
  requiredLength: number;
  id: string;
  content: string;
}

export interface DBData {
  data: DBRowData[];
  startIndex: number;
  endIndex: number;
}


// TODO posisbly needs to find 4 prior bytes for length
// TODO android variance if newline?
const headerArray = [67,73,68,44,65,114,116,105,115,116,44,78,97,109,101,44,65,117,100,105,111,44,73,108,108,117,115,116,114,97,116,111,114,44,73,109,97,103,101,44,84,121,112,101,44,78,117,109,32,66,97,114,115,44,84,101,115,116,32,80,111,119,101,114,44,73,110,115,116,114,117,109,101,110,116,44,73,110,115,116,114,117,109,101,110,116,32,50,44,73,110,115,116,114,117,109,101,110,116,32,51,44,73,110,115,116,114,117,109,101,110,116,32,52,44,71,101,110,114,101,44,89,101,97,114,44,83,111,117,114,99,101,44,65,98,105,108,105,116,121,44,83,99,114,101,101,110,32,84,101,120,116,44,77,117,115,105,99,32,69,102,102,101,99,116,44,84,101,109,112,111,44,75,101,121,44,77,111,100,101,44,84,114,97,110,115,105,116,105,111,110,44,87,105,108,100,32,66,101,97,116,32,72,97,115,32,75,101,121,44,65,114,116,32,67,114,111,112,32,67,101,110,116,101,114,44,67,44,68,98,44,68,44,69,98,44,69,44,70,44,71,98,44,71,44,65,98,44,65,44,66,98,44,66,44,67,114,101,100,105,116,115]
export const cardDataHeader = new Uint8Array([...headerArray, 0, 0]);
export const cardDataHeaderAndroid = new Uint8Array([...headerArray, 13, 0]); 

const getDatabaseStartingPoint = (db: Uint8Array, index: number) => {
  if (db[index] !== cardDataHeader[0]) {
    return false;
  }
  let assumedHeader = db.slice(index, index + headerArray.length);
  return assumedHeader.every((entry, idx) => {
    return entry === headerArray[idx];
  });
}

const processRow = (db: Uint8Array, rowStartIndex: number): DBRowData => {
  const rowLength = new Uint32Array(db.slice(rowStartIndex, rowStartIndex + 4).buffer)[0];
  let rowString = '';
  new Uint8Array(db.slice(rowStartIndex+4, rowStartIndex + 4 + rowLength).buffer)
    .forEach(v => rowString += String.fromCharCode(v))
  return {
    requiredLength: rowLength,
    id: rowString.split(',')[0].replace(/.*"(.*)".*/, '$1'),
    content: rowString,
  };
}

const getBytesToFill = (index: number) => {
  if (index % 4 !== 0) {
    return 4 - (index % 4);
  }
  return 0;
}

// Android version of db has a newline character at the end of each entry, making them all one character longer
const getCardHeaderLength = (db: Uint8Array, startIndex: number) => new Uint32Array(db.slice(startIndex, startIndex + 4).buffer)[0];

const getDatabase = (db: Uint8Array, startIndex: number, debug?: boolean): DBData => {
  const fullHeaderLength = getCardHeaderLength(db, startIndex);
  let currentRowIndex = startIndex + fullHeaderLength + 4;
  currentRowIndex += getBytesToFill(currentRowIndex);
  const entryList = [];

  while (entryList.length < 440) {
    const newEntry = processRow(db, currentRowIndex);
    entryList.push(newEntry);
    if (Number.isNaN(currentRowIndex)) {
      throw Error('aaaa')
    }
    // prior index + 32bit count for new row + row length + byte balance
    currentRowIndex += ((newEntry.requiredLength) + 4)
    currentRowIndex += (getBytesToFill(currentRowIndex))
  }
  return {
    data: entryList,
    startIndex,
    endIndex: currentRowIndex,
  }
}

export const databaseParser = (db: Uint8Array) => {
  const headerStartIndex = db.findIndex((entry, idx) => getDatabaseStartingPoint(db, idx)) - 4;
  const database = getDatabase(db, headerStartIndex);
  return database;
}

export const buildDataBase = (dbData: DBData, rawData: Uint8Array) => {
  const headerLength = new Uint8Array((new Uint32Array([cardDataHeader.length])).buffer)
  const rawDbList: Uint8Array[] = [headerLength, cardDataHeader];

  dbData.data.forEach(dbRow => {
    // 32bit row data size converted to bytes
    const lengthPrefixArray = new Uint8Array((new Uint32Array([dbRow.content.length])).buffer);
    // data converted to bytes
    const dataBytes = new Uint8Array(dbRow.content.split('').map(v => v.charCodeAt(0)))
    const padding = getBytesToFill(dbRow.content.length);
    const rowBytes = new Uint8Array(lengthPrefixArray.length + dataBytes.length + padding)
    rowBytes.set(lengthPrefixArray);
    rowBytes.set(dataBytes, lengthPrefixArray.length);
    if (rowBytes.length % 4 !== 0) {
      throw Error("needs to be in 32 bit chunks")
    }
    rawDbList.push(rowBytes);
  });

  const dataLength = rawDbList.reduce((acc, val) => acc + val.length, 0);

  const newRawData = new Uint8Array(dataLength);

  let index = 0;
  rawDbList.forEach(rawRow => {
    newRawData.set(rawRow, index);
    index += rawRow.length
  });

  return newRawData;
}