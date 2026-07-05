import { useMemo } from "react";
import { useAppState } from "../state";
import { getSyntaxStyle } from "../utils/syntax";
import { createOnChunks } from "../utils/highlight";
import { useTerminalDimensions } from "@opentui/react";
import { useTheme } from "../themes";

export function PreviewPane() {
  const { state } = useAppState();
  const colors = useTheme();
  const { height } = useTerminalDimensions();

  const syntaxStyle = useMemo(() => getSyntaxStyle(colors), [colors]);
  const onChunks = useMemo(() => createOnChunks(colors), [colors]);

  const jsonContent = state.previewLoading
    ? "Loading..."
    : state.previewItem
      ? JSON.stringify(state.previewItem, null, 2)
      : "Select an item to preview...";

  return (
    <box
      height={Math.floor(height / 2)}
      flexDirection="column"
      backgroundColor={state.focusedPane === 3 ? colors.pane.background : undefined}
      padding={1}
    >
      <box flexDirection="row" justifyContent="center">
        <text fg={state.focusedPane === 3 ? colors.pane.title.focused : colors.pane.title.unfocused}>
          Preview
        </text>
      </box>
      <box height={1} />
      <code
        content={jsonContent}
        filetype="json"
        syntaxStyle={syntaxStyle}
        onChunks={onChunks}
        width="100%"
      />
    </box>
  );
}
