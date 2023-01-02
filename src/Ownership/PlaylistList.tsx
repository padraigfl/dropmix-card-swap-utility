import { useMemo, useRef } from "react";
import { CardKey, playlists } from "../datasets";
import { useSwapContext } from "../Swap/SwapContext";
import { CollectionStage, useCollectionContext } from "./CollectionContext"

export const PlaylistList = () => {
  const { collection, updateCollectionByPlaylist } = useCollectionContext();
  const { swapped, onSwap } = useSwapContext();
  const rowRefs = useRef({} as any);

  const onCheck = (key: CollectionStage, playlist: string, value: boolean) => {
    playlists[playlist].forEach(cardId => updateCollectionByPlaylist(playlist, key, value));
  }

  const allSwappable = useMemo(() => {
    return Object.entries(playlists).reduce((acc, [key, val]) => {
      let data = { want: 0, dispose: 0, own: 0 };
      val.forEach(c => {
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
    { Object.entries(playlists).map(([name, cardIds]) =>
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
              ? 'swap these'
              : '' }
          { }
        </td>
      </tr>
    )}
  </table>
}
