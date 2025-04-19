
import { getOperationById, getOperationTableIds } from "./operationsSelectors";
import { getFocusedOperationId, getHoverOperationId } from "./uiSelectors";

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

export const getHoverOperationTableIds = (state) => {
    const hoverOperationId = getHoverOperationId(state);;
    if (hoverOperationId === null) {
        return [];
    } else {
        const operation = getOperationById(state, hoverOperationId);
        if (operation === undefined) {
            throw new Error("Node not found");
        }
        return getOperationTableIds(operation);
    }
}