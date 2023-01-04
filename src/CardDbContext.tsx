import { useCallback, useState } from 'react';
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
    "Source CID": new Set<string>(['LIC', 'HMX', 'FX'])
  };
  // const instrument = new Set<string>();
  Object.entries(cardDb).forEach(([cardKey, cardData]) => {
    filters['Series Icon'].add(cardData['Series Icon']);
    filters['Item Type'].add(cardData['Item Type']);
    filters.TypeRef.add(cardData.TypeRef);
    if (typeof cardData.GenreRef === 'string') {
      cardData.GenreRef.replace(/genre_/g, '').split(' ').forEach(g => filters.GenreRef.add(g))
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

type filterKey = keyof typeof filters;

export const useCardFilters = () => {
  const [appliedFilter, setFilter] = useState<{ [cardId in keyof typeof filters]?: (typeof filters[cardId])[] }>(defaultFilters);

  const updateFilter = useCallback((updatedKey: filterKey, value: typeof filters[filterKey][]) => {
    setFilter(oldFilters => {
      const oldFilter = oldFilters[updatedKey];
      if (!oldFilter) {
        throw Error(`BROKEN`);
      }
      return {
        ...oldFilters,
        // [updatedKey]: oldFilter.includes(value[0])
        //   ? oldFilter.filter(v => v !== value[0])
        //   : [
        //     ...oldFilter,
        //     ...value,
        //   ]
        [updatedKey]: oldFilter.includes(value[0]) ? [] : [value[0]]
      }
    });
  }, []);

  return {
    appliedFilter,
    updateFilter,
  }
}