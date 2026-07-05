import { useAppState } from "../state";
import { getSuggestions, parseCommand } from "../utils/commands";
import { useKeyboard } from "@opentui/react";
import { useState, useMemo, useEffect } from "react";
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
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!state.commandOpen) return;
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, [state.commandOpen]);

  const suggestions = state.commandOpen ? getSuggestions(state.commandBuffer) : [];
  const reversedSuggestions = useMemo(() => suggestions.slice().reverse(), [suggestions]);

  const firstSpaceIdx = state.commandBuffer.indexOf(" ");
  const cmdName = firstSpaceIdx >= 0 ? state.commandBuffer.slice(0, firstSpaceIdx) : state.commandBuffer;

  const isKnownCommand = useMemo(() => {
    if (!cmdName) return false;
    return parseCommand(cmdName) !== null;
  }, [cmdName]);

  const suggestionHeight = Math.min(7, Math.max(1, reversedSuggestions.length));
  const paletteHeight = suggestionHeight + 3;

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

  const resetIndex = () => setSelectedIndex(Math.max(0, reversedSuggestions.length - 1));

  const closePalette = () => {
    dispatch({ type: "SET_COMMAND_OPEN", open: false });
    dispatch({ type: "SET_COMMAND_BUFFER", buffer: "" });
    setSelectedIndex(0);
  };

  const appendBuffer = (char: string) => {
    dispatch({ type: "SET_COMMAND_BUFFER", buffer: state.commandBuffer + char });
    resetIndex();
  };

  useKeyboard((key) => {
    if (!state.commandOpen) return false;

    if (key.name === "escape") {
      closePalette();
      return true;
    }
    if (key.name === "up") {
      if (reversedSuggestions.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + reversedSuggestions.length) % reversedSuggestions.length);
      }
      return true;
    }
    if (key.name === "down") {
      if (reversedSuggestions.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % reversedSuggestions.length);
      }
      return true;
    }
    if (key.name === "tab") {
      if (reversedSuggestions.length > 0) {
        const suggestion = reversedSuggestions[selectedIndex].name;
        if (splitMode) {
          dispatch({ type: "SET_COMMAND_BUFFER", buffer: cmdName + " " + suggestion });
        } else {
          const parsed = parseCommand(suggestion);
          const needsArg = parsed && parsed.command !== "quit";
          dispatch({ type: "SET_COMMAND_BUFFER", buffer: suggestion + (needsArg ? " " : "") });
        }
        resetIndex();
      }
      return true;
    }
    if (key.name === "backspace") {
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: state.commandBuffer.slice(0, -1) });
      resetIndex();
      return true;
    }
    if (key.ctrl && key.name === "u") {
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: "" });
      resetIndex();
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
      height={paletteHeight}
      width="100%"
      flexDirection="column"
      backgroundColor={colors.pane.background}
    >
      <select
        options={reversedSuggestions.map(s => ({ name: `${s.name}  ${s.description}`, description: "" }))}
        selectedIndex={reversedSuggestions.length > 0 ? selectedIndex : 0}
        height={suggestionHeight}
        focused={true}
        showScrollIndicator={true}
        showDescription={false}
        showSelectionIndicator={false}
        itemSpacing={0}
        textColor={colors.palette.suggestion.unselected}
        focusedTextColor={colors.palette.suggestion.unselected}
        backgroundColor="transparent"
        focusedBackgroundColor="transparent"
        selectedBackgroundColor={colors.palette.suggestion.bg}
        selectedTextColor={colors.palette.suggestion.selected}
      />
      <box height={3} flexDirection="row" alignItems="center" paddingLeft={1}>
        <text fg={colors.palette.prompt}>/</text>
        {splitMode ? (
          <box flexDirection="row">
            <text fg={colors.palette.text.command}>{cmdName}</text>
            <text fg={colors.palette.text.command}> </text>
            <text>
              {inputPart}
              <span attributes={16}>{cursorVisible ? "█" : " "}</span>
            </text>
          </box>
        ) : (
          <text fg={isKnownCommand ? colors.palette.text.command : undefined}>
            {state.commandBuffer}
            <span attributes={16}>{cursorVisible ? "█" : " "}</span>
          </text>
        )}
      </box>
    </box>
  );
}
