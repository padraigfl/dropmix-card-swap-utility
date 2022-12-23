import { useState } from "react";
import { CollectionContextProvider } from "../Ownership/CollectionContext";
import { PlaylistSwap } from "../Swap/PlaylistSwap";

export const PlaylistWrapper = () => {
  const [id, setId] = useState('abc');

  return (
    <CollectionContextProvider collectionId={id}>
      <PlaylistSwap />
    </CollectionContextProvider>
  )
}