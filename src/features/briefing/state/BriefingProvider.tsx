"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import {
  briefingReducer,
  initialState,
  type BriefingAction,
  type BriefingState,
} from "../engine/state";

interface BriefingContextValue {
  state: BriefingState;
  dispatch: Dispatch<BriefingAction>;
}

const BriefingContext = createContext<BriefingContextValue | null>(null);

/** Estado do protótipo só em memória: recarregar a página apaga as respostas. */
export function BriefingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(briefingReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <BriefingContext.Provider value={value}>
      {children}
    </BriefingContext.Provider>
  );
}

export function useBriefing() {
  const context = useContext(BriefingContext);
  if (!context)
    throw new Error("useBriefing precisa estar dentro de BriefingProvider");
  return context;
}
