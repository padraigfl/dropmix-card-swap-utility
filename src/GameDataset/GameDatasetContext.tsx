import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getMinifiedSwap, Swapped } from "../Swap/SwapContext";
import { changeCardRelation } from "../tools/modifiers";
import { buildDataBase, databaseParser, DBData } from "../tools/parseDatabase";
import { GameDatasetUpload } from "./GameDatasetUpload";

type GameDatasetContextType = {
  filename: string;
  setFilename: (n: string) => void;
  setCardDbRaw: (b: Uint8Array) => void;
  handleLevel0File: (e: any, onClose: () => void) => void;
  downloadUpdatedDatabase: null | ((swapValues: Swapped) => void);
};

const GameDatasetContext = createContext<GameDatasetContextType>({} as GameDatasetContextType);

export const useGameDatasetContext = () => useContext(GameDatasetContext);

const useGameDatasetValues = () => {
  const [cardDb, setCardDb] = useState<DBData | null>(null);
  const [cardDbRaw, setCardDbRaw] = useState<Uint8Array | null>(null);
  const [filename, setFilename] = useState('')
  // const navigate = useNavigate()

  useEffect(() => {
    if (cardDbRaw) {
      const parsedDb = databaseParser(cardDbRaw);
      setCardDb(parsedDb);
    } else {
      setCardDb(null);
    }
  }, [cardDbRaw]);

  const handleLevel0File = useCallback((e: any, onComplete?: () => void) => {
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

  const downloadUpdatedDatabase = useCallback((swapValues: Swapped) => {
    const swapValuesMinified = getMinifiedSwap(swapValues);

    const cardDbData = [...cardDb?.data || []];
    Object.entries(swapValuesMinified).forEach((changeKeys) => {
      [
        cardDbData.findIndex(c => c.id === changeKeys[0]),
        cardDbData.findIndex(c => c.id === changeKeys[1]),
      ].forEach((rowIdx, changeIdx) => {
        if (rowIdx >= 0 && cardDb!.data[rowIdx]) {
          const newRow = changeCardRelation(cardDb!.data[rowIdx], (changeKeys[(changeIdx + 1) % 2] as any))
          cardDbData[rowIdx] = newRow
        } else {
          throw Error('Invalid row data')
        }
      })
    })
    const newRawData = buildDataBase({ ...cardDb!, data: cardDbData }, cardDbRaw!)
    const newLevel0 = new Uint8Array(cardDbRaw!.buffer);
    newLevel0.set(newRawData, cardDb?.startIndex)
    const blob = new Blob([newLevel0]);
    const aElement = window.document.createElement('a');
    const savedFilename = `${filename}.custom${Date.now()}`;
    aElement.setAttribute('download', savedFilename);
    const href = URL.createObjectURL(blob);
    aElement.href = href;
    aElement.setAttribute('target', '_blank');
    aElement.click();
    URL.revokeObjectURL(href);
    aElement.remove();
    if (window.confirm(`Updated DB saved to ${savedFilename}; follow instructions to update; click confirm to view instructions for updating app`)){
      // navigate('/guide#level0');
      window.location.href = '/guide#level0';
    }
  }, [cardDb, cardDbRaw, filename]);

  return useMemo(() => ({
    setCardDbRaw,
    downloadUpdatedDatabase: cardDbRaw ? downloadUpdatedDatabase : null,
    handleLevel0File,
    filename,
    setFilename,
  }), [downloadUpdatedDatabase, handleLevel0File, filename, cardDbRaw]);
}

export const GameDatasetContextProvider = (props: { children: ReactNode }) => {
  const value = useGameDatasetValues();
  return (
    <GameDatasetContext.Provider value={value}>
      <GameDatasetUpload />
      {props.children}
    </GameDatasetContext.Provider>
  );
}
