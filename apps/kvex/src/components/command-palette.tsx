import { useAppState } from "../state";
import { getSuggestions, parseCommand } from "../utils/commands";
import { useKeyboard } from "@opentui/react";
import { useState, useMemo } from "react";
import { colors } from "../theme";

interface CommandPaletteProps {
  onQuit: () => void;
  onSearch: (query: string) => void;
  onSetEditor: (editor: string) => void;
}

export function CommandPalette({ onQuit, onSearch, onSetEditor }: CommandPaletteProps) {
  const { state, dispatch } = useAppState();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const suggestions = state.commandOpen ? getSuggestions(state.commandBuffer) : [];

  const cmdName = state.commandBuffer.split(/\s+/)[0];
  const isKnownCommand = useMemo(() => {
    if (!cmdName) return false;
    const parsed = parseCommand(cmdName);
    return parsed !== null;
  }, [cmdName]);

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
      }
      return true;
    }
    if (key.name === "backspace") {
      const cur = state.commandBuffer;
      if (cur.length > 0) {
        dispatch({ type: "SET_COMMAND_BUFFER", buffer: cur.slice(0, -1) });
        setSelectedIndex(0);
      }
      return true;
    }
    if (key.name === "return") {
      executeCommand();
      return true;
    }
    if (key.name === "space") {
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: state.commandBuffer + " " });
      setSelectedIndex(0);
      return true;
    }
    if (key.name.length === 1) {
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: state.commandBuffer + key.name });
      setSelectedIndex(0);
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
      backgroundColor={colors.palette.background}
      borderStyle="heavy"
      border={["left"]}
      borderColor={colors.palette.border}
    >
      <box height={3} flexDirection="row" alignItems="center" paddingLeft={1}>
        <text fg={colors.palette.prompt}>/</text>
        <text fg={isKnownCommand ? colors.palette.text.command : colors.palette.text.default}>
          {state.commandBuffer}
        </text>
      </box>
      <box height={5} flexDirection="column" paddingLeft={2}>
        {suggestions.slice(selectedIndex, selectedIndex + 3).map((s) => (
          <box key={s.name} flexDirection="row" width="100%">
            <text fg={colors.palette.suggestion.selected}>
              {s.name}
            </text>
            <text fg={colors.palette.description.selected}>
              {"  "}{s.description}
            </text>
          </box>
        ))}
      </box>
    </box>
  );
}
