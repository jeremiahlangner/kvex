import { SyntaxStyle, RGBA } from "@opentui/core";

let _syntaxStyle: SyntaxStyle | null = null;

export function getSyntaxStyle(): SyntaxStyle {
  if (!_syntaxStyle) {
    _syntaxStyle = SyntaxStyle.fromStyles({
      default: { fg: RGBA.fromHex("#FFFFFF") },
      comment: { fg: RGBA.fromHex("#6A9955") },
      string: { fg: RGBA.fromHex("#CE9178") },
      number: { fg: RGBA.fromHex("#B5CEA8") },
      keyword: { fg: RGBA.fromHex("#569CD6") },
      function: { fg: RGBA.fromHex("#DCDCAA") },
      property: { fg: RGBA.fromHex("#9CDCFE") },
      operator: { fg: RGBA.fromHex("#D4D4D4") },
      punctuation: { fg: RGBA.fromHex("#D4D4D4") },
      tag: { fg: RGBA.fromHex("#569CD6") },
      type: { fg: RGBA.fromHex("#4EC9B0") },
    });
  }
  return _syntaxStyle;
}
