import { useEffect, useRef } from "react";
import { useAppState } from "../state";
import { LocalProvider } from "../providers/local-provider";
import { type DatabaseProvider, getCollectionLabel } from "../providers/types";
import { ExplorerPane } from "./explorer-pane";

export function DatabaseSelect() {
  const { state, dispatch } = useAppState();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initProvider();
  }, []);

  useEffect(() => {
    if (!state.selectedTable) return;
    loadSchema(state.selectedTable);
  }, [state.selectedTable]);

  const initProvider = async () => {
    dispatch({ type: "SET_CONNECTION_STATUS", status: "connecting" });
    dispatch({ type: "SET_TABLES_LOADING", loading: true });
    try {
      const provider: DatabaseProvider = new LocalProvider();
      await provider.connect();
      dispatch({ type: "SET_PROVIDER", provider });
      dispatch({ type: "SET_CONNECTION_STATUS", status: "connected" });
      dispatch({ type: "SET_STATUS", status: "Connected to mock provider" });
      const tables = await provider.listTables();
      dispatch({ type: "SET_TABLES", tables });
      dispatch({ type: "SET_TABLES_LOADING", loading: false });
      if (tables.length > 0) {
        dispatch({ type: "SET_SELECTED_TABLE", table: tables[0].name });
      }
    } catch (err) {
      dispatch({ type: "SET_CONNECTION_STATUS", status: "error" });
      dispatch({ type: "SET_ERROR", error: String(err) });
      dispatch({ type: "SET_TABLES_LOADING", loading: false });
    }
  };

  const loadSchema = async (table: string) => {
    dispatch({ type: "SET_PRIMARY_KEY_LOADING", loading: true });
    dispatch({ type: "SET_SORT_KEY_OPTIONS", options: [] });
    dispatch({ type: "SET_SORT_KEY_VALUE", value: null });
    dispatch({ type: "SET_PREVIEW_ITEM", item: null, key: null });
    try {
      const schema = await state.provider.describeTable(table);
      dispatch({ type: "SET_TABLE_SCHEMA", schema });
      const pkOptions = await state.provider.getKeyValues(table, schema.hash);
      dispatch({ type: "SET_PRIMARY_KEY_OPTIONS", options: pkOptions });
      dispatch({ type: "SET_PRIMARY_KEY_VALUE", value: pkOptions.length > 0 ? pkOptions[0] : null });
      dispatch({ type: "SET_PRIMARY_KEY_LOADING", loading: false });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: String(err) });
      dispatch({ type: "SET_PRIMARY_KEY_LOADING", loading: false });
    }
  };

  const handleTableChange = (index: number, option: any) => {
    if (!option || !option.name) return;
    dispatch({ type: "SET_SELECTED_TABLE", table: option.name });
    dispatch({ type: "SET_STATUS", status: `Table: ${option.name}` });
  };

  const label = getCollectionLabel(state.activeProviderType);
  const tableOptions = state.tables.map((t) => ({ name: t.name, description: "" }));
  const selectedTableIndex = state.tables.findIndex((t) => t.name === state.selectedTable);

  return (
    <ExplorerPane
      focused={state.focusedPane === 0}
      title={label}
      loading={state.tablesLoading}
      options={tableOptions}
      selectedIndex={selectedTableIndex}
      onChange={handleTableChange}
      selectHeight={state.tables.length}
    />
  );
}
