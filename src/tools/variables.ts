import cardDb from '../cardDb.json';
import { CardKey, Playlists } from '../datasets';

export const bafflers: { [k: keyof Playlists]: CardKey } = {
  derby: 'HMX_0049_Lead',
  mirrors: 'HMX_0050_Beat',
  ouroboros: 'LIC_0129_Lead',
  astro: 'LIC_0131_Lead',
  lucky: 'HMX_0051_Loop',
  flawless: 'LIC_0133_Loop',
  bomb: 'HMX_0052_Bass',
  chiller: 'LIC_0144_Lead',
  energy: 'HMX_0055_Beat',
  city: 'LIC_0103_Loop',
  flora: 'LIC_0024_Loop',
  verdant: 'LIC_0165_Lead',
  rhymer: 'HMX_0075_Lead',
  phase: 'HMX_0064_Beat',
  instinct: 'LIC_0149_Loop',
  fantastic: 'HMX_0074_Bass',
}

// returns full count of cards in each season
export const seasonCounts = Object.values(cardDb).reduce((acc, card) => {
  if (acc[card.Season]) {
    acc[card.Season]++;
  } else {
    acc[card.Season] = 1;
  }
  return acc;
}, { } as { [k: number]: number });

export const totalCards = Object.values(seasonCounts).reduce((total, i) => total + i, 0);

// TODO: verify if this is needed
// returns cards in order of print numbering; deeper logic fails due to unreleased cards
export const cardIndexesArray = Object.values(cardDb).reduce((acc, card) => {

  // let cardNumber = +(card['Print ID'].replace(/^\w\d+ C(\d+)$/, '$1'));
  // if (card.Season > 0) {
  //   cardNumber += seasonCounts[0];
  // }
  // if (card.Season > 1) {
  //   cardNumber += seasonCounts[1];
  // }
  // acc[cardNumber - 1] = card['Source CID'] as CardKey;
  // return acc;
  return [
    ...acc,
    card['Source CID'] as CardKey,
  ]
}, [] as CardKey[]);

export const cardIndexes = cardIndexesArray.reduce((acc, cardKey, idx) => {
  return {
    ...acc,
    [cardKey]: idx,
  }
}, {} as { [k in CardKey]: number });

export const playlists = Object.entries(cardDb).reduce((playlists, [id, currentCard]) => {
  const playlistName = currentCard['Series Icon']
  if (playlists[playlistName]) {
    playlists[playlistName].cards.push(id as CardKey);
  } else {
    playlists[playlistName] = {
      cards: [id as CardKey],
      baffler: bafflers[playlistName],
    };
  }
  return playlists;
}, {} as Playlists);
