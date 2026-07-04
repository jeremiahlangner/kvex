import { useAppState } from "../state";
import { getCollectionLabel } from "../providers/types";

export function StatusBar() {
  const { state } = useAppState();
  const connColor =
    state.connectionStatus === "connected" ? "#00FF00" :
    state.connectionStatus === "error" ? "#FF0000" : "#FFFF00";

  const label = getCollectionLabel(state.activeProviderType);

  return (
    <box
      height={1}
      width="100%"
      flexDirection="row"
      justifyContent="space-between"
      paddingLeft={1}
      paddingRight={1}
    >
      <text fg={connColor}>
        {state.activeProviderType} / {label}  •  {state.connectionStatus}
      </text>
      <text fg="#888888">
        editor: {state.config.editor}  |  / cmd  |  Tab nav  |  q quit
      </text>
    </box>
  );
}
