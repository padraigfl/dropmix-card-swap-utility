import cardDb from '../cardDb.json';
import { CardKey } from '../datasets';
import { cardIndexes } from './variables';

// TODO:
// // break bit list into chunks of 31 entries per section to compress reliably
// // do not filter out 0s at start
// // parseInt(x, 2).toString(36)
// // possibly consider breaking into playlists (every 3 characters represents a playlist?)

export const convertOwnershipToString = (own: CardKey[]) => {
  let ownerList = '';
  const orderedKeys = (Object.keys(cardDb) as CardKey[]).sort((a, b) => cardIndexes[a] < cardIndexes[b] ? -1 : 1)
  orderedKeys.forEach((cardKey) => {
    ownerList += (own.includes(cardKey as CardKey) ? '1' : '0');
  });
  return ownerList;
}

export const stringToOwnership = (ownershipString: string) => {
  if (!ownershipString.match(/^(1|0)*$/)) {
    throw Error("String needs to be ones and zeroes")
  }
}