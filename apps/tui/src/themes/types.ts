import { type ColorInput } from "@opentui/core";

export interface ThemeColors {
  pane: {
    background: ColorInput;
    title: { focused: ColorInput; unfocused: ColorInput };
    loading: ColorInput;
  };
  palette: {
    prompt: ColorInput;
    suggestion: { selected: ColorInput; unselected: ColorInput; bg: ColorInput };
    hint: ColorInput;
  };
  confirm: {
    background: ColorInput;
    message: ColorInput;
  };
  explorer: {
    selectedBg: ColorInput;
    selectedText: ColorInput;
  };
  status: {
    connected: ColorInput;
    error: ColorInput;
    warning: ColorInput;
  };
  syntax: {
    default: ColorInput;
    comment: ColorInput;
    string: ColorInput;
    number: ColorInput;
    keyword: ColorInput;
    function: ColorInput;
    property: ColorInput;
    operator: ColorInput;
    punctuation: ColorInput;
    tag: ColorInput;
    type: ColorInput;
  };
}
