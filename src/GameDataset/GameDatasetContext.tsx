import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { getMinifiedSwap, Swapped } from "../Swap/SwapContext";
import { downloadFile, downloadSwapData } from "../tools/download";
import { updateDatabase } from "../tools/sharedAssets";

type GameDatasetContextType = {
  filename: string;
  setFilename: (n: string) => void;
  setCardDbRaw: (b: Uint8Array) => void;
  handleRawDataFile: (e: any, onClose: () => void) => void;
  downloadUpdatedDatabase: null | ((swapValues: Swapped, prefix?: string) => number);
};

const GameDatasetContext = createContext<GameDatasetContextType>({} as GameDatasetContextType);

export const useGameDatasetContext = () => useContext(GameDatasetContext);

const useGameDatasetValues = () => {
  const [cardDbRaw, setCardDbRaw] = useState<Uint8Array | null>(null);
  const [filename, setFilename] = useState('')
  // const navigate = useNavigate()

  const handleRawDataFile = useCallback((e: any, onComplete?: () => void) => {
    var reader = new FileReader();
    reader.onload = function() {
      const arrayBuffer = this.result as ArrayBuffer;
      const array8 = new Uint8Array(arrayBuffer);
      setCardDbRaw(array8);
      onComplete?.();
    }
    setFilename(e.target.files[0].name);
    reader.readAsArrayBuffer(e.target.files[0]);
  }, [])

  const downloadUpdatedDatabase = useCallback((swapValues: Swapped, prefix?: string) => {
    const swapValuesMinified = getMinifiedSwap(swapValues);
    const newRawData = updateDatabase(cardDbRaw!, swapValuesMinified)
    const blob = new Blob([newRawData]);
    const dlTime = Date.now();
    const savedFilename = `${filename}.${prefix || 'custom'}`;
    downloadFile(blob, savedFilename);
    downloadSwapData(swapValuesMinified, `${savedFilename}-details.json`);
    window.alert(`Updated DB saved to ${savedFilename}, please check the guide for information on how to add this to the application`)
    return dlTime;
  }, [cardDbRaw, filename]);

  return useMemo(() => ({
    setCardDbRaw,
    downloadUpdatedDatabase: cardDbRaw ? downloadUpdatedDatabase : null,
    handleRawDataFile,
    filename,
    setFilename,
  }), [downloadUpdatedDatabase, handleRawDataFile, filename, cardDbRaw]);
}

export const GameDatasetContextProvider = (props: { children: ReactNode }) => {
  const value = useGameDatasetValues();
  return (
    <GameDatasetContext.Provider value={value}>
      {props.children}
    </GameDatasetContext.Provider>
  );
}
