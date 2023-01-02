import { useEffect, useMemo, useState } from "react";
import { Card, CardKey } from "../datasets";
import { CardCollectionValues, useCollectionContext } from "../Ownership/CollectionContext";
import { useSwapContext } from "./SwapContext";
import cardDb from '../cardDb.json';

const getEllipsesText = (str: string, limit = 15) => {
  if (str.length > limit) {
    return `${str.substring(0,limit - 3)}...`
  }
  return str;
}

export const CardSwap = (props: { card: Card, disabled: boolean, invert?: boolean }) => {
  const [swapReady, setSwapReady] = useState(false);
  const { collection, stage } = useCollectionContext();
  const { onSwap, swapped } = useSwapContext();
  const swapVal = useMemo(() => swapped[props.card['Source CID'] as CardKey], [swapped, props.card])

  useEffect(() => {
    setSwapReady(false);
  }, [swapVal])

  if (!swapReady && swapVal) {
    return (
      <>
        <a href={`#${swapVal}`}>{swapVal}</a>
        <button onClick={() => onSwap([props.card['Source CID'], props.card['Source CID']] as [CardKey, CardKey])}>
          Cancel Swap
        </button>
      </>
    )
  }

  if (props.disabled) {
    return <>All swapped</>
  }
  if (!swapReady) {
    return (
      <button onClick={() => setSwapReady(true)}>
        Swap
      </button>
    );
  }

  return (
    <select
      value={props.card['Source CID']}
      onChange={e => {
        if (e.target.value === props.card['Source CID']) {
          setSwapReady(false);
        } else {
          onSwap([e.target.value as CardKey, props.card['Source CID'] as CardKey]) 
        }
      }}
    >
      <option value={props.card['Source CID']}>
        -----
      </option>
      {(Object.entries(collection) as [CardKey, CardCollectionValues][])
        .filter(([key, card]) => props.invert ? card.dispose : card.want)
        .map(([id]) => {
          return (
            <option value={id} disabled={!!swapped[id]}>
              {`${cardDb[id]['Source CID'] /* .split('_')[2] || 'FX' */} - ${getEllipsesText(cardDb[id].ArtistRef)} - ${getEllipsesText('' + cardDb[id].SongRef)}`}
            </option>
          );
        })
      }
    </select>
  )
}
