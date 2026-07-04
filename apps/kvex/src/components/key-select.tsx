import { useEffect, useRef } from "react";
import { useAppState } from "../state";
import { cache } from "../cache";
import { colors } from "../theme";

export function KeySelect() {
  const { state, dispatch } = useAppState();
  const prevPkRef = useRef<string | null>(null);

  const loadSortKeyOptions = async (pkValue: string) => {
    if (!state.selectedTable || !state.tableSchema?.range) return;
    dispatch({ type: "SET_SORT_KEY_LOADING", loading: true });
    dispatch({ type: "SET_SORT_KEY_OPTIONS", options: [] });
    dispatch({ type: "SET_SORT_KEY_VALUE", value: null });
    try {
      const items = await state.provider.query(state.selectedTable, {
        [state.tableSchema.hash]: pkValue,
      });
      const rangeKey = state.tableSchema.range;
      const options = items.map((item: any) => String(item[rangeKey] ?? ""));
      const unique = [...new Set(options)].filter(Boolean);
      dispatch({ type: "SET_SORT_KEY_OPTIONS", options: unique });
      if (unique.length > 0) {
        dispatch({ type: "SET_SORT_KEY_VALUE", value: unique[0] });
      }
      dispatch({ type: "SET_SORT_KEY_LOADING", loading: false });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: String(err) });
      dispatch({ type: "SET_SORT_KEY_LOADING", loading: false });
    }
  };

  const loadItem = async (pkValue: string) => {
    if (!state.selectedTable || !state.tableSchema) return;
    const key: Record<string, string> = { [state.tableSchema.hash]: pkValue };
    dispatch({ type: "SET_PREVIEW_LOADING", loading: true });
    try {
      const item = await state.provider.getItem(state.selectedTable, key);
      dispatch({ type: "SET_PREVIEW_ITEM", item, key });
      dispatch({ type: "SET_PREVIEW_LOADING", loading: false });
      if (item) {
        cache.put(state.activeProviderType, state.selectedTable, key, item);
        dispatch({ type: "SET_STATUS", status: "Item loaded and cached" });
      } else {
        dispatch({ type: "SET_STATUS", status: "Item not found" });
      }
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: String(err) });
      dispatch({ type: "SET_PREVIEW_LOADING", loading: false });
    }
  };

  useEffect(() => {
    if (!state.primaryKeyValue || state.primaryKeyValue === prevPkRef.current) return;
    prevPkRef.current = state.primaryKeyValue;
    if (state.tableSchema?.range) {
      loadSortKeyOptions(state.primaryKeyValue);
    } else {
      loadItem(state.primaryKeyValue);
    }
  }, [state.primaryKeyValue, state.tableSchema?.range]);

  if (!state.tableSchema) return null;

  const handleChange = (index: number, option: any) => {
    if (!option || !option.name) return;
    dispatch({ type: "SET_PRIMARY_KEY_VALUE", value: option.name });
  };

  const hashKey = state.tableSchema.hash;
  const options = state.primaryKeyOptions.map((v) => ({ name: v, description: "" }));
  const selectedIdx = state.primaryKeyOptions.indexOf(state.primaryKeyValue ?? "");

  return (
    <box
      flexGrow={1}
      flexDirection="column"
      borderStyle="heavy"
      backgroundColor={colors.pane.background}
      borderColor={state.focusedPane === 1 ? colors.pane.border.focused : colors.pane.border.unfocused}
      title={`Primary Key (${hashKey})`}
      titleColor={state.focusedPane === 1 ? colors.pane.title.focused : colors.pane.title.unfocused}
      padding={1}
    >
      {state.primaryKeyLoading ? (
        <text fg={colors.pane.loading}>Loading...</text>
      ) : (
        <select
          options={options}
          selectedIndex={selectedIdx >= 0 ? selectedIdx : 0}
          onChange={handleChange}
          focused={state.focusedPane === 1}
          height={10}
          itemSpacing={0}
          showDescription={false}
        />
      )}
    </box>
  );
}
