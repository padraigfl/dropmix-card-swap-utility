import { useCallback, useState } from "react";
import { DialogControl } from "../components"
import { parseAssetsFile } from "../tools/sharedAssets";
import { useGameDatasetContext } from "./GameDatasetContext"

export const GameDatasetUpload = () => {
  const { setCardDbRaw, handleRawDataFile, setFilename, filename, downloadUpdatedDatabase } = useGameDatasetContext();
  const [loading, setLoading] = useState(false);

  const fetchExistingFile = useCallback((fileUrl: string, filename: string, onClose: () => void) => {
    setLoading(true);
    window.fetch(`${fileUrl}`, { headers: { 'Content-Type': 'text/plain' }, cache: "no-store"})
      .then(res => res.arrayBuffer())
      .then(ab => {
        parseAssetsFile(new Uint8Array(ab))
        setCardDbRaw(new Uint8Array(ab))
        setFilename(filename);
      })
      .then(() => onClose())
      .catch(e => { window.alert(e) })
      .finally(() => setLoading(false))
  }, [setCardDbRaw, setFilename]);

  return (
    <>{' '}
      <DialogControl buttonText={!!downloadUpdatedDatabase ? 'Change File' : 'Upload File'}>
        { onClose => (
          <>
            <input type="file" onChange={e => handleRawDataFile(e, onClose)} />
            <button disabled={loading} onClick={() => fetchExistingFile('/assets/sourceData/sharedassets0.assets', 'sharedassets0.assets', onClose)}>Use iOS 1.9.0</button>
            <button disabled={loading}  onClick={() => fetchExistingFile('/assets/sourceData/sharedassets0.assets.split194', 'sharedassets0.assets.split194', onClose)}>Use Android 1.9.0</button>
          </>
        )}
      </DialogControl>
      {filename || ' (a sharedassets0.assets file is required to modify the database)'}
    </>
  )
}