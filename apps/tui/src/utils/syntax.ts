import { SyntaxStyle, parseColor } from "@opentui/core";
import type { ThemeColors } from "../themes/types";

export function getSyntaxStyle(colors: ThemeColors): SyntaxStyle {
  return SyntaxStyle.fromStyles({
    default: { fg: parseColor(colors.syntaxDefault) },
    comment: { fg: parseColor(colors.syntaxComment) },
    string: { fg: parseColor(colors.syntaxString) },
    number: { fg: parseColor(colors.syntaxNumber) },
    keyword: { fg: parseColor(colors.syntaxKeyword) },
    function: { fg: parseColor(colors.syntaxFunction) },
    property: { fg: parseColor(colors.syntaxProperty) },
    operator: { fg: parseColor(colors.syntaxOperator) },
    punctuation: { fg: parseColor(colors.syntaxPunctuation) },
    tag: { fg: parseColor(colors.syntaxTag) },
    type: { fg: parseColor(colors.syntaxType) },
  });
}
