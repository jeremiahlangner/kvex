import { SyntaxStyle, parseColor } from "@opentui/core";
import type { ThemeColors } from "../themes/types";

export function getSyntaxStyle(colors: ThemeColors): SyntaxStyle {
  return SyntaxStyle.fromStyles({
    default: { fg: parseColor(colors.syntax.default) },
    comment: { fg: parseColor(colors.syntax.comment) },
    string: { fg: parseColor(colors.syntax.string) },
    number: { fg: parseColor(colors.syntax.number) },
    keyword: { fg: parseColor(colors.syntax.keyword) },
    function: { fg: parseColor(colors.syntax.function) },
    property: { fg: parseColor(colors.syntax.property) },
    operator: { fg: parseColor(colors.syntax.operator) },
    punctuation: { fg: parseColor(colors.syntax.punctuation) },
    tag: { fg: parseColor(colors.syntax.tag) },
    type: { fg: parseColor(colors.syntax.type) },
  });
}
