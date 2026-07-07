import { useRenderer } from "@opentui/react";
import { AppProvider } from "./state";
import { PreviewPane } from "./components/preview-pane";
import { DatabaseSelect } from "./components/database-select";
import { KeySelect } from "./components/key-select";
import { SortKeySelect } from "./components/sort-key-select";
import { CommandPalette } from "./components/command-palette";
import { StatusBar } from "./components/status-bar";
import { ConfirmDialog } from "./components/confirm-dialog";
import { useConnectivity } from "./hooks/use-connectivity";
import { useCommandActions } from "./hooks/use-command-actions";
import { useGlobalKeyboard } from "./hooks/use-global-keyboard";

function AppInner() {
  const renderer = useRenderer();
  useConnectivity();
  const { onQuit, onSearch, onSetEditor, onSetTheme, onSetProvider } = useCommandActions(renderer);
  useGlobalKeyboard({ onQuit });

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
        onQuit={onQuit}
        onSearch={onSearch}
        onSetEditor={onSetEditor}
        onSetTheme={onSetTheme}
        onSetProvider={onSetProvider}
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
