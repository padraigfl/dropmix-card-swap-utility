import { useCallback, useMemo, useState } from 'react';
import cardDb from '../cardDb.json';
import { PlaylistKey, Playlists } from '../datasets';
import { downloadCardPrintsheet } from '../tools/download';
import { playlists } from '../tools/variables';
import { useSwapContext } from './SwapContext';

export const PlaylistSwap = () => {
  const { onSwap } = useSwapContext();
  const [swappedPlaylists, setSwappedPlaylists] = useState<{ [k in keyof Playlists]?: keyof Playlists}>({});
  const [includeBafflers, setIncludeBafflers] = useState(false);

  const downloadPlaylistSheet = useCallback((playlistName: PlaylistKey) => {
    const printsheet = [ ...playlists[playlistName].cards ]
    if (includeBafflers && playlists[playlistName]?.baffler) {
      printsheet.push(playlists[playlistName]?.baffler!)
    }
    downloadCardPrintsheet(printsheet, [], playlistName + (playlists[playlistName].cards.length !== printsheet.length ? '+baffler' : ''));
  }, [includeBafflers]);

  const validPlaylists = useMemo(() => {
    let validPlaylists: string[] = [];
    Object.keys(playlists).forEach((p) => {
      if (playlists[p].cards.length === 15) {
        validPlaylists.push(p);
      };
    });
    return validPlaylists
      .sort((a, b) => {
        const card1 = cardDb[playlists[a].cards[0]]
        const card2 = cardDb[playlists[b].cards[0]]
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
      season: cardDb[playlists[p].cards[0]].Season + 1,
    }));
  }, []);


  const onPlaylistSwap = useCallback((p1: PlaylistKey, p2: PlaylistKey) => {
    if (includeBafflers && (!!playlists[p1]?.baffler !== !!playlists[p2]?.baffler)) {
      alert('This swap will fail as you have enabled swapping corresponding bafflers but one playlist does not have any');
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
    if (includeBafflers) {
      onSwap([playlists[p1].baffler!, playlists[p2].baffler!]);
    }
  }, [onSwap, includeBafflers]);

  return (
    <>
      <label htmlFor="bafflerToggle">Swap bafflers</label>
      <input name="bafflerToggle" type="checkbox" checked={includeBafflers} onChange={() => setIncludeBafflers(prev => !prev)} />
      <table>
        {validPlaylists.map(p => (
          <tr>
            <td>
              <button type="button" onClick={() => downloadPlaylistSheet(p.name)}>
                Print
              </button>
              {p.name}
              {swappedPlaylists[p.name] && ` -> ${swappedPlaylists[p.name]}`}
            </td>
            { swappedPlaylists[p.name] && swappedPlaylists[p.name] !== p.name
              ? 
                <td>
                  <button
                    onClick={() => {
                      const swap1 = swappedPlaylists[p.name]! as string; // TODO resolve type
                      const swap2 = swappedPlaylists[swap1!]! as string; // TODO resolve type
                      onPlaylistSwap(swap1, swap1);
                      onPlaylistSwap(swap2, swap2)
                    }}
                  >Clear</button>
                </td>
              : 
                <td>
                  <select onChange={e => onPlaylistSwap(p.name, e.target.value)} value={swappedPlaylists[p.name] || p.name}>
                    {validPlaylists.map(v => (
                      v.name === p.name
                        ? <option value={v.name} disabled>---</option>
                        : <option value={v.name} disabled={Object.values(swappedPlaylists).includes(v.name)}>{v.name}</option>
                    ))}
                  </select>
                </td>
            }
          </tr>
        ))}
      </table>
    </>
  )
}