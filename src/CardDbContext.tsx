import { createContext, useCallback, useContext, useState } from 'react';
import cardDb from './cardDb.json';


export const getCardFilters = () => {
  const filters = {
    "Item Type": new Set<string>(),
    "Power": new Set<number>(),
    "Series Icon": new Set<string>(),
    "Series Index": new Set<number>(),
    "Season": new Set<number>(),
    "TypeRef": new Set<string>(),
    "GenreRef": new Set<string>(),
  };
  // const instrument = new Set<string>();
  Object.entries(cardDb).forEach(([cardKey, cardData]) => {
    filters['Series Icon'].add(cardData['Series Icon']);
    filters['Item Type'].add(cardData['Item Type']);
    filters.TypeRef.add(cardData.TypeRef);
    if (typeof cardData.GenreRef === 'string') {
      filters.GenreRef.add(cardData.GenreRef.replace('genre_', ''))
    }
    filters.Power.add(cardData.Power);
    filters.Season.add(cardData.Season);
  });
  return Object.entries(filters).reduce((acc, [k,v]) => {
    return {
      ...acc,
      [k]: Array.from<string | number>(v),
    } 
  }, {} as { [k: string ]: any[] });
}

export const filters = getCardFilters();
const defaultFilters = Object.entries(filters).reduce((acc, [k, v]) => ({ ...acc, [k]: []}), {})

const CardDbContext = createContext({} as any);


type cardIndex = keyof typeof cardDb;
type filterKey = keyof typeof filters;

export const useCardDbContext = () => {
  const context = useContext(CardDbContext);
  const [appliedFilter, setFilter] = useState<{ [cardId in keyof typeof filters]?: (typeof filters[cardId])[] }>(defaultFilters);

  const [swapList, setSwapList] = useState<{ [card in cardIndex]?: cardIndex}>({});

  const updateFilter = useCallback((updatedKey: filterKey, value: typeof filters[filterKey][]) => {
    setFilter(oldFilters => {
      const oldFilter = oldFilters[updatedKey];
      if (!oldFilter) {
        throw Error(`BROKEN`);
      }
      return {
        ...oldFilters,
        [updatedKey]: oldFilter.includes(value[0])
          ? oldFilter.filter(v => v !== value[0])
          : [
            ...oldFilter,
            ...value,
          ]
      }
    });
  }, []);

  return {
    swapList,
    setSwapList,
    appliedFilter,
    updateFilter,
  }
}