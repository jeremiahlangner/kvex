import { type Dispatch } from "react";
import { type DatabaseProvider, type ProviderType, type TableInfo } from "../providers/types";
import { createProvider } from "../providers/factory";
import { type AppAction } from "../state";

export async function initializeProvider(
  type: ProviderType,
  dispatch: Dispatch<AppAction>,
): Promise<{ provider: DatabaseProvider; tables: TableInfo[] }> {
  dispatch({ type: "SET_TABLES_LOADING", loading: true });
  try {
    const provider = createProvider(type);
    await provider.connect();
    dispatch({ type: "SET_PROVIDER", provider });
    dispatch({ type: "SET_STATUS", status: "Connected to provider" });
    const tables = await provider.listTables();
    dispatch({ type: "SET_TABLES", tables });
    dispatch({ type: "SET_TABLES_LOADING", loading: false });
    return { provider, tables };
  } catch (err) {
    dispatch({ type: "SET_TABLES_LOADING", loading: false });
    dispatch({ type: "SET_ERROR", error: String(err) });
    dispatch({ type: "SET_STATUS", status: `Error: ${err}` });
    throw err;
  }
}
