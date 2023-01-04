import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CardKey, Playlists } from "../datasets";
import { v4 as uuidv4 } from "uuid";
import cardDb from '../cardDb.json';
import { playlists } from "../tools/variables";

export type CollectionStage = 'own' | 'want' | 'dispose';

export const collectStages: CollectionStage[] = ['own', 'want', 'dispose']

export type CardCollectionValues = {
  [k in CollectionStage]: boolean
}

export type CheckOptions = keyof CardCollectionValues;

type OwnedCard = CardCollectionValues & {
  own: true;
}

type UnownCard = CardCollectionValues & {
  own: false;
}

export type CardCollection = {
  [k in CardKey]?: OwnedCard | UnownCard;
}

type CardCollectionData = {
  savedTime?: number;
  collection: CardCollection;
}

interface CollectionContextType {
  collection: CardCollection;
  id: string;
  updateCollection: (card: CardKey, key: keyof CardCollectionValues, value: boolean) => void;
  updateCollectionByPlaylist: (card: keyof Playlists, key: keyof CardCollectionValues, value: boolean) => void;
  undoChanges: () => void;
}

export const CollectionContext = createContext<CollectionContextType>({ id: uuidv4(), collection: {} } as CollectionContextType);

export const getCollection = (collectionId?: string): CardCollectionData => {
  if (collectionId) {
    const existing = window.localStorage.getItem(`card-${collectionId}`);
    if (existing) {
      return JSON.parse(existing);
    }
  }
  return {
    collection: (
      Object.keys(cardDb).reduce(
        (acc, k) => ({ ...acc, [k]: { own: false, want: false, dispose: false }}),
        {},
      )
    ),
    savedTime: Date.now(),
  }
}

const saveCollection = (collectionId: string, collection: CardCollection) => {
  const savedTime = Date.now();
  window.localStorage.setItem(`card-${collectionId}`, JSON.stringify({ collection, savedTime }));
}

export const useCollectionValues = (collectionId: string) => {
  const [collection, setCollection] = useState<CardCollection>(
    getCollection(collectionId).collection
  );
  const original = useRef(window.localStorage.getItem(`card-${collectionId}`) ? collection : null);

  const updateCollection = useCallback((card: CardKey, key: keyof OwnedCard, value: boolean) => {
    setCollection(prev => {
      const prevCard = prev[card]!;
      let newCard = { ...prevCard, [key]: value };

      // logic to prevent ownership states tripping up over each other
      if (key === 'own') {
        if (value && prevCard?.want) {
          newCard.want = false;
        } else if (!value && prevCard?.dispose) {
          newCard.dispose = false
        }
      } else if (key === 'want') {
        if (value) {
          newCard.own = false;
          newCard.dispose = false;
        }
      } else if (key === 'dispose' && value) {
        newCard.own = true;
        newCard.want = false;
      }
      return {
        ...prev,
        [card]: newCard
      }
    })
  }, []);

  const updateCollectionByPlaylist = useCallback((playlist: keyof Playlists, key: keyof OwnedCard, value: boolean) => {
    setCollection(prev => {
      const prevCopy = { ...prev };
      playlists[playlist].forEach((cardKey) => {
        const newCard = { ...collection[cardKey], [key]: value } as CardCollectionValues;
        if (key === 'own') {
          if (value && newCard?.want) {
            newCard.want = false;
          } else if (!value && newCard?.dispose) {
            newCard.dispose = false
          }
        } else if (key === 'want') {
          if (value) {
            newCard.own = false;
            newCard.dispose = false;
          }
        } else if (key === 'dispose' && value) {
          newCard.own = true;
          newCard.want = false;
        }

        prevCopy[cardKey] = newCard;
      })
      return prevCopy;
    })
  }, [collection]);

  useEffect(() => {
    const newCollection = getCollection(collectionId).collection
    setCollection(newCollection);
    original.current = window.localStorage.getItem(`card-${collectionId}`) ? newCollection : null
  }, [collectionId, original]);

  useEffect(() => {
    saveCollection(collectionId, collection);
  }, [collection, collectionId]);

  const undoChanges = useCallback(() => {
    if (original.current) {
      if (window.confirm('this will reset the existing collection to its state upon loading, this cannot be undone')) {
        setCollection(original.current);
      }
    } else {
      alert('No saved version of this database exists')
    }
  }, []);

  return useMemo(() => ({
    collection,
    updateCollection,
    updateCollectionByPlaylist,
    undoChanges,
    id: collectionId,
  }), [collection, undoChanges, updateCollection, collectionId, updateCollectionByPlaylist])
};

export const useCollectionContext = () => useContext(CollectionContext);

export const CollectionContextProvider = (props: { collectionId: string, children: ReactNode }) => {
  const value = useCollectionValues(props.collectionId);
  return (
    <CollectionContext.Provider value={value}>
      { props.children }
    </CollectionContext.Provider>
  )
}