import { useAppState } from "../state";
import { getSuggestions, parseCommand } from "../utils/commands";
import { useKeyboard } from "@opentui/react";
import { useState, useMemo } from "react";
import { useTheme } from "../themes";

interface CommandPaletteProps {
  onQuit: () => void;
  onSearch: (query: string) => void;
  onSetEditor: (editor: string) => void;
  onSetTheme: (theme: string) => void;
}

export function CommandPalette({ onQuit, onSearch, onSetEditor, onSetTheme }: CommandPaletteProps) {
  const { state, dispatch } = useAppState();
  const colors = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const suggestions = state.commandOpen ? getSuggestions(state.commandBuffer) : [];

  const firstSpaceIdx = state.commandBuffer.indexOf(" ");
  const cmdName = firstSpaceIdx >= 0 ? state.commandBuffer.slice(0, firstSpaceIdx) : state.commandBuffer;

  const isKnownCommand = useMemo(() => {
    if (!cmdName) return false;
    return parseCommand(cmdName) !== null;
  }, [cmdName]);

  const splitMode = isKnownCommand && firstSpaceIdx >= 0;
  const inputPart = splitMode ? state.commandBuffer.slice(firstSpaceIdx + 1) : "";

  const executeCommand = () => {
    const parsed = parseCommand(state.commandBuffer);
    if (!parsed) {
      dispatch({ type: "SET_STATUS", status: `Unknown: ${state.commandBuffer}` });
      closePalette();
      return;
    }
    switch (parsed.command) {
      case "quit":
        closePalette();
        onQuit();
        break;
      case "find":
        closePalette();
        onSearch(parsed.args.join(" "));
        break;
      case "editor":
        if (parsed.args[0]) onSetEditor(parsed.args[0]);
        closePalette();
        break;
      case "theme":
        if (parsed.args[0]) onSetTheme(parsed.args[0]);
        closePalette();
        break;
      default:
        dispatch({ type: "SET_STATUS", status: `Unknown: ${parsed.command}` });
        closePalette();
    }
  };

  const closePalette = () => {
    dispatch({ type: "SET_COMMAND_OPEN", open: false });
    dispatch({ type: "SET_COMMAND_BUFFER", buffer: "" });
    setSelectedIndex(0);
  };

  const appendBuffer = (char: string) => {
    dispatch({ type: "SET_COMMAND_BUFFER", buffer: state.commandBuffer + char });
    setSelectedIndex(0);
  };

  useKeyboard((key) => {
    if (!state.commandOpen) return false;

    if (key.name === "escape") {
      closePalette();
      return true;
    }
    if (key.name === "up") {
      if (suggestions.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      }
      return true;
    }
    if (key.name === "down") {
      if (suggestions.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      }
      return true;
    }
    if (key.name === "tab") {
      if (suggestions.length > 0) {
        dispatch({ type: "SET_COMMAND_BUFFER", buffer: suggestions[selectedIndex].name });
        setSelectedIndex(0);
      }
      return true;
    }
    if (key.name === "backspace") {
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: state.commandBuffer.slice(0, -1) });
      setSelectedIndex(0);
      return true;
    }
    if (key.ctrl && key.name === "u") {
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: "" });
      setSelectedIndex(0);
      return true;
    }
    if (key.name === "return") {
      executeCommand();
      return true;
    }
    if (key.name === "space") {
      appendBuffer(" ");
      return true;
    }
    if (key.name.length === 1 && !key.ctrl && !key.meta && !key.option) {
      let char = key.shift ? key.name.toUpperCase() : key.name;
      appendBuffer(char);
      return true;
    }
    return false;
  });

  if (!state.commandOpen) {
    return (
      <box height={1} width="100%" flexDirection="row" alignItems="center" paddingLeft={1}>
        <text fg={colors.palette.hint}>Press '/' for commands</text>
      </box>
    );
  }

  return (
    <box
      height={8}
      width="100%"
      flexDirection="column"
      backgroundColor={colors.explorer.selectedBg}
      borderStyle="heavy"
      border={["left"]}
      borderColor={colors.palette.border}
    >
      <box height={3} flexDirection="row" alignItems="center" paddingLeft={1}>
        <text fg={colors.palette.prompt}>/</text>
        {splitMode ? (
          <box flexDirection="row">
            <text fg={colors.palette.text.command}>{cmdName}</text>
            <text fg={colors.palette.text.command}> </text>
            <text>{inputPart}</text>
          </box>
        ) : (
          <text fg={isKnownCommand ? colors.palette.text.command : undefined}>
            {state.commandBuffer}
          </text>
        )}
      </box>
      <box height={5} flexDirection="column" paddingLeft={2}>
        {suggestions.slice(selectedIndex, selectedIndex + 3).map((s, i) => (
          <box
            key={s.name}
            flexDirection="row"
            width="100%"
            backgroundColor={i === 0 ? colors.palette.suggestion.bg : undefined}
          >
            <text fg={i === 0 ? colors.palette.suggestion.selected : colors.palette.suggestion.unselected}>
              {s.name}
            </text>
            <text fg={i === 0 ? colors.palette.description.selected : colors.palette.description.unselected}>
              {"  "}{s.description}
            </text>
          </box>
        ))}
      </box>
    </box>
  );
}
