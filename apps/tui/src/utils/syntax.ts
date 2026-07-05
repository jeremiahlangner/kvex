import { SyntaxStyle, RGBA } from "@opentui/core";
import type { ThemeColors } from "../themes/types";

export function getSyntaxStyle(colors: ThemeColors): SyntaxStyle {
  return SyntaxStyle.fromStyles({
    default: { fg: RGBA.fromHex(colors.syntax.default) },
    comment: { fg: RGBA.fromHex(colors.syntax.comment) },
    string: { fg: RGBA.fromHex(colors.syntax.string) },
    number: { fg: RGBA.fromHex(colors.syntax.number) },
    keyword: { fg: RGBA.fromHex(colors.syntax.keyword) },
    function: { fg: RGBA.fromHex(colors.syntax.function) },
    property: { fg: RGBA.fromHex(colors.syntax.property) },
    operator: { fg: RGBA.fromHex(colors.syntax.operator) },
    punctuation: { fg: RGBA.fromHex(colors.syntax.punctuation) },
    tag: { fg: RGBA.fromHex(colors.syntax.tag) },
    type: { fg: RGBA.fromHex(colors.syntax.type) },
  });
}
