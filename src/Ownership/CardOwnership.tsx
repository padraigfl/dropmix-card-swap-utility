import { CollectionContextProvider } from "./CollectionContext"
import { useEffect, useState } from "react";
import CardList from "./CardList";
import { SwapContextProvider } from "../Swap/SwapContext";
import { PlaylistList } from "./PlaylistList";
import { ProcessSwap } from "../Swap/ProcessSwap";

const CardOwnership = (props: { view: 'card' | 'playlist' }) => {
  return (
    <>
      <ProcessSwap />
      { props.view === 'playlist'
        ? <PlaylistList />
        : <CardList />
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
      <button disabled={collectionIds.length < 2} onClick={() => {
        // TODO tidy this mess up
        if (!!collectionId && collectionIds.length > 1 && window.confirm('Are you sure you want to delete this collection')) {
          localStorage.removeItem(`card-${collectionId}`);
          const newList = collectionIds.filter(c => c !== collectionId);
          localStorage.setItem('collections', JSON.stringify(newList));
          setCollectionIds(newList)
          setCollectionId(newList[0]);
        }
      }}>Delete Collection</button>
      <select onChange={(e) => setView(e.target.value as any)} value={view}>
        <option value="card">Cards</option>
        <option value="playlist">Playlist</option>
      </select>
      <CollectionContextProvider collectionId={collectionId}>
        <SwapContextProvider>
          <CardOwnership view={view}/>
        </SwapContextProvider>
      </CollectionContextProvider>
    </>
  );
}


