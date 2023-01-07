import { DialogControl } from "../components"
import { getMinifiedSwap, useSwapContext } from "./SwapContext"
import { useEffect, useMemo, useState } from "react";
import { infoColumns } from "../Ownership/CardList";
import { CardKey } from "../datasets";
import { useGameDatasetContext } from "../GameDataset/GameDatasetContext";
import { downloadCardPrintsheet } from "../tools/download";

export const ProcessSwap = () => {
  const { swapped } = useSwapContext();
  const { downloadUpdatedDatabase } = useGameDatasetContext();
  const minifiedSwap = useMemo(() => getMinifiedSwap(swapped), [swapped]);
  const swapCount = Object.keys(swapped).length;
  const [downloadTime, setDownloadTime] = useState<number | null>(null);

  useEffect(() => {
    setDownloadTime(null);
  }, [swapped]);
  return (
    <DialogControl disabled={!Object.keys(swapped).length} buttonText={`Download Swap ${swapCount ? `(${swapCount})` : ''}`}>
      {onClose => (
        <>
          <button
            onClick={() => {
              if (!downloadUpdatedDatabase) {
                alert('please select/upload a raw data set to complete swap process')
              }
              const fn = window.prompt('please name fileset');
              try {
                const dt = downloadUpdatedDatabase?.(swapped, fn || '');
                if (dt) {
                  setDownloadTime(dt);
                }
              } catch (e) {
                console.error(e);
              } finally {
                onClose();
              }
            }}
            // disabled={!!downloadTime}
          >Download Swapped DB</button>
          <button
            onClick={() => {
              downloadCardPrintsheet(Object.keys(minifiedSwap) as CardKey[], Object.values(minifiedSwap))
            }}
            disabled={!downloadTime}
          >Download swap printsheet</button>
          <table>
            <thead>
              {infoColumns.map(v => <th>{v.name}</th>)}
              <th>{`<-->`}</th>
              {infoColumns.map(v => <th>{v.name}</th>)}
            </thead>
            <tbody>
              { Object.entries(minifiedSwap).map(([card1, card2]) => {
                return (
                <tr>
                  { infoColumns.map(v => <td>{v.render(card1 as CardKey)}</td>)}
                  <td>{`<-->`}</td>
                  { infoColumns.map(v => <td>{v.render(card2 as CardKey)}</td>)}
                </tr>
              )})}
            </tbody>
          </table>
        </>
      )}
    </DialogControl>
  )
}