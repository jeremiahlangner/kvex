import { useCallback } from "react";
import { useAppState } from "../state";
import { cache } from "../cache";
import { getThemeNames } from "../themes";
import { getProviderNames, resolveProviderType } from "../providers";
import { initializeProvider } from "../utils/provider-init";
import { writeConfig } from "../config";

export interface CommandActions {
  onQuit: () => void;
  onSearch: (query: string) => void;
  onSetEditor: (editor: string) => void;
  onSetTheme: (theme: string) => void;
  onSetProvider: (name: string) => void;
}

export function useCommandActions(renderer: { destroy: () => void }): CommandActions {
  const { state, dispatch } = useAppState();

  const onQuit = useCallback(() => {
    renderer.destroy();
  }, [renderer]);

  const onSearch = useCallback((query: string) => {
    if (!cache.ready) {
      dispatch({ type: "SET_STATUS", status: "Cache not ready" });
      return;
    }
    const results = cache.searchQuery(query);
    if (results.length > 0) {
      const first = results[0];
      try {
        const item = JSON.parse(first.value);
        dispatch({ type: "SET_PREVIEW_ITEM", item, key: JSON.parse(first.key) });
        dispatch({ type: "SET_STATUS", status: `Found ${results.length} result(s)` });
      } catch {
        dispatch({ type: "SET_STATUS", status: "No results found" });
      }
    } else {
      dispatch({ type: "SET_STATUS", status: "No results found" });
    }
  }, [dispatch]);

  const onSetEditor = useCallback(async (editor: string) => {
    dispatch({ type: "UPDATE_CONFIG", config: { editor } });
    try {
      await writeConfig({ ...state.config, editor });
      dispatch({ type: "SET_STATUS", status: `Editor set to ${editor}` });
    } catch {
      dispatch({ type: "SET_ERROR", error: "Failed to save config" });
    }
  }, [state.config, dispatch]);

  const onSetTheme = useCallback(async (theme: string) => {
    const names = getThemeNames();
    if (!names.includes(theme)) {
      dispatch({ type: "SET_STATUS", status: `Unknown theme: ${theme} (available: ${names.join(", ")})` });
      return;
    }
    dispatch({ type: "UPDATE_CONFIG", config: { theme } });
    try {
      await writeConfig({ ...state.config, theme });
      dispatch({ type: "SET_STATUS", status: `Theme set to ${theme}` });
    } catch {
      dispatch({ type: "SET_ERROR", error: "Failed to save config" });
    }
  }, [state.config, dispatch]);

  const onSetProvider = useCallback(async (name: string) => {
    const names = getProviderNames();
    if (!names.some((n) => n.toLowerCase() === name.toLowerCase())) {
      dispatch({ type: "SET_STATUS", status: `Unknown provider: ${name} (available: ${names.join(", ")})` });
      return;
    }
    const providerType = resolveProviderType(name);
    if (!providerType) return;
    if (providerType === state.activeProviderType) {
      dispatch({ type: "SET_STATUS", status: `Already using ${name}` });
      return;
    }
    try {
      await state.provider.disconnect();
      const { tables } = await initializeProvider(providerType, dispatch);
      dispatch({ type: "SET_ACTIVE_PROVIDER_TYPE", providerType });
      dispatch({ type: "UPDATE_CONFIG", config: { activeProvider: providerType } });
      await writeConfig({ ...state.config, activeProvider: providerType });
      dispatch({ type: "SET_SELECTED_TABLE", table: tables.length > 0 ? tables[0].name : null });
      dispatch({ type: "SET_TABLE_SCHEMA", schema: null });
      dispatch({ type: "SET_PRIMARY_KEY_OPTIONS", options: [] });
      dispatch({ type: "SET_PRIMARY_KEY_VALUE", value: null });
      dispatch({ type: "SET_SORT_KEY_OPTIONS", options: [] });
      dispatch({ type: "SET_SORT_KEY_VALUE", value: null });
      dispatch({ type: "SET_PREVIEW_ITEM", item: null, key: null });
      dispatch({ type: "SET_STATUS", status: `Switched to ${name}` });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: String(err) });
      dispatch({ type: "SET_STATUS", status: `Error: ${err}` });
    }
  }, [state.provider, state.activeProviderType, state.config, dispatch]);

  return { onQuit, onSearch, onSetEditor, onSetTheme, onSetProvider };
}
