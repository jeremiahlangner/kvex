import { useTheme } from "../../themes";

interface SuggestionItemProps {
  name: string;
  description?: string;
  selected: boolean;
}

export function SuggestionItem({ name, description, selected }: SuggestionItemProps) {
  const colors = useTheme();
  return (
    <box
      height={1}
      flexDirection="row"
      backgroundColor={selected ? colors.suggestionBg : undefined}
    >
      <text fg={selected ? colors.suggestionSelected : colors.suggestionUnselected}>
        {name}
      </text>
      {description ? (
        <text fg={colors.hint}>
          {"  "}{description}
        </text>
      ) : null}
    </box>
  );
}
