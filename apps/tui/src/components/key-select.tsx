import { useEffect, useRef } from "react";
import { useAppState } from "../state";
import { getKeyLabel } from "../providers/types";
import { loadAndCacheItem } from "../utils/item-loader";
import { ExplorerPane } from "./explorer-pane";

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
    try {
      await loadAndCacheItem(state.provider, state.activeProviderType, state.selectedTable, key, dispatch);
    } catch {
      // errors already dispatched by loadAndCacheItem
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

  const handleChange = (index: number, option: { name: string } | null) => {
    if (!option || !option.name) return;
    dispatch({ type: "SET_PRIMARY_KEY_VALUE", value: option.name });
  };

  const hashKey = state.tableSchema.hash;
  const options = state.primaryKeyOptions.map((v) => ({ name: v }));
  const selectedIdx = state.primaryKeyOptions.indexOf(state.primaryKeyValue ?? "");

  return (
    <ExplorerPane
      focused={state.focusedPane === 1 || (state.focusedPane === 3 && !state.tableSchema?.range)}
      title={getKeyLabel(state.activeProviderType, hashKey)}
      loading={state.primaryKeyLoading}
      options={options}
      selectedIndex={selectedIdx}
      onChange={handleChange}
      emptyMessage="No keys"
    />
  );
}
