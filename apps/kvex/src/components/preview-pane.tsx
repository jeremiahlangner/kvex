import { useAppState } from "../state";
import { getSyntaxStyle } from "../utils/syntax";
import { onChunks, getHighlightClient } from "../utils/highlight";

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
      borderStyle="rounded"
      borderColor={state.focusedPane === 3 ? "#8888FF" : "#4444AA"}
      title="Preview"
      titleColor={state.focusedPane === 3 ? "#FFFFFF" : "#8888FF"}
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
