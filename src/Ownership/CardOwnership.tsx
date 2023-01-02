import { CollectionContextProvider, CollectionStage, collectStages, getCollection, useCollectionContext } from "./CollectionContext"
import { useCallback, useEffect, useMemo, useState } from "react";
import CardList from "./CardList";
import { CardKey } from "../datasets";
import { SwapContextProvider, useSwapContext } from "../Swap/SwapContext";
import { ProcessSwap } from "../Swap/ProcessSwap";
import { PlaylistList } from "./PlaylistList";


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
  const [view, setView] = useState<'card' | 'playlist'>('card');

  useEffect(() => {
    if (!collectionId) {
      setCollectionId('default');
    }
  }, [collectionId]);

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
        if (collectionIds.includes(e.target.value)) {
          setCollectionId(e.target.value)
        }
      }}>
        {collectionIds.map(c => {
          return (
            <option value={c} disabled={c === collectionId}>{c}</option>
          )
        })}
      </select>
      <button
        onClick={() => {
          let name = window.prompt('Please give the collection a name');
          if (name) {
            setCollectionId(name);
          } else {
            window.alert('collection already exists')
          }
        }}>New Collection</button>
      <button>Delete Collection</button>
      <select onChange={(e) => setView(e.target.value as any)} value={view}>
        <option value="card">Cards</option>
        <option value="playlist">Playlist</option>
      </select>
     
      <CollectionContextProvider collectionId={collectionId}>
        <SwapContextProvider>
          { view === 'card'
            ? <CardOwnership />
            : <PlaylistList />
          }
        </SwapContextProvider>
      </CollectionContextProvider>
    </>
  );
}


