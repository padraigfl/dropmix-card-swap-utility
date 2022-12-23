import { CollectionContextProvider, CollectionStage, collectStages, useCollectionContext } from "./CollectionContext"
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CardList from "./CardList";
import { CardKey } from "../datasets";
import { useGameDatasetContext } from "../GameDataset/GameDatasetContext";
import { SwapContextProvider, useSwapContext } from "../Swap/SwapContext";
import { DialogControl } from "../components";
import { ProcessSwap } from "../Swap/ProcessSwap";


const CollectionNavigation = (props: { initialising: boolean}) => {
  const { stage, setStage, collection } = useCollectionContext();
  const { swapped } = useSwapContext();

  const stageCounts = useMemo(() =>
    Object.values(collection).reduce(
      (counts, val) => {
        if (val.own) {
          counts.own++;
        }
        if (val.want) {
          counts.want++;
        }
        if (val.dispose) {
          counts.dispose++;
        }
        return counts;
      }, { own: 0, want: 0, dispose: 0 })
  , [collection]);

  return (
    <>
      {collectStages.map(s =>
        <button onClick={() => setStage(s)} disabled={stage === s || (s !== 'own' && props.initialising)}>
          {s} {stageCounts[s] ? `(${stageCounts[s]})` : ''}
        </button>
      )}
      { Object.keys(swapped).length && (<ProcessSwap />)}
    </>
  )
}

const CardOwnership = () => {
  const { updateCollection, collection, stage } = useCollectionContext();
  const toggleCardStatus = useCallback((card: CardKey, status: CollectionStage) => {
    updateCollection(card, status, !collection[card]?.[status])
  }, [updateCollection, collection]);

  const needsCollection = Object.values(collection).every(c => !c.own);
  if (stage !== 'own' && needsCollection) {
    return <>Please select some cards as being owned by you first</>
  }

  return (
    <>
      <CollectionNavigation initialising={needsCollection} />
      { stage !== 'own' && needsCollection
        ? <>Please select some cards as being owned by you first</>
        : (
          <CardList
            action={stage}
            onCheck={toggleCardStatus}
            collection={collection}
          />
        )
      }
    </>
  )
}

export const CardOwnershipWrapper = () => {
  const [collectionId] = useState(uuidv4);
  return (
    <CollectionContextProvider collectionId={collectionId}>
      <SwapContextProvider>
        <CardOwnership />
      </SwapContextProvider>
    </CollectionContextProvider>
  );
}


