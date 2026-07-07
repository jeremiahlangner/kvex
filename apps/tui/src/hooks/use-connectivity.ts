import { useEffect, useRef } from "react";
import { ConnectivityMonitor } from "../utils/connectivity";
import { useAppState } from "../state";

export function useConnectivity(): void {
  const { state, dispatch } = useAppState();
  const monitorRef = useRef<ConnectivityMonitor | null>(null);

  useEffect(() => {
    if (!monitorRef.current) {
      monitorRef.current = new ConnectivityMonitor((connectivity) => {
        dispatch({ type: "SET_CONNECTIVITY", connectivity });
      });
    }
    monitorRef.current.start(state.activeProviderType);
    return () => monitorRef.current?.stop();
  }, [state.activeProviderType, dispatch]);
}
