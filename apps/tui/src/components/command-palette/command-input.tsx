import { useEffect, useState } from "react";
import { useTheme } from "../../themes";
import { parseCommand } from "../../utils/commands";

interface CommandInputProps {
  buffer: string;
  ghostText: string | null;
  splitMode: boolean;
  cmdName: string;
  inputPart: string;
}

export function CommandInput({ buffer, ghostText, splitMode, cmdName, inputPart }: CommandInputProps) {
  const colors = useTheme();
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  const cursor = <span fg={colors.text}>{cursorVisible ? "█" : " "}</span>;

  return (
    <box height={3} flexDirection="row" alignItems="center" paddingLeft={1}>
      <text fg={colors.prompt}>/</text>
      {splitMode ? (
        <box flexDirection="row">
          <text fg={colors.hint}>{cmdName}</text>
          <text> </text>
          <text fg={colors.hint}>
            {inputPart}
            {cursor}
            {ghostText ? <span fg={colors.hint}>{ghostText}</span> : null}
          </text>
        </box>
      ) : (
        <text fg={parseCommand(buffer) ? colors.prompt : undefined}>
          {buffer}
          {cursor}
          {ghostText ? <span fg={colors.hint}>{ghostText}</span> : null}
        </text>
      )}
    </box>
  );
}
