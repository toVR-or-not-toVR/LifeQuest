import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { AppState, AppAction } from '../types';
import { appReducer } from './reducer';
import { INITIAL_STATE } from '../constants/mockData';
import { saveState, loadState, clearState } from '../services/storageService';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  resetState: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const isHydrated = useRef(false);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const saved = await loadState();
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: saved });
      }
      isHydrated.current = true;
    })();
  }, []);

  // Persist on every state change (after hydration)
  useEffect(() => {
    if (isHydrated.current) {
      saveState(state);
    }
  }, [state]);

  // Check streak on mount
  useEffect(() => {
    if (isHydrated.current) {
      dispatch({ type: 'CHECK_STREAK' });
    }
  }, [isHydrated.current]);

  async function resetState() {
    await clearState();
    dispatch({ type: 'LOAD_STATE', payload: INITIAL_STATE });
  }

  return (
    <AppContext.Provider value={{ state, dispatch, resetState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return ctx;
}
