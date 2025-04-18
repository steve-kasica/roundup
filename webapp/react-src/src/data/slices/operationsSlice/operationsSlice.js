import { createSlice } from '@reduxjs/toolkit';
import Operation, {
    isOperation,
    Child, 
    CHILD_TYPE_OPERATION, 
    CHILD_TYPE_TABLE
} from './Operation';

const initialState = {
    entities: {}, // Normalized operations stored by ID
    ids: [], // Array of operation IDs
};

const operationsSlice = createSlice({
    name: 'operations',
    initialState,
    reducers: {
        addOperation(state, action) {
            const operation = action.payload;
            state.entities[operation.id] = operation;
            state.ids.push(operation.id);
        },
        createOperation(state, action) {
            const { operationType, children, parentId } = action.payload;
            const depth = state.entities[parentId] ? state.entities[parentId].depth + 1 : 1;
            const operation = Operation(
                operationType, 
                parentId, 
                depth, 
                children.map(id => new Child(CHILD_TYPE_TABLE, id))
            );
            state.entities[operation.id] = operation;
            state.ids.push(operation.id);
            if (parentId) {
                state.entities[parentId].children.push(new Child(CHILD_TYPE_OPERATION, operation.id));
            }
        },
        removeOperation(state, action) {
            const id = action.payload;
            delete state.entities[id];
            state.ids = state.ids.filter((operationId) => operationId !== id);
        },
        updateOperation(state, action) {
            const operation = action.payload;
            if (state.entities[operation.id]) {
                state.entities[operation.id] = operation;
            } else {
                console.warn(`Operation with ID ${operation.id} not found.`);
            }
        },
        addTableToDeepestOperation(state, action) {
            const { tableId } = action.payload;
            // Find the deepest operation (the one with the highest depth)
            const deepestOperationId = state.ids.reduce((deepestId, currentId) => {
                const currentDepth = state.entities[currentId].depth;
                const deepestDepth = state.entities[deepestId].depth;
                return currentDepth > deepestDepth ? currentId : deepestId;
            }, state.ids[0]);
            // Add the table ID to the deepest operation's children
            if (state.entities[deepestOperationId]) {
                state.entities[deepestOperationId].children.push(tableId);
            } else {
                console.warn(`Deepest operation with ID ${deepestOperationId} not found.`);
            }
        },
        addChildrenToOperation(state, action) {
            const { operationId, children } = action.payload;
            if (state.entities[operationId]) {
            state.entities[operationId].children = [
                ...(state.entities[operationId].children || []),
                ...children.map(id => new Child(CHILD_TYPE_TABLE, id)),
            ];
            }
        },
    }
});

export default operationsSlice;