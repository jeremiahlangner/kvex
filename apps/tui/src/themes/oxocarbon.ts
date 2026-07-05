import { type ThemeColors } from "./types";

export const theme: ThemeColors = {
  pane: {
    background: "#262626",
    title: {
      focused: "#f2f4f8",
      unfocused: "#525252",
    },
    loading: "#6f6f6f",
  },

  palette: {
    background: "#161616",
    border: "#0f62fe",
    prompt: "#0f62fe",
    text: {
      command: "#78a9ff",
      default: "#c1c7cd",
    },
    suggestion: {
      selected: "#ffffff",
      unselected: "#525252",
      bg: "#393939",
    },
    description: {
      selected: "#c1c7cd",
      unselected: "#6f6f6f",
    },
    hint: "#525252",
  },

  confirm: {
    background: "#262626",
    accent: "#0f62fe",
    message: "#f2f4f8",
    hint: "#c1c7cd",
  },

  explorer: {
    selectedBg: "#393939",
    selectedText: "#f2f4f8",
  },

  status: {
    connected: "#42be65",
    error: "#da1e28",
    warning: "#f1c21b",
    hint: "#6f6f6f",
  },

  syntax: {
    default: "#f2f4f8",
    comment: "#6f6f6f",
    string: "#ee5396",
    number: "#42be65",
    keyword: "#0f62fe",
    function: "#78a9ff",
    property: "#33b1ff",
    operator: "#c1c7cd",
    punctuation: "#c1c7cd",
    tag: "#0f62fe",
    type: "#08bdba",
  },
};
