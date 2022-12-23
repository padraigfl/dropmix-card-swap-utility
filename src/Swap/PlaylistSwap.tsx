import { useCallback, useMemo, useState } from 'react';
import cardDb from '../cardDb.json';
import { Playlists, playlists } from '../datasets';
import { useSwapContext } from './SwapContext';

export const PlaylistSwap = () => {
  const { onSwap } = useSwapContext();
  const [swappedPlaylists, setSwappedPlaylists] = useState<{ [k in keyof Playlists]?: keyof Playlists}>({});

  const validPlaylists = useMemo(() => {
    let validPlaylists: string[] = [];
    Object.keys(playlists).forEach((p) => {
      if (playlists[p].length === 15) {
        validPlaylists.push(p);
      };
    });
    return validPlaylists
      .sort((a, b) => {
        const card1 = cardDb[playlists[a][0]]
        const card2 = cardDb[playlists[b][0]]
        if (card2.Season > card1.Season) {
          return -1;
        } else if (card1.Season > card2.Season) {
          return 1;
        }
        if (card2['Item ID'] > card1['Item ID']) {
          return -1;
        }
        return 1;
      }).map(p => ({
      name: p,
      season: cardDb[playlists[p][0]].Season + 1,
    }));
  }, []);


  const onPlaylistSwap = useCallback((p1: keyof Playlists, p2: keyof Playlists) => {
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
      const cardKey1 = playlists[p1][i];
      const cardKey2 = playlists[p2][i];
      onSwap([cardKey1, cardKey2]);
    }
  }, [onSwap]);

  return (
    <table>
      {validPlaylists.map(p => (
        <tr>
          { swappedPlaylists[p.name] && swappedPlaylists[p.name] !== p.name
            ? <>
              <td>
                {p.name}
                {` ->`} {swappedPlaylists[p.name]}
              </td>
              <td>
                <button
                  onClick={() => {
                    const swap1 = swappedPlaylists[p.name]!;
                    const swap2 = swappedPlaylists[swap1!]!;
                    onPlaylistSwap(swap1, swap1);
                    onPlaylistSwap(swap2, swap2)
                  }}
                >Clear</button>
              </td>
            </>
            : <>
              <td>{p.name}</td>
              <td>
                <select onChange={e => onPlaylistSwap(p.name, e.target.value)} value={swappedPlaylists[p.name] || p.name}>
                  {validPlaylists.map(v => (
                    v.name === p.name
                      ? <option value={v.name} disabled>---</option>
                      : <option value={v.name} disabled={Object.values(swappedPlaylists).includes(v.name)}>{v.name}</option>
                  ))}
                </select>
              </td>
            </>
          }
        </tr>
      ))}
    </table>
  )
}