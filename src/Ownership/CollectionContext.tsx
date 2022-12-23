import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CardKey } from "../datasets";
import { v4 as uuidv4 } from "uuid";
import cardDb from '../cardDb.json';

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

interface CollectionContextType {
  stage: CollectionStage;
  setStage: (s: CollectionStage) => void;
  collection: CardCollection;
  id: string;
  updateCollection: (card: CardKey, key: keyof CardCollectionValues, value: boolean) => void;
  undoChanges: () => void;
}

export const CollectionContext = createContext<CollectionContextType>({ id: uuidv4(), collection: {} } as CollectionContextType);

const getInitialCollection = (collectionId?: string) => {
  if (collectionId) {
    const existing = window.localStorage.getItem(`card-${collectionId}`);
    if (existing) {
      return JSON.parse(existing);
    }
  }
  return (
    Object.keys(cardDb).reduce(
      (acc, k) => ({ ...acc, [k]: { own: false, want: false, swapee: false }}),
      {},
    )
  )
}

const saveCollection = (collectionId: string, collection: CardCollection) => {
  window.localStorage.setItem(`card-${collectionId}`, JSON.stringify(collection));
}


export const useCollectionValues = (collectionId: string) => {
  const [collection, setCollection] = useState<CardCollection>(
    getInitialCollection(collectionId)
  );
  const [stage, setStage] = useState<CollectionStage>('own');
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

  useEffect(() => {
    const newCollection = getInitialCollection(collectionId)
    setCollection(getInitialCollection(collectionId));
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
    undoChanges,
    stage,
    setStage,
    id: collectionId
  }), [stage, collection, undoChanges, updateCollection, collectionId])
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