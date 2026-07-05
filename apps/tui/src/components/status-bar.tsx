import { useAppState } from "../state";
import { getCollectionLabel } from "../providers/types";
import { useTheme } from "../themes";

export function StatusBar() {
  const { state } = useAppState();
  const colors = useTheme();
  const connColor =
    state.connectionStatus === "connected" ? colors.status.connected :
    state.connectionStatus === "error" ? colors.status.error : colors.status.warning;

  const label = getCollectionLabel(state.activeProviderType);

  return (
    <box
      height={1}
      width="100%"
      flexDirection="row"
      justifyContent="flex-end"
      paddingLeft={1}
      paddingRight={1}
    >
      <text fg={connColor}>
        {state.activeProviderType} / {label}  •  {state.connectionStatus}
      </text>
    </box>
  );
}
