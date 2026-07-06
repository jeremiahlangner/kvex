import { useKeyboard, useRenderer } from "@opentui/react";
import { useEffect, useRef } from "react";
import { AppProvider, useAppState } from "./state";
import { PreviewPane } from "./components/preview-pane";
import { DatabaseSelect } from "./components/database-select";
import { KeySelect } from "./components/key-select";
import { SortKeySelect } from "./components/sort-key-select";
import { CommandPalette } from "./components/command-palette";
import { StatusBar } from "./components/status-bar";
import { ConfirmDialog } from "./components/confirm-dialog";
import { editInEditor } from "./utils/editor";
import { writeConfig } from "./config";
import { cache } from "./cache";
import { getThemeNames } from "./themes";
import { createProvider, resolveProviderType, getProviderNames } from "./providers";
import { ConnectivityMonitor } from "./utils/connectivity";

function AppInner() {
  const { state, dispatch } = useAppState();
  const renderer = useRenderer();
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

  useKeyboard((key) => {
    if (state.confirmDialog) return false;

    if (key.name === "/" && !state.commandOpen) {
      dispatch({ type: "SET_COMMAND_OPEN", open: true });
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: "" });
      return true;
    }

    if (key.name === "w" && !state.commandOpen) {
      const validPanes = [0];
      if (state.tableSchema) validPanes.push(1);
      if (state.tableSchema?.range) validPanes.push(2);
      validPanes.push(3);
      const idx = validPanes.indexOf(state.focusedPane);
      const next = validPanes[(idx + 1) % validPanes.length];
      dispatch({ type: "SET_FOCUSED_PANE", pane: next });
      return true;
    }

    if (key.name === "b" && !state.commandOpen) {
      const validPanes = [0];
      if (state.tableSchema) validPanes.push(1);
      if (state.tableSchema?.range) validPanes.push(2);
      validPanes.push(3);
      const idx = validPanes.indexOf(state.focusedPane);
      if (idx > 0) {
        dispatch({ type: "SET_FOCUSED_PANE", pane: validPanes[idx - 1] });
      }
      return true;
    }

    if (key.name === "tab" && !state.commandOpen) {
      const lastKey = state.tableSchema?.range ? 2 : (state.tableSchema ? 1 : -1);
      if (lastKey < 0) return false;
      if (state.focusedPane === 3) {
        dispatch({ type: "SET_FOCUSED_PANE", pane: lastKey });
        return true;
      }
      if (state.focusedPane < lastKey) {
        dispatch({ type: "SET_FOCUSED_PANE", pane: state.focusedPane + 1 });
        return true;
      }
      dispatch({ type: "SET_FOCUSED_PANE", pane: 3 });
      return true;
    }

    if (key.name === "q" && !state.commandOpen) {
      dispatch({
        type: "SET_CONFIRM_DIALOG",
        dialog: {
          message: "Quit kvex?",
          onConfirm: () => {
            renderer.destroy();
            process.exit(0);
          },
        },
      });
      return true;
    }

    if (key.name === "return" && !state.commandOpen && state.previewItem && state.previewKey && state.selectedTable) {
      const lastExplorer = state.tableSchema?.range ? 2 : (state.tableSchema ? 1 : 0);
      const canEdit = state.focusedPane === 3 || state.focusedPane === lastExplorer;
      if (!canEdit) return false;
      editInEditor(
        renderer,
        state.config.editor,
        state.previewItem,
        state.provider,
        state.selectedTable,
        state.previewKey,
        () => {
          dispatch({ type: "SET_STATUS", status: "Item saved" });
          cache.put(
            state.activeProviderType,
            state.selectedTable!,
            state.previewKey!,
            state.previewItem!,
          );
        },
      );
      return true;
    }

    if ((key.name === "d" || key.name === "delete") && !state.commandOpen && state.previewItem && state.previewKey) {
      const keyStr = JSON.stringify(state.previewKey);
      dispatch({
        type: "SET_CONFIRM_DIALOG",
        dialog: {
          message: `Delete item with key ${keyStr}?`,
          onConfirm: async () => {
            if (!state.selectedTable || !state.previewKey) return;
            try {
              await state.provider.deleteItem(state.selectedTable, state.previewKey);
              cache.remove(state.activeProviderType, state.selectedTable, state.previewKey);
              dispatch({ type: "SET_PREVIEW_ITEM", item: null, key: null });
              dispatch({ type: "SET_STATUS", status: "Item deleted" });
            } catch (err) {
              dispatch({ type: "SET_ERROR", error: String(err) });
            }
          },
        },
      });
      return true;
    }

    return false;
  });

  const handleQuit = () => {
    renderer.destroy();
    process.exit(0);
  };

  const handleSearch = (query: string) => {
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
  };

  const handleSetEditor = async (editor: string) => {
    dispatch({ type: "UPDATE_CONFIG", config: { editor } });
    try {
      await writeConfig({ ...state.config, editor });
      dispatch({ type: "SET_STATUS", status: `Editor set to ${editor}` });
    } catch {
      dispatch({ type: "SET_ERROR", error: "Failed to save config" });
    }
  };

  const handleSetTheme = async (name: string) => {
    const names = getThemeNames();
    if (!names.includes(name)) {
      dispatch({ type: "SET_STATUS", status: `Unknown theme: ${name} (available: ${names.join(", ")})` });
      return;
    }
    dispatch({ type: "UPDATE_CONFIG", config: { theme: name } });
    try {
      await writeConfig({ ...state.config, theme: name });
      dispatch({ type: "SET_STATUS", status: `Theme set to ${name}` });
    } catch {
      dispatch({ type: "SET_ERROR", error: "Failed to save config" });
    }
  };

  const handleSetProvider = async (name: string) => {
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
    dispatch({ type: "SET_CONNECTION_STATUS", status: "connecting" });
    dispatch({ type: "SET_TABLES_LOADING", loading: true });
    try {
      await state.provider.disconnect();
      const newProvider = createProvider(providerType);
      await newProvider.connect();
      dispatch({ type: "SET_PROVIDER", provider: newProvider });
      dispatch({ type: "SET_ACTIVE_PROVIDER_TYPE", providerType });
      dispatch({ type: "SET_CONNECTION_STATUS", status: "connected" });
      dispatch({ type: "UPDATE_CONFIG", config: { activeProvider: providerType } });
      await writeConfig({ ...state.config, activeProvider: providerType });
      const tables = await newProvider.listTables();
      dispatch({ type: "SET_TABLES", tables });
      dispatch({ type: "SET_TABLES_LOADING", loading: false });
      dispatch({ type: "SET_SELECTED_TABLE", table: tables.length > 0 ? tables[0].name : null });
      dispatch({ type: "SET_TABLE_SCHEMA", schema: null });
      dispatch({ type: "SET_PRIMARY_KEY_OPTIONS", options: [] });
      dispatch({ type: "SET_PRIMARY_KEY_VALUE", value: null });
      dispatch({ type: "SET_SORT_KEY_OPTIONS", options: [] });
      dispatch({ type: "SET_SORT_KEY_VALUE", value: null });
      dispatch({ type: "SET_PREVIEW_ITEM", item: null, key: null });
      dispatch({ type: "SET_STATUS", status: `Switched to ${name}` });
    } catch (err) {
      dispatch({ type: "SET_CONNECTION_STATUS", status: "error" });
      dispatch({ type: "SET_ERROR", error: String(err) });
      dispatch({ type: "SET_TABLES_LOADING", loading: false });
    }
  };

  return (
    <box flexDirection="column" width="100%" height="100%">
      <PreviewPane />
      <box flexDirection="row" flexGrow={1}>
        <DatabaseSelect />
        <KeySelect />
        <SortKeySelect />
      </box>
      <box height={1} />
      <CommandPalette
        onQuit={handleQuit}
        onSearch={handleSearch}
        onSetEditor={handleSetEditor}
        onSetTheme={handleSetTheme}
        onSetProvider={handleSetProvider}
      />
      <box height={1} />
      <StatusBar />
      <box height={1} />
      <ConfirmDialog />
    </box>
  );
}

interface AppProps {
  initialConfig?: import("./providers/types").KvexConfig;
}

export function App({ initialConfig }: AppProps) {
  return (
    <AppProvider initialConfig={initialConfig}>
      <AppInner />
    </AppProvider>
  );
}
