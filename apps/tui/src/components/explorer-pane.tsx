import { useTheme } from "../themes";

interface ExplorerOption {
  name: string;
  description?: string;
}

interface ExplorerPaneProps {
  focused: boolean;
  title: string;
  loading: boolean;
  options: ExplorerOption[];
  selectedIndex: number;
  onChange: (index: number, option: ExplorerOption | null) => void;
  selectHeight?: number;
  emptyMessage?: string;
}

export function ExplorerPane({ focused, title, loading, options, selectedIndex, onChange, selectHeight = 10, emptyMessage = "No items" }: ExplorerPaneProps) {
  const colors = useTheme();
  const selectOptions = options.map((o) => ({ name: o.name, description: o.description ?? "" }));
  return (
    <box
      flexGrow={1}
      flexBasis={0}
      flexDirection="column"
      backgroundColor={focused ? colors.bg : undefined}
      padding={1}
    >
      <text fg={focused ? colors.text : colors.hint}>
        {title}
      </text>
      <box height={1} />
      {loading ? (
        <text fg={colors.loading}>Loading...</text>
      ) : options.length === 0 ? (
        <text fg={colors.hint}>{emptyMessage}</text>
      ) : (
        <select
          options={selectOptions}
          selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
          onChange={onChange}
          focused={focused}
          height={selectHeight}
          itemSpacing={0}
          showDescription={false}
          textColor={colors.hint}
          focusedTextColor={colors.hint}
          backgroundColor="transparent"
          focusedBackgroundColor="transparent"
          selectedBackgroundColor={colors.selectionBg}
          selectedTextColor={colors.text}
        />
      )}
    </box>
  );
}
