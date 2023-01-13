import { DialogControl } from "../components"
import { getMinifiedSwap, useSwapContext } from "./SwapContext"
import { useEffect, useMemo, useState } from "react";
import { infoColumns } from "../Ownership/CardList";
import { CardKey } from "../datasets";
import { useGameDatasetContext } from "../GameDataset/GameDatasetContext";
import { downloadCardPrintsheet } from "../tools/download";
import { useCollectionContext } from "../Ownership/CollectionContext";
import { access } from "fs";

export const ProcessSwap = (props: { allowPrintsheet?: boolean; invertPrintSheet?: boolean }) => {
  const { swapped } = useSwapContext();
  const { downloadUpdatedDatabase } = useGameDatasetContext();
  const { collection } = useCollectionContext();
  const minifiedSwap = useMemo(() => getMinifiedSwap(swapped, collection), [swapped, collection]);
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
                return;
              }
              const fn = window.prompt('please name fileset');
              try {
                const dt = downloadUpdatedDatabase?.(swapped, fn || '');
                if (dt) {
                  setDownloadTime(dt);
                }
              } catch (e) {
                console.error(e);
                return;
              }
              onClose();
            }}
            // disabled={!!downloadTime}
          >Download Swapped DB</button>
          {props.allowPrintsheet && (
            <button
              onClick={() => {
                props.invertPrintSheet
                  ? downloadCardPrintsheet(Object.values(minifiedSwap), Object.keys(minifiedSwap) as CardKey[], 'swapData' + downloadTime)
                  : downloadCardPrintsheet(Object.keys(minifiedSwap) as CardKey[], Object.values(minifiedSwap), 'swapData' + downloadTime)
              }}
              disabled={!downloadTime}
            >Download swap printsheet</button>
          )}
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