export const colors = {
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
      unselected: "#8888FF",
    },
    description: {
      selected: "#AAAAAA",
      unselected: "#555577",
    },
    hint: "#555577",
  },

  confirm: {
    background: "#1a1a3e",
    accent: "#6666FF",
    message: "#FFFFFF",
    hint: "#AAAAAA",
  },

  status: {
    connected: "#00FF00",
    error: "#FF0000",
    warning: "#FFFF00",
    hint: "#888888",
  },
} as const;
