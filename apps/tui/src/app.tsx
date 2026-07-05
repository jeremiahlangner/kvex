import { useKeyboard, useRenderer } from "@opentui/react";
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

function AppInner() {
  const { state, dispatch } = useAppState();
  const renderer = useRenderer();

  useKeyboard((key) => {
    if (state.confirmDialog) return false;

    if (key.name === "/" && !state.commandOpen) {
      dispatch({ type: "SET_COMMAND_OPEN", open: true });
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: "" });
      return true;
    }

    if (key.name === "w" && !state.commandOpen) {
      const maxPane = 3;
      const next = (state.focusedPane + 1) % (maxPane + 1);
      dispatch({ type: "SET_FOCUSED_PANE", pane: next });
      return true;
    }

    if (key.name === "b" && !state.commandOpen) {
      const maxPane = 3;
      const prev = (state.focusedPane - 1 + maxPane + 1) % (maxPane + 1);
      dispatch({ type: "SET_FOCUSED_PANE", pane: prev });
      return true;
    }

    if (key.name === "tab" && !state.commandOpen) {
      if (state.focusedPane === 3) {
        const lastExplorer = state.tableSchema?.range ? 2 : (state.tableSchema ? 1 : 0);
        dispatch({ type: "SET_FOCUSED_PANE", pane: lastExplorer });
      } else {
        dispatch({ type: "SET_FOCUSED_PANE", pane: 3 });
      }
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
