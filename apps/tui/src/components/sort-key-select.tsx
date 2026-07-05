import { useEffect, useRef } from "react";
import { useAppState } from "../state";
import { cache } from "../cache";
import { useTheme } from "../themes";

export function SortKeySelect() {
  const { state, dispatch } = useAppState();
  const colors = useTheme();
  const prevSkRef = useRef<string | null>(null);

  const loadItem = async () => {
    if (!state.selectedTable || !state.tableSchema?.range || !state.primaryKeyValue || !state.sortKeyValue) return;
    const rangeKey: string = state.tableSchema.range;
    const hashKey: string = state.tableSchema.hash;
    const key: Record<string, string> = {};
    key[hashKey] = state.primaryKeyValue;
    key[rangeKey] = state.sortKeyValue;
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
    if (!state.sortKeyValue || state.sortKeyValue === prevSkRef.current) return;
    prevSkRef.current = state.sortKeyValue;
    loadItem();
  }, [state.sortKeyValue, state.primaryKeyValue]);

  if (!state.tableSchema?.range) return null;

  const handleChange = (index: number, option: any) => {
    if (!option || !option.name) return;
    dispatch({ type: "SET_SORT_KEY_VALUE", value: option.name });
  };

  const range = state.tableSchema.range;
  const options = state.sortKeyOptions.map((v) => ({ name: v, description: "" }));
  const selectedIdx = state.sortKeyOptions.indexOf(state.sortKeyValue ?? "");

  return (
    <box
      flexGrow={1}
      flexBasis={0}
      flexDirection="column"
      backgroundColor={state.focusedPane === 2 ? colors.pane.background : undefined}
      padding={1}
    >
      <text fg={state.focusedPane === 2 ? colors.pane.title.focused : colors.pane.title.unfocused}>
        {`Sort Key (${range})`}
      </text>
      <box height={1} />
      {state.sortKeyLoading ? (
        <text fg={colors.pane.loading}>Loading...</text>
      ) : (
        <select
          options={options}
          selectedIndex={selectedIdx >= 0 ? selectedIdx : 0}
          onChange={handleChange}
          focused={state.focusedPane === 2}
          height={10}
          itemSpacing={0}
          showDescription={false}
          textColor={colors.pane.title.unfocused}
          focusedTextColor={colors.pane.title.unfocused}
          backgroundColor="transparent"
          focusedBackgroundColor="transparent"
          selectedBackgroundColor={colors.explorer.selectedBg}
          selectedTextColor={colors.explorer.selectedText}
        />
      )}
    </box>
  );
}
