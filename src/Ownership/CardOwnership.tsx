import { CollectionContextProvider, CollectionStage, collectStages, getCollection, useCollectionContext } from "./CollectionContext"
import { v4 as uuidv4 } from "uuid";
import { useCallback, useEffect, useMemo, useState } from "react";
import CardList from "./CardList";
import { CardKey } from "../datasets";
import { SwapContextProvider, useSwapContext } from "../Swap/SwapContext";
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


const getCollections = () => {
  return JSON.parse(window.localStorage.getItem('collections') || '[]') as string[]
}

const saveCollectionList = (collectionId: string) => {
  const collections = new Set<string>(getCollections());
  collections.add(collectionId);
  const array = Array.from(collections)
  window.localStorage.setItem('collections', JSON.stringify(array));
  return array;
}

export const CardOwnershipWrapper = () => {
  
  const [collectionIds, setCollectionIds] = useState<string[]>(getCollections())
  const [collectionId, setCollectionId] = useState(collectionIds[collectionIds.length - 1]);

  useEffect(() => {
    if (!collectionId) {
      setCollectionId(uuidv4());
    }
  }, []);

  useEffect(() => {
    const savedCollections = getCollections();
    const newCollections = collectionIds.filter(c => !savedCollections.includes(c));
    if (newCollections.length) {
      newCollections.forEach(c => saveCollectionList(c));
      setCollectionIds([...savedCollections, ...newCollections]);
    }
  }, [collectionIds]);

  useEffect(() => {
    const newlyCreatedCollections = !collectionIds.includes(collectionId)
    if (newlyCreatedCollections) {
      setCollectionIds(prev => [...prev, collectionId]);
    }
  }, [collectionId, collectionIds]);

  return (
    <>
      <select value={collectionId} onChange={e => {
        if (collectionIds.includes(e.target.value) || window.confirm('create new collection')) {
          setCollectionId(e.target.value)
        }
      }}>
        {collectionIds.map(c => {
          const collection = getCollection(c);
          return (
            <option value={c} disabled={c === collectionId}>{new Date(collection.savedTime! || 0).toISOString()}</option>
          )
        })}
      </select>
      <button
        onClick={() => {
          window.confirm('create new collection') && setCollectionId(uuidv4())
        }}>New Collection</button>
      <button>Delete Collection</button>
     
      <CollectionContextProvider collectionId={collectionId}>
        <SwapContextProvider>
          <CardOwnership />
        </SwapContextProvider>
      </CollectionContextProvider>
    </>
  );
}


