import { useAppState } from "../state";
import { getCollectionLabel, getConnectionLabel } from "../providers/types";
import { useTheme } from "../themes";

export function StatusBar() {
  const { state } = useAppState();
  const colors = useTheme();

  const connColor =
    state.connectivity === "online" ? colors.connected :
    state.connectivity === "offline" ? colors.error : colors.warning;

  const displayLabel = getConnectionLabel(state.activeProviderType);
  const collectionLabel = getCollectionLabel(state.activeProviderType);

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
        {displayLabel} / {collectionLabel}  •  {state.connectivity}
      </text>
    </box>
  );
}
