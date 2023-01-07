import { GameDatasetUpload } from "../GameDataset/GameDatasetUpload";
import { CollectionContextProvider } from "../Ownership/CollectionContext";
import { PlaylistSwap } from "../Swap/PlaylistSwap";
import { ProcessSwap } from "../Swap/ProcessSwap";
import { SwapContextProvider } from "../Swap/SwapContext";

const Playlist = () => {
  return (
    <>
      <p>
        <GameDatasetUpload />
      </p>
      <p>
        <ProcessSwap />
      </p>
      <PlaylistSwap />
    </>
  )
}

export const PlaylistWrapper = () => {
  return (
    <CollectionContextProvider collectionId={'playlistswap'}>
      <SwapContextProvider>
        <Playlist />
      </SwapContextProvider>
    </CollectionContextProvider>
  )
}