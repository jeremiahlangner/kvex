import { type ThemeColors } from "./types";

export const theme: ThemeColors = {
  pane: {
    background: "#24283b",
    title: {
      focused: "#c0caf5",
      unfocused: "#565f89",
    },
    loading: "#565f89",
  },

  palette: {
    prompt: "#bb9af7",
    suggestion: {
      selected: "#c0caf5",
      unselected: "#565f89",
      bg: "#283457",
    },
    hint: "#565f89",
  },

  confirm: {
    background: "#24283b",
    message: "#c0caf5",
  },

  explorer: {
    selectedBg: "#283457",
    selectedText: "#c0caf5",
  },

  status: {
    connected: "#9ece6a",
    error: "#f7768e",
    warning: "#e0af68",
  },

  syntax: {
    default: "#c0caf5",
    comment: "#565f89",
    string: "#9ece6a",
    number: "#ff9e64",
    keyword: "#7aa2f7",
    function: "#bb9af7",
    property: "#7dcfff",
    operator: "#a9b1d6",
    punctuation: "#a9b1d6",
    tag: "#7aa2f7",
    type: "#73daca",
  },
};
