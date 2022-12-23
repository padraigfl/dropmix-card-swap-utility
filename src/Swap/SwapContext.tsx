import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { CardKey } from "../datasets";

export type OnSwap = ((swap: [CardKey, CardKey]) => void)

interface SwapContextType {
  onSwap: OnSwap;
  swapped: Swapped;
}
const SwapContext = createContext({} as SwapContextType);

export const useSwapContext = () => useContext<SwapContextType>(SwapContext);

export type Swapped = { [k in CardKey]?: CardKey };

export const getMinifiedSwap = (swapValues: Swapped) => {
  const swapValuesMinified = {
    ...swapValues,
  };

  // hacky clearance of correlated values
  (Object.keys(swapValuesMinified) as CardKey[]).forEach(k => {
    const swapVal = swapValuesMinified[k];
    if (swapVal && swapValuesMinified[swapVal]) {
      delete swapValuesMinified[swapVal];
    };
  });
  return swapValuesMinified;
}

export const SwapContextProvider = (props: { children: ReactNode }) => {
  const [swapped, setSwapped] = useState<Swapped>({});

  // if both values are the same remove the swap
  const onSwap = useCallback(([k1, k2]: [CardKey, CardKey]) => {
    setSwapped(prevSwapState => {
      const newState = {...prevSwapState};
      if (k1 === k2) {
        const otherSwapVal = prevSwapState[k1];
        delete newState[k1];
        if (otherSwapVal) {
          delete newState[otherSwapVal];
        }
        return newState;
      }
      return {
        ...newState,
        [k1]: k2,
        [k2]: k1,
      }
    })
  }, []);

  return (
    <SwapContext.Provider value={{ onSwap, swapped }}>
      {props.children}
    </SwapContext.Provider>
  );
}