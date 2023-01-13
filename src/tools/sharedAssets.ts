import { Swapped } from "../Swap/SwapContext";
import cardDb from '../cardDb.json';
import { CardKey } from "../datasets";

// const dataHeader = new Uint8Array([67,73,68,44,83,111,117,114,99,101,32,67,73,68,44,67,84,73,44,73,116,101,109,32,73,68,44,73,116,101,109,32,84,121,112,101,44,80,111,119,101,114,44,68,101,99,107,32,73,68,44,83,101,114,105,101,115,32,73,99,111,110,44,83,101,114,105,101,115,32,73,110,100,101,120,44,83,101,114,105,101,115,32,67,111,117,110,116,44,83,101,97,115,111,110,44,65,114,116,105,115,116,82,101,102,44,83,111,110,103,82,101,102,44,84,121,112,101,82,101,102,44,71,101,110,114,101,82,101,102,44,80,114,105,110,116,32,73,68]);

const seasonHeaders = [
  new Uint8Array([99,97,114,100,115,95,112,48,49,0,0,0]),
  new Uint8Array([99,97,114,100,115,0,0,0]),
  new Uint8Array([99,97,114,100,115,95,115,48,50,0,0,0]),
];

const findStartIndex = (sharedAssets: Uint8Array, seasonHeader: Uint8Array) => {
  for (let i = 0; i < sharedAssets.length; i++) {
    if (sharedAssets[i] === seasonHeader[0]) {
      for (let j = 1; j < seasonHeader.length; j++) {
        if (sharedAssets[i+j] !== seasonHeader[j]) {
          break;
        }
        if (j === seasonHeader.length - 1) {
          return i + seasonHeader.length + 4;
        }
      }
    }
  }
  throw Error("No start index found")
}

const findDatabaseLength = (sharedAssets: Uint8Array, startIndex: number) => {
  return new Uint32Array(sharedAssets.slice(startIndex - 4, startIndex).buffer)[0]
}

const getCSV = (sharedAssets: Uint8Array, startIndex: number, length: number) => {
  return [...Array.from(sharedAssets).slice(startIndex, startIndex+length)].map(v => String.fromCharCode(v)).join('')
}

export const parseAssetsFile = (sharedAssets: Uint8Array) => {
  const dbIndexes = seasonHeaders.map((seasonHeader, idx) => {
    const startIndex = findStartIndex(sharedAssets, seasonHeader);
    const length = findDatabaseLength(sharedAssets, startIndex)
    const splitFunc = idx === 1 // workaround for robin thicke
      ? (str: string) => str.replace(/([\s"\d]),/g, '$1__SPLIT__').split('__SPLIT__')
      : (str: string) => str.split(',')
    return {
      startIndex,
      length,
      data: getCSV(sharedAssets, startIndex, length).split('\n').map(v => splitFunc(v)),
    }
  });
  if (dbIndexes.some(db => db.startIndex === -1 || !db.length)) {
    throw Error("Invalid database file");
  }
  return dbIndexes;
}

const cardIdIdx = 1;
const powerIdx = 5;
const songTitleIdx = 11;

const retainRowSize = (row: string[], operation: number) => {
  const expectedLength = row[songTitleIdx].length + operation;
  // const prevTitle = row[songTitleIdx];
  let hasQuotes = !!row[songTitleIdx].match(/^".*"$/)
  if (hasQuotes) {
    row[songTitleIdx] = row[songTitleIdx].substring(1, row[songTitleIdx].length - 1);
  }
  if (operation === 0) {
    throw Error('shouldnt be in here ever')
  }
  if (operation < 0) {
    row[songTitleIdx] = row[songTitleIdx].substring(0, row[songTitleIdx].length + operation)
  } else {
    row[songTitleIdx] = row[songTitleIdx].padEnd(row[songTitleIdx].length + operation, '_')
  }
  if (hasQuotes) {
    row[songTitleIdx] = `"${row[songTitleIdx]}"`
  }
  if (row[songTitleIdx].length !== expectedLength) {
    debugger;
  }
  // if (operation > 0) {
  //   const targetSongTitleLength = row[songTitleIdx].length + operation + (hasQuotes ? 2 : 0)
  //   for (let i = 0; i < operation; i++) {
  //     row[songTitleIdx] = row[songTitleIdx] + ' '
  //   }
  //   if (hasQuotes) {
  //     row[songTitleIdx] = `"${row[songTitleIdx]}"`
  //   }
  //   return;
  // }
  // if (operation < 0) {
  //   const targetSongTitleLength = row[songTitleIdx].length + operation;
  //   let i = 0;
  //   const replacements = [/\s\s()/, /\s()$/, /\s([A-Z])/, /.()$/]
  //   while (!!replacements[i] && row[songTitleIdx].length > targetSongTitleLength) {
  //     row[songTitleIdx] = row[songTitleIdx].replace(replacements[i], '$1');
  //     if (row[songTitleIdx].length === targetSongTitleLength) {
  //       if (hasQuotes) {
  //         row[songTitleIdx] = `"${row[songTitleIdx]}"`
  //       }
  //       return;
  //     }
  //     i++
  //   }
  //   debugger
  //   row[songTitleIdx] = row[songTitleIdx].substring(0, targetSongTitleLength);
  //   if (hasQuotes) {
  //     row[songTitleIdx] = `"${row[songTitleIdx]}"`
  //   }
  //   return;
  // }
} 

const getCSVString = (csvArrays: string[][]) => csvArrays.map(v => v.join(',')).join('\n')

const getRawDataForCSV = (csvArrays: string[][]) => {
  const csvCharArray = getCSVString(csvArrays).split('').map(c => c.charCodeAt(0));
  return new Uint8Array(csvCharArray);
}

export const updateDatabase = (sharedAssets: Uint8Array, swaps: Swapped) => {
  // const comparison = parseAssetsFile(sharedAssets);
  const parsedAssets = parseAssetsFile(sharedAssets);
  Object.entries(swaps).forEach(([a, b]) => {
    console.log(a, b)
    let swappedSeasonA;
    let swappedSeasonB;
    let swapIndexA;
    let swapIndexB;
    let powerA;
    let powerB;
    try {
      swappedSeasonA = cardDb[a as CardKey].Season;
      swappedSeasonB = cardDb[b as CardKey].Season;
      
      swapIndexA = parsedAssets[swappedSeasonA].data.findIndex(v => v[cardIdIdx]?.includes(a));
      swapIndexB = parsedAssets[swappedSeasonB].data.findIndex(v => v[cardIdIdx]?.includes(b));
      powerA = parsedAssets[swappedSeasonA].data[swapIndexA][powerIdx]
      powerB = parsedAssets[swappedSeasonB].data[swapIndexB][powerIdx];
      parsedAssets[swappedSeasonA].data[swapIndexA][cardIdIdx] = swappedSeasonA === 2 ? b :`"${b}"`
      parsedAssets[swappedSeasonB].data[swapIndexB][cardIdIdx] = swappedSeasonB === 2 ? a : `"${a}"`
      parsedAssets[swappedSeasonA].data[swapIndexA][powerIdx] = powerB
      parsedAssets[swappedSeasonB].data[swapIndexB][powerIdx] = powerA
      if (swappedSeasonA !== swappedSeasonB && a.length !== b.length) {
        retainRowSize(parsedAssets[swappedSeasonA].data[swapIndexA], a.length - b.length)
        retainRowSize(parsedAssets[swappedSeasonB].data[swapIndexB], b.length - a.length)
      }
    } catch (e) {
      throw e;
    }

  })
  // const newData = parsedAssets.map(v => v.data.map(_ => _.join(',')).join('\n'))
  // const oldData = comparison.map(v => v.data.map(_ => _.join(',')).join('\n'))

  const newBinaryFile = new Uint8Array(sharedAssets.length)
  newBinaryFile.set(sharedAssets, 0)

  parsedAssets.forEach(p => {
    const rawDBData = getRawDataForCSV(p.data);
    newBinaryFile.set(rawDBData, p.startIndex);
  })

  return newBinaryFile;
}
