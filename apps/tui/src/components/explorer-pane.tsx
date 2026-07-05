import { useTheme } from "../themes";

interface ExplorerPaneProps {
  focused: boolean;
  title: string;
  loading: boolean;
  options: { name: string; description: string }[];
  selectedIndex: number;
  onChange: (index: number, option: any) => void;
  selectHeight?: number;
}

export function ExplorerPane({ focused, title, loading, options, selectedIndex, onChange, selectHeight = 10 }: ExplorerPaneProps) {
  const colors = useTheme();
  return (
    <box
      flexGrow={1}
      flexBasis={0}
      flexDirection="column"
      backgroundColor={focused ? colors.pane.background : undefined}
      padding={1}
    >
      <text fg={focused ? colors.pane.title.focused : colors.pane.title.unfocused}>
        {title}
      </text>
      <box height={1} />
      {loading ? (
        <text fg={colors.pane.loading}>Loading...</text>
      ) : (
        <select
          options={options}
          selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
          onChange={onChange}
          focused={focused}
          height={selectHeight}
          itemSpacing={0}
          showDescription={false}
          textColor={colors.pane.title.unfocused}
          focusedTextColor={colors.pane.title.unfocused}
          backgroundColor="transparent"
          focusedBackgroundColor="transparent"
          selectedBackgroundColor={colors.explorer.selectedBg}
          selectedTextColor={colors.explorer.selectedText}
        />
      )}
    </box>
  );
}
