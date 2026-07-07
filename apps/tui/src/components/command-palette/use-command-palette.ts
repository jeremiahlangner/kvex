import { useCallback, useEffect, useMemo, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { useAppState } from "../../state";
import { getSuggestions, parseCommand } from "../../utils/commands";

const MAX_SUGGESTIONS = 7;

interface UseCommandPaletteOptions {
  onQuit: () => void;
  onSearch: (query: string) => void;
  onSetEditor: (editor: string) => void;
  onSetTheme: (theme: string) => void;
  onSetProvider: (name: string) => void;
}

export function useCommandPalette(options: UseCommandPaletteOptions) {
  const { onQuit, onSearch, onSetEditor, onSetTheme, onSetProvider } = options;
  const { state, dispatch } = useAppState();
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [state.commandBuffer]);

  const suggestions = useMemo(() => {
    if (!state.commandOpen) return [];
    return getSuggestions(state.commandBuffer);
  }, [state.commandOpen, state.commandBuffer]);

  const suggestionHeight = useMemo(() => {
    return suggestions.length > 0 ? Math.min(MAX_SUGGESTIONS, suggestions.length) : 0;
  }, [suggestions.length]);

  const scrollOffset = useMemo(() => {
    if (suggestions.length <= suggestionHeight) return 0;
    if (selectedIndex < 0) return 0;
    return Math.max(0, selectedIndex - suggestionHeight + 1);
  }, [selectedIndex, suggestionHeight, suggestions.length]);

  const visibleSuggestions = useMemo(() => {
    return suggestions.slice(scrollOffset, scrollOffset + suggestionHeight);
  }, [suggestions, scrollOffset, suggestionHeight]);

  const firstSpaceIdx = state.commandBuffer.indexOf(" ");
  const cmdName = firstSpaceIdx >= 0 ? state.commandBuffer.slice(0, firstSpaceIdx) : state.commandBuffer;
  const isKnownCommand = cmdName !== "" && parseCommand(cmdName) !== null;
  const splitMode = isKnownCommand && firstSpaceIdx >= 0;
  const inputPart = splitMode ? state.commandBuffer.slice(firstSpaceIdx + 1) : "";

  const ghostText = useMemo(() => {
    if (suggestions.length === 0) return null;
    const first = suggestions[0].name;
    const input = splitMode ? inputPart : state.commandBuffer;
    if (!input) return null;
    if (first.toLowerCase().startsWith(input.toLowerCase())) {
      return first.slice(input.length);
    }
    return null;
  }, [suggestions, splitMode, inputPart, state.commandBuffer]);

  const closePalette = useCallback(() => {
    dispatch({ type: "SET_COMMAND_OPEN", open: false });
    dispatch({ type: "SET_COMMAND_BUFFER", buffer: "" });
  }, [dispatch]);

  const applySuggestion = useCallback((suggestionName: string) => {
    const parsed = parseCommand(suggestionName);
    const needsArg = parsed && parsed.command !== "quit";
    const spaceIdx = state.commandBuffer.indexOf(" ");
    if (spaceIdx >= 0) {
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: state.commandBuffer.slice(0, spaceIdx + 1) + suggestionName });
    } else {
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: suggestionName + (needsArg ? " " : "") });
    }
  }, [state.commandBuffer, dispatch]);

  const executeCommand = useCallback(() => {
    const parsed = parseCommand(state.commandBuffer);
    if (!parsed) {
      closePalette();
      onSearch(state.commandBuffer);
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
      case "provider":
        if (parsed.args[0]) onSetProvider(parsed.args[0]);
        closePalette();
        break;
      default:
        dispatch({ type: "SET_STATUS", status: `Unknown: ${parsed.command}` });
        closePalette();
    }
  }, [state.commandBuffer, closePalette, onQuit, onSearch, onSetEditor, onSetTheme, onSetProvider, dispatch]);

  const handleKey = useCallback((key: { name: string; ctrl?: boolean; sequence?: string; meta?: boolean; option?: boolean }) => {
    if (!state.commandOpen) return false;

    const keyMap: Record<string, () => void> = {
      escape: closePalette,
      up: () => {
        if (suggestions.length === 0) return;
        setSelectedIndex((prev) => (prev < 0 ? suggestions.length - 1 : (prev - 1 + suggestions.length) % suggestions.length));
      },
      down: () => {
        if (suggestions.length === 0) return;
        setSelectedIndex((prev) => (prev < 0 ? 0 : (prev + 1) % suggestions.length));
      },
      tab: () => {
        if (suggestions.length === 0) return;
        const suggestionName = selectedIndex >= 0 ? suggestions[selectedIndex].name : suggestions[0].name;
        applySuggestion(suggestionName);
        setSelectedIndex(-1);
      },
      backspace: () => {
        dispatch({ type: "SET_COMMAND_BUFFER", buffer: state.commandBuffer.slice(0, -1) });
      },
      return: executeCommand,
      space: () => {
        dispatch({ type: "SET_COMMAND_BUFFER", buffer: state.commandBuffer + " " });
      },
    };

    if (key.ctrl && key.name === "u") {
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: "" });
      return true;
    }

    const action = keyMap[key.name];
    if (action) {
      action();
      return true;
    }

    if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta && !key.option) {
      dispatch({ type: "SET_COMMAND_BUFFER", buffer: state.commandBuffer + key.sequence });
      return true;
    }

    return false;
  }, [state.commandOpen, state.commandBuffer, suggestions, selectedIndex, closePalette, applySuggestion, executeCommand, dispatch]);

  useKeyboard(handleKey);

  return {
    suggestions,
    visibleSuggestions,
    selectedIndex,
    scrollOffset,
    suggestionHeight,
    ghostText,
    splitMode,
    cmdName,
    inputPart,
  };
}
