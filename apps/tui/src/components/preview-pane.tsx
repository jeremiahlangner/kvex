import { useMemo, useEffect, useState } from "react";
import { useAppState } from "../state";
import { getSyntaxStyle } from "../utils/syntax";
import { createOnChunks } from "../utils/highlight";
import { useTerminalDimensions } from "@opentui/react";
import { useTheme } from "../themes";

export function PreviewPane() {
  const { state } = useAppState();
  const colors = useTheme();
  const { height } = useTerminalDimensions();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (state.previewItem) {
      setLastUpdated(new Date());
    }
  }, [state.previewItem]);

  const lastUpdatedText = lastUpdated
    ? `Last updated ${lastUpdated.toLocaleDateString()} ${lastUpdated.toTimeString().slice(0, 8)}`
    : null;

  const syntaxStyle = useMemo(() => getSyntaxStyle(colors), [colors]);
  const onChunks = useMemo(() => createOnChunks(colors), [colors]);

  const keyLabel = state.previewKey
    ? Object.values(state.previewKey).join(" / ")
    : state.primaryKeyValue ?? "";

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
          {keyLabel ? `Preview — ${keyLabel}` : "Preview"}
        </text>
      </box>
      <box height={1} />
      <box flexGrow={1}>
        <code
          content={jsonContent}
          filetype="json"
          syntaxStyle={syntaxStyle}
          onChunks={onChunks}
          width="100%"
        />
      </box>
      {lastUpdatedText && (
        <box flexDirection="row" justifyContent="flex-end">
          <text fg={colors.palette.hint}>{lastUpdatedText}</text>
        </box>
      )}
    </box>
  );
}
