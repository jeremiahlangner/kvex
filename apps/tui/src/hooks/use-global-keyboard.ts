import { useKeyboard, useRenderer } from "@opentui/react";
import { useCallback } from "react";
import { useAppState, type AppState } from "../state";
import { type KeySchema } from "../providers/types";
import { editInEditor } from "../utils/editor";
import { cache } from "../cache";

function getValidPanes(tableSchema: KeySchema | null): number[] {
  const panes = [0];
  if (tableSchema) panes.push(1);
  if (tableSchema?.range) panes.push(2);
  panes.push(3);
  return panes;
}

function getLastExplorerIndex(tableSchema: AppState["tableSchema"]): number {
  return tableSchema?.range ? 2 : (tableSchema ? 1 : 0);
}

interface UseGlobalKeyboardOptions {
  onQuit: () => void;
}

export function useGlobalKeyboard({ onQuit }: UseGlobalKeyboardOptions): void {
  const { state, dispatch } = useAppState();
  const renderer = useRenderer();

  const handleEditItem = useCallback(() => {
    if (!state.previewItem || !state.previewKey || !state.selectedTable) return;
    const lastExplorer = getLastExplorerIndex(state.tableSchema);
    const canEdit = state.focusedPane === 3 || state.focusedPane === lastExplorer;
    if (!canEdit) return;
    editInEditor(
      renderer,
      state.config.editor,
      state.previewItem,
      state.provider,
      state.selectedTable,
      state.previewKey,
      (savedItem) => {
        dispatch({ type: "SET_PREVIEW_ITEM", item: savedItem, key: state.previewKey });
        cache.put(state.activeProviderType, state.selectedTable!, state.previewKey!, savedItem);
        dispatch({ type: "SET_STATUS", status: "Item saved" });
      },
    );
  }, [state, dispatch, renderer]);

  const handleDeleteItem = useCallback(() => {
    if (!state.previewItem || !state.previewKey) return;
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
  }, [state, dispatch]);

  const handleKey = useCallback((key: { name: string; ctrl?: boolean }) => {
    if (state.confirmDialog) return false;

    if (key.name === "/" && !state.commandOpen) {
      dispatch({ type: "SET_COMMAND_OPEN", open: true });
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: "" });
      return true;
    }

    if (key.name === "q" && !state.commandOpen) {
      dispatch({
        type: "SET_CONFIRM_DIALOG",
        dialog: {
          message: "Quit kvex?",
          onConfirm: onQuit,
        },
      });
      return true;
    }

    if (key.name === "return" && !state.commandOpen && state.previewItem && state.previewKey && state.selectedTable) {
      handleEditItem();
      return true;
    }

    if ((key.name === "d" || key.name === "delete") && !state.commandOpen && state.previewItem && state.previewKey) {
      handleDeleteItem();
      return true;
    }

    if (!state.commandOpen) {
      const validPanes = getValidPanes(state.tableSchema);
      const lastKey = state.tableSchema?.range ? 2 : (state.tableSchema ? 1 : -1);

      if (key.name === "w") {
        const idx = validPanes.indexOf(state.focusedPane);
        if (idx < validPanes.length - 1) {
          dispatch({ type: "SET_FOCUSED_PANE", pane: validPanes[idx + 1] });
        }
        return true;
      }

      if (key.name === "b") {
        const idx = validPanes.indexOf(state.focusedPane);
        if (idx > 0) {
          dispatch({ type: "SET_FOCUSED_PANE", pane: validPanes[idx - 1] });
        }
        return true;
      }

      if (key.name === "tab") {
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
    }

    return false;
  }, [state, dispatch, onQuit, handleEditItem, handleDeleteItem]);

  useKeyboard(handleKey);
}
