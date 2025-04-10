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
