import { ReactNode, useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { Card, CardKey } from '../datasets';
import { CardCollection, CollectionStage, useCollectionContext } from './CollectionContext';
import { cardIndexesArray } from '../tools/variables';
import { useSwapContext } from '../Swap/SwapContext';
import cardDb from '../cardDb.json';
import { CardSwap } from '../Swap/CardSwap';
import { filters, useCardFilters } from '../CardDbContext';
import { DialogControl } from '../components';
import { ProcessSwap } from '../Swap/ProcessSwap';

export type ListProps = {
  action: CollectionStage,
  onCheck: (k: CardKey, option: CollectionStage, value?: any) => void;
  collection: CardCollection;
}

type Columns = {
  key: keyof Card;
  name?: string;
  filter?: (card: Card, predicate: any) => boolean;
  sort?: (a: Card, b: Card) => 1 | -1 | 0;
  short?: number;
}

const filterFields: Columns[] = [
  { key: 'Power', filter: (card: Card, k: number) => card.Power === k, short: 3 },
  { key: 'TypeRef', name: 'Type', short: 4, filter: (card: Card, k: string) => card.TypeRef === k},
  { key: 'Season', short: 3 },
  { key: 'Item Type', name: 'Grouping' },
  { key: 'Series Icon', name: 'Playlist' },
  { key: 'GenreRef', name: 'Genre', filter: (card: Card, genre: string) => {
    return `${card['GenreRef']}`.includes(`genre_${genre}`)
  }, },
  { key: 'Source CID', name: 'Music', filter: (card: Card, prefix: string) => { return card['Source CID'].includes(prefix) }}
  // { key: 'Instrument', name: 'Instrument', filter: (k: Instrument) => card => [instrument 1 to 4].includes(instrument)}
]

const ToggleAll = (props: { stage: CollectionStage, filteredCards: CardKey[], disabled?: boolean }) => {
  const { collection, updateCollection } = useCollectionContext();
  const { stage, disabled, filteredCards } = props;
  const toggleRef = useRef<HTMLInputElement | null>()
  const { appliedFilter } = useCardFilters();

  const counts = useMemo(() => {
    const count = { own: 0, want: 0, dispose: 0 };
    Object.values(collection).forEach(v => {
      ['own', 'want', 'dispose'].forEach((s: any) => {
        const pointlesskeytoshutuptypescript = s as unknown as CollectionStage
        if (v[pointlesskeytoshutuptypescript]) {
          count[pointlesskeytoshutuptypescript]++;
        }
      })
    })
    return count;
  }, [collection])

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
      if (disabled) {
        toggleRef.current.disabled = true;
      }
    }
  }, [checkedStatus, disabled])

  const toggleAllDisabled = useMemo(() => Object.values(collection).every(v => {
    if (props.disabled) {
      return true
    }
    if (stage === 'dispose') {
      return !v.own
    }
    if (stage === 'own') {
      return !!v.want
    }
    if (stage === 'want') {
      return !!v.own
    }
    throw Error("shouldn't get in here")
  }), [collection, stage, props.disabled]);

  const toggleAll = useCallback((e: any) => {
    const toggleAction = !filteredCards.some(c => !collection![c]![stage]) ? false : true;
    const otherStages = ['own', 'want', 'dispose'].filter(v => v !== stage) as CollectionStage[]
    const warningRequired = Object.values(collection)
      .some(c => otherStages.map(s => c[s]).includes(true))
    if (warningRequired && !window.confirm('this may impact other datasets, are you sure?')) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    filteredCards.forEach(k => {
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
  }, [stage, collection, updateCollection, appliedFilter, filteredCards]);
  const toggleName = `toggleAll-${props.stage}`
  return (
    <>
      <label htmlFor={toggleName}>
        {props.stage } ({ counts[props.stage]})
      </label>
      <input
        ref={r => { toggleRef.current = r }}
        name={toggleName}
        type="checkbox"
        onChange={toggleAll}
        disabled={toggleAllDisabled}
      />
    </>
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
        <img loading="lazy" className="img" src={`/assets/images/100-card_${k}.png`} alt={`artwork for ${cardDb[k].SongRef}`} data-image={`/assets/images/240-card_${k}.png`} />
      </>
      
    )
  },
  { name: 'Artist', render: k => cardDb[k].ArtistRef },
  { name: 'Song', render: k => cardDb[k].SongRef },
]

const CardList = () => {
  const { appliedFilter, updateFilter } = useCardFilters();
  const { swapped } = useSwapContext();
  const { collection, updateCollection } = useCollectionContext();
  const hackyCardModalListenerRef = useRef<any>(null);
  const [bigImage, setBigImage] = useState('');

  useEffect(() => {
    hackyCardModalListenerRef.current = document.addEventListener('click', (e: { target: any }) => {
      if (e?.target?.dataset?.image) {
        setBigImage(e?.target?.dataset?.image)
      } else {
        setBigImage('')
      }
    });
    return () => {
      document.removeEventListener('click', hackyCardModalListenerRef.current);
    }
  }, []);

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
        f.filter = (card: Card, k: any) => {
          return card[f.key] === k
        };
      }
      if (!f.sort) {
        f.sort = (a: Card, b: Card) => a[f.key] > b[f.key] ? 1 : -1;
      }
      return f;
    })
  }, [])

  const filteredCards = useMemo(() => {
    const filteredColumnsObject = filteredColumns.reduce((acc, val) => ({ ...acc, [val.key]: val}), {} as any)
    const res = cardIndexesArray.filter(cKey => {
      const card = cardDb[cKey];
      return !Object.entries(appliedFilter).some(([fkey, fval]) => {
        return fval
          && fval.length > 0
          && !(filteredColumnsObject[fkey as any]?.filter?.(card, fval[0]))
      });
    })
    return res;
  }, [appliedFilter, filteredColumns]);

  return (
    <>
    { bigImage && (
      <DialogControl initialOpenState noOpenButton>
        { setOpen => {
          return (
          <>
            <img src={bigImage} alt={bigImage}/>
          </>
        )}}
      </DialogControl>
    )}
    <p>Filters:</p>
    <ul>
      {['TypeRef', 'Power', 'Item Type', 'GenreRef', 'Season', 'Source CID'].map((v) => (

        <li><strong>{v}</strong>:
          { filters[v].map(f => {
            const nameFor = `filter-${v.replace(/ /g, '-')}-${f}`
            return (
              <>
                —{' '}
                <label htmlFor={nameFor}>{f}</label>
                <input type="checkbox" name={nameFor} checked={appliedFilter[v]?.includes(f)} onChange={() => updateFilter(v, [f])} />
              </>
            );
          })}
        </li>
      ))}
    </ul>
    { filteredCards.length !== 440 && <p>Displaying {filteredCards.length} of 440</p> }
    <table>
      <thead>
        <tr>
          { infoColumns.map(v => <th>{v.name}</th>)}
          { filteredColumns.map(v => <th className={`filter ${v.short ? 'filter--short' : ''}`}>{(v.name || v.key).substring(0, v.short || Infinity)}</th>)}
          {['own', 'want', 'dispose'].map(stage => (
            <th>
              {/* Limit to filtered cards */}
              <ToggleAll filteredCards={filteredCards} stage={stage as CollectionStage} />
            </th>
          ))}
          { canSwap && <th>Swap <ProcessSwap /></th>}
        </tr>
      </thead>
      <tbody>
        { filteredCards.map((cardKey) => {
            const cardData = cardDb[cardKey];
            const inputName = `checkbox_${cardKey}`;

            if (!cardData) {
              return null;
            }
            const collectionInfo = collection[cardKey];
            return (
              <tr id={cardData['Source CID']} key={`row-${cardData['Source CID']}`}>
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
                    name={`${inputName}-own`}
                    checked={collectionInfo?.own}
                    onChange={() => updateCollection(cardKey, 'own', !collectionInfo?.own)}
                    disabled={collectionInfo?.want}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    name={`${inputName}-want`}
                    checked={collectionInfo?.want}
                    onChange={() => updateCollection(cardKey, 'want', !collectionInfo?.want)}
                    disabled={!!collectionInfo?.own}
                  />
                </td>
                <td>

                  <input
                    type="checkbox"
                    name={`${inputName}-dispose`}
                    checked={collectionInfo?.dispose}
                    onChange={() => updateCollection(cardKey, 'dispose', !collectionInfo?.dispose)}
                    disabled={!collectionInfo?.own}
                  />
                </td>
                {canSwap && (
                  <td>
                    { canSwap && (collectionInfo?.want || collectionInfo?.dispose)
                        ? <CardSwap card={cardData} disabled={allSwapped} invert={!collectionInfo?.dispose} />
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
