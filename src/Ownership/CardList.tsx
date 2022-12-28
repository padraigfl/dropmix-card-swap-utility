import { ReactNode, useMemo, useRef, useEffect, useCallback } from 'react';
import { Card, CardKey } from '../datasets';
import { CardCollection, CollectionStage, useCollectionContext } from './CollectionContext';
import { cardIndexesArray } from '../tools/variables';
import { useSwapContext } from '../Swap/SwapContext';
import cardDb from '../cardDb.json';
import { CardSwap } from '../Swap/CardSwap';
import { filters, useCardDbContext } from '../CardDbContext';

export type ListProps = {
  action: CollectionStage,
  onCheck: (k: CardKey, option: CollectionStage, value?: any) => void;
  collection: CardCollection;
}

type Columns = {
  key: keyof Card;
  name?: string;
  filter?: (k: any) => (card: Card) => boolean;
  sort?: (a: Card, b: Card) => 1 | -1 | 0;
  short?: number;
}

const filterFields: Columns[] = [
  { key: 'Power', filter: (k: number) => card => card.Power === k, short: 3 },
  { key: 'TypeRef', name: 'Type', short: 4 },
  { key: 'Season', short: 3 },
  { key: 'Series Icon', name: 'Playlist' },
  { key: 'GenreRef', name: 'Genre', filter: (k: Card['GenreRef']) => card => `${card.GenreRef}`.includes(`${k}`) },
  // { key: 'Instrument', name: 'Instrument', filter: (k: Instrument) => card => [instrument 1 to 4].includes(instrument)}
]

const StageActions = () => {
  const { stage, collection, updateCollection } = useCollectionContext();
  const toggleRef = useRef<HTMLInputElement | null>()
  const { appliedFilter } = useCardDbContext();

  const checkedStatus = useMemo(() => {
    return Object.entries(collection).reduce((acc, [k, v]) => {
      const changeKey = v[stage] ? 'checked' : 'not';
      acc[changeKey].push(k);
      return acc;
    }, { checked: [] as string[], not: [] as string[] })
  }, [stage, collection]);

  useEffect(() => {
    if (toggleRef.current) {
      toggleRef.current.indeterminate = false;
      if (checkedStatus.not.length === 0) {
        toggleRef.current.checked = true;
      } else if (checkedStatus.checked.length === 0) {
        toggleRef.current.checked = false;
      } else {
        toggleRef.current.checked = false;
        toggleRef.current.indeterminate = true;
      }
    }
  }, [checkedStatus])

  const toggleAll = useCallback(() => {
    const toggleAction = !checkedStatus.not.length ? false : true;
    const otherStages = ['own', 'want', 'dispose'].filter(v => v !== stage) as CollectionStage[]
    const warningRequired = Object.values(collection)
      .some(c => otherStages.map(s => c[s]).includes(true))
    if (warningRequired && !window.confirm('this may impact other datasets, are you sure?')) {
      return;
    }
    Object.keys(collection).forEach(k => {
      const card = collection[k as CardKey]
      const cardVal = card?.[stage]

      const isFiltered = Object.keys(appliedFilter).some(f => {
        const cardTypeFromFitler = cardDb[k as CardKey][f as keyof Card];
        if (!appliedFilter[f]?.length || appliedFilter[f]?.includes(cardTypeFromFitler as any)) {
          return false;
        }
        return true;
      })
      if (isFiltered) {
        return;
      }
      if (typeof cardVal !== 'boolean' ) {
        console.error('only booleans should be here')
      } else if (cardVal && !toggleAction) {
        updateCollection(k as CardKey, stage, toggleAction)
        // updateCollection(card, , !collection[card]?.[status])
      } else if (!cardVal && toggleAction) {
        updateCollection(k as CardKey, stage, toggleAction)
      }
    });
  }, [checkedStatus, stage, collection, updateCollection, appliedFilter]);

  return (
    <label htmlFor="toggleAll">
      {stage}
      <input
        ref={r => { toggleRef.current = r }}
        name="toggleAll"
        type="checkbox"
        onChange={toggleAll}
      />
    </label>
  )
}

export const infoColumns: {
  name: string;
  render: (k: CardKey) => (ReactNode | string);
}[] = [
  {
    name: 'Image',
    render: k => (
      <>
        <img loading="lazy" className="img" src={`/assets/images/100-card_${k}.png`} alt={`artwork for ${cardDb[k].SongRef}`} />
        <img loading="lazy" className="img--large" src={`/assets/images/240-card_${k}.png`}  alt={`artwork for ${cardDb[k].SongRef}`} />
      </>
      
    )
  },
  { name: 'Artist', render: k => cardDb[k].ArtistRef },
  { name: 'Song', render: k => cardDb[k].SongRef },
]

const CardList = (props: ListProps) => {
  const { appliedFilter, updateFilter } = useCardDbContext();
  // useEffect(() => {
  //   window.fetch('/assets/cardDb.json')
  //     .then(res => res.json())
  //     .then(d => { debugger })
  // })
  const { swapped } = useSwapContext();
  const { collection, stage } = useCollectionContext();
  const filteredCards = useMemo(() => {
    if (stage === 'dispose') {
      return cardIndexesArray.filter(cardKey => collection[cardKey]?.own)
    }
    if (stage === 'want') {
      return cardIndexesArray.filter(cardKey => !collection[cardKey]?.own)
    }
    return cardIndexesArray;
  }, [stage, collection]);
  const canSwap = useMemo(() => {
    const values = Object.values(collection);

    return values.some(v => v.own) && values.some(v => v.dispose) && values.some(v => v.want);
  }, [collection]);

  const allSwapped = useMemo(() => {
    const disposeCount = Object.values(collection).filter(v => v.dispose).length;
    const ownCount = Object.values(collection).filter(v => v.want).length;
    const swa = Object.values(swapped).length;
    return (disposeCount + ownCount) === swa;
  }, [swapped, collection]);

  const filteredColumns = useMemo(() => {
    return filterFields.map(f => {
      if (!f.filter) {
        f.filter = (k: Card[typeof f.key]) => card => card[f.key] === k;
      }
      if (!f.sort) {
        f.sort = (a: Card, b: Card) => a[f.key] > b[f.key] ? 1 : -1;
      }
      return f;
    })
  }, [])
  return (
    <>
    { filters.TypeRef.map(f => {
      const nameFor = `filter-typeRef-${f}`
      return (
        <>| 
          <label htmlFor={nameFor}>{f}</label>
          <input type="checkbox" name={nameFor} checked={appliedFilter.TypeRef?.includes(f)} onChange={() => updateFilter('TypeRef', [f])} />
        </>
      );
    }
    )}
    <table>
      <thead>
        <tr>
          { infoColumns.map(v => <th>{v.name}</th>)}
          { filteredColumns.map(v => <th className={`filter ${v.short ? 'filter--short' : ''}`}>{(v.name || v.key).substring(0, v.short || Infinity)}</th>)}
          <th>{
            stage === 'own'
              ? <StageActions />
              : stage
            }</th>
          { canSwap && <th>Swap</th>}
        </tr>
      </thead>
      <tbody>
        { filteredCards.map((cardKey) => {
            const cardData = cardDb[cardKey];
            const inputName = `checkbox_${cardKey}`;
            if (appliedFilter.TypeRef?.length && appliedFilter.TypeRef?.includes(cardData.TypeRef as any)) {
              return null;
            }
            if (!cardData) {
              return null;
            }
            return (
              <tr id={cardData['Source CID']}>
                { infoColumns.map(c => (
                  <td>
                    {c.render(cardKey)}
                  </td>
                ))}
                { filteredColumns.map(c => (
                  <td className={`filter $`}>{cardDb[cardKey][c.key]}</td>
                ))}
                <td>
                  <input
                    type="checkbox"
                    name={inputName}
                    checked={props.collection[cardKey]?.[stage]}
                    onChange={() => props.onCheck!(cardKey, stage, true)}
                  />
                </td>
                {canSwap && (
                  <td>
                    { canSwap && (props.collection[cardKey]?.want || props.collection[cardKey]?.dispose)
                        ? <CardSwap card={cardData} disabled={allSwapped} />
                        : '---'
                    }
                  </td>
                )}
              </tr>
            );
          })
        }
      </tbody>
    </table>
    </>
  )
}

export default CardList;
