import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from "react";
import {
  type DatabaseProvider,
  type KeySchema,
  type ProviderType,
  type KvexConfig,
  type ConfirmDialog,
  type ConnectionStatus,
  type ConnectivityState,
  DEFAULT_CONFIG,
} from "./providers/types";
import { createProvider } from "./providers/factory";

export interface AppState {
  config: KvexConfig;
  provider: DatabaseProvider;
  connectionStatus: ConnectionStatus;
  activeProviderType: ProviderType;
  tables: { name: string; keySchema: KeySchema }[];
  selectedTable: string | null;
  tableSchema: KeySchema | null;
  primaryKeyOptions: string[];
  primaryKeyValue: string | null;
  sortKeyOptions: string[];
  sortKeyValue: string | null;
  previewItem: object | null;
  previewKey: Record<string, string> | null;
  commandOpen: boolean;
  commandBuffer: string;
  commandSuggestions: string[];
  confirmDialog: ConfirmDialog | null;
  focusedPane: number;
  connectivity: ConnectivityState;
  tablesLoading: boolean;
  primaryKeyLoading: boolean;
  sortKeyLoading: boolean;
  previewLoading: boolean;
  errorMessage: string | null;
  statusMessage: string;
}

export type AppAction =
  | { type: "SET_CONFIG"; config: KvexConfig }
  | { type: "SET_PROVIDER"; provider: DatabaseProvider }
  | { type: "SET_CONNECTION_STATUS"; status: ConnectionStatus }
  | { type: "SET_ACTIVE_PROVIDER_TYPE"; providerType: ProviderType }
  | { type: "SET_TABLES"; tables: { name: string; keySchema: KeySchema }[] }
  | { type: "SET_SELECTED_TABLE"; table: string | null }
  | { type: "SET_TABLE_SCHEMA"; schema: KeySchema | null }
  | { type: "SET_PRIMARY_KEY_OPTIONS"; options: string[] }
  | { type: "SET_PRIMARY_KEY_VALUE"; value: string | null }
  | { type: "SET_SORT_KEY_OPTIONS"; options: string[] }
  | { type: "SET_SORT_KEY_VALUE"; value: string | null }
  | { type: "SET_PREVIEW_ITEM"; item: object | null; key: Record<string, string> | null }
  | { type: "SET_COMMAND_OPEN"; open: boolean }
  | { type: "SET_COMMAND_BUFFER"; buffer: string }
  | { type: "SET_COMMAND_SUGGESTIONS"; suggestions: string[] }
  | { type: "SET_CONFIRM_DIALOG"; dialog: ConfirmDialog | null }
  | { type: "SET_FOCUSED_PANE"; pane: number }
  | { type: "SET_CONNECTIVITY"; connectivity: ConnectivityState }
  | { type: "SET_TABLES_LOADING"; loading: boolean }
  | { type: "SET_PRIMARY_KEY_LOADING"; loading: boolean }
  | { type: "SET_SORT_KEY_LOADING"; loading: boolean }
  | { type: "SET_PREVIEW_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_STATUS"; status: string }
  | { type: "UPDATE_CONFIG"; config: Partial<KvexConfig> };

export function makeInitialState(config: KvexConfig = DEFAULT_CONFIG): AppState {
  return {
    config,
    provider: createProvider(config.activeProvider),
    connectionStatus: "disconnected",
    connectivity: config.activeProvider === "local" ? "local" : "offline",
    activeProviderType: config.activeProvider,
  tables: [],
  selectedTable: null,
  tableSchema: null,
  primaryKeyOptions: [],
  primaryKeyValue: null,
  sortKeyOptions: [],
  sortKeyValue: null,
  previewItem: null,
  previewKey: null,
  commandOpen: false,
  commandBuffer: "",
  commandSuggestions: [],
  confirmDialog: null,
  focusedPane: 0,
  tablesLoading: false,
  primaryKeyLoading: false,
  sortKeyLoading: false,
  previewLoading: false,
  errorMessage: null,
  statusMessage: "Ready",
};
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CONFIG":
      return { ...state, config: action.config };
    case "SET_PROVIDER":
      return { ...state, provider: action.provider };
    case "SET_CONNECTION_STATUS":
      return { ...state, connectionStatus: action.status };
    case "SET_ACTIVE_PROVIDER_TYPE":
      return { ...state, activeProviderType: action.providerType };
    case "SET_TABLES":
      return { ...state, tables: action.tables };
    case "SET_SELECTED_TABLE":
      return { ...state, selectedTable: action.table };
    case "SET_TABLE_SCHEMA":
      return { ...state, tableSchema: action.schema };
    case "SET_PRIMARY_KEY_OPTIONS":
      return { ...state, primaryKeyOptions: action.options };
    case "SET_PRIMARY_KEY_VALUE":
      return { ...state, primaryKeyValue: action.value };
    case "SET_SORT_KEY_OPTIONS":
      return { ...state, sortKeyOptions: action.options };
    case "SET_SORT_KEY_VALUE":
      return { ...state, sortKeyValue: action.value };
    case "SET_PREVIEW_ITEM":
      return { ...state, previewItem: action.item, previewKey: action.key };
    case "SET_COMMAND_OPEN":
      return { ...state, commandOpen: action.open };
    case "SET_COMMAND_BUFFER":
      return { ...state, commandBuffer: action.buffer };
    case "SET_COMMAND_SUGGESTIONS":
      return { ...state, commandSuggestions: action.suggestions };
    case "SET_CONFIRM_DIALOG":
      return { ...state, confirmDialog: action.dialog };
    case "SET_FOCUSED_PANE":
      return { ...state, focusedPane: action.pane };
    case "SET_CONNECTIVITY":
      return { ...state, connectivity: action.connectivity };
    case "SET_TABLES_LOADING":
      return { ...state, tablesLoading: action.loading };
    case "SET_PRIMARY_KEY_LOADING":
      return { ...state, primaryKeyLoading: action.loading };
    case "SET_SORT_KEY_LOADING":
      return { ...state, sortKeyLoading: action.loading };
    case "SET_PREVIEW_LOADING":
      return { ...state, previewLoading: action.loading };
    case "SET_ERROR":
      return { ...state, errorMessage: action.error };
    case "SET_STATUS":
      return { ...state, statusMessage: action.status };
    case "UPDATE_CONFIG":
      return { ...state, config: { ...state.config, ...action.config } };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, initialConfig }: { children: ReactNode; initialConfig?: KvexConfig }) {
  const [state, dispatch] = useReducer(appReducer, initialConfig ? makeInitialState(initialConfig) : makeInitialState());
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}
