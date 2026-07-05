import { useAppState } from "../state";
import { getSyntaxStyle } from "../utils/syntax";
import { onChunks, getHighlightClient } from "../utils/highlight";
import { useTerminalDimensions } from "@opentui/react";
import { useTheme } from "../themes";

export function PreviewPane() {
  const { state } = useAppState();
  const colors = useTheme();
  const { height } = useTerminalDimensions();

  const jsonContent = state.previewLoading
    ? "Loading..."
    : state.previewItem
      ? JSON.stringify(state.previewItem, null, 2)
      : "Select an item to preview...";

  return (
    <box
      height={Math.floor(height / 2)}
      flexDirection="column"
      backgroundColor={state.focusedPane === 3 && !state.commandOpen ? colors.pane.background : undefined}
      title="Preview"
      titleColor={state.focusedPane === 3 && !state.commandOpen ? colors.pane.title.focused : colors.pane.title.unfocused}
      padding={1}
    >
      <code
        content={jsonContent}
        filetype="json"
        syntaxStyle={getSyntaxStyle()}
        treeSitterClient={getHighlightClient()}
        onChunks={onChunks}
        width="100%"
      />
    </box>
  );
}
