
import { getFocusedOperationId } from "./uiSelectors";

// TODO: memoize, if necessary
export const getFocusedOperation = (state) => {
    const focusedOperationNodeId = getFocusedOperationId(state);
    if (focusedOperationNodeId === null) {
        return null;
    } else {
        const operation = state.operations.entities[focusedOperationNodeId];
        if (operation === undefined) {
            throw new Error("Node not found");
        }
        return operation;
    }
}