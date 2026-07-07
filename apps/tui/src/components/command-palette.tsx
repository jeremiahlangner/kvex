import { useAppState } from "../state";
import { useTheme } from "../themes";
import { useCommandPalette } from "./command-palette/use-command-palette";
import { SuggestionItem } from "./command-palette/suggestion-item";
import { CommandInput } from "./command-palette/command-input";

interface CommandPaletteProps {
  onQuit: () => void;
  onSearch: (query: string) => void;
  onSetEditor: (editor: string) => void;
  onSetTheme: (theme: string) => void;
  onSetProvider: (name: string) => void;
}

export function CommandPalette(props: CommandPaletteProps) {
  const { state } = useAppState();
  const colors = useTheme();
  const {
    visibleSuggestions,
    selectedIndex,
    scrollOffset,
    suggestionHeight,
    ghostText,
    splitMode,
    cmdName,
    inputPart,
  } = useCommandPalette(props);

  return (
    <box
      height={state.commandOpen ? suggestionHeight + 3 : 3}
      width="100%"
      flexDirection="column"
      backgroundColor={colors.bg}
      borderStyle="heavy"
      border={["left"]}
      borderColor={colors.prompt}
    >
      {!state.commandOpen ? (
        <box height={3} flexDirection="row" alignItems="center" paddingLeft={1}>
          <text fg={colors.hint}>'/' for commands or to search</text>
        </box>
      ) : (
        <>
          {visibleSuggestions.length > 0 && (
            <box flexDirection="column" height={suggestionHeight}>
              {visibleSuggestions.map((s, i) => (
                <SuggestionItem
                  key={`${s.name}-${scrollOffset + i}`}
                  name={s.name}
                  description={s.description}
                  selected={scrollOffset + i === selectedIndex}
                />
              ))}
            </box>
          )}
          <CommandInput
            buffer={state.commandBuffer}
            ghostText={ghostText}
            splitMode={splitMode}
            cmdName={cmdName}
            inputPart={inputPart}
          />
        </>
      )}
    </box>
  );
}
