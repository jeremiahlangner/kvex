export interface ThemeColors {
  pane: {
    background: string;
    title: { focused: string; unfocused: string };
    loading: string;
  };
  palette: {
    prompt: string;
    suggestion: { selected: string; unselected: string; bg: string };
    hint: string;
  };
  confirm: {
    background: string;
    message: string;
  };
  explorer: {
    selectedBg: string;
    selectedText: string;
  };
  status: {
    connected: string;
    error: string;
    warning: string;
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
