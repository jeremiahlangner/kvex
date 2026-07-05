import { type ThemeColors } from "./types";

export const theme: ThemeColors = {
  pane: {
    background: "#1a1a3e",
    title: {
      focused: "#FFFFFF",
      unfocused: "#555577",
    },
    loading: "#888888",
  },

  palette: {
    background: "#1a1a3e",
    border: "#6666FF",
    prompt: "#6666FF",
    text: {
      command: "#6666FF",
      default: "#CCCCCC",
    },
    suggestion: {
      selected: "#FFFFFF",
      unselected: "#555577",
      bg: "#2a2a5e",
    },
    description: {
      selected: "#AAAAAA",
      unselected: "#444466",
    },
    hint: "#555577",
  },

  confirm: {
    background: "#1a1a3e",
    accent: "#6666FF",
    message: "#FFFFFF",
    hint: "#AAAAAA",
  },

  explorer: {
    selectedBg: "#2a2a5e",
    selectedText: "#FFFFFF",
  },

  status: {
    connected: "#00FF00",
    error: "#FF0000",
    warning: "#FFFF00",
    hint: "#888888",
  },

  syntax: {
    default: "#FFFFFF",
    comment: "#6A9955",
    string: "#CE9178",
    number: "#B5CEA8",
    keyword: "#569CD6",
    function: "#DCDCAA",
    property: "#9CDCFE",
    operator: "#D4D4D4",
    punctuation: "#D4D4D4",
    tag: "#569CD6",
    type: "#4EC9B0",
  },
};
