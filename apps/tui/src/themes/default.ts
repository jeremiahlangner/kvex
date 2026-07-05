import { type ThemeColors } from "./types";
import { RGBA } from "@opentui/core";

export const theme: ThemeColors = {
  pane: {
    background: "transparent",
    title: {
      focused: RGBA.defaultForeground(),
      unfocused: RGBA.fromIndex(8),
    },
    loading: RGBA.fromIndex(8),
  },

  palette: {
    prompt: RGBA.fromIndex(4),
    suggestion: {
      selected: RGBA.defaultForeground(),
      unselected: RGBA.fromIndex(8),
      bg: "transparent",
    },
    hint: RGBA.fromIndex(8),
  },

  confirm: {
    background: "transparent",
    message: RGBA.defaultForeground(),
  },

  explorer: {
    selectedBg: RGBA.fromIndex(8),
    selectedText: RGBA.defaultForeground(),
  },

  status: {
    connected: RGBA.fromIndex(2),
    error: RGBA.fromIndex(1),
    warning: RGBA.fromIndex(3),
  },

  syntax: {
    default: RGBA.defaultForeground(),
    comment: RGBA.fromIndex(8),
    string: RGBA.fromIndex(10),
    number: RGBA.fromIndex(13),
    keyword: RGBA.fromIndex(12),
    function: RGBA.fromIndex(14),
    property: RGBA.fromIndex(6),
    operator: RGBA.defaultForeground(),
    punctuation: RGBA.defaultForeground(),
    tag: RGBA.fromIndex(4),
    type: RGBA.fromIndex(11),
  },
};
