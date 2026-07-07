import { useEffect, useRef } from "react";
import { useAppState } from "../state";
import { getSortKeyLabel } from "../providers/types";
import { loadAndCacheItem } from "../utils/item-loader";
import { ExplorerPane } from "./explorer-pane";

export function SortKeySelect() {
  const { state, dispatch } = useAppState();
  const prevSkRef = useRef<string | null>(null);

  const loadItem = async () => {
    if (!state.selectedTable || !state.tableSchema?.range || !state.primaryKeyValue || !state.sortKeyValue) return;
    const rangeKey: string = state.tableSchema.range;
    const hashKey: string = state.tableSchema.hash;
    const key: Record<string, string> = {
      [hashKey]: state.primaryKeyValue,
      [rangeKey]: state.sortKeyValue,
    };
    try {
      await loadAndCacheItem(state.provider, state.activeProviderType, state.selectedTable, key, dispatch);
    } catch {
      // errors already dispatched by loadAndCacheItem
    }
  };

  useEffect(() => {
    if (!state.sortKeyValue || state.sortKeyValue === prevSkRef.current) return;
    prevSkRef.current = state.sortKeyValue;
    loadItem();
  }, [state.sortKeyValue, state.primaryKeyValue]);

  if (!state.tableSchema?.range) return null;

  const handleChange = (index: number, option: { name: string } | null) => {
    if (!option || !option.name) return;
    dispatch({ type: "SET_SORT_KEY_VALUE", value: option.name });
  };

  const range = state.tableSchema.range;
  const options = state.sortKeyOptions.map((v) => ({ name: v }));
  const selectedIdx = state.sortKeyOptions.indexOf(state.sortKeyValue ?? "");

  return (
    <ExplorerPane
      focused={state.focusedPane === 2 || state.focusedPane === 3}
      title={getSortKeyLabel(state.activeProviderType, range)}
      loading={state.sortKeyLoading}
      options={options}
      selectedIndex={selectedIdx}
      onChange={handleChange}
      emptyMessage="No sort keys"
    />
  );
}
