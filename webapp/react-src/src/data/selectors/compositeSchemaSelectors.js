import { createSelector } from "@reduxjs/toolkit";
import { stratify as d3Stratify, descending } from "d3";
import { isOperationNode } from "../slices/compositeSchemaSlice";

export const stratify = d3Stratify()
    .id(d => d.id)
    .parentId(d => d.parentId || null);

export const getRoot = createSelector(
    state => state.compositeSchema.data,
    (data) => Object.keys(data).length > 0
        ? stratify(Object.values(data))
        : null
);

export const getOperations = createSelector(
    state => state.compositeSchema.data,
    (data) => Object.values(data)
        .filter(isOperationNode)
        .sort(({id: a}, {id: b}) => descending(a,b))
);

export const getFocusedOperation = createSelector(
    [
        state => state.compositeSchema.data,
        state => state.ui.focused.operation
    ],
    (data, focusedOperationNodeId) => {
        if (focusedOperationNodeId === null) {
            return null;
        } else {
            const node = data[focusedOperationNodeId];
            
            if (node === undefined) {
                throw new Error("Node not found");
            } else if (!isOperationNode(node)) {
                throw new Error("Focused node is not an operation");
            }

            return node;
        }
    }
)