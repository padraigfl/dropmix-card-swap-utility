import cardDb from '../cardDb.json';
import { CardKey, Playlist, Playlists } from '../datasets';

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
    playlists[playlistName].push(id as CardKey);
  } else {
    playlists[playlistName] = [id as CardKey];
  }
  return playlists;
}, {} as Playlists);