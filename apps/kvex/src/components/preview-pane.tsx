import { useAppState } from "../state";
import { getSyntaxStyle } from "../utils/syntax";
import { onChunks, getHighlightClient } from "../utils/highlight";
import { colors } from "../theme";

export function PreviewPane() {
  const { state } = useAppState();

  const jsonContent = state.previewLoading
    ? "Loading..."
    : state.previewItem
      ? JSON.stringify(state.previewItem, null, 2)
      : "Select an item to preview...";

  return (
    <box
      flexGrow={1}
      flexDirection="column"
      borderStyle="heavy"
      backgroundColor={colors.pane.background}
      borderColor={state.focusedPane === 3 ? colors.pane.border.focused : colors.pane.border.unfocused}
      title="Preview"
      titleColor={state.focusedPane === 3 ? colors.pane.title.focused : colors.pane.title.unfocused}
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
