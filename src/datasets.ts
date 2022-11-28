import cardDb from './cardDb.json';
import playbackDb from './playbackDb.json';

export type CardKey = keyof typeof cardDb;

export type Card = typeof cardDb[CardKey];
type CardMusic = typeof playbackDb[CardKey];

// Maybe in the future
export type CardExpanded = Card & {
  Tempo: number;
  Key: string;//
  Mode: 'major' | 'minor';
  'Num Bars': 8 | 16 | 32;
  Instrument: string;
  'Instrument 2'?: string;
  'Instrument 3'?: string;
  'Instrument 4'?: string;
  // Instrument: [string] | [string, string, string, string]
}

export interface Playlist {
  [k: typeof cardDb[CardKey]['Series Icon']]: CardKey[]; 
}

export const playlists = Object.entries(cardDb).reduce((playlists, [id, currentCard]) => {
  const playlistName = currentCard['Series Icon']
  if (playlists[playlistName]) {
    playlists[playlistName].push(id as CardKey);
  } else {
    playlists[playlistName] = [id as CardKey];
  }
  return playlists;
}, {} as Playlist);

export const VALID_PLAYLIST_SIZE = 15;

const getCardInstruments = (card: Partial<CardMusic>) => {
  const l: string[] = [];
  const keys: (keyof CardMusic)[] = ['Instrument', 'Instrument 2', 'Instrument 3', 'Instrument 4'];
  keys.forEach(i => {
    if (card[i]) {
      l.push(card[i] as string);
    }
  })
  return l;
};

export const instruments = Object.values(playbackDb).reduce((inst, obj) => {
  getCardInstruments(obj).forEach(i => {
    if (!inst.includes(i)) {
      inst.push(i);
    }
  })
  return inst;
}, [] as string[])

export const cardFilters: { [k: string]: { key?: keyof Card, filter?: (c: CardExpanded, filters: any) => boolean } } = {
  power: { key: 'Power' },
  type: { key: 'TypeRef' },
  licensed: { filter: c => c['Source CID'].includes('LIC_') },
  genre: { key: 'GenreRef' },
  instrument: {
    filter: (c, f) => {
      const instruments = getCardInstruments(c);
      return instruments.includes(f);
    },
  },
}
