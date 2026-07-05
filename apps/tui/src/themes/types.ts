export interface ThemeColors {
  pane: {
    background: string;
    title: { focused: string; unfocused: string };
    loading: string;
  };
  palette: {
    background: string;
    border: string;
    prompt: string;
    text: { command: string; default: string };
    suggestion: { selected: string; unselected: string; bg: string };
    description: { selected: string; unselected: string };
    hint: string;
  };
  confirm: {
    background: string;
    accent: string;
    message: string;
    hint: string;
  };
  explorer: {
    selectedBg: string;
    selectedText: string;
  };
  status: {
    connected: string;
    error: string;
    warning: string;
    hint: string;
  };
  syntax: {
    default: string;
    comment: string;
    string: string;
    number: string;
    keyword: string;
    function: string;
    property: string;
    operator: string;
    punctuation: string;
    tag: string;
    type: string;
  };
}
