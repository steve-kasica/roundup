import { createSelector } from "@reduxjs/toolkit";
import { stratify as d3Stratify } from "d3";

export const stratify = d3Stratify()
    .id(d => d.id)
    .parentId(d => d.parentId || null);

export const getRoot = createSelector(
    state => state.compositeSchema.data,
    (data) => Object.keys(data).length > 0
        ? stratify(Object.values(data))
        : null
);