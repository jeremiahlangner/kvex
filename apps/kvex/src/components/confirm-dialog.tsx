import { useKeyboard } from "@opentui/react";
import { useAppState } from "../state";
import { colors } from "../theme";

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
        borderColor={colors.confirm.border}
        backgroundColor={colors.confirm.background}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        padding={1}
      >
        <text fg={colors.confirm.message}>{state.confirmDialog.message}</text>
        <text fg={colors.confirm.hint}>[Y]es / [N]o</text>
      </box>
    </box>
  );
}
