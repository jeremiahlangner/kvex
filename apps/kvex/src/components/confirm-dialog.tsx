import { useKeyboard } from "@opentui/react";
import { useAppState } from "../state";

export function ConfirmDialog() {
  const { state, dispatch } = useAppState();

  useKeyboard((key) => {
    if (!state.confirmDialog) return false;
    if (key.name === "y" || key.name === "Y") {
      state.confirmDialog!.onConfirm();
      dispatch({ type: "SET_CONFIRM_DIALOG", dialog: null });
      return true;
    }
    if (key.name === "n" || key.name === "N" || key.name === "escape" || key.name === "return") {
      dispatch({ type: "SET_CONFIRM_DIALOG", dialog: null });
      return true;
    }
    return false;
  });

  if (!state.confirmDialog) return null;

  return (
    <box
      position="absolute"
      left={0}
      top={0}
      width="100%"
      height="100%"
    >
      <box
        position="absolute"
        left="25%"
        top="40%"
        width="50%"
        height={5}
        borderStyle="double"
        borderColor="#FF4444"
        backgroundColor="#1a0000"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        padding={1}
      >
        <text fg="#FF4444">{state.confirmDialog.message}</text>
        <text fg="#AAAAAA">[Y]es / [N]o</text>
      </box>
    </box>
  );
}
