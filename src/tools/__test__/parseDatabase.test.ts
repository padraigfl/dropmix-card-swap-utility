import { changeCardRelation } from "../modifiers";
import { buildDataBase, databaseParser, DBData } from "../parseDatabase";
import readFile from "./readFile";

describe('testing parsing', () => {
  let level0: Uint8Array;
  let parsedDb: DBData;
  beforeAll( async () => {
    level0 = await readFile('./level0_db');
    parsedDb = databaseParser(level0);
  });

  it('results Test', () => {
    const { startIndex, endIndex, data } = parsedDb;
    expect(data.length).toEqual(440);
    expect(startIndex).toEqual(0);
    expect(endIndex).toEqual(216608)
  });

  it('swaps values, retains same overall length', () => {
    const swap1 = ['LIC_0031_Wild', 'LIC_0185_Wild']
    const swap2 = ['FX_0022', 'FX_0047'];
    const swap3 = ['FX_0022', 'LIC_0031_Wild'];
    const swap4 = ['LIC_0031_Wild', 'FX_0022'];

    [swap1, swap2, swap3, swap4].forEach(([a, b], idx) => {
      const originalCardA = parsedDb.data.find(c => c.id === a)!
      const originalCardB = parsedDb.data.find(c => c.id === b)!
      const swappedCardA = changeCardRelation(originalCardA, b);
      const swappedCardB = changeCardRelation(originalCardB, a);
      expect(swappedCardA.content.length).toEqual(originalCardA.content.length);
      expect(swappedCardB.content.length).toEqual(originalCardB.content.length);
    })
  });

  it('swaps values, produces new cardDb with same length', () => {
    const swap1 = ['LIC_0031_Wild', 'LIC_0185_Wild']
    const swap2 = ['FX_0011', 'FX_0012'];
    const swap3 = ['FX_0022', 'LIC_0055_Bass'];
    const swap4 = ['HMX_0040_Loop', 'FX_0020'];
    let newDb = { ...parsedDb, data: parsedDb.data.map(v => ({ ...v })) };

    [swap1, swap2, swap3, swap4].forEach(([a, b], idx) => {
      const originalCardAIdx = parsedDb.data.findIndex(c => c.id === a)!
      const originalCardBIdx = parsedDb.data.findIndex(c => c.id === b)!
      newDb.data[originalCardAIdx] = changeCardRelation(newDb.data[originalCardAIdx], b);
      newDb.data[originalCardBIdx] = changeCardRelation(newDb.data[originalCardBIdx], a)
    })

    const raw =  buildDataBase({ ...parsedDb!, data: newDb.data }, level0);
    const parsed2 = databaseParser(raw);
    [raw, level0].forEach(r => {
      let b = '';
      for (let i = 0; i < 1000; i++) {
        b += (String.fromCharCode(+r[i]) || '±');
      }
    })
    expect(parsed2.startIndex).toEqual(parsedDb.startIndex)
    expect(parsed2.endIndex).toEqual(parsed2.endIndex);
    let count = 0;
    console.log(parsed2.data[0].content);
    console.log(parsedDb.data[0].content);
    parsed2.data.forEach((d, idx) => {
      if (d.content !== parsedDb.data[idx].content) {
        count++;
      }
    })
    expect(count).toEqual(8)
  })
})