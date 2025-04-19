

export const getMaxOperationDepth = ({operations}) => {
    if (Object.keys(operations.entities).length === 0) {
        return 0;
    }
    const maxDepth = Object.values(operations.entities)
        .map(operation => operation.depth)
        .reduce((max, depth) => Math.max(max, depth), 0);
    return maxDepth;
}

// TODO: memoize, if necessary
export const getRootOperationId = ({operations}) => {
    const nullParentOperations = Object.values(operations.entities)
        .filter(operation => operation.parentId === null);
    if (nullParentOperations.length > 1) {
        throw new Error("Multiple root operations found");
    }
    if (nullParentOperations.length === 0) {
        return null;
    }
    return nullParentOperations[0].id;
}

export const getOperationById = (state, operationId) => {
    const operation = state.operations.entities[operationId];
    return operation;
};

export const getOperations = (state) => {
    return Object.values(state.operations.entities);
}

export const getSelectedSourceTables = ({operations}) => {
    if (Object.keys(operations.entities).length === 0) {
        return [];
    }
    return Object.values(operations.entities)
        .filter(operation => operation.type === "table")
        .map(operation => operation.id);
}

export const getOperationTableIds = ((operation) => operation.children
    .filter(child => child.type === "table")
    .map(child => child.id)
);

export const getLastOperation = (state) => {
    const operationId = state.operations.ids[state.operations.ids.length - 1];
    return getOperationById(state, operationId);
}