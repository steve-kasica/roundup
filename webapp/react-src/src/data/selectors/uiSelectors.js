import { initialState } from "../uiSlice";
import { shallowEqual } from "react-redux";

export const getFocused = ({ui}) => ui.focused;

// export const getFocusedOperation = ({ui}) => {
//     if (shallowEqual(ui.focused, initialState.focused)) {
//         return initialState.focused.id;
//     } else if (ui.focused.dataType !== "operation") {
//         throw Error("Focused is not an operation")
//     } else {
//         return ui.focused.id;
//     }
// }