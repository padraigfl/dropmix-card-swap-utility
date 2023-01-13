import { useCallback, useMemo, useRef, useState } from "react";
import { CardKey, Playlists } from "../datasets";
import { useSwapContext } from "../Swap/SwapContext";
import { playlists } from "../tools/variables";
import { CollectionStage, useCollectionContext } from "./CollectionContext"

export const PlaylistList = () => {
  const { collection, updateCollectionByPlaylist } = useCollectionContext();
  const { swapped, onSwap } = useSwapContext();
  const rowRefs = useRef({} as any);
  /* TODO decouple this */
  const [swappedPlaylists, setSwappedPlaylists] = useState<{ [k in keyof Playlists]?: keyof Playlists}>({});


  const onCheck = (key: CollectionStage, playlist: string, value: boolean) => {
    playlists[playlist].cards.forEach(cardId => updateCollectionByPlaylist(playlist, key, value));
  }

  const allSwappable = useMemo(() => {
    return Object.entries(playlists).reduce((acc, [key, val]) => {
      let data = { want: 0, dispose: 0, own: 0 };
      val.cards.forEach(c => {
        if (collection[c as CardKey]?.want) {
          data.want++;
        }
        if (collection[c as CardKey]?.dispose) {
          data.dispose++;
        }
        if (collection[c as CardKey]?.own) {
          data.own++;
        }
      })
      return {
        ...acc,
        [key]: data,
      }
    }, { } as any);
  }, [collection]);

  const cantSwapPlaylist = useMemo(() => {
    let swapDisabled = {} as { [k: keyof Playlists]: boolean };
    const swappedFlattened = new Set([...Object.keys(swapped), Object.values(swapped)])
    Object.keys(playlists).forEach(pl => {
      swapDisabled[pl] = playlists[pl].cards.length !== 15 || playlists[pl].cards.some(c => swappedFlattened.has(c));
    })
    debugger;
    return swapDisabled;
  }, [swapped])

  const onPlaylistSwap = useCallback((p1: keyof Playlists, p2: keyof Playlists) => {
    if (p1 !== p2 && (cantSwapPlaylist[p1] || cantSwapPlaylist[p2])) {
      alert('some cards in this swap are already swapped')
    }
    setSwappedPlaylists(prev => {
      const prevFiltered = { ...prev };
      if (typeof p1 === 'number' || typeof p2 === 'number') {
        return prev;
      }
      if (p1 && prev[p1]) {
        delete prevFiltered[p1];
      }
      if (prev[p2]) {
        delete prevFiltered[p2];
      }
      return {
        ...prevFiltered,
        [p1]: p2,
        [p2]: p1,
      }
    })
    for (let i = 0; i < 15; i++) {
      const cardKey1 = playlists[p1].cards[i];
      const cardKey2 = playlists[p2].cards[i];
      onSwap([cardKey1, cardKey2]);
    }
  }, [onSwap, cantSwapPlaylist]);

  const stages = ['own', 'want', 'dispose'] as CollectionStage[];
  console.log(allSwappable)

  return <table>
    <thead>
      <tr>
        <td>Playlist</td>
        <td># Cards</td>
        {stages.map(h => <th>{h}</th>)}
        <td>Swap</td>
      </tr>
    </thead>
    { Object.entries(playlists).map(([name, { cards: cardIds }]) =>
      <tr>
        <td>{name}</td>
        <td>{cardIds.length} {JSON.stringify(allSwappable[name])}</td>
        {stages.map(cell => {
          const isActive = allSwappable[name][cell] === cardIds.length;
          if (rowRefs.current[name]) {
            if (allSwappable[name][cell] && allSwappable[name][cell] < cardIds.length) {
              rowRefs.current[name].indeterminate = true;
            } else {
              rowRefs.current[name].indeterminate = false;
            }
          }
          return (
            <td>
              <input
                ref={ref => {
                  rowRefs.current[name] = ref;
                  if (rowRefs.current[name]) {
                    if (allSwappable[name][cell] && allSwappable[name][cell] < cardIds.length) {
                      rowRefs.current[name].indeterminate = true;
                    } else {
                      rowRefs.current[name].indeterminate = false;
                    }
                  }
                }}
                type="checkbox"
                name={`playlist-${cell}-${name}`}
                checked={isActive}
                onChange={e => onCheck(cell, name, !isActive)}
              />
            </td>
          )
        })}
        <td>
          { cardIds.length !== 15
            ? 'Cant swap'
            : (allSwappable[name].want === 15 || allSwappable.dispose === 15)
              ? (
                <select onChange={e => onPlaylistSwap(name, e.target.value)} value={swappedPlaylists[name] || name}>
                  { Object.keys(playlists).map(v => (
                    playlists[v].cards.length === 15 && ( allSwappable[v].dispose || v === name)
                      ? v === name
                        ? <option key={name} value={name}> ---- </option>
                        : <option
                            key={name}
                            value={v}
                            disabled={cantSwapPlaylist[v]}
                          >{v}</option>
                      : null
                  ))}
                </select>
              )
              : ''
            }
        </td>
      </tr>
    )}
  </table>
}
