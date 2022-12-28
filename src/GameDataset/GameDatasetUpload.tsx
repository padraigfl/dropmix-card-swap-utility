import { useCallback, useState } from "react";
import { DialogControl } from "../components"
import { useGameDatasetContext } from "./GameDatasetContext"

export const GameDatasetUpload = () => {
  const { setCardDbRaw, handleLevel0File, setFilename, downloadUpdatedDatabase } = useGameDatasetContext();
  const [loading, setLoading] = useState(false);

  const fetchExistingFile = useCallback((fileUrl: string, filename: string, onClose: () => void) => {
    setLoading(true);
    window.fetch(`${fileUrl}`, { headers: { 'Content-Type': 'text/plain' }, cache: "no-store"})
      .then(res => res.arrayBuffer())
      .then(ab => {
        setCardDbRaw(new Uint8Array(ab))
        setFilename(filename);
      })
      .then(() => onClose())
      .catch(e => { window.alert(e) })
      .finally(() => setLoading(true))
  }, [setCardDbRaw, setFilename]);

  return (
    <DialogControl buttonText={!!downloadUpdatedDatabase ? 'Change File' : 'Upload File'}>
      { onClose => (
        <>
          <input type="file" onChange={e => handleLevel0File(e, onClose)} />
          <button disabled={loading} onClick={() => fetchExistingFile('/assets/sourceData/level0', 'level0', onClose)}>Use iOS Default</button>
          <button disabled={loading}  onClick={() => fetchExistingFile('/assets/sourceData/level0.split3', 'level0.split3', onClose)}>Use Android Default</button>
        </>
      )}
    </DialogControl>
  )
}