import { databaseParser } from "../parseDatabase";
import readFile from "./readFile";

describe('testing parsing', () => {
  let level0: Uint8Array;
  beforeAll( async () => {
    level0 = await readFile('./level0_db');
  });

  it('results Test', () => {
    const { startIndex, endIndex, data } = databaseParser(level0);
    expect(data.length).toEqual(440);
    expect(startIndex).toEqual(0);
    expect(endIndex).toEqual(216608)
  });
})