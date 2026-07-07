import { type ThemeColors } from "./types";
import { RGBA } from "@opentui/core";

export const theme: ThemeColors = {
  bg: "transparent",
  text: RGBA.defaultForeground(),
  hint: RGBA.fromIndex(8),
  loading: RGBA.fromIndex(8),
  prompt: RGBA.fromIndex(4),
  suggestionSelected: RGBA.defaultForeground(),
  suggestionUnselected: RGBA.fromIndex(8),
  suggestionBg: "transparent",
  selectionBg: RGBA.fromIndex(8),
  connected: RGBA.fromIndex(2),
  error: RGBA.fromIndex(1),
  warning: RGBA.fromIndex(3),
  syntaxDefault: RGBA.defaultForeground(),
  syntaxComment: RGBA.fromIndex(8),
  syntaxString: RGBA.fromIndex(10),
  syntaxNumber: RGBA.fromIndex(13),
  syntaxKeyword: RGBA.fromIndex(12),
  syntaxFunction: RGBA.fromIndex(14),
  syntaxProperty: RGBA.fromIndex(6),
  syntaxOperator: RGBA.defaultForeground(),
  syntaxPunctuation: RGBA.defaultForeground(),
  syntaxTag: RGBA.fromIndex(4),
  syntaxType: RGBA.fromIndex(11),
};
