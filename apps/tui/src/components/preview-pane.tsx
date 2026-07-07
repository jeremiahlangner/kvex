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

  const keyLabel = state.previewKey
    ? Object.values(state.previewKey).join(" / ")
    : state.primaryKeyValue ?? "";

  const showCode = state.previewLoading || state.previewItem;

  return (
    <box
      height={Math.floor(height / 2)}
      flexDirection="column"
      backgroundColor={state.focusedPane === 3 ? colors.bg : undefined}
      padding={1}
    >
      <box flexDirection="row" justifyContent="center">
        <text fg={state.focusedPane === 3 ? colors.text : colors.hint}>
          {keyLabel ? `Preview — ${keyLabel}` : "Preview"}
        </text>
      </box>
      <box height={1} />
      <box flexGrow={1}>
        {showCode ? (
          <code
            content={state.previewLoading ? "Loading..." : JSON.stringify(state.previewItem, null, 2)}
            filetype="json"
            syntaxStyle={syntaxStyle}
            onChunks={onChunks}
            width="100%"
          />
        ) : (
          <text fg={colors.hint}>Select an item to preview...</text>
        )}
      </box>
    </box>
  );
}
