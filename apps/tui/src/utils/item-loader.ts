import { type Dispatch } from "react";
import { type DatabaseProvider } from "../providers/types";
import { cache } from "../cache";
import { type AppAction } from "../state";

export async function loadAndCacheItem(
  provider: DatabaseProvider,
  activeProviderType: string,
  table: string,
  key: Record<string, string>,
  dispatch: Dispatch<AppAction>,
): Promise<object | null> {
  dispatch({ type: "SET_PREVIEW_LOADING", loading: true });
  try {
    const item = await provider.getItem(table, key);
    dispatch({ type: "SET_PREVIEW_ITEM", item, key });
    dispatch({ type: "SET_PREVIEW_LOADING", loading: false });
    if (item) {
      cache.put(activeProviderType, table, key, item);
      dispatch({ type: "SET_STATUS", status: "Item loaded and cached" });
    } else {
      dispatch({ type: "SET_STATUS", status: "Item not found" });
    }
    return item;
  } catch (err) {
    dispatch({ type: "SET_ERROR", error: String(err) });
    dispatch({ type: "SET_STATUS", status: `Error: ${err}` });
    dispatch({ type: "SET_PREVIEW_LOADING", loading: false });
    throw err;
  }
}
