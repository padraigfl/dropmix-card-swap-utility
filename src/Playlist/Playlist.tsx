import { useState } from "react";
import { CollectionContextProvider } from "../Ownership/CollectionContext";
import { PlaylistSwap } from "../Swap/PlaylistSwap";
import { ProcessSwap } from "../Swap/ProcessSwap";
import { SwapContextProvider, useSwapContext } from "../Swap/SwapContext";

const Playlist = () => {
  const { swapped } = useSwapContext();

  return (
    <>
      <PlaylistSwap />
      { Object.keys(swapped).length && (<ProcessSwap />)}
    </>
  )
}

export const PlaylistWrapper = () => {
  const [id, setId] = useState('abc');

  return (
    <CollectionContextProvider collectionId={id}>
      <SwapContextProvider>
        <Playlist />
      </SwapContextProvider>
    </CollectionContextProvider>
  )
}