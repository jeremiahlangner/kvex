import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { useAppState } from "../state";
import { useTheme } from "../themes";

export function ConfirmDialog() {
  const { state, dispatch } = useAppState();
  const colors = useTheme();
  const [selected, setSelected] = useState<"yes" | "no">("no");

  const handleYes = () => {
    if (!state.confirmDialog) return;
    state.confirmDialog.onConfirm();
    dispatch({ type: "SET_CONFIRM_DIALOG", dialog: null });
    setSelected("no");
  };

  const handleNo = () => {
    dispatch({ type: "SET_CONFIRM_DIALOG", dialog: null });
    setSelected("no");
  };

  useKeyboard((key) => {
    if (!state.confirmDialog) return false;

    if (key.name === "y" || key.name === "Y") {
      handleYes();
      return true;
    }
    if (key.name === "n" || key.name === "N" || key.name === "escape") {
      handleNo();
      return true;
    }
    if (key.name === "return") {
      if (selected === "yes") handleYes();
      else handleNo();
      return true;
    }
    if (key.name === "left" || key.name === "h" || key.name === "b") {
      setSelected("yes");
      return true;
    }
    if (key.name === "right" || key.name === "l" || key.name === "w" || key.name === "j" || key.name === "k") {
      setSelected("no");
      return true;
    }
    return false;
  });

  if (!state.confirmDialog) return null;

  const yesBg = selected === "yes" ? colors.selectionBg : undefined;
  const noBg = selected === "no" ? colors.selectionBg : undefined;
  const yesFg = selected === "yes" ? colors.text : colors.hint;
  const noFg = selected === "no" ? colors.text : colors.hint;

  return (
    <box
      position="absolute"
      left={0}
      top={0}
      width="100%"
      height="100%"
      backgroundColor="#00000080"
    >
      <box
        position="absolute"
        left="25%"
        top="40%"
        width="50%"
        height={5}
        backgroundColor={colors.bg}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        padding={1}
      >
        <text fg={colors.text}>{state.confirmDialog.message}</text>
        <box flexDirection="row" marginTop={1} alignItems="center">
          <box paddingLeft={2} paddingRight={2} backgroundColor={yesBg}>
            <text fg={yesFg}>
              <u>Y</u>es
            </text>
          </box>
          <text>  </text>
          <box paddingLeft={2} paddingRight={2} backgroundColor={noBg}>
            <text fg={noFg}>
              <u>N</u>o
            </text>
          </box>
        </box>
      </box>
    </box>
  );
}
